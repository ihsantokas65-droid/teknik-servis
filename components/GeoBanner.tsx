"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MapPin, X, ArrowRight, Zap } from "lucide-react";
import { getCities, findCityFuzzy } from "@/lib/geo";

// Vercel city header (English/Slug-like) to our local slugs mapping
const cityMatchMap: Record<string, string> = {
  "istanbul": "istanbul",
  "ankara": "ankara",
  "izmir": "izmir",
  "bursa": "bursa",
  "antalya": "antalya",
  "adana": "adana",
  "konya": "konya",
  "van": "van",
  "eskisehir": "eskisehir",
  "diyarbakir": "diyarbakir",
  "mersin": "mersin",
  "kayseri": "kayseri",
  "gaziantep": "gaziantep",
  "samsun": "samsun",
  "trabzon": "trabzon",
  "denizli": "denizli",
  "sakarya": "sakarya",
  "mugla": "mugla",
  "tekirdag": "tekirdag",
  "manisa": "manisa",
  "balikesir": "balikesir",
  "kocaeli": "kocaeli",
  "canakkale": "canakkale",
  "hatay": "hatay",
  "malatya": "malatya",
  "erzurum": "erzurum",
  "afyon": "afyonkarahisar",
  "afyonkarahisar": "afyonkarahisar",
  "maras": "kahramanmaras",
  "kahramanmaras": "kahramanmaras",
  "urfa": "sanliurfa",
  "sanliurfa": "sanliurfa"
};

function GeoBannerContent({ detectedCityName }: { detectedCityName?: string }) {
  const [show, setShow] = useState(false);
  const [matchedCity, setMatchedCity] = useState<{ name: string; slug: string } | null>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDebug = searchParams.get("debugGeo") === "true";

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    let cityToMatch = "";
    const cookieCity = getCookie("user-geo-city");
    
    if (cookieCity) {
      try {
        cityToMatch = decodeURIComponent(cookieCity);
      } catch (e) {
        cityToMatch = cookieCity;
      }
    } else {
      cityToMatch = detectedCityName || "";
    }
    
    const mock = searchParams.get("mockCity");
    if (mock) cityToMatch = mock;

    if (cityToMatch) {
      const cityData = findCityFuzzy(cityToMatch);
      if (isDebug) {
        setDebugData({ 
          source: cookieCity ? "Cookie" : "Prop/Mock",
          detected: cityToMatch,
          match: cityData?.slug || "NOT_FOUND"
        });
      }

      if (cityData) {
        const isAlreadyOnCityPage = pathname.startsWith(`/${cityData.slug}`);
        if (!isAlreadyOnCityPage) {
          setMatchedCity({ name: cityData.name, slug: cityData.slug });
          const timer = setTimeout(() => setShow(true), 1200);
          return () => clearTimeout(timer);
        }
        return;
      }
    }

    // FALLBACK IF NO MATCH
    if (!matchedCity && !cityToMatch) {
      const fetchFallback = async () => {
        if (isDebug) setDebugData((p: any) => ({ ...p, status: "Starting fallback..." }));
        
        try {
          const providers = [
            "https://ipapi.co/json/",
            "http://ip-api.com/json"
          ];
          
          for (const url of providers) {
            try {
              const res = await fetch(url);
              const data = await res.json();
              const foundName = data.region || data.regionName || data.city;
              
              if (foundName) {
                if (isDebug) setDebugData((p: any) => ({ ...p, fallbackDetected: foundName }));
                const match = findCityFuzzy(foundName);
                if (match) {
                  const onPage = pathname.startsWith(`/${match.slug}`);
                  if (!onPage) {
                    setMatchedCity({ name: match.name, slug: match.slug });
                    setShow(true);
                    document.cookie = `user-geo-city=${encodeURIComponent(match.slug)}; path=/; max-age=604800; samesite=lax`;
                  }
                  break;
                }
              }
            } catch (e) { continue; }
          }
        } catch (err) {
          if (isDebug) setDebugData((p: any) => ({ ...p, error: String(err) }));
        }
      };
      
      fetchFallback();
    }
  }, [detectedCityName, pathname, searchParams, isDebug, matchedCity]);

  if (!show && !isDebug) return null;

  return (
    <>
      {isDebug && (
        <div style={{
          position: "fixed", bottom: 10, left: 10, zIndex: 10000,
          background: "black", color: "#0f0", padding: 15, fontSize: 10,
          borderRadius: 8, fontFamily: "monospace", border: "1px solid #0f0",
          maxWidth: 300, opacity: 0.9, boxShadow: "0 0 20px rgba(0,255,0,0.2)"
        }}>
          <div><strong>GEO DEBUG MODE</strong></div>
          <pre>{JSON.stringify(debugData, null, 2)}</pre>
        </div>
      )}

      {show && matchedCity && (
        <div className="geo-banner" style={{
          position: "sticky", top: 0, zIndex: 999, background: "var(--brand-900)",
          color: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", borderBottom: "2px solid var(--brand)",
          animation: "slideDown 0.5s ease-out"
        }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" }}>
                <MapPin size={20} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Görünüşe göre <strong style={{ color: "var(--brand)" }}>{matchedCity.name}</strong> bölgesindesiniz. 
                <span className="desktop-only" style={{ marginLeft: 8, padding: "2px 8px", background: "rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12 }}>
                  <Zap size={12} style={{ display: "inline", marginRight: 4 }} /> 30 Dakikada Servis
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href={`/${matchedCity.slug}`} style={{ padding: "8px 20px", fontSize: 13, borderRadius: 30, background: "white", color: "var(--brand-900)", textDecoration: "none", fontWeight: 700 }}>
                {matchedCity.name} Servisine Git <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </Link>
              <button onClick={() => setShow(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
            @media (max-width: 768px) { .container { flex-direction: column; gap: 12px; text-align: center; } .desktop-only { display: none; } }
          `}</style>
        </div>
      )}
    </>
  );
}

export function GeoBanner(props: { detectedCityName?: string }) {
  return (
    <Suspense fallback={null}>
      <GeoBannerContent {...props} />
    </Suspense>
  );
}

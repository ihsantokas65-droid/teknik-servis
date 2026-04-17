"use client";

import { useEffect, useState } from "react";
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

export function GeoBanner({ detectedCityName }: { detectedCityName?: string }) {
  const [show, setShow] = useState(false);
  const [matchedCity, setMatchedCity] = useState<{ name: string; slug: string } | null>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Detection Logic
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
    
    // MOCK for testing: ?mockCity=van
    const mock = searchParams.get("mockCity");
    if (mock) cityToMatch = mock;

    if (!cityToMatch) {
      if (searchParams.get("debugGeo")) {
        setDebugData({ status: "No city detected", cookie: cookieCity, prop: detectedCityName });
      }
      return;
    }

    // USE FUZZY MATCHING (Robust against encoding/naming variations)
    const cityData = findCityFuzzy(cityToMatch);
    
    if (searchParams.get("debugGeo")) {
      setDebugData({ 
        detected: cityToMatch,
        normalized: cityToMatch.toLowerCase(),
        matchFound: !!cityData,
        matchedSlug: cityData?.slug,
        currentPath: pathname
      });
    }

    if (cityData) {
      const isAlreadyOnCityPage = pathname.startsWith(`/${cityData.slug}`);
      
      if (!isAlreadyOnCityPage) {
        setMatchedCity({ name: cityData.name, slug: cityData.slug });
        const timer = setTimeout(() => setShow(true), 1000);
        return () => clearTimeout(timer);
      }
    } else if (!cityData && cityToMatch && isDebug) {
       // Debug: show if we detected SOMETHING but didn't match
       setDebugData((prev: any) => ({ ...prev, unmatchedCity: cityToMatch }));
    }

    // ULTIMATE FALLBACK: If still no city detected after initial checks, try client-side IP-API
    if (!cityToMatch && !cookieCity && !detectedCityName) {
      const fetchGeoFallback = async () => {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          if (data.city) {
            if (isDebug) setDebugData((prev: any) => ({ ...prev, fallbackDetected: data.city }));
            
            const fallbackMatch = findCityFuzzy(data.city);
            if (fallbackMatch) {
              const isAlreadyOnCityPage = pathname.startsWith(`/${fallbackMatch.slug}`);
              if (!isAlreadyOnCityPage) {
                setMatchedCity({ name: fallbackMatch.name, slug: fallbackMatch.slug });
                setShow(true);
              }
            }
          }
        } catch (error) {
          if (isDebug) setDebugData((prev: any) => ({ ...prev, fallbackError: String(error) }));
        }
      };
      
      fetchGeoFallback();
    }
  }, [detectedCityName, pathname, searchParams]);

  const isDebug = searchParams.get("debugGeo") === "true";

  if (!show && !isDebug) return null;
  if (!matchedCity && !isDebug) return null;

  return (
    <>
      {/* DEBUG OVERLAY - Force visible with ?debugGeo=true */}
      {isDebug && (
        <div style={{
          position: "fixed", bottom: 10, left: 10, zIndex: 10000,
          background: "black", color: "#0f0", padding: 15, fontSize: 10,
          borderRadius: 8, fontFamily: "monospace", border: "1px solid #0f0",
          maxWidth: 300, opacity: 0.9, boxShadow: "0 0 20px rgba(0,255,0,0.2)"
        }}>
          <div><strong>GEO DEBUG MODE</strong></div>
          <pre>{JSON.stringify(debugData, null, 2)}</pre>
          <div style={{ marginTop: 5, color: "#fff" }}>
            Cookie city: {debugData?.detected || "NULL"}
          </div>
          <div style={{ marginTop: 5, fontSize: 9, color: "#888" }}>
            Tip: Use ?mockCity=van to test UI
          </div>
        </div>
      )}

      {!matchedCity || !show ? null : (
        <div 
          className="geo-banner"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
            background: "var(--brand-900)",
            color: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            borderBottom: "2px solid var(--brand)",
            animation: "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: "50%", background: "var(--brand)", 
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-900)" 
              }}>
                <MapPin size={20} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                <span style={{ opacity: 0.9 }}>Görünüşe göre </span>
                <strong style={{ color: "var(--brand)", fontSize: 16 }}>{matchedCity.name}</strong>
                <span style={{ opacity: 0.9 }}> bölgesindesiniz. </span>
                <span className="desktopOnly" style={{ marginLeft: 8, padding: "2px 8px", background: "rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                   <Zap size={12} style={{ display: "inline", marginRight: 4 }} /> 30 Dakikada Servis İmkanı
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link 
                href={`/${matchedCity.slug}`} 
                className="btn" 
                style={{ 
                  padding: "8px 20px", fontSize: 13, borderRadius: 30, background: "white", 
                  color: "var(--brand-900)", boxShadow: "none", border: "none" 
                }}
              >
                {matchedCity.name} Servisine Git <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </Link>
              <button 
                onClick={() => setShow(false)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes slideDown {
              from { transform: translateY(-100%); }
              to { transform: translateY(0); }
            }
            @media (max-width: 768px) {
              .geo-banner { position: relative; }
              .container { flex-direction: column; gap: 12px; text-align: center; }
              .btn { width: 100%; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

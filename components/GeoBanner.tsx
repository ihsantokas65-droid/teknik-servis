"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MapPin, X, ArrowRight, Zap } from "lucide-react";
import { getCities } from "@/lib/geo";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Detection Logic
    let cityToMatch = detectedCityName?.toLowerCase() || "";
    
    // Allow mocking for testing: ?mockCity=van
    const mock = searchParams.get("mockCity");
    if (mock) cityToMatch = mock.toLowerCase();

    if (!cityToMatch) return;

    // Use mapping or direct slug find
    const citySlug = cityMatchMap[cityToMatch] || cityToMatch;
    const cities = getCities();
    
    // Improved matching: Check slug or lowercase name comparison
    const cityData = cities.find(c => 
      c.slug === citySlug || 
      c.name.toLowerCase().replace(/i/g, "i").replace(/ı/g, "i") === cityToMatch.replace(/i/g, "i").replace(/ı/g, "i")
    );

    if (cityData) {
      // 2. Hide logic: Don't show if we are already on this city's page or its subpages
      const isAlreadyOnCityPage = pathname.startsWith(`/${cityData.slug}`);
      
      if (!isAlreadyOnCityPage) {
        setMatchedCity({ name: cityData.name, slug: cityData.slug });
        
        // Faster appearance for better UX
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [detectedCityName, pathname, searchParams]);

  if (!matchedCity || !show) return null;

  return (
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
  );
}

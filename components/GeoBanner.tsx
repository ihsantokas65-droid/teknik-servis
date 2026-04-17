"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MapPin, X, ArrowRight, Zap } from "lucide-react";
import { getCities, findCityFuzzy } from "@/lib/geo";

const cityMatchMap: Record<string, string> = {
  "istanbul": "istanbul", "ankara": "ankara", "izmir": "izmir", "bursa": "bursa",
  "antalya": "antalya", "adana": "adana", "konya": "konya", "van": "van" 
};

export function GeoBanner({ detectedCityName }: { detectedCityName?: string }) {
  const [show, setShow] = useState(false);
  const [matchedCity, setMatchedCity] = useState<{ name: string; slug: string } | null>(null);
  const [debugData, setDebugData] = useState<any>(null);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDebug = searchParams.get("debugGeo") === "true";

  useEffect(() => {
    // 1. Detection
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
      try { cityToMatch = decodeURIComponent(cookieCity); } catch (e) { cityToMatch = cookieCity; }
    } else {
      cityToMatch = detectedCityName || "";
    }
    
    const mock = searchParams.get("mockCity");
    if (mock) cityToMatch = mock;

    if (cityToMatch) {
      const cityData = findCityFuzzy(cityToMatch);
      if (isDebug) setDebugData({ source: cookieCity ? "Cookie" : "Initial", detected: cityToMatch, match: cityData?.slug || "NO_MATCH" });
      
      if (cityData) {
        if (!pathname.startsWith(`/${cityData.slug}`)) {
          setMatchedCity({ name: cityData.name, slug: cityData.slug });
          const t = setTimeout(() => setShow(true), 1500);
          return () => clearTimeout(t);
        }
        return;
      }
    }

    // 2. Fallback
    if (!matchedCity && !cityToMatch) {
      const fetchFallback = async () => {
        if (isDebug) setDebugData((p: any) => ({ ...p, status: "Falling back..." }));
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          const found = data.region || data.city;
          if (found) {
            const match = findCityFuzzy(found);
            if (match && !pathname.startsWith(`/${match.slug}`)) {
              setMatchedCity({ name: match.name, slug: match.slug });
              setShow(true);
              document.cookie = `user-geo-city=${encodeURIComponent(match.slug)}; path=/; max-age=604800; samesite=lax`;
            }
          }
        } catch (e) {}
      };
      fetchFallback();
    }
  }, [detectedCityName, pathname, isDebug, matchedCity, searchParams]);

  // Clean UI: No full-screen wrappers
  return (
    <>
      {/* Absolute debug box - limited area */}
      {isDebug && (
        <div style={{
          position: "fixed", bottom: 10, left: 10, zIndex: 10000,
          background: "black", color: "#0f0", padding: 10, fontSize: 10,
          borderRadius: 8, border: "1px solid #0f0", opacity: 0.9,
          pointerEvents: "none", // Prevent blocking clicks
        }}>
          <div style={{ fontWeight: "bold" }}>DEBUG</div>
          <pre>{JSON.stringify(debugData, null, 2)}</pre>
        </div>
      )}

      {show && matchedCity && (
        <div style={{
          width: "100%", background: "var(--brand-900)", color: "white",
          borderBottom: "2px solid var(--brand)", position: "relative", // Changed from sticky to relative to prevent overlapping header
          zIndex: 1000, animation: "slideDown 0.4s ease-out", overflow: "hidden"
        }}>
          <div className="container" style={{ 
            display: "flex", alignItems: "center", justifyContent: "space-between", 
            padding: "10px 24px", minHeight: "56px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MapPin size={18} color="var(--brand)" />
              <div style={{ fontSize: 14 }}>
                Konumunuza Özel: <strong style={{ color: "var(--brand)" }}>{matchedCity.name}</strong> 
                <span className="desktop-only" style={{ marginLeft: 8, opacity: 0.7 }}> - 30 Dakikada Yanınızdayız</span>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <Link href={`/${matchedCity.slug}`} style={{ 
                background: "white", color: "var(--brand-900)", padding: "6px 16px", 
                borderRadius: "20px", fontSize: 13, fontWeight: "bold", textDecoration: "none"
              }}>
                Hemen Git
              </Link>
              <button onClick={() => setShow(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", padding: 5 }}>
                <X size={18} />
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
            @media (max-width: 768px) { .container { flex-direction: column; padding: 10px; gap: 10px; text-align: center; } .desktop-only { display: none; } }
          `}</style>
        </div>
      )}
    </>
  );
}

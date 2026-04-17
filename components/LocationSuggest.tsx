"use client";

import { useEffect, useState } from "react";
import { findNearestCity } from "@/lib/location";
import { MapPin, X, Navigation } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LocationSuggest() {
  const pathname = usePathname();
  const [suggestion, setSuggestion] = useState<{ name: string; slug: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the suggestion or if it's already a city page
    const isDismissed = localStorage.getItem("location_suggest_dismissed");
    if (isDismissed) return;

    // Don't suggest if the user is already on a city or district page that starts with a potential city slug
    // (This is a simple check, could be more robust)
    const currentCitySlug = pathname.split("/")[1];
    
    if (!navigator.geolocation) return;

    // Small delay to let the page settle
    const timer = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = findNearestCity(latitude, longitude);

          // Only suggest if the nearest city is NOT the one the user is currently looking at
          if (nearest && nearest.slug !== currentCitySlug && nearest.distance < 100) {
            setSuggestion({ name: nearest.name, slug: nearest.slug });
            setIsVisible(true);
          }
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 3600000 }
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("location_suggest_dismissed", "true");
  };

  if (!isVisible || !suggestion) return null;

  return (
    <div 
      style={{ 
        position: "fixed", 
        bottom: 24, 
        right: 24, 
        zIndex: 1000, 
        maxWidth: 320,
        animation: "reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <div className="card" style={{ padding: 20, border: "2px solid var(--brand)", boxShadow: "var(--shadow)" }}>
        <button 
          onClick={dismiss}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
        >
          <X size={16} />
        </button>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand-soft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Navigation size={20} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 950, color: "var(--brand-900)" }}>Konum Tespit Edildi</div>
            <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4, lineHeight: 1.4 }}>
              Şu anda <strong>{suggestion.name}</strong> bölgesinde olduğunuzu saptadık. Size özel servis sayfasını görmek ister misiniz?
            </div>
            
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <Link 
                href={`/${suggestion.slug}`} 
                onClick={() => setIsVisible(false)}
                className="btn" 
                style={{ padding: "10px 16px", fontSize: 13, borderRadius: 6 }}
              >
                Sayfaya Git
              </Link>
              <button 
                onClick={dismiss}
                className="btn secondary"
                style={{ padding: "10px 16px", fontSize: 13, borderRadius: 6, boxShadow: "none" }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

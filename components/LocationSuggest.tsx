"use client";

import { useState } from "react";
import { findNearestCity } from "@/lib/location";
import { X, Navigation, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Step = "idle" | "detecting" | "suggesting" | "error";

export function LocationSuggest() {
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("idle");
  const [suggestion, setSuggestion] = useState<{ name: string; slug: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // If dismissed or already on a relevant city page, don't show the initial prompt
  // But we let the user trigger it manually if they want (optional)
  if (isDismissed) return null;

  const handleTrigger = () => {
    if (!navigator.geolocation) {
      setStep("error");
      return;
    }

    setStep("detecting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCity(latitude, longitude);
        const currentCitySlug = pathname.split("/")[1];

        if (nearest) {
          setSuggestion({ name: nearest.name, slug: nearest.slug });
          setStep("suggesting");
        } else {
          setStep("error");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStep("error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
    );
  };

  const dismiss = () => {
    setIsDismissed(true);
    // We could use localStorage here if we wanted it to stay hidden across sessions
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        bottom: 24, 
        right: 24, 
        zIndex: 1000, 
        maxWidth: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 12
      }}
    >
      {/* 1. IDLE STATE: Floating Trigger Button */}
      {step === "idle" && (
        <button 
          onClick={handleTrigger}
          className="card hover shadow-lg"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10, 
            padding: "12px 20px", 
            background: "var(--brand-900)", 
            color: "white", 
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 10px 25px rgba(26,43,60,0.3)",
            animation: "reveal 0.5s ease"
          }}
        >
          <MapPin size={18} className="text-brand" />
          En Yakın Servis Noktasını Bul
        </button>
      )}

      {/* 2. DETECTING STATE: Loading Card */}
      {step === "detecting" && (
        <div className="card shadow-lg" style={{ padding: 20, animation: "reveal 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Loader2 size={24} className="animate-spin text-brand" />
            <span style={{ fontWeight: 700 }}>Konumunuz saptanıyor...</span>
          </div>
        </div>
      )}

      {/* 3. SUGGESTING STATE: Premium Suggestion Card */}
      {step === "suggesting" && suggestion && (
        <div className="card shadow-lg" style={{ padding: 24, border: "2px solid var(--brand)", position: "relative", animation: "reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <button 
            onClick={dismiss}
            style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
          >
            <X size={16} />
          </button>

          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Navigation size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 950, color: "var(--brand-900)", letterSpacing: 0.5 }}>BÖLGE TESPİT EDİLDİ</div>
              <div style={{ fontSize: 15, color: "var(--text)", marginTop: 6, lineHeight: 1.5 }}>
                Şu anda <strong>{suggestion.name}</strong> bölgesindesiniz. Size en yakın servis sayfasını görmek ister misiniz?
              </div>
              
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <Link 
                  href={`/${suggestion.slug}`} 
                  onClick={() => setIsDismissed(true)}
                  className="btn" 
                  style={{ padding: "10px 20px", fontSize: 14 }}
                >
                  Sayfaya Git
                </Link>
                <button 
                  onClick={() => setStep("idle")}
                  className="btn secondary"
                  style={{ padding: "10px 20px", fontSize: 14, boxShadow: "none" }}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ERROR STATE */}
      {step === "error" && (
        <div className="card shadow-lg" style={{ padding: 16, border: "1px solid #fee2e2", background: "#fef2f2" }}>
          <div style={{ fontSize: 13, color: "#991b1b", display: "flex", alignItems: "center", gap: 8 }}>
            <X size={16} />
            Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.
          </div>
          <button onClick={() => setStep("idle")} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, background: "none", border: "none", borderBottom: "1px solid currentcolor", cursor: "pointer" }}>Tekrar Dene</button>
        </div>
      )}
    </div>
  );
}

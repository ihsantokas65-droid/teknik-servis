"use client";

import { useState } from "react";
import { findNearestCity } from "@/lib/location";
import { X, Navigation, MapPin, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Step = "idle" | "detecting" | "suggesting" | "error";

export function LocationSuggest() {
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("idle");
  const [suggestion, setSuggestion] = useState<{ name: string; slug: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

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
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(242, 101, 34, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(242, 101, 34, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(242, 101, 34, 0); }
        }
        .radar-btn {
          animation: radar-pulse 2s infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .radar-btn:hover {
          transform: scale(1.05) translateY(-5px) !important;
          animation: none;
        }
      `}} />

      <div 
        style={{ 
          position: "fixed", 
          bottom: 24, 
          right: 24, 
          zIndex: 1000, 
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12
        }}
      >
        {/* 1. IDLE STATE: Floating Radar Trigger */}
        {step === "idle" && (
          <button 
            onClick={handleTrigger}
            className="radar-btn card shadow-lg"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              padding: "16px 28px", 
              background: "var(--brand-900)", 
              color: "white", 
              border: "2px solid var(--brand)",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 950,
              fontSize: 15,
              boxShadow: "0 15px 35px rgba(242, 101, 34, 0.25)",
              animation: "reveal 0.8s ease, radar-pulse 2s infinite"
            }}
          >
            <div style={{ position: 'relative' }}>
               <MapPin size={20} className="text-brand" />
               <div style={{ position: 'absolute', inset: -4, background: 'var(--brand)', borderRadius: '50%', opacity: 0.2, zIndex: -1 }}></div>
            </div>
            YAKININDAKİ EKİBİ GÖR
          </button>
        )}

        {/* 2. DETECTING STATE: Loading Card */}
        {step === "detecting" && (
          <div className="card shadow-lg" style={{ padding: "20px 30px", animation: "reveal 0.3s ease", border: "2px solid var(--brand)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Loader2 size={28} className="animate-spin text-brand" />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 950, fontSize: 16 }}>Konum Saptanıyor</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Mesafe taranıyor...</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SUGGESTING STATE: Premium Result Card */}
        {step === "suggesting" && suggestion && (
          <div className="card shadow-lg" style={{ padding: 28, border: "3px solid var(--brand)", position: "relative", animation: "reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)", background: "var(--surface)" }}>
            <button 
              onClick={dismiss}
              style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 8 }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-soft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: 'inset 0 0 0 1px var(--brand)' }}>
                <Navigation size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 950, color: "var(--brand)", letterSpacing: 1, textTransform: 'uppercase' }}>Konum Doğrulandı</div>
                <div style={{ fontSize: 17, color: "var(--brand-900)", marginTop: 8, lineHeight: 1.4, fontWeight: 800 }}>
                  Şu anda <strong>{suggestion.name}</strong> bölgesindesiniz.
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>
                   Size en hızlı hizmeti verecek teknik ekibi bulduk. Sayfaya gitmek ister misiniz?
                </p>
                
                <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                  <Link 
                    href={`/${suggestion.slug}`} 
                    onClick={() => setIsDismissed(true)}
                    className="btn shadow-md" 
                    style={{ padding: "12px 24px", fontSize: 15, flex: 1 }}
                  >
                    Sayfaya Git
                  </Link>
                  <button 
                    onClick={() => setStep("idle")}
                    className="btn secondary"
                    style={{ padding: "12px 24px", fontSize: 15, boxShadow: "none" }}
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ERROR STATE */}
        {step === "error" && (
          <div className="card shadow-lg" style={{ padding: 20, border: "1px solid #fee2e2", background: "#fef2f2", maxWidth: 280 }}>
            <div style={{ fontSize: 14, color: "#991b1b", display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
              <X size={18} />
              Bölge saptanamadı.
            </div>
            <p style={{ fontSize: 13, color: "#991b1b", marginTop: 8, opacity: 0.8 }}>Tarayıcı izinlerini kontrol edip sayfayı yenileyebilirsiniz.</p>
            <button onClick={() => setStep("idle")} style={{ marginTop: 12, color: "var(--brand-900)", fontSize: 13, fontWeight: 900, background: "none", border: "none", borderBottom: "2px solid var(--brand)", cursor: "pointer", padding: 0 }}>Tekrar Dene</button>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { findNearestCity } from "@/lib/location";
import { X, Navigation, MapPin, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
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
          animation: radar-pulse 2.5s infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .radar-btn:hover {
          transform: scale(1.03) translateY(-3px) !important;
          animation: none;
        }
      `}} />

      <div 
        style={{ 
          position: "fixed", 
          bottom: 24, 
          right: 24, 
          zIndex: 1000, 
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12
        }}
      >
        {/* 1. IDLE STATE: Floating Corporate Trigger */}
        {step === "idle" && (
          <button 
            onClick={handleTrigger}
            className="radar-btn card shadow-lg"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              padding: "16px 26px", 
              background: "var(--brand-900)", 
              color: "white", 
              border: "2px solid var(--border)",
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 14,
              boxShadow: "0 15px 35px rgba(26,43,60,0.2)",
              animation: "reveal 0.8s ease, radar-pulse 2.5s infinite"
            }}
          >
            <ShieldCheck size={20} className="text-brand" />
            SİZE EN YAKIN KURUMSAL SERVİS
          </button>
        )}

        {/* 2. DETECTING STATE: Loading Card */}
        {step === "detecting" && (
          <div className="card shadow-lg" style={{ padding: "20px 30px", animation: "reveal 0.3s ease", border: "1px solid var(--brand)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Loader2 size={24} className="animate-spin text-brand" />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>Sistem Doğrulanıyor</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Güvenli konum tespiti aktif...</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SUGGESTING STATE: Premium Result Card */}
        {step === "suggesting" && suggestion && (
          <div className="card shadow-lg" style={{ padding: 28, borderBottom: "4px solid var(--brand)", position: "relative", animation: "reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)", background: "var(--surface)" }}>
            <button 
              onClick={dismiss}
              style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 8 }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-900)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: '0 8px 16px rgba(26,43,60,0.15)' }}>
                <CheckCircle2 size={28} className="text-brand" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 950, color: "var(--brand)", letterSpacing: 1.2, textTransform: 'uppercase' }}>KURUMSAL BÖLGE TESPİTİ</div>
                <div style={{ fontSize: 18, color: "var(--brand-900)", marginTop: 8, lineHeight: 1.4, fontWeight: 900 }}>
                  <strong>{suggestion.name}</strong> Merkez Servis Birimi
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8, fontWeight: 500 }}>
                   Bulunduğunuz bölgeye hizmet veren onaylı teknik ekibimize yönlendiriliyorsunuz.
                </p>
                
                <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                  <Link 
                    href={`/${suggestion.slug}`} 
                    onClick={() => setIsDismissed(true)}
                    className="btn shadow-md" 
                    style={{ padding: "12px 24px", fontSize: 14, flex: 2 }}
                  >
                    Bölge Sayfasına Git
                  </Link>
                  <button 
                    onClick={() => setStep("idle")}
                    className="btn secondary"
                    style={{ padding: "12px 24px", fontSize: 14, flex: 1, boxShadow: "none" }}
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
          <div className="card shadow-lg" style={{ padding: 20, borderTop: "4px solid #ef4444", background: "white", maxWidth: 280 }}>
            <div style={{ fontSize: 14, color: "#991b1b", display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
              <Navigation size={18} />
              Bölge Saptanamadı
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Güvenliğiniz için konum izninizi tarayıcı ayarlarından kontrol ediniz.</p>
            <button onClick={() => setStep("idle")} style={{ marginTop: 12, color: "var(--brand-900)", fontSize: 13, fontWeight: 900, background: "none", border: "none", borderBottom: "2px solid var(--brand)", cursor: "pointer", padding: 0 }}>Tekrar Dene</button>
          </div>
        )}
      </div>
    </>
  );
}

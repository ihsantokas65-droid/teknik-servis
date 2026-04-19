"use client";

import { useState, useEffect, useMemo } from "react";
import { findNearestCity } from "@/lib/location";
import { X, Navigation, MapPin, Loader2, ShieldCheck, CheckCircle2, PhoneCall, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { WhatsAppForm } from "./WhatsAppForm";

type Step = "idle" | "detecting" | "error";

interface LocationSuggestProps {
  ipCity?: string;
}

export function LocationSuggest({ ipCity }: LocationSuggestProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("idle");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Reset step on route change
  useEffect(() => {
    setStep("idle");
  }, [pathname]);

  // Check if we are on a service-specific page (not home, not catalog)
  const isServicePage = useMemo(() => {
    const staticRoutes = ["/", "/servis-bolgelerimiz", "/servis-ucretleri", "/sitemap", "/blog", "/servis-bolgeleri"];
    return pathname !== "/" && !staticRoutes.some(route => pathname.startsWith(route) && route !== "/");
  }, [pathname]);

  // Extract city/district from pathname for form defaults
  const pathParts = pathname.split("/").filter(Boolean);
  const currentCity = pathParts[0] || ipCity || "";
  const currentDistrict = pathParts[1] || "";

  if (isDismissed) return null;

  const handleLocationTrigger = () => {
    // Geolocation trigger
    if (!navigator.geolocation) {
      setStep("error");
      return;
    }

    setStep("detecting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Include ipCity in hints to improve accuracy in boundary areas (like Bursa/Bilecik border)
        const nearest = findNearestCity(latitude, longitude, [currentCity, currentDistrict, ipCity]);
        
        if (nearest) {
          router.push(`/${nearest.slug}`);
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

  const handleCallTrigger = () => {
    window.location.href = `tel:${site.phone.replace(/\s+/g, "")}`;
  };

  return (
    <>
      <WhatsAppForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        defaultCity={currentCity}
        defaultDistrict={currentDistrict}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(242, 101, 34, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(242, 101, 34, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(242, 101, 34, 0); }
        }
        @keyframes call-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .radar-btn {
          animation: radar-pulse 2.5s infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .radar-btn:hover, .call-btn:hover {
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
          gap: 12,
          paddingBottom: "var(--safe-bottom, 0px)"
        }}
        className="location-suggest-container"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 768px) {
            .location-suggest-container {
              bottom: 100px !important;
              right: 20px !important;
              left: 20px !important;
              max-width: none !important;
            }
            .radar-btn {
              width: 100%;
              justify-content: center;
              padding: 12px 20px !important;
              font-size: 11px !important;
              border-radius: 10px !important;
              box-shadow: 0 10px 25px rgba(26,43,60,0.3) !important;
            }
          }
        `}} />
        {/* 1. IDLE STATE: Floating Trigger */}
        {step === "idle" && (
          <button 
            onClick={handleLocationTrigger}
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
              fontSize: 13,
              letterSpacing: "0.2px",
              boxShadow: "0 15px 35px rgba(26,43,60,0.2)",
              animation: "reveal 0.8s ease"
            }}
          >
            <ShieldCheck size={20} className="text-brand" />
            EN YAKIN YETKİLİ SERVİSİ BUL
          </button>
        )}

        {/* 2. DETECTING STATE */}
        {step === "detecting" && (
          <div className="card shadow-lg" style={{ padding: "20px 30px", animation: "reveal 0.3s ease", border: "1px solid var(--brand)", background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Loader2 size={24} className="animate-spin text-brand" />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>Bölge Saptanıyor</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Bulunduğunuz yere yönlendiriliyorsunuz...</div>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneCall, MessageCircle, X, ChevronRight, Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function ChatBot() {
  const [visible, setVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Reveal chatbot on scroll
    const onScroll = () => {
      const threshold = window.innerWidth < 769 ? 50 : 300;
      if (window.scrollY >= threshold) {
        setVisible(true);
        // Auto-open chatbot ONCE on desktop after some scroll
        if (!hasOpened && window.innerWidth > 768 && window.scrollY > 800) {
          setIsOpen(true);
          setHasOpened(true);
        }
      } else {
        setVisible(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hasOpened]);

  // Close when navigating routes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const tel = digitsOnly(site.phone);
  const wa = digitsOnly(site.whatsapp);
  
  const getWaUrl = (promptText?: string) => {
    let message = promptText || "Merhaba, servis randevusu ve bilgi almak istiyorum.";
    
    if (!promptText) {
      if (pathname.includes("/ariza-kodlari/")) {
        message = `Merhaba, ${pathname.split('/').pop()} kilitlenme sorunu yaşıyorum.`;
      } else if (pathname.split("/").length >= 4) {
        const parts = pathname.split("/").filter(Boolean);
        const service = parts[2]?.replace(/-/g, " ");
        const area = parts[1]?.replace(/-/g, " ");
        if (service && area) {
          message = `Merhaba, ${area} bölgesi ${service} ihtiyacı için randevu almak istiyorum.`;
        }
      }
    }
    
    return `https://wa.me/${wa.replace("+", "")}?text=${encodeURIComponent(message)}`;
  };

  const genericWaUrl = getWaUrl();

  const quickReplies = [
    { label: "💳 Fiyat Öğrenmek İstiyorum", msg: "Merhaba, cihazımın arızası için servis ve fiyat bilgisi alabilir miyim?" },
    { label: "📅 Arıza Kaydı Oluştur", msg: "Merhaba, cihazım arızalandı. Arıza kaydı bırakmak istiyorum." },
    { label: "⚠️ Cihazım Hata Kodu Veriyor", msg: "Merhaba, cihazım ekranda arıza kodu veriyor. Acil destek lazım." },
    { label: "📞 Müşteri Temsilcisiyle Görüş", msg: "Merhaba, direkt bir uzmanla görüşmek istiyorum." }
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Sticky Bar (Always visible bottom bar on mobile) */}
      <div className={`mobileOnly stickyCtaBar ${visible ? 'active' : ''}`} style={{ 
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease", position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', display: 'flex', gap: 10, padding: '12px 16px',
        borderTop: '1px solid var(--border)', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
      }}>
        <Link className="btn focus-ring" href={`tel:${tel}`} style={{ flex: 1, padding: "14px", borderRadius: 10, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <PhoneCall size={20} /> Hemen Ara
        </Link>
        <button onClick={() => setIsOpen(true)} className="btn secondary focus-ring" style={{ flex: 1, padding: "14px", borderRadius: 10, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "white", borderColor: "#25D366" }}>
          <MessageCircle size={20} /> WhatsApp
        </button>
      </div>

      {/* Chat Window */}
      <div style={{
          position: "fixed",
          bottom: window.innerWidth < 769 ? 80 : 100,
          right: window.innerWidth < 769 ? 16 : 24,
          left: window.innerWidth < 769 ? 16 : "auto",
          width: window.innerWidth < 769 ? "auto" : 360,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          zIndex: 1001,
          overflow: "hidden",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s"
      }}>
        {/* Header */}
        <div style={{ background: "var(--brand)", padding: 20, color: "var(--brand-900)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "white", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Servis Asistanı</div>
              <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, background: "#25D366", borderRadius: "50%" }}></span> Çevrimiçi
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 4 }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, background: "#f0f2f5", minHeight: 180 }}>
          <div style={{ background: "white", padding: 16, borderRadius: "0 16px 16px 16px",boxShadow: "0 1px 2px rgba(0,0,0,0.05)", marginBottom: 16, maxWidth: "90%", fontSize: 14 }}>
            Merhaba! 👋<br/><br/>
            Cihazınızdaki sorunu veya bulunduğunuz ilçeyi seçerek destek alabilirsiniz. Size nasıl yardımcı olabilirim?
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            {quickReplies.map((qr, idx) => (
              <Link 
                key={idx} 
                href={getWaUrl(qr.msg)} 
                target="_blank" 
                className="chip hover focus-ring" 
                style={{ background: "#DCF8C6", border: "1px solid #c0ebaa", color: "#111", padding: "10px 16px", borderRadius: "16px 0 16px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                onClick={() => setIsOpen(false)}
              >
                {qr.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ padding: 16, background: "white", fontSize: 12, textAlign: "center", color: "var(--muted)" }}>
          WhatsApp üzerinden 7/24 randevu oluşturabilirsiniz.
        </div>
      </div>

      {/* Desktop Floating Avatar Button */}
      <div className="desktopOnly" style={{
        position: "fixed", right: 24, bottom: 24, zIndex: 60,
        opacity: visible && !isOpen ? 1 : 0, pointerEvents: visible && !isOpen ? "auto" : "none",
        transform: visible && !isOpen ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 300ms ease, transform 300ms ease"
      }}>
        <button onClick={() => setIsOpen(true)} className="btn focus-ring" style={{ width: 64, height: 64, borderRadius: "50%", boxShadow: "0 10px 25px rgba(21,94,239,.3)", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} title="Canlı Destek" aria-label="Canlı Destek">
          <MessageCircle size={28} />
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) { .desktopOnly { display: none !important; } }
        @media (min-width: 769px) { .mobileOnly { display: none !important; } }
      `}</style>
    </>
  );
}

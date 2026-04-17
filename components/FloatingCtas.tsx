"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneCall, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function FloatingCtas() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      // For mobile, we show it instantly OR after very small scroll
      const threshold = window.innerWidth < 769 ? 0 : 300;
      setVisible(window.scrollY >= threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const tel = digitsOnly(site.phone);
  const wa = digitsOnly(site.whatsapp);
  
  // Dynamic WhatsApp Message Logic
  const getWaUrl = () => {
    let message = "Merhaba, servis randevusu ve bilgi almak istiyorum.";
    
    if (pathname.includes("/blog/")) {
      message = "Merhaba, blog yazınızdaki konuyla ilgili teknik destek almak istiyorum.";
    } else if (pathname.split("/").length >= 4) {
      // It's a service page: /[city]/[district]/[service]
      const parts = pathname.split("/").filter(Boolean);
      const service = parts[2]?.replace(/-/g, " ");
      const area = parts[1]?.replace(/-/g, " ");
      if (service && area) {
        message = `Merhaba, ${area} bölgesi ${service} hizmetiniz için randevu almak istiyorum.`;
      }
    }
    
    return `https://wa.me/${wa.replace("+", "")}?text=${encodeURIComponent(message)}`;
  };

  const waUrl = getWaUrl();

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className={`stickyCtaBar mobileOnly ${visible ? 'active' : ''}`} style={{ 
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        display: 'flex',
        gap: 10,
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
      }}>
        <Link
          className="btn focus-ring"
          href={`tel:${tel}`}
          style={{ flex: 1, padding: "14px", borderRadius: 10, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <PhoneCall size={20} /> Hemen Ara
        </Link>
        <Link
          className="btn secondary focus-ring"
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          style={{ flex: 1, padding: "14px", borderRadius: 10, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <MessageCircle size={20} /> WhatsApp
        </Link>
      </div>

      {/* Desktop Floating Buttons */}
      <div
        className="desktopOnly"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 60,
          display: "grid",
          gap: 14,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 300ms ease, transform 300ms ease"
        }}
      >
        <Link
          className="btn focus-ring"
          href={`tel:${tel}`}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            boxShadow: "0 10px 25px rgba(21,94,239,.3)",
            fontSize: 24,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Bizi Arayın"
          aria-label="Bizi Arayın"
        >
          <PhoneCall size={26} />
        </Link>
        <Link
          className="btn secondary focus-ring"
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            boxShadow: "0 10px 25px rgba(0,0,0,.1)",
            fontSize: 24,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="WhatsApp Destek"
          aria-label="WhatsApp Destek"
        >
          <MessageCircle size={26} />
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktopOnly { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobileOnly { display: none !important; }
        }
      `}</style>
    </>
  );
}


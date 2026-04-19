"use client";

import { useEffect, useState } from "react";
import { PhoneCall } from "lucide-react";
import { site } from "@/lib/site";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function FloatingCall() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after 50px of scroll on mobile, 300px on desktop
      const threshold = window.innerWidth < 769 ? 50 : 300;
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes call-pulse-minimal {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(26,43,60, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(26,43,60, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(26,43,60, 0); }
        }
        .animate-call-pulse {
          animation: call-pulse-minimal 2.5s infinite ease-in-out;
        }
        @media (max-width: 768px) {
          .desktop-only-call { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only-call { display: none !important; }
        }
      `}} />

      {/* MOBILE: Sticky Bottom Bar */}
      <div 
        className="mobile-only-call"
        style={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1100,
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border)",
          padding: "12px 16px",
          boxShadow: "0 -5px 20px rgba(0,0,0,0.05)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex"
        }}
      >
        <a 
          href={`tel:${tel}`}
          style={{
            flex: 1,
            background: "var(--brand-900)",
            color: "white",
            padding: "14px",
            borderRadius: 12,
            textAlign: "center",
            fontWeight: 900,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textDecoration: "none"
          }}
        >
          <PhoneCall size={20} />
          HEMEN ARA: {site.phone}
        </a>
      </div>

      {/* DESKTOP: Floating Left Circle */}
      <div 
        className="desktop-only-call"
        style={{ 
          position: "fixed", 
          bottom: 24, 
          left: 24, 
          zIndex: 1000,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.4s ease-out",
          pointerEvents: visible ? "auto" : "none"
        }}
      >
        <a 
          href={`tel:${tel}`}
          title="Müşteri Hizmetlerini Ara"
          className="animate-call-pulse"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--brand-900)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(26,43,60,0.3)",
            border: "2px solid white",
            textDecoration: "none"
          }}
        >
          <PhoneCall size={26} />
        </a>
      </div>
    </>
  );
}

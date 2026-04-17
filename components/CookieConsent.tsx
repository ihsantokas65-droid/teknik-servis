"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      // Delay visibility for a smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 48px)",
        maxWidth: 600,
        background: "white",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        borderRadius: 16,
        padding: "20px 24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, color: "var(--brand-900)", fontSize: 16, marginBottom: 4 }}>
          🍪 Deneyiminizi İyileştiriyoruz
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
          Sizlere daha iyi bir deneyim sunabilmek için çerezleri kullanıyoruz. Devam ederek{" "}
          <Link href="/cerez-politikasi" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            Çerez Politikamızı
          </Link>{" "}
          kabul etmiş sayılırsınız.
        </div>
      </div>
      
      <button
        onClick={handleAccept}
        className="btn"
        style={{
          padding: "10px 24px",
          fontSize: 14,
          whiteSpace: "nowrap",
          boxShadow: "none",
        }}
      >
        Kabul Et
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 40px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (max-width: 640px) {
          div[style*="slideUp"] {
            flex-direction: column;
            gap: 16px;
            text-align: center;
            bottom: 12px;
            width: calc(100% - 24px);
          }
          button { width: 100%; }
        }
      `}} />
    </div>
  );
}

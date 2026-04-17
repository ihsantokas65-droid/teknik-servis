"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, MapPin, X } from "lucide-react";
import { createRng, pickOne } from "@/lib/variation";

const NAMES = ["Fatma", "Mehmet", "Ayşe", "Mustafa", "Emine", "Ahmet", "Hatice", "Ali", "Zeynep", "Hüseyin", "Elif", "Murat"];
const ACTIONS = ["servis kaydı açtı", "kombi bakımı yaptırdı", "ankastre servis talebi iletti", "teknik destek randevusu aldı"];

export function SocialProof({ city = "İstanbul" }) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: "", action: "", time: "" });

  useEffect(() => {
    const showNotification = () => {
      const rng = createRng(Math.random().toString());
      const name = pickOne(rng, NAMES);
      const action = pickOne(rng, ACTIONS);
      const minutes = Math.floor(Math.random() * 55) + 5;
      
      setData({ name, action, time: `${minutes} dk önce` });
      setVisible(true);

      setTimeout(() => setVisible(false), 7000); // 7 saniye göster
    };

    // İlk gösterim 10sn sonra, sonra her 30-45sn'de bir
    const initialTimer = setTimeout(showNotification, 10000);
    const interval = setInterval(showNotification, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [city]);

  if (!visible) return null;

  return (
    <div 
      style={{ 
        position: "fixed", 
        bottom: 24, 
        left: 24, 
        zIndex: 1500, 
        maxWidth: 320,
        animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100%) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}} />
      <div className="card shadow-lg" style={{ padding: 16, borderLeft: "4px solid #22c55e", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0fdf4", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CheckCircle2 size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--brand-900)" }}>
            {data.name} • {city}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {data.action}
          </div>
          <div style={{ fontSize: 10, color: "var(--brand)", fontWeight: 800, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
             <MapPin size={10} /> {data.time}
          </div>
        </div>
        <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", alignSelf: "flex-start", padding: 4 }}>
           <X size={14} />
        </button>
      </div>
    </div>
  );
}

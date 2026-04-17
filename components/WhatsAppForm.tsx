"use client";

import { useState, useEffect } from "react";
import { X, Phone, User, Settings, AlertCircle, Send, MapPin, Tag } from "lucide-react";
import { site } from "@/lib/site";

type WhatsAppFormProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
  defaultDistrict?: string;
  defaultBrand?: string;
  defaultService?: string;
};

export function WhatsAppForm({ 
  isOpen, 
  onClose, 
  defaultCity = "", 
  defaultDistrict = "", 
  defaultBrand = "",
  defaultService = ""
}: WhatsAppFormProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [brand, setBrand] = useState(defaultBrand);
  const [issue, setIssue] = useState("");
  const [address, setAddress] = useState("");
  useEffect(() => {
    // Adresi sayfa bilgisinden oluştur
    const autoAddress = [defaultCity, defaultDistrict].filter(Boolean).join(" / ");
    if (autoAddress) setAddress(autoAddress);
  }, [defaultCity, defaultDistrict]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `*Yeni Servis Talebi* 🛠️\n` +
      `--------------------------\n` +
      `👤 *İsim:* ${name}\n` +
      `📞 *Telefon:* ${phoneNumber}\n` +
      `📌 *Konum:* ${address}\n` +
      `🏷️ *Marka/Cihaz:* ${brand || "Belirtilmedi"}\n` +
      `❓ *Sorun:* ${issue}\n` +
      `--------------------------\n` +
      "_Hemen Servis İstiyorum_" ;

    const encodedMessage = encodeURIComponent(message);
    window.location.href = `https://wa.me/${site.whatsapp.replace("+", "")}?text=${encodedMessage}`;
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(1, 36, 90, 0.8)", backdropFilter: "blur(4px)" }} 
      />
      
      {/* Modal */}
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: 500, position: "relative", zIndex: 1, padding: 0, overflow: "hidden", animation: "reveal 0.4s ease" }}>
        {/* Header */}
        <div style={{ background: "var(--brand)", color: "var(--brand-900)", padding: "24px 30px", borderBottom: "1px solid var(--border)" }}>
           <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "inherit", opacity: 0.6, cursor: "pointer" }}>
             <X size={24} />
           </button>
           <h3 style={{ fontSize: 22, fontWeight: 950, letterSpacing: -1 }}>Hızlı Servis Formu</h3>
           <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
             Bilgilerinizi girin, en yakın ekibimizi size yönlendirelim.
           </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 30, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                <User size={14} className="text-brand" /> Ad Soyad
              </label>
              <input 
                type="text" 
                required 
                placeholder="Örn: Ahmet Yılmaz" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                <Phone size={14} className="text-brand" /> Telefon
              </label>
              <input 
                type="tel" 
                required 
                placeholder="05XX XXX XX XX" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
              <Tag size={14} className="text-brand" /> Marka & Model (Opsiyonel)
            </label>
            <input 
              type="text" 
              placeholder="Örn: Bosch Kombi" 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
              <MapPin size={14} className="text-brand" /> Açık Adres veya Bölge
            </label>
            <input 
              type="text" 
              required
              placeholder="Mahalle, Sokak, Kapı No..." 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
              <AlertCircle size={14} className="text-brand" /> Şikayetiniz Nedir?
            </label>
            <textarea 
              required 
              rows={3}
              placeholder="Arızayı kısaca tarif ediniz..." 
              value={issue} 
              onChange={(e) => setIssue(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, resize: "none" }}
            />
          </div>

          <button 
            type="submit" 
            className="btn shadow-lg" 
            style={{ 
              marginTop: 10, 
              padding: "16px", 
              fontSize: 16, 
              fontWeight: 950, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 10,
              background: "var(--brand)",
              color: "var(--brand-900)"
            }}
          >
            <Send size={18} />
            WhatsApp ile Hemen Gönder
          </button>
        </form>
      </div>
    </div>
  );
}

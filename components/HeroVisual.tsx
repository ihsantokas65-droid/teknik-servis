import Image from "next/image";
import type { ServiceKind } from "@/lib/services";
import { serviceLabelFromKind } from "@/lib/services";
import { ShieldCheck } from "lucide-react";

function pickBg(kind: ServiceKind | null) {
  if (kind === "klima") return "/images/klima2.webp";
  if (kind === "beyaz-esya") return "/images/bulasik.webp";
  if (kind === "kombi") return "/images/kombi2.webp";
  return "/images/home-one-img1.webp";
}

export function HeroVisual({
  city,
  district,
  brand,
  serviceLabel,
  serviceKind
}: {
  city: string;
  district?: string;
  brand?: string;
  serviceLabel?: string;
  serviceKind: ServiceKind | null;
}) {
  const label = serviceLabel || (serviceKind ? serviceLabelFromKind(serviceKind) : "");
  const title = [city, district, label].filter(Boolean).join(" ");
  const subtitle = brand ? `${brand} Teknik Destek ve Bakım` : "Garantili Yerinden Tespit & Hızlı Müdahale";
  const bg = pickBg(serviceKind);

  return (
    <div
      className="card hero"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid var(--border)",
        aspectRatio: "1200 / 520",
        background: "var(--brand-900)"
      }}
      role="region"
      aria-label={title}
    >
      <Image 
        src={bg} 
        alt={title}
        priority={true}
        fetchPriority="high"
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        style={{ objectFit: "cover", opacity: 0.25 }}
      />
      
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(90deg, rgba(1, 36, 90, 0.98) 0%, rgba(1, 36, 90, 0.6) 100%)",
          zIndex: 1
        }} 
      />

      <div style={{ position: "absolute", left: '6%', right: '6%', top: "50%", transform: "translateY(-50%)", maxWidth: 720, zIndex: 10 }}>
        <div 
          style={{ 
            background: "var(--brand)", 
            color: "var(--brand-900)", 
            padding: "6px 14px", 
            borderRadius: 30, 
            fontSize: 12, 
            fontWeight: 800, 
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 24
          }}
        >
          <ShieldCheck size={14} /> 1 YIL PARÇA GARANTİSİ
        </div>
        
        <h1 
          style={{ 
            fontWeight: 950, 
            fontSize: 'clamp(32px, 6vw, 56px)',
            lineHeight: 1,
            letterSpacing: "-2.5px", 
            color: "white",
            marginBottom: 20
          }}
        >
          {title}
        </h1>

        <div style={{ 
          fontSize: 'clamp(16px, 2.5vw, 22px)', 
          fontWeight: 600, 
          color: "rgba(255,255,255,0.9)", 
          letterSpacing: -0.5,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          {subtitle}
        </div>
        
        <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
          <div style={{ background: "white", color: "var(--brand-900)", padding: "16px 32px", borderRadius: 12, fontWeight: 950, fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}>
            Randevu Oluştur
          </div>
          <div style={{ border: "2px solid rgba(255,255,255,0.2)", color: "white", padding: "16px 32px", borderRadius: 12, fontWeight: 950, fontSize: 16, cursor: "pointer" }}>
            Hizmet Detayları
          </div>
        </div>
      </div>
    </div>
  );
}


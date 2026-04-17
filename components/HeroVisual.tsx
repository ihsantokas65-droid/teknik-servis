import Image from "next/image";
import type { ServiceKind } from "@/lib/services";

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
  const title = [city, district].filter(Boolean).join(" ");
  const subtitle = [brand, serviceLabel].filter(Boolean).join(" • ");
  const bg = pickBg(serviceKind);

  return (
    <div
      className="card hero"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        border: "1px solid var(--border)",
        minHeight: 380,
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "var(--brand-900)"
      }}
      role="region"
      aria-label={subtitle ? `${title} ${subtitle}` : title}
    >
      <Image 
        src={bg} 
        alt={`${title} ${serviceLabel || "Teknik Servis"} Hizmeti`}
        priority={true}
        fetchPriority="high"
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        style={{ objectFit: "cover", opacity: 0.15 }}
      />
      
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(90deg, rgba(1, 36, 90, 0.95) 0%, rgba(1, 36, 90, 0.4) 100%)",
          zIndex: 1
        }} 
      />

      <div style={{ position: "absolute", left: '5%', right: '5%', top: "50%", transform: "translateY(-50%)", maxWidth: 640, zIndex: 10 }}>
        <div 
          style={{ 
            background: "var(--brand)", 
            color: "var(--brand-900)", 
            padding: "8px 16px", 
            borderRadius: 6, 
            fontSize: 12, 
            fontWeight: 800, 
            display: "inline-block",
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 20
          }}
        >
          {brand || "Kurumsal"} Teknik Servis
        </div>
        
        <h1 
          style={{ 
            fontWeight: 950, 
            fontSize: 'clamp(32px, 5vw, 48px)',
            lineHeight: 1.05,
            letterSpacing: "-2.5px", 
            color: "white",
            marginBottom: 16
          }}
        >
          {title}
        </h1>

        {subtitle ? (
          <div style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: -0.5 }}>
            {subtitle}
          </div>
        ) : null}
        
        <div style={{ marginTop: 32, display: "flex", gap: 14 }}>
          <div style={{ background: "var(--brand)", color: "var(--brand-900)", padding: "14px 28px", borderRadius: 10, fontWeight: 950, fontSize: 16, boxShadow: "0 15px 35px rgba(255,197,38,0.25)" }}>
            Hemen Bilgi Al
          </div>
        </div>
      </div>
    </div>
  );
}


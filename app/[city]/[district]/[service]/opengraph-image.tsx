import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Helper for edge runtime (No FS allowed)
function capitalize(str: string) {
  if (!str) return "";
  return str.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(" ");
}

export default function Image({ params }: { params: { city: string; district: string; service: string } }) {
  const city = capitalize(params.city);
  const district = capitalize(params.district);
  const service = capitalize(params.service);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #01245a 0%, #067eef 100%)",
          color: "white",
          padding: 80,
          fontFamily: "ui-sans-serif, system-ui",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative Graphic Element */}
        <div
          style={{
            position: "absolute",
            right: -100,
            bottom: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,197,38,0.2) 0%, transparent 60%)",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", color: "#ffc526" }}>
            {site.name}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.9, background: "rgba(0,0,0,0.3)", padding: "10px 24px", borderRadius: 999 }}>
            Türkiye Geneli Teknik Ağ
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: "auto", marginBottom: "auto" }}>
          <div style={{ fontSize: 36, color: "#ffc526", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>
            {city} {district}
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-2px" }}>
            {service}
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, opacity: 0.9, marginTop: 20 }}>
            Hızlı, Kurumsal ve Garantili Müdahale
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ffc526" }} />
            <span style={{ fontSize: 24, fontWeight: 600 }}>1 Yıl Garanti</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ffc526" }} />
            <span style={{ fontSize: 24, fontWeight: 600 }}>Orijinal Yedek Parça</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}

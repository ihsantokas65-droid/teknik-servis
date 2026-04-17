import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0b1020, #121b3e)",
          color: "white",
          padding: 64,
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "ui-sans-serif, system-ui"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 22, opacity: 0.9 }}>{site.name}</div>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05 }}>Bakım • Onarım • Tespit</div>
          <div style={{ fontSize: 26, opacity: 0.85 }}>{site.address.city}</div>
        </div>
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 32,
            background: "radial-gradient(circle at 30% 30%, rgba(55,214,122,.75), rgba(79,124,255,.55))",
            boxShadow: "0 24px 60px rgba(0,0,0,.45)",
            border: "1px solid rgba(255,255,255,.18)"
          }}
        />
      </div>
    ),
    size
  );
}


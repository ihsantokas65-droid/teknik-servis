import React from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { serviceKindFromSlug, services } from "@/lib/services";

export const runtime = "nodejs";

function clampText(value: string, max = 54) {
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max - 1)}…`;
}

const imageCache = new Map<string, string>();

async function readPublicImageAsDataUrl(relativePathFromPublic: string) {
  const cached = imageCache.get(relativePathFromPublic);
  if (cached) return cached;

  const full = path.join(process.cwd(), "public", relativePathFromPublic);
  const buf = await readFile(full);
  const ext = path.extname(relativePathFromPublic).toLowerCase();
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : "application/octet-stream";

  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  imageCache.set(relativePathFromPublic, dataUrl);
  return dataUrl;
}

async function pickBackground(kind: "kombi" | "klima" | "beyaz-esya" | "default") {
  const candidates =
    kind === "klima"
      ? ["images/klima.webp", "images/klima2.webp", "images/home-one-img1.webp"]
      : kind === "beyaz-esya"
        ? ["images/bulasik.webp", "images/tv.webp", "images/home-one-img1.webp"]
        : kind === "kombi"
          ? ["images/kombi.webp", "images/kombi2.webp", "images/home-one-img1.webp"]
          : ["images/home-one-img1.webp", "images/1.webp", "images/3.webp"];

  for (const rel of candidates) {
    try {
      return await readPublicImageAsDataUrl(rel);
    } catch {
      // try next
    }
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "Türkiye";
  const district = searchParams.get("district") ?? "";
  const serviceSlug = searchParams.get("service") ?? "";
  const brand = searchParams.get("brand") ?? "";

  const kind = serviceSlug ? serviceKindFromSlug(serviceSlug) : null;
  const serviceLabel = serviceSlug ? services.find((s) => s.slug === serviceSlug)?.label ?? "" : "";

  const titleLeft = clampText([city, district].filter(Boolean).join(" "));
  const titleRight = clampText([brand, serviceLabel].filter(Boolean).join(" "));

  const accent = kind === "klima" ? "#0ea5e9" : kind === "beyaz-esya" ? "#16a34a" : "#155eef";

  const bg = await pickBackground((kind ?? "default") as "kombi" | "klima" | "beyaz-esya" | "default");

  const e = React.createElement;

  return new ImageResponse(
    e(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          color: "#0b1220",
          background: "#f6f8fc",
          position: "relative",
          overflow: "hidden"
        }
      },
      bg
        ? e("img", {
            src: bg,
            alt: "",
            style: {
              position: "absolute",
              inset: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              opacity: 0.92
            }
          })
        : null,
      e("div", {
        style: {
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(246,248,252,0.96) 0%, rgba(246,248,252,0.92) 45%, rgba(246,248,252,0.70) 100%)"
        }
      }),
      e(
        "div",
        { style: { position: "relative", display: "flex", justifyContent: "space-between", gap: "24px" } },
        e(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "14px" } },
          e("div", {
            style: {
              width: "52px",
              height: "52px",
              borderRadius: "18px",
              background: `linear-gradient(135deg, ${accent}, #0b2f7a)`,
              boxShadow: "0 18px 30px rgba(21,94,239,.25)"
            }
          }),
          e(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "2px" } },
            e("div", { style: { fontSize: "18px", fontWeight: 900, opacity: 0.92 } }, "Teknik Servis"),
            e("div", { style: { fontSize: "14px", fontWeight: 700, color: "#4b5568" } }, "Kombi • Klima • Beyaz Eşya")
          )
        ),
        e(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(21,94,239,0.20)",
              background: "rgba(255,255,255,0.78)"
            }
          },
          e("span", { style: { fontSize: "14px", fontWeight: 800, color: "#0b2f7a" } }, "81 il"),
          e("span", { style: { width: "6px", height: "6px", borderRadius: "999px", background: accent } }),
          e("span", { style: { fontSize: "14px", fontWeight: 800, color: "#0b2f7a" } }, "İlçe bazlı")
        )
      ),
      e(
        "div",
        { style: { position: "relative", display: "flex", flexDirection: "column", gap: "14px" } },
        e("div", { style: { fontSize: "52px", fontWeight: 950, letterSpacing: "-0.8px", lineHeight: 1.1 } }, titleLeft),
        e(
          "div",
          { style: { fontSize: "34px", fontWeight: 900, color: "#0b2f7a", letterSpacing: "-0.4px" } },
          titleRight || "Servis Bilgilendirme Sayfası"
        ),
        e(
          "div",
          { style: { fontSize: "18px", fontWeight: 700, color: "#4b5568", maxWidth: "900px" } },
          "Kurumsal süreç: tespit → onay → işlem → test. Bölgeye göre dinamik içerik ve SSS."
        )
      ),
      e(
        "div",
        { style: { position: "relative", display: "flex", gap: "14px", flexWrap: "wrap" } },
        ...["Planlı servis", "Şeffaf bilgilendirme", "Test ve teslim"].map((x) =>
          e(
            "div",
            {
              key: x,
              style: {
                padding: "12px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(15,23,42,0.12)",
                background: "rgba(255,255,255,0.82)",
                fontSize: "16px",
                fontWeight: 900,
                color: "#0b1220"
              }
            },
            x
          )
        )
      )
    ),
    { width: 1200, height: 630 }
  );
}


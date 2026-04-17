import { NextResponse } from "next/server";
import { buildSitemapXml } from "@/lib/sitemapXml";
import { absoluteUrl } from "@/lib/seo";
import { services } from "@/lib/services";
import { getCities } from "@/lib/geo";
import { getBrands } from "@/lib/brands";
import { getAllErrorCodes } from "@/lib/errorCodes";
import { BUILD_DATE } from "@/lib/buildDate";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

export function GET() {
  const lastmod = BUILD_DATE;
  const urls: Array<{ loc: string; lastmod: string; changefreq: "weekly"; priority: number }> = [];
  const LIMIT = 50000;

  const add = (path: string, priority = 0.7) => {
    if (urls.length >= LIMIT) return;
    urls.push({
      loc: absoluteUrl(path),
      lastmod,
      changefreq: "weekly",
      priority
    });
  };

  add("/", 1);
  add("/hizmetler", 0.9);
  for (const s of services) add(`/hizmetler/${s.slug}`, 0.8);
  add("/servis-bolgelerimiz", 0.9);
  add("/markalar", 0.8);
  add("/blog", 0.7);
  add("/hakkimizda", 0.6);
  add("/iletisim", 0.6);

  add("/gizlilik-politikasi", 0.4);
  add("/cerez-politikasi", 0.4);
  add("/kvkk-aydinlatma-metni", 0.4);
  add("/iptal-iade-politikasi", 0.4);
  add("/kullanim-kosullari", 0.4);
  add("/servis-ucretleri", 0.6);
  add("/firma-rehberi", 0.5);
  add("/sitemap", 0.4);
  add("/llms.txt", 0.3);
  add("/ariza-kodlari", 0.9);

  for (const err of getAllErrorCodes()) {
    add(`/ariza-kodlari/${err.slug}`, 0.8);
  }

  // Note: All area-specific slugs (cities, districts, and their service combinations) 
  // are now handled by /sitemaps/areas chunks to prevent main.xml from becoming too large 
  // and to avoid duplicate entries in the sitemap index.

  const brands = getBrands();
  for (const b of brands) {
    add(`/marka/${b.slug}`, 0.6);
    for (const s of services) {
      if (b.supportedServices.includes(s.kind)) add(`/marka/${b.slug}/${s.slug}`, 0.6);
    }
  }

  const xml = buildSitemapXml(urls);
  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}


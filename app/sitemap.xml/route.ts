import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { buildSitemapXml } from "@/lib/sitemapXml";
import { getPriorityAreaSlugs } from "@/lib/geoSlugs";
import { services } from "@/lib/services";
import { getBrands } from "@/lib/brands";
import { getAllErrorCodes } from "@/lib/errorCodes";
import { BUILD_DATE } from "@/lib/buildDate";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

export function GET() {
  const lastmod = BUILD_DATE;
  const urls: Array<{ loc: string; lastmod: string; changefreq: "weekly"; priority: number }> = [];
  const LIMIT = 1000;

  const add = (path: string, priority = 0.7) => {
    if (urls.length >= LIMIT) return;
    urls.push({
      loc: absoluteUrl(path),
      lastmod,
      changefreq: "weekly",
      priority
    });
  };

  // 1. Core Pages
  add("/", 1.0);
  add("/hizmetler", 0.9);
  for (const s of services) add(`/hizmetler/${s.slug}`, 0.8);
  add("/servis-bolgelerimiz", 0.9);
  add("/markalar", 0.8);
  add("/blog", 0.7);
  add("/ariza-kodlari", 0.9);
  add("/servis-ucretleri", 0.6);
  add("/iletisim", 0.6);
  add("/hakkimizda", 0.6);

  // 2. Error Codes (Important for technical SEO)
  for (const err of getAllErrorCodes()) {
    add(`/ariza-kodlari/${err.slug}`, 0.8);
  }

  // 3. Brands
  for (const b of getBrands()) {
    add(`/marka/${b.slug}`, 0.6);
  }

  // 4. Fill remaining slots with Top Priority Area Slugs (Cities, City-Brands)
  const remainingSlots = LIMIT - urls.length;
  if (remainingSlots > 0) {
    const priorityAreas = getPriorityAreaSlugs(remainingSlots);
    for (const area of priorityAreas) {
      add(area.slug, area.priority);
    }
  }

  const xml = buildSitemapXml(urls);
  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}

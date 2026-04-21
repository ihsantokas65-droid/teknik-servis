import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { buildSitemapXml } from "@/lib/sitemapXml";
import { getPriorityAreaSlugs } from "@/lib/geoSlugs";
import { BUILD_DATE } from "@/lib/buildDate";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

export function GET() {
  const priorityEntries = getPriorityAreaSlugs(1000);
  const lastmod = BUILD_DATE;

  const urls = priorityEntries.map((entry) => ({
    loc: absoluteUrl(entry.slug),
    lastmod,
    changefreq: "weekly" as const,
    priority: entry.priority
  }));

  const xml = buildSitemapXml(urls);
  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}

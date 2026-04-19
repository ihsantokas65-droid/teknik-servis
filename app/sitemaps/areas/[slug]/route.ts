import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { buildSitemapXml } from "@/lib/sitemapXml";
import { getAllAreaSlugs, AREA_SITEMAP_CHUNK_SIZE, getAreaSitemapCount } from "@/lib/geoSlugs";
import { BUILD_DATE } from "@/lib/buildDate";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

export async function generateStaticParams() {
  const count = getAreaSitemapCount();
  return Array.from({ length: count }, (_, i) => ({
    slug: `${i}.xml`
  }));
}

export function GET(req: Request, { params }: { params: { slug: string } }) {
  const page = parseInt(params.slug.replace(".xml", ""), 10);
  if (isNaN(page)) return new NextResponse("Invalid Page", { status: 400 });

  const allEntries = getAllAreaSlugs();
  const start = page * AREA_SITEMAP_CHUNK_SIZE;
  const end = start + AREA_SITEMAP_CHUNK_SIZE;
  const chunk = allEntries.slice(start, end);

  if (chunk.length === 0) return new NextResponse("Not Found", { status: 404 });

  const lastmod = BUILD_DATE;
  const urls = chunk.map((entry) => ({
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

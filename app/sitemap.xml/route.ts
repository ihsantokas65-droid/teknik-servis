import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { buildSitemapIndexXml } from "@/lib/sitemapXml";
import { BLOG_SITEMAP_PAGES } from "@/lib/blogSlugs";
import { getAreaSitemapCount } from "@/lib/geoSlugs";
import { BUILD_DATE } from "@/lib/buildDate";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

export function GET() {
  const lastmod = BUILD_DATE;
  const areaCount = getAreaSitemapCount();

  const sitemaps = [
    { loc: absoluteUrl("/sitemaps/important.xml"), lastmod },
    { loc: absoluteUrl("/sitemaps/main.xml"), lastmod },
    ...Array.from({ length: BLOG_SITEMAP_PAGES }).map((_, i) => ({
      loc: absoluteUrl(`/sitemaps/blog/${i}.xml`),
      lastmod
    })),
    ...Array.from({ length: areaCount }).map((_, i) => ({
      loc: absoluteUrl(`/sitemaps/areas/${i}.xml`),
      lastmod
    }))
  ];

  const xml = buildSitemapIndexXml(sitemaps);
  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}


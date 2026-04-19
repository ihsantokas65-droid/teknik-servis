import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { buildSitemapXml } from "@/lib/sitemapXml";
import { absoluteUrl } from "@/lib/seo";
import { BLOG_SITEMAP_PAGE_SIZE, BLOG_TOTAL_URLS, blogSlugFromIndex } from "@/lib/blogSlugs";
import { BUILD_DATE } from "@/lib/buildDate";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

export function GET(_req: Request, { params }: { params: { page: string } }) {
  const page = Number.parseInt(params.page, 10);
  if (!Number.isFinite(page) || page < 0) return notFound();

  const start = page * BLOG_SITEMAP_PAGE_SIZE;
  if (start >= BLOG_TOTAL_URLS) return notFound();

  const end = Math.min(start + BLOG_SITEMAP_PAGE_SIZE, BLOG_TOTAL_URLS);
  const lastmod = BUILD_DATE;

  const urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: "weekly";
    priority: number;
  }> = [];
  for (let i = start; i < end; i++) {
    const slug = blogSlugFromIndex(i);
    urls.push({
      loc: absoluteUrl(`/blog/${slug}`),
      lastmod,
      changefreq: "weekly",
      priority: 0.3
    });
  }

  const xml = buildSitemapXml(urls);
  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}

import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { getBlogIndexSlugs, buildBlogArticle } from "@/lib/blog";
import { services } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";

export async function GET() {
  const blogSlugs = getBlogIndexSlugs(100);
  const articles = blogSlugs.map(slug => buildBlogArticle(slug)).filter(Boolean);

  const rssItems = [
    {
      title: "Servis Ücretleri",
      link: absoluteUrl("/servis-ucretleri"),
      description: "Şeffaf servis ücreti politikamız ve güncel 2026 fiyat listemiz.",
      pubDate: new Date().toUTCString(),
    },
    // Main Services
    ...services.map(s => ({
      title: s.label,
      link: absoluteUrl(`/hizmetler/${s.slug}`),
      description: `${s.label} arıza, bakım ve onarım hizmetleri. 81 ilde profesyonel teknisyen kadrosuyla yanınızdayız.`,
      pubDate: new Date().toUTCString(),
    })),
    // Blog Articles
    ...articles.map(a => ({
      title: a!.title,
      link: absoluteUrl(`/blog/${a!.slug}`),
      description: a!.description,
      pubDate: new Date().toUTCString(), // Real dates aren't in the mock data, so we use current
    }))
  ];

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${site.name}</title>
  <link>${site.url}</link>
  <description>${site.description}</description>
  <language>tr-TR</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${site.url}/feed" rel="self" type="application/rss+xml" />
  ${rssItems.map(item => `
  <item>
    <title><![CDATA[${item.title}]]></title>
    <link>${item.link}</link>
    <guid isPermaLink="true">${item.link}</guid>
    <description><![CDATA[${item.description}]]></description>
    <pubDate>${item.pubDate}</pubDate>
  </item>`).join('')}
</channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}

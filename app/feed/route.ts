import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { getBlogIndexSlugs, buildBlogArticle } from "@/lib/blog";
import { services } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";
import { BUILD_DATE } from "@/lib/buildDate";

export async function GET() {
  const blogSlugs = getBlogIndexSlugs(100);
  const articles = blogSlugs.map(slug => buildBlogArticle(slug)).filter(Boolean);
  
  // Stable date based on build time
  const baseDate = new Date(BUILD_DATE);
  const buildDateStr = baseDate.toUTCString();

  const rssItems = [
    {
      title: "2026 Teknik Servis Ücretleri ve Fiyat Listesi",
      link: absoluteUrl("/servis-ucretleri"),
      description: "Kombi, klima ve beyaz eşya tamiri için şeffaf servis ücreti politikamız ve güncel 2026 fiyat listemiz yayınlandı.",
      pubDate: buildDateStr,
    },
    {
      title: "Teknik Arıza Rehberi ve Hata Kodları Sözlüğü",
      link: absoluteUrl("/ariza-kodlari"),
      description: "Cihazınızın verdiği hata kodlarının anlamlarını ve çözüm yollarını uzman teknisyenlerimizin hazırladığı rehberden öğrenin.",
      pubDate: buildDateStr,
    },
    // Main Services
    ...services.map((s, idx) => ({
      title: `${s.label} Servis ve Bakım Hizmetleri`,
      link: absoluteUrl(`/hizmetler/${s.slug}`),
      description: `${s.label} arıza, periyodik bakım ve onarım hizmetleri. 81 ilde profesyonel teknisyen kadrosuyla yerinde servis sunuyoruz.`,
      // Stagger by index to look more natural
      pubDate: new Date(baseDate.getTime() - (idx * 3600000 * 2)).toUTCString(),
    })),
    // Blog Articles
    ...articles.map((a, idx) => ({
      title: a!.title,
      link: absoluteUrl(`/blog/${a!.slug}`),
      description: a!.description,
      // Staggered dates relative to BUILD_DATE to look active
      pubDate: new Date(baseDate.getTime() - ((idx + 10) * 3600000 * 24)).toUTCString(), 
    }))
  ];

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${site.businessName} | Teknik Servis Akışı</title>
  <link>${site.url}</link>
  <description>${site.description}</description>
  <language>tr-TR</language>
  <lastBuildDate>${buildDateStr}</lastBuildDate>
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

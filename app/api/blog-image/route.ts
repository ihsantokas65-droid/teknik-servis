import { buildBlogArticle } from "@/lib/blog";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache for 24 hours (ISR)

function iconForCategory(category: string) {
  if (category === "kombi") return "🔥";
  if (category === "klima") return "❄️";
  return "🧰";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  const article = buildBlogArticle(slug);
  if (!article) {
    return new Response("Not found", { status: 404 });
  }

  const icon = iconForCategory(article.category);
  const subtitle = article.category.replaceAll("-", " ").toLocaleUpperCase("tr-TR");
  const title = article.title;
  const desc = article.description.length > 140 ? article.description.slice(0, 137) + "..." : article.description;

  // Manual SVG generation to bypass next/og Windows bug
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f2f6ff;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="grad1" cx="10%" cy="0%" r="60%">
          <stop offset="0%" style="stop-color:#1d4ed8;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </radialGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)" />
      <rect width="1200" height="630" fill="url(#grad1)" />
      
      <rect x="54" y="54" width="64" height="64" rx="18" fill="#1d4ed8" />
      <text x="86" y="96" font-family="Arial, sans-serif" font-size="34" fill="white" text-anchor="middle">${icon}</text>
      
      <text x="134" y="74" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#475569">YETKİLİ KOMBİ SERVİSİ • BLOG</text>
      <rect x="134" y="86" width="120" height="28" rx="14" fill="#1d4ed8" fill-opacity="0.1" />
      <text x="144" y="105" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#1d4ed8">${subtitle}</text>
      
      <text x="54" y="220" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="#0f172a">
        <tspan x="54" dy="0">${title.slice(0, 40)}</tspan>
        <tspan x="54" dy="60">${title.slice(40)}</tspan>
      </text>
      
      <text x="54" y="380" font-family="Arial, sans-serif" font-size="22" fill="#64748b">
        <tspan x="54" dy="0">${desc.slice(0, 80)}</tspan>
        <tspan x="54" dy="30">${desc.slice(80)}</tspan>
      </text>
      
      <text x="54" y="570" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="#64748b">${article.readingMinutes} dk okuma • ${article.wordCount} kelime</text>
      
      <rect x="980" y="540" width="166" height="44" rx="14" fill="white" stroke="#e2e8f0" />
      <text x="1063" y="568" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="#64748b" text-anchor="middle">yetkilikombiservisi.tr</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}

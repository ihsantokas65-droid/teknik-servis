export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export function buildSitemapXml(urls: SitemapUrlEntry[]) {
  const parts: string[] = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>\n');
  parts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

  for (const u of urls) {
    parts.push("<url>\n");
    parts.push(`  <loc>${escapeXml(u.loc)}</loc>\n`);
    if (u.lastmod) parts.push(`  <lastmod>${escapeXml(u.lastmod)}</lastmod>\n`);
    if (u.changefreq) parts.push(`  <changefreq>${u.changefreq}</changefreq>\n`);
    if (typeof u.priority === "number") parts.push(`  <priority>${u.priority.toFixed(1)}</priority>\n`);
    parts.push("</url>\n");
  }

  parts.push("</urlset>");
  return parts.join("");
}

export type SitemapIndexEntry = {
  loc: string;
  lastmod?: string;
};

export function buildSitemapIndexXml(sitemaps: SitemapIndexEntry[]) {
  const parts: string[] = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>\n');
  parts.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

  for (const s of sitemaps) {
    parts.push("<sitemap>\n");
    parts.push(`  <loc>${escapeXml(s.loc)}</loc>\n`);
    if (s.lastmod) parts.push(`  <lastmod>${escapeXml(s.lastmod)}</lastmod>\n`);
    parts.push("</sitemap>\n");
  }

  parts.push("</sitemapindex>");
  return parts.join("");
}

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}


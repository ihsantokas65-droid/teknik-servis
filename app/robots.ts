import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/reviews"],
        disallow: ["/api/"]
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "ClaudeBot",
          "PerplexityBot",
          "Omgili",
          "Omgilibot",
          "YouBot"
        ],
        allow: ["/", "/llms.txt", "/api/reviews"],
        disallow: ["/api/"]
      }
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}


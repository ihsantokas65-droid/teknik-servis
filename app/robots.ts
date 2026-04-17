import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      },
      {
        // Explicitly welcome AI aggregators for GEO (Generative Engine Optimization)
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
        allow: ["/", "/llms.txt"],
        disallow: ["/api/"]
      }
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}


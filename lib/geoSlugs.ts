import { getCities } from "@/lib/geo";
import { services } from "@/lib/services";
import { getBrands } from "@/lib/brands";

export type AreaSlugEntry = {
  slug: string;
  priority: number;
};

export function getAllAreaSlugs(): AreaSlugEntry[] {
  const cities = getCities();
  const brands = getBrands();
  const entries: AreaSlugEntry[] = [];

  for (const city of cities) {
    // City Landing — highest priority among area pages
    entries.push({ slug: `/${city.slug}`, priority: 0.8 });

    // City Brand Landing — lower priority
    for (const brand of brands) {
      for (const svc of services) {
        if (brand.supportedServices.includes(svc.kind)) {
          entries.push({
            slug: `/${city.slug}/marka/${brand.slug}/${svc.slug}`,
            priority: 0.5
          });
        }
      }
    }

    for (const dist of city.districts) {
      // District Landing
      entries.push({ slug: `/${city.slug}/${dist.slug}`, priority: 0.7 });

      for (const svc of services) {
        // Service Area Landing
        entries.push({
          slug: `/${city.slug}/${dist.slug}/${svc.slug}`,
          priority: 0.6
        });

        // District Brand Landing — lowest priority
        for (const brand of brands) {
          if (brand.supportedServices.includes(svc.kind)) {
            entries.push({
              slug: `/${city.slug}/${dist.slug}/marka/${brand.slug}/${svc.slug}`,
              priority: 0.4
            });
          }
        }
      }
    }
  }

  return entries;
}

export const AREA_SITEMAP_CHUNK_SIZE = 5000;

export function getAreaSitemapCount() {
  const entries = getAllAreaSlugs();
  return Math.ceil(entries.length / AREA_SITEMAP_CHUNK_SIZE);
}


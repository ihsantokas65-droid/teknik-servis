import { getCities } from "@/lib/geo";
import { services } from "@/lib/services";
import { getBrands } from "@/lib/brands";

export type AreaSlugEntry = {
  slug: string;
  priority: number;
};

export function getPriorityAreaSlugs(limit: number = 1000): AreaSlugEntry[] {
  const all = getAllAreaSlugs(false);
  // Sort by priority descending, then return first 1000
  return all.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

export function getAllAreaSlugs(excludePriority: boolean = false): AreaSlugEntry[] {
  const cities = getCities();
  const brands = getBrands();
  const entries: AreaSlugEntry[] = [];

  for (const city of cities) {
    // City Landing — highest priority 0.9
    entries.push({ slug: `/${city.slug}`, priority: 0.9 });

    // City Brand Landing — high priority 0.8
    for (const brand of brands) {
      entries.push({
        slug: `/${city.slug}-${brand.slug}-servisi`,
        priority: 0.8
      });
    }

    for (const dist of city.districts) {
      // District Landing — priority 0.7
      entries.push({ slug: `/${city.slug}/${dist.slug}`, priority: 0.7 });

      // District Brand Landing — priority 0.6
      for (const brand of brands) {
        entries.push({
          slug: `/${city.slug}/${dist.slug}-${brand.slug}-servisi`,
          priority: 0.6
        });
      }

      for (const svc of services) {
        // District Service Areas (e.g. adana/seyhan/klima-servisi)
        entries.push({
          slug: `/${city.slug}/${dist.slug}/${svc.slug}`,
          priority: 0.5
        });
      }
    }
  }

  if (excludePriority) {
    const prioritySlugs = new Set(getPriorityAreaSlugs().map(p => p.slug));
    return entries.filter(e => !prioritySlugs.has(e.slug));
  }

  return entries;
}

export const AREA_SITEMAP_CHUNK_SIZE = 5000;

export function getAreaSitemapCount() {
  const entries = getAllAreaSlugs(true); // Always count excluding priority for the index
  return Math.ceil(entries.length / AREA_SITEMAP_CHUNK_SIZE);
}


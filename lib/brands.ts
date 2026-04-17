import rawBrandList from "@/data/legacy/final_brand_list.json";
import rawBrandMetadata from "@/data/legacy/brand_metadata.json";
import rawManualBrands from "@/data/brands.manual.json";
import { isCitySlug } from "@/lib/geo";
import { titleCaseTR } from "@/lib/tr";
import type { ServiceKind } from "@/lib/services";

type BrandMetadata = Record<string, { name?: string; type?: string }>;

const brandList: string[] = rawBrandList as string[];
const brandMetadata: BrandMetadata = rawBrandMetadata as BrandMetadata;
const manualBrands = rawManualBrands as Array<{ slug: string; name: string; services: ServiceKind[] }>;

const BRAND_IGNORE = new Set([
  "beyaz-esya",
  "beyaz-esya-markalari",
  "klima",
  "klima-markalari",
  "kombi",
  "kombi-markalari",
  "sehirlere-gore"
]);

/**
 * Detects city-prefixed fake brand slugs like "van-airfel", "istanbul-bosch", etc.
 * These originate from legacy brand list data and generate broken sitemap URLs.
 */
const CITY_PREFIXES = new Set([
  "van", "istanbul", "ankara", "izmir", "bursa", "antalya", "adana",
  "konya", "gaziantep", "mersin", "kayseri", "eskisehir", "diyarbakir",
  "samsun", "trabzon", "erzurum", "malatya", "elazig", "kocaeli",
  "sakarya", "denizli", "manisa", "balikesir", "mugla", "aydin",
  "tekirdağ", "hatay", "kahramanmaras", "ordu", "afyon"
]);

function isCityPrefixedSlug(slug: string): boolean {
  const dashIdx = slug.indexOf("-");
  if (dashIdx <= 0) return false;
  return CITY_PREFIXES.has(slug.substring(0, dashIdx));
}

const BRAND_DISPLAY_OVERRIDES: Record<string, string> = {
  eca: "ECA",
  lg: "LG",
  arcelik: "Arçelik",
  beko: "Beko",
  bosch: "Bosch",
  siemens: "Siemens",
  vestel: "Vestel",
  seg: "SEG",
  tcl: "TCL",
  "de-dietrich": "De Dietrich",
  "alarko-carrier": "Alarko Carrier"
};

export type Brand = {
  slug: string;
  name: string;
  supportedServices: ServiceKind[];
};

function detectServiceSuffix(item: string): ServiceKind | null {
  if (item.endsWith("-kombi")) return "kombi";
  if (item.endsWith("-klima")) return "klima";
  if (item.endsWith("-beyaz-esya")) return "beyaz-esya";
  return null;
}

function baseBrandSlug(item: string, kind: ServiceKind): string {
  if (kind === "kombi") return item.replace(/-kombi$/, "");
  if (kind === "klima") return item.replace(/-klima$/, "");
  return item.replace(/-beyaz-esya$/, "");
}

function toBrandDisplayName(slug: string) {
  if (BRAND_DISPLAY_OVERRIDES[slug]) return BRAND_DISPLAY_OVERRIDES[slug];

  const meta = brandMetadata[slug];
  if (meta?.name) return meta.name;

  // slug'da Türkçe karakter yok; en azından okunur hale getir
  return titleCaseTR(slug);
}

export function getBrands(): Brand[] {
  const supportMap = new Map<string, Set<ServiceKind>>();
  const nameMap = new Map<string, string>();

  for (const item of brandList) {
    if (!item || BRAND_IGNORE.has(item)) continue;
    if (isCitySlug(item)) continue;

    const kind = detectServiceSuffix(item);
    if (!kind) continue;

    const brandSlug = baseBrandSlug(item, kind);
    if (!brandSlug || BRAND_IGNORE.has(brandSlug)) continue;
    if (isCitySlug(brandSlug)) continue;
    if (isCityPrefixedSlug(brandSlug)) continue;

    const set = supportMap.get(brandSlug) ?? new Set<ServiceKind>();
    set.add(kind);
    supportMap.set(brandSlug, set);
  }

  for (const mb of manualBrands) {
    if (!mb?.slug) continue;
    if (BRAND_IGNORE.has(mb.slug)) continue;
    if (isCitySlug(mb.slug)) continue;
    if (isCityPrefixedSlug(mb.slug)) continue;
    nameMap.set(mb.slug, mb.name);
    const set = supportMap.get(mb.slug) ?? new Set<ServiceKind>();
    for (const s of mb.services ?? []) set.add(s);
    supportMap.set(mb.slug, set);
  }

  return [...supportMap.entries()]
    .map(([slug, kinds]) => ({
      slug,
      name: nameMap.get(slug) ?? toBrandDisplayName(slug),
      supportedServices: Array.from(kinds).sort()
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
}

export function getBrand(slug: string): Brand | null {
  const all = getBrands();
  return all.find((b) => b.slug === slug) ?? null;
}

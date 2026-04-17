import rawCityDistrictMap from "@/data/legacy/city_district_map.json";
import rawDistrictNames from "@/data/legacy/district_display_names.json";
import { cityDisplayNameBySlug, districtDisplayNameByCitySlug } from "@/data/tr-locations";
import { titleCaseTR } from "@/lib/tr";

export type City = {
  slug: string;
  name: string;
  districts: District[];
};

export type District = {
  slug: string;
  name: string;
};

type CityDistrictMap = Record<string, string | string[]>;

const cityDistrictMap: CityDistrictMap = rawCityDistrictMap as CityDistrictMap;
const districtDisplayNames: Record<string, Record<string, string>> =
  rawDistrictNames as Record<string, Record<string, string>>;

function normalizeDistricts(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

export function getCities(): City[] {
  return Object.keys(cityDistrictMap)
    .sort((a, b) => a.localeCompare(b, "tr-TR"))
    .map((citySlug) => {
      const districts = normalizeDistricts(cityDistrictMap[citySlug])
        .map((districtSlug) => ({
          slug: districtSlug,
          name: getDistrictDisplayName(citySlug, districtSlug)
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));

      return {
        slug: citySlug,
        name: getCityDisplayName(citySlug),
        districts
      };
    });
}

export function getCity(slug: string): City | null {
  if (!cityDistrictMap[slug]) return null;
  const districts = normalizeDistricts(cityDistrictMap[slug]).map((districtSlug) => ({
    slug: districtSlug,
    name: getDistrictDisplayName(slug, districtSlug)
  }));
  return {
    slug,
    name: getCityDisplayName(slug),
    districts
  };
}

export function getCityDisplayName(slug: string) {
  return cityDisplayNameBySlug[slug] ?? titleCaseTR(slug);
}

export function getDistrictDisplayName(citySlug: string, districtSlug: string) {
  const cityMap = districtDisplayNameByCitySlug[citySlug];
  if (cityMap && cityMap[districtSlug]) return cityMap[districtSlug];
  const generatedMap = districtDisplayNames[citySlug];
  if (generatedMap && generatedMap[districtSlug]) return generatedMap[districtSlug];
  return titleCaseTR(districtSlug);
}

export function isCitySlug(slug: string) {
  return Boolean(cityDistrictMap[slug]);
}

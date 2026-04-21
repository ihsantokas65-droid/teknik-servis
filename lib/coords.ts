import rawTurkeyCities from "@/data/legacy/turkey-cities.json";
import { slugifyTR } from "@/lib/slug";

import { createRng } from "@/lib/variation";

type TurkeyCity = {
  name: string;
  plate: string;
  latitude: string;
  longitude: string;
  counties: string[];
};

export type Coordinates = { lat: number; lon: number };

const turkeyCities: TurkeyCity[] = rawTurkeyCities as TurkeyCity[];

const cityCoordMap: Map<string, Coordinates> = new Map(
  turkeyCities.map((c) => [
    slugifyTR(c.name),
    { lat: Number(c.latitude), lon: Number(c.longitude) }
  ])
);

export function getCityCoordinates(citySlug: string): Coordinates | null {
  return cityCoordMap.get(citySlug) ?? null;
}

export function getDistrictCoordinates(citySlug: string, districtSlug: string): Coordinates | null {
  const cityCoords = getCityCoordinates(citySlug);
  if (!cityCoords) return null;

  // Dataset ilçe koordinatı içermiyor; algoritma ile ilçe bazlı benzersiz koordinat üretiyoruz.
  // Bu, Google SGE ve Yerel SEO için her ilçede fiziksel "dükkan" varmış illüzyonu yaratır.
  const rng = createRng(`coord-shift-${citySlug}-${districtSlug}`);
  
  // 0.01 ile 0.04 derece arası (yaklaşık 1-4km) rastgele sapma ekliyoruz.
  const latShift = (rng() - 0.5) * 0.06; 
  const lonShift = (rng() - 0.5) * 0.06;

  return {
    lat: Number((cityCoords.lat + latShift).toFixed(6)),
    lon: Number((cityCoords.lon + lonShift).toFixed(6))
  };
}


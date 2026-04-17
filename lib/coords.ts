import rawTurkeyCities from "@/data/legacy/turkey-cities.json";
import { slugifyTR } from "@/lib/slug";

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

export function getDistrictCoordinates(citySlug: string, _districtSlug: string): Coordinates | null {
  // Dataset ilçe koordinatı içermiyor; il merkez koordinatını fallback olarak kullanıyoruz.
  return getCityCoordinates(citySlug);
}


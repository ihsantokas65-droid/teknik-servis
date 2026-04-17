import rawTurkeyCities from "@/data/legacy/turkey-cities.json";
import { slugifyTR } from "@/lib/slug";

type TurkeyCity = {
  name: string;
  latitude: string;
  longitude: string;
};

const turkeyCities: TurkeyCity[] = rawTurkeyCities as TurkeyCity[];

/**
 * Calculates the Haversine distance between two points in kilometers.
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestCity(userLat: number, userLon: number) {
  let nearestCity = turkeyCities[0];
  let minDistance = Infinity;

  for (const city of turkeyCities) {
    const dist = getDistance(
      userLat,
      userLon,
      Number(city.latitude),
      Number(city.longitude)
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city;
    }
  }

  return {
    slug: slugifyTR(nearestCity.name),
    name: nearestCity.name.toUpperCase(),
    distance: minDistance
  };
}

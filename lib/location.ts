import rawTurkeyCities from "@/data/legacy/turkey-cities.json";
import { slugifyTR } from "@/lib/slug";

type TurkeyCity = {
  name: string;
  latitude: string;
  longitude: string;
  counties: string[];
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

export function findNearestCity(userLat: number, userLon: number, hints: string[] = []) {
  let nearestCity = turkeyCities[0];
  let minDistance = Infinity;

  // Normalize all hints
  const hintedSlugs = hints.filter(Boolean).map(h => slugifyTR(h));

  for (const city of turkeyCities) {
    const dist = getDistance(
      userLat,
      userLon,
      Number(city.latitude),
      Number(city.longitude)
    );

    const citySlug = slugifyTR(city.name);
    const countySlugs = city.counties.map(c => slugifyTR(c));

    // Priority Check: Does ANY hint match this city OR any of its counties?
    const isHintMatch = hintedSlugs.some(hs => 
      hs === citySlug || countySlugs.includes(hs)
    );
    
    // Hinted şehre çok güçlü bir öncelik tanı (mesafeyi %20 "daha yakın" göster -> 5 kat öncelik)
    // Bu, Bursa'daki bir ilçe (İnegöl), Bilecik merkezine coğrafi olarak yakın olsa bile 
    // Bursa sayfasındayken Bursa'nın kazanmasını garanti eder.
    const adjustedDist = isHintMatch ? dist * 0.2 : dist; 

    if (adjustedDist < minDistance) {
      minDistance = dist; // Gerçek mesafeyi sakla
      nearestCity = city;
    }
  }

  return {
    slug: slugifyTR(nearestCity.name),
    name: nearestCity.name.toUpperCase(),
    distance: minDistance
  };
}

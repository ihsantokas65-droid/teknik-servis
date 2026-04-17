import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Collect all possible location cues from Vercel headers
  const cityHeader = request.headers.get('x-vercel-ip-city');
  const regionHeader = request.headers.get('x-vercel-ip-country-region');
  const geoCity = request.geo?.city;
  
  // Choose the best candidate
  const rawCity = geoCity || cityHeader || regionHeader || '';
  
  const response = NextResponse.next();

  if (rawCity) {
    let decodedCity = rawCity;
    try {
      if (rawCity.includes('%')) decodedCity = decodeURIComponent(rawCity);
    } catch (e) {}

    // Special case for TR-XX region codes that Vercel might send
    // e.g. TR-34 -> Istanbul
    const regionMap: Record<string, string> = {
      'TR-34': 'Istanbul',
      'TR-06': 'Ankara',
      'TR-35': 'Izmir',
      'TR-01': 'Adana',
      'TR-07': 'Antalya',
      'TR-16': 'Bursa',
      'TR-65': 'Van'
    };
    
    const finalCity = regionMap[decodedCity] || decodedCity;

    const existingCity = request.cookies.get('user-geo-city')?.value;
    if (finalCity !== existingCity) {
      response.cookies.set('user-geo-city', encodeURIComponent(finalCity), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get geolocation data from multiple Vercel sources
  const cityFromGeo = request.geo?.city;
  const cityFromHeader = request.headers.get('x-vercel-ip-city');
  
  const city = cityFromGeo || cityFromHeader || '';
  
  const response = NextResponse.next();

  if (city) {
    // Decode if encoded (some headers come encoded)
    let decodedCity = city;
    try {
      if (city.includes('%')) decodedCity = decodeURIComponent(city);
    } catch (e) {}

    const existingCity = request.cookies.get('user-geo-city')?.value;
    
    if (decodedCity !== existingCity) {
      response.cookies.set('user-geo-city', encodeURIComponent(decodedCity), {
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

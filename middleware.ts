import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get geolocation data from Vercel
  const city = request.geo?.city || '';
  
  // 2. Prepare response
  const response = NextResponse.next();

  // 3. Set cookie if city detected (only if not already there to avoid unnecessary updates)
  const existingCity = request.cookies.get('user-geo-city')?.value;
  
  if (city && city !== existingCity) {
    // Vercel city is often percent-encoded or has non-ascii. 
    // We store it as is, or optionally normalize it.
    response.cookies.set('user-geo-city', encodeURIComponent(city), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    });
  }

  return response;
}

// Ensure it runs on all relevant pages
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

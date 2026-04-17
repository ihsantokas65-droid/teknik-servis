import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const city = request.geo?.city || request.headers.get('x-vercel-ip-city') || '';
  const response = NextResponse.next();

  if (city) {
    // Explicitly set cookie on every request to ensure it's captured
    response.cookies.set('user-geo-city', encodeURIComponent(city), {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Role-Based Access Control
 * Intercepts protected admin routes before rendering
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin route
  if (pathname.startsWith('/admin')) {
    const roleCookie = request.cookies.get('bookly_auth_role')?.value;
    const tokenCookie = request.cookies.get('bookly_token')?.value;

    // If role cookie exists and is explicitly not admin, redirect to home with access_denied query
    if (roleCookie && roleCookie !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('access_denied', 'admin');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

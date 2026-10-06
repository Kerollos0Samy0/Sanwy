import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow access to login page and login API
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('servant_auth');
  
  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.svg$).*)'],
};

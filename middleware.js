import { NextResponse } from 'next/server';

const publicRoutes = ['/login'];
const protectedPrefixes = ['/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect root to /admin/dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Next.js handles client-side redirects for unauthenticated users in AppLayout
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)'],
};

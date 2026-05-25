import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const hasAccess = request.cookies.has('vault_access_granted');

  // If the user doesn't have the cookie and is trying to access a protected route, redirect to /login
  if (!hasAccess && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is already authenticated and visits /login, redirect to dashboard
  if (hasAccess && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protects all paths except:
     * - _next/static (static assets like JS/CSS)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

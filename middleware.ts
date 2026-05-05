// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware function will run for all paths matched by the config.
export function middleware(request: NextRequest) {
  // 1. Get the authentication token from the user's cookies.
  const authToken = request.cookies.get('auth_token');

  // 2. Check if the user is trying to access a protected admin page.
  // The `matcher` in the config ensures this code only runs for `/admin/*` paths.
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login');

  // 3. If it's a protected route and the user is not authenticated (no auth_token),
  //    redirect them to the admin login page.
  if (isProtectedRoute && !authToken) {
    // Create a URL object for the login page.
    const loginUrl = new URL('/admin/login', request.url);
    // You can add a `from` query parameter to redirect the user back after login.
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 4. If the user is authenticated or the route is not protected, allow the request to proceed.
  return NextResponse.next();
}

// The config specifies which paths the middleware should apply to.
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * This is a common configuration to apply middleware to most of your app's pages.
   * We will then filter for `/admin` pages inside the middleware function itself.
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
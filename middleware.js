// middleware.js - Role-based access control with HTTPOnly cookies
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define route categories
  const publicRoutes = [
    '/',
    '/posts',
    '/about',
    '/contact',
    '/blog',
    '/categories',
    '/tags',
  ];

  const authRoutes = ['/sign-in', '/sign-up'];

  const dashboardRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/change-password',
  ];

  const adminRoutes = ['/admin'];

  // Check route types
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const isDashboardRoute = dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Get tokens from httpOnly cookies
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const hasRefreshToken = !!refreshToken;

  // For debugging
  console.log('🛡️ Middleware check:', {
    pathname,
    isPublicRoute,
    isAuthRoute,
    isDashboardRoute,
    isAdminRoute,
    hasRefreshToken: hasRefreshToken ? 'YES' : 'NO',
  });

  // PUBLIC ROUTES - Always allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // AUTH ROUTES - Redirect to dashboard if already authenticated
  if (isAuthRoute && hasRefreshToken) {
    console.log('✅ Authenticated user on auth page, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // AUTH ROUTES - Allow access if not authenticated
  if (isAuthRoute && !hasRefreshToken) {
    return NextResponse.next();
  }

  // DASHBOARD ROUTES - Require authentication
  if (isDashboardRoute) {
    if (!hasRefreshToken) {
      console.log(
        '❌ Dashboard route accessed without auth, redirecting to sign-in'
      );
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Has refresh token, allow access (useAuth will handle token refresh and user data)
    return NextResponse.next();
  }

  // ADMIN ROUTES - Require authentication + admin/moderator role
  if (isAdminRoute) {
    if (!hasRefreshToken) {
      console.log(
        '❌ Admin route accessed without auth, redirecting to sign-in'
      );
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // We can't check role in middleware easily without making API calls
    // So we'll let the component handle role-based redirect
    // The useAuth hook will have user data including role
    return NextResponse.next();
  }

  // All other routes - Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

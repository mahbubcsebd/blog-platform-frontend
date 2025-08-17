// middleware.js - SIMPLIFIED FOR HTTPONLY COOKIES
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/change-password',
  ];

  const authRoutes = ['/sign-in', '/sign-up'];

  // Check if current route is protected or auth route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get refresh token from httpOnly cookies
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const hasRefreshToken = !!refreshToken;

  // console.log('🛡️ Middleware check:', {
  //   pathname,
  //   isProtectedRoute,
  //   isAuthRoute,
  //   hasRefreshToken: hasRefreshToken ? 'YES' : 'NO',
  // });

  // If user is on auth routes and has refresh token, redirect to dashboard
  if (isAuthRoute && hasRefreshToken) {
    console.log('✅ Authenticated user on auth page, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If route is not protected, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For protected routes, check if refresh token exists
  if (!hasRefreshToken) {
    console.log(
      '❌ Protected route accessed without refresh token, redirecting to sign-in'
    );
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Has refresh token, allow access (useAuth will handle token refresh)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

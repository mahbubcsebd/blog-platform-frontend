'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();

  // Prevent multiple redirects
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimeoutRef = useRef(null);

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const wasRedirected = searchParams.has('redirect');

  // ------------------------------
  // FIXED: Prevent infinite redirect loops
  // ------------------------------
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('🔄 Auth still loading, waiting...');
      return;
    }

    // Don't redirect if we already have
    if (hasRedirected) {
      console.log('⚠️ Already redirected, skipping...');
      return;
    }

    // Only redirect if actually authenticated
    if (isAuthenticated && user) {
      console.log('✅ User authenticated, preparing redirect...', {
        userRole: user.role,
        redirectUrl,
      });

      setHasRedirected(true);

      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Delay redirect slightly to prevent race conditions
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('🔀 Redirecting authenticated user...');

        // Determine redirect based on user role
        if (
          user.role === 'ADMIN' ||
          user.role === 'MODERATOR' ||
          user.role === 'SUPERADMIN'
        ) {
          const targetUrl =
            redirectUrl === '/dashboard' ? '/admin' : redirectUrl;
          console.log('🛡️ Admin user redirecting to:', targetUrl);
          router.replace(targetUrl);
        } else {
          console.log('👤 Regular user redirecting to:', redirectUrl);
          router.replace(redirectUrl);
        }
      }, 500); // Small delay to ensure state is stable
    } else if (!authLoading) {
      console.log('ℹ️ User not authenticated, staying on sign-in page');
    }

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, authLoading, hasRedirected, redirectUrl, router]);

  // ------------------------------
  // Enhanced form submission
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData(e.target);
      const username = formData.get('username')?.trim();
      const password = formData.get('password');

      if (!username || !password) {
        setError('Username/Email and password are required');
        return;
      }

      console.log('🔐 Attempting login for:', username);
      const result = await login(username, password);

      console.log('🔐 Login result:', result);

      if (result.success) {
        setSuccess(true);
        console.log('✅ Login successful, user role:', result.user?.role);

        // Don't manually redirect here - let the useEffect handle it
        // This prevents race conditions
      } else {
        setError(result.error || 'Login failed');
        console.log('❌ Login failed:', result.error);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-gray-400 mt-2">
              Auth Loading: {authLoading ? 'true' : 'false'} | Authenticated:{' '}
              {isAuthenticated ? 'true' : 'false'} | User:{' '}
              {user?.username || 'none'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show redirect screen if already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Already signed in. Redirecting...</p>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {user.firstName || user.username}!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your username or email and password to access your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {wasRedirected && !error && !success && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-medium">
                    You need to sign in to access that page
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    Login successful! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              {error && !success && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Username or Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter username or email"
                    required
                    disabled={loading}
                    className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="h-11 pl-10 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Redirecting...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href={`/sign-up${
                      wasRedirected
                        ? `?redirect=${encodeURIComponent(redirectUrl)}`
                        : ''
                    }`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>

          {/* Debug Panel - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t bg-gray-50 p-3 text-xs text-gray-600">
              <div className="space-y-1">
                <div>
                  <strong>Debug Info:</strong>
                </div>
                <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
                <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                <div>User Role: {user?.role || 'None'}</div>
                <div>Has Redirected: {hasRedirected ? 'Yes' : 'No'}</div>
                <div>Redirect URL: {redirectUrl}</div>
                <div>Was Redirected: {wasRedirected ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function SignInPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading sign in page...</p>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageFallback />}>
      <SignInForm />
    </Suspense>
  );
}

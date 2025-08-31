// components/guards/AdminRouteGuard.jsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Crown, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminRouteGuard = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log(user);

  // Updated to include SUPERADMIN
  const isAuthorized =
    user?.role === 'SUPERADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MODERATOR';

  // Check if user is SUPERADMIN for special styling
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (!loading && isAuthenticated && !isAuthorized) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to sign-in
  }

  // Authenticated but not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this admin area. Only super
              administrators, administrators and moderators can access this
              section.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get appropriate colors and styling based on role
  const getHeaderStyling = () => {
    if (isSuperAdmin) {
      return {
        gradient: 'bg-gradient-to-r from-yellow-500 to-orange-600',
        buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        textColor: 'text-yellow-100',
      };
    }
    return {
      gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
      buttonBg: 'bg-purple-800 hover:bg-purple-900',
      textColor: 'text-purple-200',
    };
  };

  const styling = getHeaderStyling();

  // Authorized user
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className={`${styling.gradient} text-white p-4`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSuperAdmin ? (
              <Crown className="h-6 w-6 text-yellow-300" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
            <div>
              <h1 className="text-lg font-semibold">
                {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
              </h1>
              <p className={`text-sm ${styling.textColor}`}>
                Logged in as {user.firstName} ({user.role})
                {isSuperAdmin && (
                  <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full">
                    SUPER
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className={`px-4 py-2 ${styling.buttonBg} rounded-lg transition-colors text-sm`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="">{children}</div>
    </div>
  );
};

export default AdminRouteGuard;

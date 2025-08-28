// components/guards/DashboardRouteGuard.jsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardRouteGuard = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    // Check role-based access
    if (!loading && isAuthenticated && requiredRole) {
      const userRole = user?.role?.toUpperCase();

      // SUPERADMIN can access everything
      if (userRole === 'SUPERADMIN') {
        return;
      }

      // Check if user has required role
      if (userRole !== requiredRole.toUpperCase()) {
        router.push('/unauthorized'); // or redirect to appropriate page
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to sign-in
  }

  // Role-based access control
  if (requiredRole) {
    const userRole = user?.role?.toUpperCase();

    // SUPERADMIN can access everything
    if (userRole === 'SUPERADMIN') {
      return children;
    }

    // Check if user has required role
    if (userRole !== requiredRole.toUpperCase()) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Access Denied!</strong>
              <span className="block sm:inline">
                {' '}
                You don't have permission to access this page.
              </span>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized - render dashboard content
  return children;
};

export default DashboardRouteGuard;

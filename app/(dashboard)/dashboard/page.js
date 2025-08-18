'use client';

// import DebugAuth from '@/components/DebugAuth';
import { useAuth, useAuthenticatedFetch } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch dashboard data safely
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        setDataLoading(true);

        const response = await authenticatedFetch('/api/dashboard');

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else if (response.status === 401) {
          // Unauthorized → logout user
          console.warn('Unauthorized, logging out...');
          logout();
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, authenticatedFetch, logout]);

  // Show global loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Access denied fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info */}
      {/* <DebugAuth /> */}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <Link href="/" className="text-xl font-semibold text-gray-900">
                Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName}!
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              User Information
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {user?.firstName}{' '}
                {user?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Role:</span>{' '}
                {user?.role || 'User'}
              </p>
            </div>
          </div>

          {/* Dashboard Data */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Dashboard Stats
            </h2>
            {dataLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : dashboardData ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Data loaded successfully!
                </p>
                {/* Render dashboard data dynamically */}
                {Object.entries(dashboardData).map(([key, value]) => (
                  <p key={key} className="text-sm text-gray-600">
                    <span className="font-medium">{key}:</span> {value}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                <span className="text-sm font-medium text-blue-900">
                  View Profile
                </span>
              </button>
              <button className="w-full text-left p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors">
                <span className="text-sm font-medium text-green-900">
                  Settings
                </span>
              </button>
              <button className="w-full text-left p-3 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors">
                <span className="text-sm font-medium text-purple-900">
                  Help & Support
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

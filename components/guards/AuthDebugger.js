// Temporary debug component - যেকোনো page এ এটা add করুন
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const AuthDebugger = () => {
  const {
    user,
    loading,
    isAuthenticated,
    accessToken,
    tokenExpiry,
    isTokenExpired,
  } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔍 AUTH DEBUG:', {
        loading,
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        hasToken: !!accessToken,
        tokenExpiry: tokenExpiry
          ? new Date(tokenExpiry).toLocaleTimeString()
          : null,
        isExpired: isTokenExpired(),
        currentTime: new Date().toLocaleTimeString(),
        localStorage: {
          token: localStorage.getItem('auth_token') ? 'exists' : 'missing',
          user: localStorage.getItem('auth_user') ? 'exists' : 'missing',
          expiry: localStorage.getItem('auth_expiry')
            ? new Date(
                JSON.parse(localStorage.getItem('auth_expiry'))
              ).toLocaleTimeString()
            : 'missing',
        },
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [
    user,
    loading,
    isAuthenticated,
    accessToken,
    tokenExpiry,
    isTokenExpired,
  ]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-0 left-0 bg-black bg-opacity-90 text-white p-4 text-xs z-50 max-w-md">
      <div className="font-bold mb-2">🔍 Auth Debug Panel</div>
      <div className="space-y-1">
        <div>
          Loading:{' '}
          <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          Authenticated:{' '}
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          User:{' '}
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user?.username || 'None'}
          </span>
        </div>
        <div>
          Role:{' '}
          <span className={user?.role ? 'text-blue-400' : 'text-gray-400'}>
            {user?.role || 'None'}
          </span>
        </div>
        <div>
          Token:{' '}
          <span className={accessToken ? 'text-green-400' : 'text-red-400'}>
            {accessToken ? 'Exists' : 'Missing'}
          </span>
        </div>
        <div>
          Token Expired:{' '}
          <span
            className={isTokenExpired() ? 'text-red-400' : 'text-green-400'}
          >
            {isTokenExpired() ? 'Yes' : 'No'}
          </span>
        </div>
        {tokenExpiry && (
          <div>
            Expires:{' '}
            <span className="text-blue-400">
              {new Date(tokenExpiry).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugger;

// hooks/useAuth.js - PROPERLY OPTIMIZED VERSION
'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null); // Track token expiry

  // ------------------------------
  // Set/Clear Auth Data
  // ------------------------------
  const setAuthData = useCallback(({ token, userData, expiresIn }) => {
    setAccessToken(token);
    setUser(userData);

    console.log('this is set user', userData);

    // Calculate expiry time (subtract 1 minute for safety margin)
    if (expiresIn || token) {
      const expiryTime =
        Date.now() + (expiresIn ? expiresIn * 1000 - 60000 : 14 * 60 * 1000);
      setTokenExpiry(expiryTime);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setTokenExpiry(null);
  }, []);

  // ------------------------------
  // Check if token is expired
  // ------------------------------
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiry) return true;
    return Date.now() >= tokenExpiry;
  }, [tokenExpiry]);

  // ------------------------------
  // Refresh Token (only when needed)
  // ------------------------------
  const refreshAccessToken = useCallback(async () => {
    try {
      console.log('🔄 Refreshing access token...');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        const { accessToken: newToken, user: userData, expiresIn } = data.data;
        console.log(userData, data.data);
        setAuthData({
          token: newToken,
          userData,
          expiresIn: expiresIn || 15 * 60, // Default 15 minutes if not provided
        });
        console.log('✅ Token refreshed successfully');
        return newToken;
      } else {
        console.log('❌ Token refresh failed:', data.message);
        clearAuthData();
        return null;
      }
    } catch (err) {
      console.error('❌ Token refresh error:', err);
      clearAuthData();
      return null;
    }
  }, [setAuthData, clearAuthData]);

  // ------------------------------
  // Get Valid Token (smart token management)
  // ------------------------------
  const getValidToken = useCallback(async () => {
    // If no token at all, try to refresh from httpOnly cookie
    if (!accessToken) {
      console.log('🔍 No access token found, attempting refresh...');
      return await refreshAccessToken();
    }

    // If token exists but expired, refresh it
    if (isTokenExpired()) {
      console.log('⏰ Token expired, refreshing...');
      return await refreshAccessToken();
    }

    // Token is valid, use it
    console.log('✅ Using existing valid token');
    return accessToken;
  }, [accessToken, isTokenExpired, refreshAccessToken]);

  // ------------------------------
  // Login / Register
  // ------------------------------
  const login = useCallback(
    async (username, password) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
          }
        );
        const data = await res.json();

        if (res.ok && data.success) {
          const { accessToken, user, expiresIn } = data.data;
          setAuthData({
            token: accessToken,
            userData: user,
            expiresIn: expiresIn || 15 * 60,
          });
          return { success: true, user };
        } else return { success: false, error: data.message };
      } catch (err) {
        return { success: false, error: 'Network error' };
      }
    },
    [setAuthData]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include',
          }
        );
        const data = await res.json();

        if (res.ok && data.success) {
          const { accessToken, user, expiresIn } = data.data;
          setAuthData({
            token: accessToken,
            userData: user,
            expiresIn: expiresIn || 15 * 60,
          });
          return { success: true, user };
        } else return { success: false, error: data.message };
      } catch (err) {
        return { success: false, error: 'Network error' };
      }
    },
    [setAuthData]
  );

  // ------------------------------
  // Logout
  // ------------------------------
  const logout = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
      router.push('/sign-in');
    }
  }, [accessToken, clearAuthData, router]);

  // ------------------------------
  // Initialize Auth on Mount (ONE TIME ONLY)
  // ------------------------------
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        // Only try to refresh if we don't have a valid token
        if (!accessToken || isTokenExpired()) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  // ------------------------------
  // Authenticated Fetch (with smart retry)
  // ------------------------------
  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      let token = await getValidToken();
      if (!token) throw new Error('Authentication required');

      const makeRequest = async (authToken) => {
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type':
              options.headers?.['Content-Type'] || 'application/json',
            Authorization: `Bearer ${authToken}`,
            ...options.headers,
          },
          credentials: 'include',
        });
      };

      let response = await makeRequest(token);

      // If 401 and we haven't already refreshed, try once more
      if (response.status === 401) {
        console.log('🔄 Got 401, attempting token refresh...');
        const newToken = await refreshAccessToken();

        if (newToken) {
          console.log('🔄 Retrying request with new token...');
          response = await makeRequest(newToken);
        } else {
          throw new Error('Authentication failed');
        }
      }

      return response;
    },
    [getValidToken, refreshAccessToken]
  );

  // Debug info (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth State:', {
        hasToken: !!accessToken,
        hasUser: !!user,
        tokenExpiry: tokenExpiry
          ? new Date(tokenExpiry).toLocaleString()
          : null,
        isExpired: isTokenExpired(),
        loading,
      });
    }
  }, [accessToken, user, tokenExpiry, loading, isTokenExpired]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated: !!user && !!accessToken && !isTokenExpired(),
        login,
        register,
        logout,
        getValidToken,
        authenticatedFetch,
        // Utility functions
        isTokenExpired,
        refreshAccessToken, // Expose for manual refresh if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

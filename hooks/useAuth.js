// hooks/useAuth.js - COMPLETE TOKEN MANAGEMENT SYSTEM
'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const router = useRouter();
  const refreshTimeoutRef = useRef(null);
  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);

  // Set token data in context
  const setTokenData = useCallback((token, expiresIn, userData) => {
    setAccessToken(token);
    setUser(userData);

    const expiryTime = Date.now() + expiresIn * 1000;
    setTokenExpiry(expiryTime);

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule token refresh 2 minutes before expiry
    const refreshTime = Math.max(10000, (expiresIn - 120) * 1000); // minimum 10 seconds
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Auto-refreshing token...');
      refreshAccessToken();
    }, refreshTime);
  }, []);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setTokenExpiry(null);

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, []);

  // Check if token is expired or about to expire
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiry) return true;
    // Consider expired if less than 1 minute remaining
    return Date.now() >= tokenExpiry - 60000;
  }, [tokenExpiry]);

  // Refresh access token using refresh token (httpOnly cookie)
  const refreshAccessToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.current) {
      return refreshPromise.current;
    }

    isRefreshing.current = true;
    refreshPromise.current = (async () => {
      try {
        console.log('🔄 Refreshing access token...');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include', // Send httpOnly refresh token cookie
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          console.log('✅ Token refreshed successfully');

          // Update context with new tokens
          setTokenData(
            data.data.accessToken,
            data.data.expiresIn || 900,
            data.data.user
          );

          return data.data.accessToken;
        } else {
          console.log('❌ Token refresh failed:', data.message);

          // Refresh token is invalid/expired, clear auth data
          clearAuthData();
          return null;
        }
      } catch (error) {
        console.error('❌ Token refresh error:', error);
        clearAuthData();
        return null;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [setTokenData, clearAuthData]);

  // Get valid access token (with automatic refresh if needed)
  const getValidToken = useCallback(async () => {
    // If token exists and not expired, return it
    if (accessToken && !isTokenExpired()) {
      return accessToken;
    }

    // Token is expired or doesn't exist, try to refresh
    console.log('🔄 Access token expired/missing, refreshing...');
    return await refreshAccessToken();
  }, [accessToken, isTokenExpired, refreshAccessToken]);

  // Login function
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // Receive httpOnly refresh token cookie
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          console.log('✅ Login successful');

          // Store access token and user data in context
          setTokenData(
            data.data.accessToken,
            data.data.expiresIn || 900,
            data.data.user
          );

          return {
            success: true,
            message: data.message,
            user: data.data.user,
          };
        } else {
          return {
            success: false,
            error: data.message || 'Login failed',
          };
        }
      } catch (error) {
        console.error('❌ Login error:', error);
        return {
          success: false,
          error: 'Network error. Please try again.',
        };
      }
    },
    [setTokenData]
  );

  // Register function
  const register = useCallback(
    async (userData) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          console.log('✅ Registration successful');

          setTokenData(
            data.data.accessToken,
            data.data.expiresIn || 900,
            data.data.user
          );

          return {
            success: true,
            message: data.message,
            user: data.data.user,
          };
        } else {
          return {
            success: false,
            error: data.message || 'Registration failed',
          };
        }
      } catch (error) {
        console.error('❌ Register error:', error);
        return {
          success: false,
          error: 'Network error. Please try again.',
        };
      }
    },
    [setTokenData]
  );

  // Logout function
  // Logout function
  const logout = useCallback(async () => {
    console.log('clicked----------------');

    try {
      // Get valid access token from context
      const token = accessToken;

      if (!token) {
        console.warn(
          'No access token available, sending only refresh token cookie'
        );
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Send httpOnly refresh token cookie
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      // Always clear frontend auth data
      clearAuthData();
      router.push('/sign-in');
    }
  }, [accessToken, clearAuthData, router]);

  // Check auth status on app load
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);

    try {
      // Try to refresh token to see if user is still authenticated
      const token = await refreshAccessToken();

      if (!token) {
        console.log('❌ No valid authentication found');
        clearAuthData();
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken, clearAuthData]);

  // Initialize auth on mount
  useEffect(() => {
    checkAuthStatus();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [checkAuthStatus]);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user && !!accessToken && !isTokenExpired(),
    login,
    loginWithCredentials: login, // Alias for backward compatibility
    register,
    logout,
    refreshToken: refreshAccessToken,
    getValidToken,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced authenticated fetch hook with automatic retry
export const useAuthenticatedFetch = () => {
  const { getValidToken, logout } = useAuth();

  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      try {
        // Get valid access token (automatically refreshes if needed)
        const token = await getValidToken();

        if (!token) {
          console.error('❌ No valid access token available');
          logout();
          throw new Error('Authentication required');
        }

        // Make API call with access token
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type':
              options.headers?.['Content-Type'] || 'application/json',
          },
          credentials: 'include',
        });

        // If still unauthorized after getting fresh token, logout user
        if (response.status === 401) {
          console.error('❌ API call unauthorized even with fresh token');
          logout();
          throw new Error('Authentication failed');
        }

        return response;
      } catch (error) {
        console.error('❌ Authenticated fetch error:', error);
        throw error;
      }
    },
    [getValidToken, logout]
  );

  return { authenticatedFetch };
};

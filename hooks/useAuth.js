// hooks/useAuth.js - FIXED INFINITE LOOP VERSION
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
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Add initialization tracking to prevent loops
  const [hasInitialized, setHasInitialized] = useState(false);
  const initializationRef = useRef(false);

  // ------------------------------
  // Enhanced localStorage for token persistence
  // ------------------------------
  const saveToStorage = useCallback((key, value) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }, []);

  const getFromStorage = useCallback((key) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return null;
      }
    }
    return null;
  }, []);

  const removeFromStorage = useCallback((key) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    }
  }, []);

  // ------------------------------
  // Set/Clear Auth Data
  // ------------------------------
  const setAuthData = useCallback(
    ({ token, userData, expiresIn }) => {
      console.log('🔧 Setting auth data:', {
        userData: userData?.username,
        token: !!token,
      });

      setAccessToken(token);
      setUser(userData);

      // Calculate expiry time (subtract 1 minute for safety margin)
      if (expiresIn || token) {
        const expiryTime =
          Date.now() + (expiresIn ? expiresIn * 1000 - 60000 : 14 * 60 * 1000);
        setTokenExpiry(expiryTime);

        // Save to localStorage for persistence
        saveToStorage('auth_token', token);
        saveToStorage('auth_user', userData);
        saveToStorage('auth_expiry', expiryTime);
      }
    },
    [saveToStorage]
  );

  const clearAuthData = useCallback(() => {
    console.log('🧹 Clearing auth data');
    setAccessToken(null);
    setUser(null);
    setTokenExpiry(null);

    // Clear localStorage
    removeFromStorage('auth_token');
    removeFromStorage('auth_user');
    removeFromStorage('auth_expiry');
  }, [removeFromStorage]);

  // ------------------------------
  // Check if token is expired - memoized to prevent recalculations
  // ------------------------------
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiry) return true;
    const expired = Date.now() >= tokenExpiry;
    return expired;
  }, [tokenExpiry]);

  // ------------------------------
  // Enhanced Refresh Token with better error handling
  // ------------------------------
  const refreshAccessToken = useCallback(async () => {
    try {
      console.log('🔄 Refreshing access token...');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      console.log('🔄 Refresh response status:', res.status);

      // If 401, session actually expired - don't treat as error
      if (res.status === 401) {
        console.log('🔒 Session expired (401) - clearing auth data');
        clearAuthData();
        return null;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.log('❌ Refresh failed - Response:', errorText);
        clearAuthData();
        return null;
      }

      const data = await res.json();
      console.log('✅ Refresh successful');

      if (data.success) {
        const { accessToken: newToken, user: userData, expiresIn } = data.data;
        setAuthData({
          token: newToken,
          userData,
          expiresIn: expiresIn || 15 * 60,
        });
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
  // Get Valid Token
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
    return accessToken;
  }, [accessToken, isTokenExpired, refreshAccessToken]);

  // ------------------------------
  // Enhanced Login with better debugging
  // ------------------------------
  const login = useCallback(
    async (username, password) => {
      try {
        console.log('🔐 Login attempt for:', username);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
          }
        );

        console.log('🔐 Login response status:', res.status);
        const data = await res.json();

        if (res.ok && data.success) {
          const { accessToken, user, expiresIn } = data.data;
          setAuthData({
            token: accessToken,
            userData: user,
            expiresIn: expiresIn || 15 * 60,
          });
          console.log('✅ Login successful, user role:', user.role);
          return { success: true, user };
        } else {
          console.log('❌ Login failed:', data.message);
          return { success: false, error: data.message };
        }
      } catch (err) {
        console.error('❌ Login error:', err);
        return { success: false, error: 'Network error' };
      }
    },
    [setAuthData]
  );

  const register = useCallback(
    async (userData) => {
      try {
        console.log('📝 Register attempt');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
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
  // FIXED: Initialize Auth - prevent infinite loops
  // ------------------------------
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationRef.current) {
      console.log('⚠️ Auth already initializing, skipping...');
      return;
    }

    let mounted = true;
    let timeoutId;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth (one time only)...');

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log(
              '⏰ Auth initialization timeout - setting loading false'
            );
            setLoading(false);
            setHasInitialized(true);
          }
        }, 4000);

        // First, try to restore from localStorage
        const storedToken = getFromStorage('auth_token');
        const storedUser = getFromStorage('auth_user');
        const storedExpiry = getFromStorage('auth_expiry');

        console.log('💾 Checking stored auth data:', {
          hasStoredToken: !!storedToken,
          hasStoredUser: !!storedUser,
          hasStoredExpiry: !!storedExpiry,
        });

        if (storedToken && storedUser && storedExpiry) {
          // Check if stored token is expired
          const now = Date.now();
          const isStoredTokenExpired = now >= storedExpiry;

          console.log('🕐 Token expiry check:', {
            now: new Date(now).toLocaleString(),
            expiry: new Date(storedExpiry).toLocaleString(),
            isExpired: isStoredTokenExpired,
          });

          if (isStoredTokenExpired) {
            console.log('⏰ Stored token expired, attempting refresh...');
            // Clear expired data first
            clearAuthData();

            // Try to refresh
            const newToken = await refreshAccessToken();
            if (!newToken) {
              console.log('❌ Could not refresh token');
            }
          } else {
            // Token is still valid, restore it
            console.log('✅ Restoring valid auth from localStorage');
            setAccessToken(storedToken);
            setUser(storedUser);
            setTokenExpiry(storedExpiry);
          }
        } else {
          console.log(
            '🔍 No valid stored auth, attempting refresh from cookie...'
          );
          // Try to get token from httpOnly cookie
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        clearAuthData();
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setHasInitialized(true);
          console.log('🏁 Auth initialization completed');
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Don't reset initializationRef here to prevent re-runs
    };
  }, []); // NO DEPENDENCIES - run only once on mount

  // ------------------------------
  // Authenticated Fetch
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

  // ------------------------------
  // FIXED: Debug logging with proper dependencies
  // ------------------------------
  useEffect(() => {
    if (hasInitialized) {
      console.log('🔍 Auth State Final:', {
        hasToken: !!accessToken,
        hasUser: !!user,
        userRole: user?.role,
        tokenExpiry: tokenExpiry
          ? new Date(tokenExpiry).toLocaleString()
          : null,
        isExpired: tokenExpiry ? Date.now() >= tokenExpiry : true,
        isAuthenticated:
          !!user && !!accessToken && tokenExpiry && Date.now() < tokenExpiry,
        loading,
      });
    }
  }, [accessToken, user, tokenExpiry, loading, hasInitialized]);

  // Calculate isAuthenticated based on current state
  const isAuthenticated = !!user && !!accessToken && !isTokenExpired();

  const contextValue = {
    user,
    accessToken,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    getValidToken,
    authenticatedFetch,
    isTokenExpired,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

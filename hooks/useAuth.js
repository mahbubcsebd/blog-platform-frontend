// hooks/useAuth.js - OPTIMIZED LIGHTWEIGHT VERSION
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

  // ------------------------------
  // Set/Clear Auth Data
  // ------------------------------
  const setAuthData = useCallback(({ token, userData }) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // ------------------------------
  // Refresh Token On Demand
  // ------------------------------
  const refreshAccessToken = useCallback(async () => {
    try {
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
        setAuthData({ token: data.data.accessToken, userData: data.data.user });
        return data.data.accessToken;
      } else {
        clearAuthData();
        return null;
      }
    } catch (err) {
      clearAuthData();
      return null;
    }
  }, [setAuthData, clearAuthData]);

  // ------------------------------
  // Get Valid Token
  // ------------------------------
  const getValidToken = useCallback(async () => {
    if (!accessToken) return await refreshAccessToken();
    return accessToken;
  }, [accessToken, refreshAccessToken]);

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
          setAuthData({
            token: data.data.accessToken,
            userData: data.data.user,
          });
          return { success: true, user: data.data.user };
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
          setAuthData({
            token: data.data.accessToken,
            userData: data.data.user,
          });
          return { success: true, user: data.data.user };
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
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : '' },
      });
    } catch (err) {
      console.error(err);
    } finally {
      clearAuthData();
      router.push('/sign-in');
    }
  }, [accessToken, clearAuthData, router]);

  // ------------------------------
  // Initialize Auth on Mount
  // ------------------------------
  useEffect(() => {
    (async () => {
      await refreshAccessToken();
      setLoading(false);
    })();
  }, [refreshAccessToken]);

  // ------------------------------
  // Authenticated Fetch (with lazy refresh)
  // ------------------------------
  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      let token = await getValidToken();
      if (!token) throw new Error('Authentication required');

      let res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type':
            options.headers?.['Content-Type'] || 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        credentials: 'include',
      });

      // Retry once if 401
      if (res.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Authentication required');

        res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type':
              options.headers?.['Content-Type'] || 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
          credentials: 'include',
        });
      }

      return res;
    },
    [getValidToken, refreshAccessToken]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
        getValidToken,
        authenticatedFetch,
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

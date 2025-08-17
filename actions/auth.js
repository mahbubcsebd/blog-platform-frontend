// lib/actions/auth.js
'use server';

import { authApi } from '@/utils/auth';
import { cookies } from 'next/headers';

// Login server action - Hybrid approach
export async function loginAction(formData) {
  try {
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    // Validate required fields
    if (!loginData.email || !loginData.password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    const response = await authApi.login(loginData);
    const data = await response.json();

    if (response.ok && data.success) {
      const cookieStore = cookies();

      // Store ONLY refresh token in httpOnly cookie (secure, long-term)
      // cookieStore.set('refreshToken', data.data.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: 'strict',
      //   maxAge: 7 * 24 * 60 * 60, // 7 days
      //   path: '/',
      // });

      // Return access token and user data (will be stored in memory/context)
      return {
        success: true,
        message: data.message,
        user: data.data.user,
        accessToken: data.data.accessToken, // This goes to client-side memory
        expiresIn: data.data.expiresIn || 900, // 15 minutes default
      };
    } else {
      return {
        success: false,
        error: data.message || 'Login failed',
      };
    }
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Register server action - Hybrid approach
export async function registerAction(formData) {
  try {
    const userData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    // Validate required fields
    if (
      !userData.firstName ||
      !userData.lastName ||
      !userData.email ||
      !userData.password
    ) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }

    const response = await authApi.register(userData);
    const data = await response.json();

    if (response.ok && data.success) {
      const cookieStore = cookies();

      // Store ONLY refresh token in httpOnly cookie
      // cookieStore.set('refreshToken', data.data.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: 'strict',
      //   maxAge: 7 * 24 * 60 * 60, // 7 days
      //   path: '/',
      // });

      return {
        success: true,
        message: data.message,
        user: data.data.user,
        accessToken: data.data.accessToken,
        expiresIn: data.data.expiresIn || 900,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Registration failed',
      };
    }
  } catch (error) {
    console.error('Register action error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Refresh token server action - Key component of hybrid approach
export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies(); // ✅ এখন async
    const refreshToken = cookieStore.get('refreshToken')?.value;

    console.log('Refresh token check:', !!refreshToken);

    if (!refreshToken) {
      return { success: false, error: 'No refresh token found' };
    }

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
      }/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${refreshToken}`,
        },
        credentials: 'include',
      }
    );

    const data = await response.json();
    console.log('Refresh token response:', {
      success: data.success,
      hasUser: !!data.data?.user,
    });

    if (response.ok && data.success) {
      // ✅ Update cookie (rotation)
      (await cookies()).set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return {
        success: true,
        message: data.message,
        user: data.data.user,
        accessToken: data.data.accessToken,
        expiresIn: data.data.expiresIn || 900,
      };
    } else {
      (await cookies()).delete('refreshToken');
      return { success: false, error: data.message || 'Token refresh failed' };
    }
  } catch (error) {
    console.error('Refresh token action error:', error);
    (await cookies()).delete('refreshToken');
    return { success: false, error: 'Token refresh failed' };
  }
}

// Logout server action
export async function logoutAction() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      await authApi.logout();
    }

    // Clear refresh token cookie
    cookieStore.delete('refreshToken');

    return {
      success: true,
      message: 'Logout successful',
    };
  } catch (error) {
    console.error('Logout action error:', error);
    const cookieStore = cookies();
    cookieStore.delete('refreshToken');

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}

// Check if user has valid refresh token (for SSR)
export async function hasValidRefreshToken() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    return !!refreshToken;
  } catch (error) {
    return false;
  }
}

// Server-side auth check (for protected pages/layouts)
export async function getServerAuth() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return { isAuthenticated: false, user: null };
    }

    // Try to get fresh access token
    const result = await refreshTokenAction();

    if (result.success) {
      return {
        isAuthenticated: true,
        user: result.user,
        accessToken: result.accessToken,
      };
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Server auth check failed:', error);
    return { isAuthenticated: false, user: null };
  }
}

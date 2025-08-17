// utils/api.js
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for API calls
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include', // Important for cookies
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw new Error('Network error. Please check your connection.');
  }
};

// Auth API functions
export const authApi = {
  // Register
  register: async (registerData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
    return response;
  },

  // Login
  login: async (loginData) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    return response;
  },

  // Logout
  logout: async (accessToken = null) => {
    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await apiRequest('/auth/logout', {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Logout failed');
    }

    return response.json();
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to refresh token');
    }

    return response.json();
  },

  // Get profile
  getProfile: async (accessToken) => {
    const response = await apiRequest('/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch profile');
    }

    return response.json();
  },

  // Update profile
  updateProfile: async (profileData, accessToken) => {
    const response = await apiRequest('/auth/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return response.json();
  },

  // Change password
  changePassword: async (passwordData, accessToken) => {
    const response = await apiRequest('/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to change password');
    }

    return response.json();
  },
};

// Generic authenticated request utility
export const authenticatedRequest = async (
  endpoint,
  accessToken,
  options = {}
) => {
  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// Response handler utility
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: Request failed`
    );
  }
  return response.json();
};

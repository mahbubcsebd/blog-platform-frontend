import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useApi = () => {
  const { apiCall, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // small util for safe JSON parsing
  const parseJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const request = useCallback(
    async (url, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall(url, options);
        const data = await parseJson(response);

        if (!response.ok) {
          if (response.status === 401) {
            await logout(); // refresh fail হলে fallback
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, logout]
  );

  // REST helpers
  const get = useCallback(
    (url, options = {}) => request(url, { method: 'GET', ...options }),
    [request]
  );
  const post = useCallback(
    (url, data, options = {}) =>
      request(url, { method: 'POST', body: JSON.stringify(data), ...options }),
    [request]
  );
  const put = useCallback(
    (url, data, options = {}) =>
      request(url, { method: 'PUT', body: JSON.stringify(data), ...options }),
    [request]
  );
  const patch = useCallback(
    (url, data, options = {}) =>
      request(url, { method: 'PATCH', body: JSON.stringify(data), ...options }),
    [request]
  );
  const del = useCallback(
    (url, options = {}) => request(url, { method: 'DELETE', ...options }),
    [request]
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError: () => setError(null),
  };
};

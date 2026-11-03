import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://job-mansion.onrender.com/api',
  withCredentials: true, // send httpOnly refresh-token cookie
});

/**
 * Wire up the auth interceptors.
 * Call this once from main.jsx after AuthProvider is mounted,
 * passing the AuthContext's tokenRef and refresh/clearSession callbacks.
 */
export function setupInterceptors({ tokenRef, refresh, clearSession }) {
  // ── Request: attach the in-memory access token ──────────────────────
  api.interceptors.request.use((config) => {
    const t = tokenRef?.current;
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
  });

  // ── Response: on 401 → try one silent refresh, then retry ───────────
  let isRefreshing = false;
  let failedQueue = [];

  function processQueue(error, newToken = null) {
    failedQueue.forEach((p) => {
      if (error) p.reject(error);
      else p.resolve(newToken);
    });
    failedQueue = [];
  }

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      // Only retry once and skip the refresh endpoint itself
      if (
        error.response?.status === 401 &&
        !original._retry &&
        !original.url?.includes('/auth/refresh')
      ) {
        if (isRefreshing) {
          // Queue subsequent 401s while refresh is in flight
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                original.headers.Authorization = `Bearer ${token}`;
                resolve(api(original));
              },
              reject,
            });
          });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refresh();
          if (!newToken) throw new Error('Refresh failed');
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearSession();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

export default api;

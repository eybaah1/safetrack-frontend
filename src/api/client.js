import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token helpers ──────────────────────────────────────
export function getTokens() {
  return {
    access: localStorage.getItem('safetrack_access'),
    refresh: localStorage.getItem('safetrack_refresh'),
  };
}

export function setTokens(access, refresh) {
  localStorage.setItem('safetrack_access', access);
  if (refresh) localStorage.setItem('safetrack_refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('safetrack_access');
  localStorage.removeItem('safetrack_refresh');
  localStorage.removeItem('safetrack_auth');
  localStorage.removeItem('safetrack_userType');
  localStorage.removeItem('safetrack_user');
}

// ── Request interceptor: attach access token ───────────
client.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// ── Response interceptor: handle 401 + refresh ─────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh on login/signup/refresh endpoints
      const skipPaths = ['/auth/login/', '/auth/signup/', '/auth/token/refresh/'];
      if (skipPaths.some((p) => originalRequest.url?.includes(p))) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refresh } = getTokens();
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, {
          refresh,
        });

        setTokens(data.access, data.refresh || refresh);
        processQueue(null, data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
        window.location.hash = 'signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
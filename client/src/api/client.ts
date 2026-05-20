import axios from 'axios';

/** Empty string = same-origin (/api proxied by Vite dev or Nginx in production). */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

/** Attempt silent refresh when access cookie expires. */
export async function refreshSession(): Promise<boolean> {
  try {
    await api.post('/api/auth/refresh');
    return true;
  } catch {
    return false;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || original._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !String(original.url || '').includes('/api/auth/refresh')) {
      original._retry = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

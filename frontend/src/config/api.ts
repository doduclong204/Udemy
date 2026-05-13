import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Store } from '@reduxjs/toolkit';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: (params) => {
    const parts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'sort') {
        parts.push(`${key}=${value}`);
      } else if (key === 'filter') {
        parts.push(`${key}=${encodeURIComponent(value as string)}`);
      } else if (Array.isArray(value)) {
        (value as unknown[]).forEach((v) =>
          parts.push(`${key}=${encodeURIComponent(String(v))}`)
        );
      } else {
        parts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    });
    return parts.join('&');
  },
});

let isRefreshing = false;
let pendingQueue: QueueItem[] = [];

const drainQueue = (error: unknown, newToken: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newToken!)
  );
  pendingQueue = [];
};

let _store: Store | null = null;

export const setupAxios = (store: Store) => {
  _store = store;
};

const dispatchIfReady = (action: Parameters<Store['dispatch']>[0]) => {
  _store?.dispatch(action);
};

const forceLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  import('@/redux/slices/authSlice').then(({ resetAuthState }) => {
    dispatchIfReady(resetAuthState());
  });
  window.location.href = '/login';
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const skipUrls = ['/auth/login', '/auth/refresh', '/auth/register'];
    const requestUrl = originalRequest.url ?? '';
    if (skipUrls.some((u) => requestUrl.includes(u))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken: string = data?.data?.access_token;
      if (!newAccessToken) throw new Error('No access_token in refresh response');

      localStorage.setItem('access_token', newAccessToken);

      const newUser = data?.data?.user;
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
        import('@/redux/slices/authSlice').then(({ setUser }) => {
          dispatchIfReady(setUser(newUser));
        });
      }

      drainQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
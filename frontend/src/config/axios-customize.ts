import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Custom interceptor configurations
// Tách riêng để dễ customize theo từng use case

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const setupRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add timestamp to prevent caching
      // config.params = { ...config.params, _t: Date.now() };
      
      // Add custom headers if needed
      // config.headers['X-Custom-Header'] = 'value';
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
};

export const setupResponseInterceptor = (
  instance: AxiosInstance,
  onUnauthorized?: () => void,
  onForbidden?: () => void
) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Transform response data if needed
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosConfig;
      
      // Handle token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            // TODO: Call refresh token API
            // const response = await axios.post('/api/auth/refresh', { refreshToken });
            // localStorage.setItem('access_token', response.data.accessToken);
            // return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          onUnauthorized?.();
        }
      }
      
      if (error.response?.status === 403) {
        onForbidden?.();
      }
      
      return Promise.reject(error);
    }
  );
};

// Utility function to create axios instance with all interceptors
export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  setupRequestInterceptor(instance);
  setupResponseInterceptor(instance);
  
  return instance;
};

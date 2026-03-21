import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    const parts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'filter' || key === 'sort') {
        parts.push(`${key}=${value}`);
      } else if (Array.isArray(value)) {
        value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
      } else {
        parts.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    return parts.join('&');
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, config } = error;

    if (response) {
      switch (response.status) {
        case 401: {
          const url: string = config?.url || '';
          const isAuthEndpoint =
            url.includes('/auth/account') ||
            url.includes('/auth/me') ||
            url.includes('/auth/refresh') ||
            url.includes('/auth/login');

          const isPublicPage =
            window.location.pathname === '/' ||
            window.location.pathname.startsWith('/course') ||
            window.location.pathname.startsWith('/search') ||
            window.location.pathname === '/login' ||
            window.location.pathname === '/signup' ||
            window.location.pathname === '/forgot-password';

          if (!isAuthEndpoint && !isPublicPage) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        }
        case 403:
          console.error('Forbidden: Bạn không có quyền truy cập tài nguyên này');
          break;
        case 404:
          console.error('Not Found: Tài nguyên không tồn tại');
          break;
        case 500:
          console.error('Server Error: Đã xảy ra lỗi từ máy chủ');
          break;
        default:
          console.error('Error:', response.data?.message || 'Đã xảy ra lỗi');
      }
    } else if (error.request) {
      console.error('Network Error: Không thể kết nối đến máy chủ');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
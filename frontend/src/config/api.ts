import axios from 'axios';

// TODO: Đổi URL production sau
const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - tự động thêm Bearer token
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

// Response interceptor - xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          // TODO: Redirect to login hoặc dispatch logout action
          window.location.href = '/login';
          break;
        case 403:
          // Không có quyền truy cập
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

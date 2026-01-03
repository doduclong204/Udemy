import axiosInstance from '@/config/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constant/common.constant';
import { AuthResponse, LoginRequest, RegisterRequest, User, ApiResponse } from '@/types';

// Mock data để UI vẫn chạy bình thường
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'User',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  role: 'user',
};

const mockAdminUser: User = {
  id: '2',
  email: 'admin@gmail.com',
  name: 'Admin',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  role: 'admin',
};

const authService = {
  /**
   * Đăng nhập
   * TODO: Implement thật với API sau
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isAdmin = data.email === 'admin@gmail.com' && data.password === 'admin123';
    const user = isAdmin ? mockAdminUser : { ...mockUser, email: data.email, name: data.email.split('@')[0] };
    
    if (data.password.length < 6) {
      throw new Error('Invalid credentials');
    }
    
    const mockResponse: AuthResponse = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user,
      expiresIn: 3600,
    };
    
    // Lưu vào localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, mockResponse.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, mockResponse.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockResponse.user));
    
    return mockResponse;
  },

  /**
   * Đăng ký
   * TODO: Implement thật với API sau
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      role: 'user',
    };
    
    const mockResponse: AuthResponse = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user: newUser,
      expiresIn: 3600,
    };
    
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, mockResponse.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, mockResponse.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockResponse.user));
    
    return mockResponse;
  },

  /**
   * Đăng xuất
   * TODO: Implement thật với API sau
   */
  logout: async (): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Refresh token
   * TODO: Implement thật với API sau
   */
  refreshToken: async (): Promise<AuthResponse> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    // const response = await axiosInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
    // return response.data.data;
    
    // Mock implementation
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : mockUser;
    
    return {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user,
      expiresIn: 3600,
    };
  },

  /**
   * Forgot password
   * TODO: Implement thật với API sau
   */
  forgotPassword: async (email: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset email sent to:', email);
  },

  /**
   * Reset password
   * TODO: Implement thật với API sau
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset successfully');
  },

  /**
   * Lấy user từ localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Lấy access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};

export default authService;

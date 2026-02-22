import axiosInstance from "@/config/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constant/common.constant";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

const authService = {
  /**
   * Đăng nhập - Backend trả { statusCode, message, data: { access_token, user } }
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
    );

    // Fix: đọc response.data.data thay vì response.data
    const authData = response.data.data;

    // Lưu token vào localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));

    return authData;
  },

  /**
   * Đăng ký - Backend chỉ trả UserResponse (không có token)
   * User cần login sau khi đăng ký
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await axiosInstance.post<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
    );
    // Nếu backend cũng bọc data thì dùng response.data.data
    // Nếu không bọc thì dùng response.data
    return response.data.data ?? response.data;
  },

  /**
   * Lấy thông tin account hiện tại (bỏ qua nếu endpoint chưa có)
   */
  getAccount: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ACCOUNT,
    );
    return response.data.data ?? response.data;
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout API error:", error);
    }

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Refresh token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {},
      { withCredentials: true },
    );
    const authData = response.data.data;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));

    return authData;
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

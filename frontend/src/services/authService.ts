import axiosInstance from "@/config/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constant/common.constant";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  OAuthRequest,
  User,
} from "@/types";

const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
    );
    const authData = response.data.data;
    if (
      authData.user &&
      (authData.user as User & { _id?: string })._id &&
      !(authData.user as User & { _id?: string }).id
    ) {
      (authData.user as User & { _id?: string }).id = (
        authData.user as User & { _id?: string }
      )._id;
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    return authData;
  },

  sendRegisterOtp: async (data: SendOtpRequest): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_REGISTER_OTP, data);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data,
    );
    const authData = response.data.data;
    return authData;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data,
    );
    const authData = response.data.data;
    if (
      authData.user &&
      (authData.user as User & { _id?: string })._id &&
      !(authData.user as User & { _id?: string }).id
    ) {
      (authData.user as User & { _id?: string }).id = (
        authData.user as User & { _id?: string }
      )._id;
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    return authData;
  },

  loginGoogle: async (data: OAuthRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE,
      data,
    );
    const authData = response.data.data;
    if (
      authData.user &&
      (authData.user as User & { _id?: string })._id &&
      !(authData.user as User & { _id?: string }).id
    ) {
      (authData.user as User & { _id?: string }).id = (
        authData.user as User & { _id?: string }
      )._id;
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    return authData;
  },

  loginFacebook: async (data: OAuthRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.FACEBOOK,
      data,
    );
    const authData = response.data.data;
    if (
      authData.user &&
      (authData.user as User & { _id?: string })._id &&
      !(authData.user as User & { _id?: string }).id
    ) {
      (authData.user as User & { _id?: string }).id = (
        authData.user as User & { _id?: string }
      )._id;
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    return authData;
  },

  getAccount: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ACCOUNT,
    );
    return response.data.data ?? response.data;
  },

  logout: async (): Promise<void> => {
  try {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error("Logout API error:", error);
  }
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = "/";
},

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {},
      { withCredentials: true },
    );
    const authData = response.data.data;
    if (
      authData.user &&
      (authData.user as User & { _id?: string })._id &&
      !(authData.user as User & { _id?: string }).id
    ) {
      (authData.user as User & { _id?: string }).id = (
        authData.user as User & { _id?: string }
      )._id;
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    return authData;
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  isSocialAccount: (): boolean => {
    const user = authService.getCurrentUser();
    return !!user?.provider && user.provider !== "LOCAL";
  },
};

export default authService;

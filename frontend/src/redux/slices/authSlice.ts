import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  User,
  LoginRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  OAuthRequest,
} from "@/types";
import authService from "@/services/authService";
import type { RootState } from "../store";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialUser = (): User | null => {
  try {
    return authService.getCurrentUser();
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

// ── Async Thunks ──────────────────────────────────────────────

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      return response.user;
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Đăng nhập thất bại";
      return rejectWithValue(message);
    }
  },
);

export const sendRegisterOtpAsync = createAsyncThunk(
  "auth/sendRegisterOtp",
  async (data: SendOtpRequest, { rejectWithValue }) => {
    try {
      await authService.sendRegisterOtp(data);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Gửi OTP thất bại";
      return rejectWithValue(message);
    }
  },
);

export const verifyOtpAsync = createAsyncThunk(
  "auth/verifyOtp",
  async (data: VerifyOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(data);
      return response.user;
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Xác thực OTP thất bại";
      return rejectWithValue(message);
    }
  },
);

export const forgotPasswordAsync = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(data);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Gửi OTP thất bại";
      return rejectWithValue(message);
    }
  },
);

export const resetPasswordAsync = createAsyncThunk(
  "auth/resetPassword",
  async (data: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data);
      return response.user;
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Đặt lại mật khẩu thất bại";
      return rejectWithValue(message);
    }
  },
);

export const loginGoogleAsync = createAsyncThunk(
  "auth/loginGoogle",
  async (data: OAuthRequest, { rejectWithValue }) => {
    try {
      const response = await authService.loginGoogle(data);
      return response.user;
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Đăng nhập Google thất bại";
      return rejectWithValue(message);
    }
  },
);

export const loginFacebookAsync = createAsyncThunk(
  "auth/loginFacebook",
  async (data: OAuthRequest, { rejectWithValue }) => {
    try {
      const response = await authService.loginFacebook(data);
      return response.user;
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Đăng nhập Facebook thất bại";
      return rejectWithValue(message);
    }
  },
);

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const fetchAccount = createAsyncThunk(
  "auth/fetchAccount",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getAccount();
      return user;
    } catch {
      return rejectWithValue("Failed to fetch account");
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send Register OTP
      .addCase(sendRegisterOtpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRegisterOtpAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendRegisterOtpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(loginGoogleAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginGoogleAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginGoogleAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Facebook Login
      .addCase(loginFacebookAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginFacebookAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginFacebookAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Fetch Account
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchAccount.rejected, () => {});
  },
});

export const { setUser, clearError, resetAuthState } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsAdmin = (state: RootState) => {
  const role = state.auth.user?.role;
  return !!role && role.toUpperCase() === "ADMIN";
};
export const selectIsSocialAccount = (state: RootState) => {
  const provider = state.auth.user?.provider;
  return !!provider && provider !== "LOCAL";
};
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
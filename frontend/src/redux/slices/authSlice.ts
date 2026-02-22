import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, LoginRequest, RegisterRequest } from "@/types";
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

// Async Thunks
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      return response.user;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Đăng nhập thất bại";
      return rejectWithValue(message);
    }
  },
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      // Register chỉ trả UserResponse, không auto-login
      const user = await authService.register(data);
      return user;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
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
    } catch (error: any) {
      return rejectWithValue("Failed to fetch account");
    }
  },
);

// Slice
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
      // Register - không auto-login, chỉ thông báo thành công
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false;
        // Không set user/isAuthenticated vì register không trả token
      })
      .addCase(registerAsync.rejected, (state, action) => {
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
      .addCase(fetchAccount.rejected, (state) => {
         
      });
  },
});

// Actions
export const { setUser, clearError, resetAuthState } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsAdmin = (state: RootState) => {
  const role = state.auth.user?.role;
  return !!role && role.toUpperCase() === "ADMIN";
};
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;

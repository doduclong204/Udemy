import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectIsAdmin, 
  selectAuthLoading,
  selectAuthError,
  loginAsync,
  registerAsync,
  logoutAsync,
  setUser,
  clearError,
} from '@/redux/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/types';

/**
 * Custom hook để quản lý authentication
 * Wrapper Redux auth state và actions
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await dispatch(loginAsync({ email, password })).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await dispatch(registerAsync({ name, email, password })).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await dispatch(logoutAsync());
  };

  const updateUser = (userData: typeof user) => {
    dispatch(setUser(userData));
  };

  const resetError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    resetError,
  };
}

export default useAuth;

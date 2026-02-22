import React, { createContext, useContext, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  loginAsync, registerAsync, logoutAsync, 
  selectUser, selectIsAuthenticated, selectAuthLoading, selectAuthError,
  clearError
} from '@/redux/slices/authSlice';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await dispatch(loginAsync({ username, password })).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (username: string, password: string, name: string): Promise<boolean> => {
    try {
      await dispatch(registerAsync({ username, password, name })).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    dispatch(logoutAsync());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin: user?.role === 'ADMIN',
      loading,
      error,
      login, 
      signup, 
      logout,
      clearAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

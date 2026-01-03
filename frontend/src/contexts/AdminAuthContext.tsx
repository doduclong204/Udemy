import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  avatar?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Auto-login admin by default
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin');
    if (saved) return JSON.parse(saved);
    
    // Auto-login with default admin
    const defaultAdmin: AdminUser = {
      id: 'admin-1',
      email: ADMIN_CREDENTIALS.email,
      name: 'Admin',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    };
    localStorage.setItem('admin', JSON.stringify(defaultAdmin));
    return defaultAdmin;
  });

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminUser: AdminUser = {
        id: 'admin-1',
        email: ADMIN_CREDENTIALS.email,
        name: 'Admin',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      };
      setAdmin(adminUser);
      localStorage.setItem('admin', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAdminAuthenticated: !!admin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

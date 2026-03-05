import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  // allow uppercase for consistency with backend
  role: string;
  avatar?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const ADMIN_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "admin123",
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Auto-login admin by default (or inherit from main auth user)
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    // if we previously saved an admin session, restore it
    const saved = localStorage.getItem("admin");
    if (saved) return JSON.parse(saved);

    // if a regular user is logged in and has ADMIN role, use that instead
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role && user.role.toString().toUpperCase() === "ADMIN") {
          const adminUser: AdminUser = {
            id: user.id || user._id || "",
            email: user.username || user.email,
            name: user.name || "Admin",
            role: user.role.toString().toUpperCase(),
            avatar: user.avatar,
          };
          localStorage.setItem("admin", JSON.stringify(adminUser));
          return adminUser;
        }
      } catch {}
    }

    // otherwise fall back to default hardcoded admin
    const defaultAdmin: AdminUser = {
      id: "admin-1",
      email: ADMIN_CREDENTIALS.email,
      name: "Admin",
      role: "admin".toUpperCase(),
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    };
    localStorage.setItem("admin", JSON.stringify(defaultAdmin));
    return defaultAdmin;
  });

  const adminLogin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const adminUser: AdminUser = {
        id: "admin-1",
        email: ADMIN_CREDENTIALS.email,
        name: "Admin",
        role: "admin".toUpperCase(),
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      };
      setAdmin(adminUser);
      localStorage.setItem("admin", JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAdminAuthenticated: !!admin, adminLogin, adminLogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

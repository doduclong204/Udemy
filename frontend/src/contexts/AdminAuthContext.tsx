import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useDispatch } from "react-redux";
import userService from "@/services/userService";
import { resetAuthState } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const buildAdminFromUser = (user: any): AdminUser => ({
  id: user.id || user._id || "",
  email: user.username || user.email || "",
  name: user.name || "Admin",
  role: user.role?.toString().toUpperCase() || "ADMIN",
  avatar: user.avatar || undefined,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role?.toString().toUpperCase() === "ADMIN") {
          return buildAdminFromUser(user);
        }
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    userService.getCurrentUser().then((user) => {
      if (user.role?.toString().toUpperCase() === "ADMIN") {
        const adminUser = buildAdminFromUser(user);
        setAdmin(adminUser);
        localStorage.setItem("user", JSON.stringify(user));
      }
    }).catch(() => {});
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role?.toString().toUpperCase() === "ADMIN") {
          const adminUser = buildAdminFromUser(user);
          setAdmin(adminUser);
          return true;
        }
      } catch {}
    }
    return false;
  };

  const refreshAdmin = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user.role?.toString().toUpperCase() === "ADMIN") {
        const adminUser = buildAdminFromUser(user);
        setAdmin(adminUser);
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {}
  };

  const adminLogout = () => {
    setAdmin(null);
    dispatch(resetAuthState());
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAdminAuthenticated: !!admin, adminLogin, adminLogout, refreshAdmin }}
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
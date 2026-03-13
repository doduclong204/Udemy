import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import type { WishlistResponse, ApiResponse, ApiPagination } from '@/types';
import type { RootState } from '@/redux/store';

interface WishlistContextType {
  wishlist: WishlistResponse[];
  loading: boolean;
  addToWishlist: (courseId: string) => Promise<void>;
  removeFromWishlist: (courseId: string) => Promise<void>;
  isInWishlist: (courseId: string) => boolean;
  toggleWishlist: (courseId: string) => Promise<void>;
  refetch: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchWishlist = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    axiosInstance
      .get<ApiResponse<ApiPagination<WishlistResponse>>>(API_ENDPOINTS.WISHLIST.BASE, {
        params: { page: 0, size: 100 },
      })
      .then((res) => setWishlist(res.data.data.result))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (courseId: string) => {
    await axiosInstance.post(API_ENDPOINTS.WISHLIST.BASE, { courseId });
    fetchWishlist();
  };

  const removeFromWishlist = async (courseId: string) => {
    await axiosInstance.delete(`${API_ENDPOINTS.WISHLIST.BASE}/${courseId}`);
    setWishlist((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  const isInWishlist = (courseId: string) => {
    return wishlist.some((c) => c.courseId === courseId);
  };

  const toggleWishlist = async (courseId: string) => {
    if (isInWishlist(courseId)) {
      await removeFromWishlist(courseId);
    } else {
      await addToWishlist(courseId);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, refetch: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
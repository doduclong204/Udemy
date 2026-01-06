import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '@/data/mockData';

interface WishlistContextType {
  wishlist: Course[];
  addToWishlist: (course: Course) => void;
  removeFromWishlist: (courseId: string) => void;
  isInWishlist: (courseId: string) => boolean;
  toggleWishlist: (course: Course) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Course[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (course: Course) => {
    setWishlist((prev) => {
      if (prev.find((c) => c.id === course.id)) {
        return prev;
      }
      return [...prev, course];
    });
  };

  const removeFromWishlist = (courseId: string) => {
    setWishlist((prev) => prev.filter((c) => c.id !== courseId));
  };

  const isInWishlist = (courseId: string) => {
    return wishlist.some((c) => c.id === courseId);
  };

  const toggleWishlist = (course: Course) => {
    if (isInWishlist(course.id)) {
      removeFromWishlist(course.id);
    } else {
      addToWishlist(course);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
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

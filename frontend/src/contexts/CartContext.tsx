import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '@/data/mockData';

interface CartContextType {
  items: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  totalPrice: number;
  totalOriginalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Course[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const addToCart = (course: Course) => {
    if (!items.find((item) => item.id === course.id)) {
      const newItems = [...items, course];
      setItems(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const removeFromCart = (courseId: string) => {
    const newItems = items.filter((item) => item.id !== courseId);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const isInCart = (courseId: string) => {
    return items.some((item) => item.id === courseId);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalOriginalPrice = items.reduce((sum, item) => sum + item.originalPrice, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, isInCart, totalPrice, totalOriginalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

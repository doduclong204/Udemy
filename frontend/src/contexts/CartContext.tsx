import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import cartService from '@/services/cartService';
import type { CartItemResponse } from '@/types';

interface CartContextType {
  items: CartItemResponse[];
  loading: boolean;
  totalOriginalPrice: number;
  totalSalePrice: number;
  totalDiscount: number;
  discountPercentage: string;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (courseId: string) => boolean;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [totalOriginalPrice, setTotalOriginalPrice] = useState(0);
  const [totalSalePrice, setTotalSalePrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchCart = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    cartService
      .getMyCart()
      .then((cart) => {
        setItems(cart.items);
        setTotalOriginalPrice(cart.totalOriginalPrice);
        setTotalSalePrice(cart.totalSalePrice);
        setTotalDiscount(cart.totalDiscount);
        setDiscountPercentage(cart.discountPercentage);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setTotalOriginalPrice(0);
      setTotalSalePrice(0);
      setTotalDiscount(0);
      setDiscountPercentage('0');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (courseId: string) => {
    const cart = await cartService.addToCart(courseId);
    setItems(cart.items);
    setTotalOriginalPrice(cart.totalOriginalPrice);
    setTotalSalePrice(cart.totalSalePrice);
    setTotalDiscount(cart.totalDiscount);
    setDiscountPercentage(cart.discountPercentage);
  };

  const removeFromCart = async (courseId: string) => {
    const cart = await cartService.removeFromCart(courseId);
    setItems(cart.items);
    setTotalOriginalPrice(cart.totalOriginalPrice);
    setTotalSalePrice(cart.totalSalePrice);
    setTotalDiscount(cart.totalDiscount);
    setDiscountPercentage(cart.discountPercentage);
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setItems([]);
    setTotalOriginalPrice(0);
    setTotalSalePrice(0);
    setTotalDiscount(0);
    setDiscountPercentage('0');
  };

  const isInCart = (courseId: string) => {
    return items.some((item) => item.courseId === courseId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalOriginalPrice,
        totalSalePrice,
        totalDiscount,
        discountPercentage,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        refetch: fetchCart,
      }}
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
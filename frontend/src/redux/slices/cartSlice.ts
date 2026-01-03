import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '@/types';
import type { RootState } from '../store';

interface CartState {
  items: Course[];
  loading: boolean;
}

// Lấy cart từ localStorage khi khởi động
const getInitialCart = (): Course[] => {
  try {
    const cartStr = localStorage.getItem('cart');
    return cartStr ? JSON.parse(cartStr) : [];
  } catch {
    return [];
  }
};

const initialState: CartState = {
  items: getInitialCart(),
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Course>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
    setCartItems: (state, action: PayloadAction<Course[]>) => {
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
});

// Actions
export const { addToCart, removeFromCart, clearCart, setCartItems } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartItemsCount = (state: RootState) => state.cart.items.length;
export const selectIsInCart = (courseId: string) => (state: RootState) => 
  state.cart.items.some(item => item.id === courseId);
export const selectCartTotalPrice = (state: RootState) => 
  state.cart.items.reduce((sum, item) => sum + item.price, 0);
export const selectCartTotalOriginalPrice = (state: RootState) => 
  state.cart.items.reduce((sum, item) => sum + item.originalPrice, 0);

export default cartSlice.reducer;

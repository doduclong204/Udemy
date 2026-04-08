import axiosInstance from '@/config/api';
import type { CartResponse, ApiResponse } from '@/types';

const cartService = {
  getMyCart: async (): Promise<CartResponse> => {
    const res = await axiosInstance.get<ApiResponse<CartResponse>>('/carts/me');
    return res.data.data;
  },

  addToCart: async (courseId: string): Promise<CartResponse> => {
    const res = await axiosInstance.post<ApiResponse<CartResponse>>(`/carts/add/${courseId}`);
    return res.data.data;
  },

  removeFromCart: async (courseId: string): Promise<CartResponse> => {
    const res = await axiosInstance.delete<ApiResponse<CartResponse>>(`/carts/remove/${courseId}`);
    return res.data.data;
  },

  clearCart: async (): Promise<void> => {
    await axiosInstance.delete('/carts/clear');
  },

  getCartItemCount: async (): Promise<number> => {
    const res = await axiosInstance.get<ApiResponse<number>>('/carts/count');
    return res.data.data;
  },
};

export default cartService;
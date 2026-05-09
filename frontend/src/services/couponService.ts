import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import {
  Coupon,
  ApiResponse,
  ApiPagination,
  CreateCouponRequest,
  UpdateCouponRequest,
  CouponStatus,
} from "@/types";

const couponService = {
  getCoupons: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }): Promise<ApiPagination<Coupon>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<ApiResponse<ApiPagination<Coupon>>>(
      API_ENDPOINTS.COUPONS?.BASE || "/coupons",
      {
        params: {
          page: page,
          size: pageSize,
          filter: params?.search ? `code~'*${params.search}*'` : undefined,
          status:
            params?.status && params.status !== "all" ? params.status : undefined,
        },
      }
    );

    return response.data.data;
  },

  getCouponById: async (id: string): Promise<Coupon> => {
    const response = await axiosInstance.get<ApiResponse<Coupon>>(
      `${API_ENDPOINTS.COUPONS?.BASE || "/coupons"}/${id}`
    );
    return response.data.data;
  },

  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await axiosInstance.post<ApiResponse<Coupon>>(
      API_ENDPOINTS.COUPONS?.BASE || "/coupons",
      data
    );
    return response.data.data;
  },

  updateCoupon: async (id: string, data: UpdateCouponRequest): Promise<Coupon> => {
    const response = await axiosInstance.put<ApiResponse<Coupon>>(
      `${API_ENDPOINTS.COUPONS?.BASE || "/coupons"}/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await axiosInstance.delete(
      `${API_ENDPOINTS.COUPONS?.BASE || "/coupons"}/${id}`
    );
  },

  verifyCoupon: async (code: string, orderAmount: number): Promise<Coupon> => {
    const response = await axiosInstance.post<ApiResponse<Coupon>>(
      `${API_ENDPOINTS.COUPONS?.BASE || "/coupons"}/verify`,
      { code, orderAmount }
    );
    return response.data.data;
  },

  calculateDiscount: async (code: string, orderAmount: number): Promise<number> => {
    const response = await axiosInstance.post<ApiResponse<number>>(
      `${API_ENDPOINTS.COUPONS?.BASE || "/coupons"}/calculate-discount`,
      { code, orderAmount }
    );
    return response.data.data;
  },

  validateCoupon: async (code: string, orderAmount: number): Promise<number> => {
    const response = await axiosInstance.post<ApiResponse<number>>(
      `${API_ENDPOINTS.COUPONS?.BASE || "/coupons"}/validate`,
      { code, orderAmount }
    );
    return response.data.data;
  },
};

export default couponService;
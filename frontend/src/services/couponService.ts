import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Coupon, 
  ApiResponse, 
  ApiPagination, 
  CreateCouponRequest, 
  UpdateCouponRequest,
  CouponStatus 
} from '@/types';

const couponService = {
  /**
   * Lấy danh sách coupons có phân trang và lọc
   */
  getCoupons: async (params?: { page?: number; pageSize?: number; search?: string; status?: string }): Promise<ApiPagination<Coupon>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<ApiResponse<ApiPagination<Coupon>>>(API_ENDPOINTS.COUPONS?.BASE || '/coupons', {
      params: {
        // Spring Boot page tính từ 0
        page: Math.max(0, page - 1),
        size: pageSize,
        // Cú pháp spring-filter: code ~ '*từ_khóa*'
        filter: params?.search ? `code~'*${params.search}*'` : undefined,
        status: params?.status && params.status !== 'all' ? params.status : undefined,
      },
    });

    // Trả về data.data vì cấu trúc là ApiResponse -> ApiPagination
    return response.data.data;
  },

  /**
   * Lấy chi tiết coupon theo ID
   */
  getCouponById: async (id: string): Promise<Coupon> => {
    const response = await axiosInstance.get<ApiResponse<Coupon>>(`${API_ENDPOINTS.COUPONS?.BASE || '/coupons'}/${id}`);
    return response.data.data;
  },

  /**
   * Tạo coupon mới (Admin)
   */
  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await axiosInstance.post<ApiResponse<Coupon>>(API_ENDPOINTS.COUPONS?.BASE || '/coupons', data);
    return response.data.data;
  },

  /**
   * Cập nhật coupon (Admin)
   */
  updateCoupon: async (id: string, data: UpdateCouponRequest): Promise<Coupon> => {
    const response = await axiosInstance.put<ApiResponse<Coupon>>(`${API_ENDPOINTS.COUPONS?.BASE || '/coupons'}/${id}`, data);
    return response.data.data;
  },

  /**
   * Xóa coupon (Admin)
   */
  deleteCoupon: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.COUPONS?.BASE || '/coupons'}/${id}`);
  },

  /**
   * Kiểm tra mã coupon (Public)
   */
  verifyCoupon: async (code: string, orderAmount: number): Promise<Coupon> => {
    const response = await axiosInstance.post<ApiResponse<Coupon>>(
      `${API_ENDPOINTS.COUPONS?.BASE || '/coupons'}/verify`,
      { code, orderAmount }
    );
    return response.data.data;
  },
};

export default couponService;

import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import {
  ApiResponse,
  ApiPagination,
  ReviewResponse,
  ReviewRequest,
  GetReviewsParams,
} from "@/types";

const reviewService = {
  // ==================== Client Methods ====================

  /**
   * Lấy reviews theo course (Client)
   * GET /reviews?filter=course.id:'xxx'
   */
  getReviewsByCourse: async (
    courseId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<ApiPagination<ReviewResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 5;

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<ReviewResponse>>
    >(API_ENDPOINTS.REVIEWS.BASE, {
      params: {
        page: Math.max(0, page - 1),
        size: pageSize,
        filter: `course.id:'${courseId}'`,
      },
    });
    return response.data.data;
  },

  /**
   * Tạo review (Client)
   * POST /reviews
   */
  createReview: async (data: ReviewRequest): Promise<ReviewResponse> => {
    const response = await axiosInstance.post<ApiResponse<ReviewResponse>>(
      API_ENDPOINTS.REVIEWS.BASE,
      data,
    );
    return response.data.data;
  },
  // ==================== Admin Methods ====================

  /**
   * Lấy tất cả reviews (Admin)
   * GET /reviews?page=0&size=10&filter=...
   */
  getAdminReviews: async (
    params?: GetReviewsParams & { search?: string; rating?: number },
  ): Promise<ApiPagination<ReviewResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const filters: string[] = [];
    if (params?.search) {
      filters.push(
        `(comment~'*${params.search}*' or course.title~'*${params.search}*')`,
      );
    }
    if (params?.rating) filters.push(`rating:${params.rating}`);
    if (params?.courseId) filters.push(`course.id:'${params.courseId}'`);

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<ReviewResponse>>
    >(API_ENDPOINTS.REVIEWS.BASE, {
      params: {
        page: Math.max(0, page - 1),
        size: pageSize,
        filter: filters.length > 0 ? filters.join(" and ") : undefined,
      },
    });
    return response.data.data;
  },

  /**
   * Ẩn/hiện review (Admin)
   * PUT /reviews/:id  với { reviewStatus: true/false }
   */
  toggleReviewVisibility: async (
    reviewId: string,
    currentStatus: boolean,
  ): Promise<ReviewResponse> => {
    const response = await axiosInstance.put<ApiResponse<ReviewResponse>>(
      `${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}`,
      { reviewStatus: !currentStatus } satisfies ReviewRequest,
    );
    return response.data.data;
  },

  /**
   * Admin reply review
   * PUT /reviews/:id  với { adminReply: "..." }
   */
  replyToReview: async (
    reviewId: string,
    adminReply: string,
  ): Promise<ReviewResponse> => {
    const response = await axiosInstance.put<ApiResponse<ReviewResponse>>(
      `${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}`,
      { adminReply } satisfies ReviewRequest,
    );
    return response.data.data;
  },

  /**
   * Xóa review (Admin)
   * DELETE /reviews/:id
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}`);
  },
};

export default reviewService;

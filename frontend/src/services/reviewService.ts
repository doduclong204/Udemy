import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Review, 
  AdminReview, 
  CreateReviewRequest, 
  ApiResponse, 
  PaginationResponse, 
  GetReviewsParams 
} from '@/types';
import { reviews as mockReviews } from '@/data/mockData';
import { adminReviews as mockAdminReviews } from '@/data/adminMockData';

const reviewService = {
  /**
   * Lấy reviews của khóa học
   * TODO: Implement thật với API sau
   */
  getCourseReviews: async (courseId: string, params?: GetReviewsParams): Promise<PaginationResponse<Review>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<Review>>(`${API_ENDPOINTS.COURSES.BASE}/${courseId}/reviews`, { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedReviews = mockReviews.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      data: paginatedReviews,
      meta: {
        page,
        pageSize,
        totalItems: mockReviews.length,
        totalPages: Math.ceil(mockReviews.length / pageSize),
        hasNextPage: startIndex + pageSize < mockReviews.length,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Tạo review mới
   * TODO: Implement thật với API sau
   */
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.BASE, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `review-${Date.now()}`,
      userName: 'Current User',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      rating: data.rating,
      date: 'Just now',
      comment: data.comment,
      helpful: 0,
    };
  },

  /**
   * Đánh dấu review hữu ích
   * TODO: Implement thật với API sau
   */
  markHelpful: async (reviewId: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.post(`${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}/helpful`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Marked helpful:', reviewId);
  },

  // ==================== Admin Methods ====================

  /**
   * Lấy tất cả reviews (Admin)
   * TODO: Implement thật với API sau
   */
  getAdminReviews: async (params?: GetReviewsParams): Promise<PaginationResponse<AdminReview>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<AdminReview>>('/admin/reviews', { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedReviews = mockAdminReviews.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      data: paginatedReviews,
      meta: {
        page,
        pageSize,
        totalItems: mockAdminReviews.length,
        totalPages: Math.ceil(mockAdminReviews.length / pageSize),
        hasNextPage: startIndex + pageSize < mockAdminReviews.length,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Ẩn/hiện review (Admin)
   * TODO: Implement thật với API sau
   */
  toggleReviewVisibility: async (reviewId: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.put(`/admin/reviews/${reviewId}/toggle-visibility`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Toggled visibility:', reviewId);
  },

  /**
   * Trả lời review (Admin)
   * TODO: Implement thật với API sau
   */
  replyToReview: async (reviewId: string, reply: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.post(`/admin/reviews/${reviewId}/reply`, { reply });
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Reply sent:', reviewId, reply);
  },

  /**
   * Xóa review (Admin)
   * TODO: Implement thật với API sau
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.delete(`/admin/reviews/${reviewId}`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Review deleted:', reviewId);
  },
};

export default reviewService;

import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Category, 
  ApiResponse, 
  ApiPagination, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '@/types';

const categoryService = {
  /**
   * Lấy danh sách categories có phân trang và lọc
   * Khớp với Controller: getCategories(@Filter Specification<Category> spec, Pageable pageable)
   */
  getCategories: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<ApiPagination<Category>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<ApiResponse<ApiPagination<Category>>>(API_ENDPOINTS.CATEGORIES.BASE, {
      params: {
        // Spring Boot page tính từ 0
        page: Math.max(0, page - 1),
        size: pageSize,
        // Cú pháp spring-filter: name ~ '*từ_khóa*'
        filter: params?.search ? `name~'*${params.search}*'` : undefined,
      },
    });

    // Trả về data.data vì cấu trúc là ApiResponse -> ApiPagination
    return response.data.data;
  },

  /**
   * Lấy chi tiết category theo ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
    return response.data.data;
  },

  /**
   * Lấy category theo Slug (dùng cho phía người dùng xem khóa học theo danh mục)
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.BASE}/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Tạo category mới (Admin)
   */
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await axiosInstance.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE, data);
    return response.data.data;
  },

  /**
   * Cập nhật category (Admin)
   * Khớp với Controller: updateCategory(@PathVariable String id, @RequestBody CategoryUpdateRequest request)
   */
  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await axiosInstance.put<ApiResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`, data);
    return response.data.data;
  },

  /**
   * Xóa category (Admin)
   */
  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
  },
};

export default categoryService;
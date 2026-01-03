import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { Category, ApiResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';
import { categories as mockCategories } from '@/data/mockData';

const categoryService = {
  /**
   * Lấy tất cả categories
   * TODO: Implement thật với API sau
   */
  getCategories: async (): Promise<Category[]> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  },

  /**
   * Lấy category theo ID
   * TODO: Implement thật với API sau
   */
  getCategoryById: async (id: string): Promise<Category | null> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories.find(c => c.id === id) || null;
  },

  /**
   * Tạo category mới (Admin)
   * TODO: Implement thật với API sau
   */
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `category-${Date.now()}`,
      name: data.name,
      icon: data.icon,
      courseCount: 0,
      subcategories: data.subcategories,
    };
  },

  /**
   * Cập nhật category (Admin)
   * TODO: Implement thật với API sau
   */
  updateCategory: async (data: UpdateCategoryRequest): Promise<Category> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.put<ApiResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.BASE}/${data.id}`, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingCategory = mockCategories.find(c => c.id === data.id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    return {
      ...existingCategory,
      ...data,
    } as Category;
  },

  /**
   * Xóa category (Admin)
   * TODO: Implement thật với API sau
   */
  deleteCategory: async (id: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Category deleted:', id);
  },
};

export default categoryService;

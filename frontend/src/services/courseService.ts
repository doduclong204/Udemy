import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Course, 
  AdminCourse, 
  CreateCourseRequest, 
  UpdateCourseRequest,
  ApiResponse, 
  PaginationResponse,
  Section,
  GetCoursesParams
} from '@/types';
import { courses as mockCourses, sections as mockSections } from '@/data/mockData';
import { adminCourses as mockAdminCourses } from '@/data/adminMockData';

const courseService = {
  /**
   * Lấy danh sách khóa học
   * TODO: Implement thật với API sau
   */
  getCourses: async (params?: GetCoursesParams): Promise<PaginationResponse<Course>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<Course>>(API_ENDPOINTS.COURSES.BASE, { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredCourses = [...mockCourses];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredCourses = filteredCourses.filter(c => 
        c.title.toLowerCase().includes(search) || 
        c.instructor.toLowerCase().includes(search)
      );
    }
    
    if (params?.category) {
      filteredCourses = filteredCourses.filter(c => c.category === params.category);
    }
    
    if (params?.level) {
      filteredCourses = filteredCourses.filter(c => c.level === params.level);
    }
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      data: paginatedCourses,
      meta: {
        page,
        pageSize,
        totalItems: filteredCourses.length,
        totalPages: Math.ceil(filteredCourses.length / pageSize),
        hasNextPage: startIndex + pageSize < filteredCourses.length,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Lấy chi tiết khóa học theo ID
   * TODO: Implement thật với API sau
   */
  getCourseById: async (id: string): Promise<Course | null> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Course>>(`${API_ENDPOINTS.COURSES.BASE}/${id}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCourses.find(c => c.id === id) || null;
  },

  /**
   * Lấy các sections/lessons của khóa học
   * TODO: Implement thật với API sau
   */
  getCourseSections: async (courseId: string): Promise<Section[]> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Section[]>>(`${API_ENDPOINTS.COURSES.BASE}/${courseId}/sections`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSections as unknown as Section[];
  },

  /**
   * Lấy khóa học nổi bật
   * TODO: Implement thật với API sau
   */
  getFeaturedCourses: async (): Promise<Course[]> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Course[]>>(API_ENDPOINTS.COURSES.FEATURED);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCourses.filter(c => c.badge === 'bestseller');
  },

  /**
   * Lấy khóa học phổ biến
   * TODO: Implement thật với API sau
   */
  getPopularCourses: async (): Promise<Course[]> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Course[]>>(API_ENDPOINTS.COURSES.POPULAR);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCourses.sort((a, b) => b.studentCount - a.studentCount).slice(0, 8);
  },

  /**
   * Lấy khóa học theo category
   * TODO: Implement thật với API sau
   */
  getCoursesByCategory: async (categoryId: string): Promise<Course[]> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Course[]>>(`${API_ENDPOINTS.COURSES.BY_CATEGORY}/${categoryId}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCourses.filter(c => c.category === categoryId);
  },

  // ==================== Admin Methods ====================

  /**
   * Lấy danh sách khóa học (Admin)
   * TODO: Implement thật với API sau
   */
  getAdminCourses: async (params?: GetCoursesParams): Promise<PaginationResponse<AdminCourse>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<AdminCourse>>('/admin/courses', { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedCourses = mockAdminCourses.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      data: paginatedCourses,
      meta: {
        page,
        pageSize,
        totalItems: mockAdminCourses.length,
        totalPages: Math.ceil(mockAdminCourses.length / pageSize),
        hasNextPage: startIndex + pageSize < mockAdminCourses.length,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Tạo khóa học mới
   * TODO: Implement thật với API sau
   */
  createCourse: async (data: CreateCourseRequest): Promise<AdminCourse> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<AdminCourse>>(API_ENDPOINTS.COURSES.BASE, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCourse: AdminCourse = {
      id: `course-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
      category: data.category,
      level: data.level,
      price: data.price,
      discountPrice: data.discountPrice,
      students: 0,
      rating: '0',
      reviews: 0,
      lectures: 0,
      duration: '0 giờ',
      status: 'Draft',
      isFeatured: false,
      isBestseller: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newCourse;
  },

  /**
   * Cập nhật khóa học
   * TODO: Implement thật với API sau
   */
  updateCourse: async (data: UpdateCourseRequest): Promise<AdminCourse> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.put<ApiResponse<AdminCourse>>(`${API_ENDPOINTS.COURSES.BASE}/${data.id}`, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingCourse = mockAdminCourses.find(c => c.id === data.id);
    if (!existingCourse) {
      throw new Error('Course not found');
    }
    
    return {
      ...existingCourse,
      ...data,
      updatedAt: new Date().toISOString(),
    } as AdminCourse;
  },

  /**
   * Xóa khóa học
   * TODO: Implement thật với API sau
   */
  deleteCourse: async (id: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.delete(`${API_ENDPOINTS.COURSES.BASE}/${id}`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Course deleted:', id);
  },
};

export default courseService;

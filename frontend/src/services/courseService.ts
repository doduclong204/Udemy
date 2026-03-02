import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Course, 
  AdminCourse, 
  CreateCourseRequest, 
  UpdateCourseRequest,
  ApiResponse, 
  ApiPagination,
  SectionResponse,
  GetCoursesParams
} from '@/types';

const courseService = {
  /**
   * Lấy danh sách khóa học
   */
  getCourses: async (params?: GetCoursesParams): Promise<ApiPagination<Course>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<ApiResponse<ApiPagination<Course>>>(API_ENDPOINTS.COURSES.BASE, {
      params: {
        page: Math.max(0, page - 1),
        size: pageSize,
        filter: params?.search ? `title~'*${params.search}*'` : undefined,
        category: params?.category,
        level: params?.level,
      },
    });

    return response.data.data;
  },

  /**
   * Lấy chi tiết khóa học theo ID
   */
  getCourseById: async (id: string): Promise<Course | null> => {
    const response = await axiosInstance.get<ApiResponse<Course>>(`${API_ENDPOINTS.COURSES.BASE}/${id}`);
    return response.data.data;
  },

  /**
   * Lấy các sections/lessons của khóa học
   */
  getCourseSections: async (courseId: string): Promise<SectionResponse[]> => {
    const response = await axiosInstance.get<ApiResponse<SectionResponse[]>>(
      `${API_ENDPOINTS.COURSES.BASE}/${courseId}/sections`
    );
    return response.data.data;
  },

  /**
   * Lấy khóa học nổi bật
   */
  getFeaturedCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(API_ENDPOINTS.COURSES.FEATURED);
    return response.data.data;
  },

  /**
   * Lấy khóa học phổ biến
   */
  getPopularCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(API_ENDPOINTS.COURSES.POPULAR);
    return response.data.data;
  },

  /**
   * Lấy khóa học theo category
   */
  getCoursesByCategory: async (categoryId: string): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(
      `${API_ENDPOINTS.COURSES.BY_CATEGORY}/${categoryId}`
    );
    return response.data.data;
  },

  // ==================== Admin Methods ====================

  /**
   * Lấy danh sách khóa học (Admin)
   * Backend endpoint: GET /courses (không có /admin prefix)
   */
  getAdminCourses: async (params?: GetCoursesParams): Promise<ApiPagination<AdminCourse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<ApiResponse<ApiPagination<AdminCourse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page: Math.max(0, page - 1),
          size: pageSize,
          filter: params?.search ? `title~'*${params.search}*'` : undefined,
          category: params?.category,
          level: params?.level,
        },
      }
    );

    return response.data.data;
  },

  /**
   * Tạo khóa học mới
   * Backend endpoint: POST /courses
   */
  createCourse: async (data: CreateCourseRequest): Promise<AdminCourse> => {
    const response = await axiosInstance.post<ApiResponse<AdminCourse>>(
      API_ENDPOINTS.COURSES.BASE,
      data
    );
    return response.data.data;
  },

  /**
   * Cập nhật khóa học
   * Backend endpoint: PUT /courses/:id
   */
  updateCourse: async (data: UpdateCourseRequest & { id: string }): Promise<AdminCourse> => {
    const { id, ...payload } = data;
    const response = await axiosInstance.put<ApiResponse<AdminCourse>>(
      `${API_ENDPOINTS.COURSES.BASE}/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Xóa khóa học
   * Backend endpoint: DELETE /courses/:id
   */
  deleteCourse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.COURSES.BASE}/${id}`);
  },
};

export default courseService;
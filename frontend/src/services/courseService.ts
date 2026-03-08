import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import {
  Course,
  CourseDetailResponse,
  CourseSummaryResponse,
  AdminCourse,
  CreateCourseRequest,
  UpdateCourseRequest,
  ApiResponse,
  ApiPagination,
  SectionResponse,
  GetCoursesParams,
} from "@/types";

const courseService = {
  // ==================== Client Methods ====================

  /**
   * Lấy danh sách khóa học (client) - trả về CourseSummaryResponse
   */
  getCourses: async (
    params?: GetCoursesParams,
  ): Promise<ApiPagination<CourseSummaryResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<CourseSummaryResponse>>
    >(API_ENDPOINTS.COURSES.BASE, {
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
   * Lấy chi tiết khóa học theo ID - trả về CourseDetailResponse (có sections, reviews...)
   */
  getCourseById: async (id: string): Promise<CourseDetailResponse> => {
    const response = await axiosInstance.get<ApiResponse<CourseDetailResponse>>(
      `${API_ENDPOINTS.COURSES.BASE}/${id}`,
    );
    return response.data.data;
  },

  /**
   * Lấy khóa học nổi bật
   */
  getFeaturedCourses: async (): Promise<CourseSummaryResponse[]> => {
    const response = await axiosInstance.get<
      ApiResponse<CourseSummaryResponse[]>
    >(API_ENDPOINTS.COURSES.FEATURED);
    return response.data.data;
  },

  /**
   * Lấy khóa học phổ biến
   */
  getPopularCourses: async (): Promise<CourseSummaryResponse[]> => {
    const response = await axiosInstance.get<
      ApiResponse<CourseSummaryResponse[]>
    >(API_ENDPOINTS.COURSES.POPULAR);
    return response.data.data;
  },

  /**
   * Lấy khóa học theo category
   */
  getCoursesByCategory: async (
    categoryId: string,
  ): Promise<CourseSummaryResponse[]> => {
    const response = await axiosInstance.get<
      ApiResponse<CourseSummaryResponse[]>
    >(`${API_ENDPOINTS.COURSES.BY_CATEGORY}/${categoryId}`);
    return response.data.data;
  },

  // ==================== Admin Methods ====================

  /**
   * Lấy danh sách khóa học (Admin)
   */
  getAdminCourses: async (
    params?: GetCoursesParams,
  ): Promise<ApiPagination<AdminCourse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<AdminCourse>>
    >(API_ENDPOINTS.COURSES.BASE, {
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
   * Tạo khóa học mới
   */
  createCourse: async (data: CreateCourseRequest): Promise<AdminCourse> => {
    const response = await axiosInstance.post<ApiResponse<AdminCourse>>(
      API_ENDPOINTS.COURSES.BASE,
      data,
    );
    return response.data.data;
  },

  /**
   * Cập nhật khóa học
   */
  updateCourse: async (
    data: UpdateCourseRequest & { id: string },
  ): Promise<AdminCourse> => {
    const { id, ...payload } = data;
    const response = await axiosInstance.put<ApiResponse<AdminCourse>>(
      `${API_ENDPOINTS.COURSES.BASE}/${id}`,
      payload,
    );
    return response.data.data;
  },

  /**
   * Xóa khóa học
   */
  deleteCourse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.COURSES.BASE}/${id}`);
  },
};

export default courseService;

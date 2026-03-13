import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import {
  CourseDetailResponse,
  CourseSummaryResponse,
  AdminCourse,
  CreateCourseRequest,
  UpdateCourseRequest,
  ApiResponse,
  ApiPagination,
  GetCoursesParams,
} from "@/types";

const courseService = {
  getCourses: async (params?: GetCoursesParams): Promise<ApiPagination<CourseSummaryResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const filters: string[] = [];
    if (params?.search) filters.push(`title~'*${params.search}*'`);
    if (params?.category) filters.push(`category.name:'${params.category}'`);
    if (params?.level) filters.push(`level:'${params.level}'`);
    if (params?.outstanding) filters.push(`outstanding:true`);

    const response = await axiosInstance.get<ApiResponse<ApiPagination<CourseSummaryResponse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page: Math.max(0, page - 1),
          size: pageSize,
          filter: filters.length > 0 ? filters.join(' and ') : undefined,
          sort: params?.sort,
        },
      }
    );
    return response.data.data;
  },

  getCourseById: async (id: string): Promise<CourseDetailResponse> => {
    const response = await axiosInstance.get<ApiResponse<CourseDetailResponse>>(
      `${API_ENDPOINTS.COURSES.BASE}/${id}`
    );
    return response.data.data;
  },

  getFeaturedCourses: async (): Promise<CourseSummaryResponse[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiPagination<CourseSummaryResponse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page: 0,
          size: 10,
          filter: `outstanding:true`,
        },
      }
    );
    return response.data.data.result;
  },

  getPopularCourses: async (): Promise<CourseSummaryResponse[]> => {
    const response = await axiosInstance.get<ApiResponse<ApiPagination<CourseSummaryResponse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page: 0,
          size: 10,
          sort: 'totalStudents,desc',
        },
      }
    );
    return response.data.data.result;
  },

  getAdminCourses: async (params?: GetCoursesParams): Promise<ApiPagination<AdminCourse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const filters: string[] = [];
    if (params?.search) filters.push(`title~'*${params.search}*'`);
    if (params?.category) filters.push(`category.name:'${params.category}'`);
    if (params?.level) filters.push(`level:'${params.level}'`);
    if (params?.outstanding) filters.push(`outstanding:true`);

    const response = await axiosInstance.get<ApiResponse<ApiPagination<AdminCourse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page: Math.max(0, page - 1),
          size: pageSize,
          filter: filters.length > 0 ? filters.join(' and ') : undefined,
          sort: params?.sort,
        },
      }
    );
    return response.data.data;
  },

  createCourse: async (data: CreateCourseRequest): Promise<AdminCourse> => {
    const response = await axiosInstance.post<ApiResponse<AdminCourse>>(
      API_ENDPOINTS.COURSES.BASE,
      data
    );
    return response.data.data;
  },

  updateCourse: async (data: UpdateCourseRequest & { id: string }): Promise<AdminCourse> => {
    const { id, ...payload } = data;
    const response = await axiosInstance.put<ApiResponse<AdminCourse>>(
      `${API_ENDPOINTS.COURSES.BASE}/${id}`,
      payload
    );
    return response.data.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.COURSES.BASE}/${id}`);
  },
};

export default courseService;
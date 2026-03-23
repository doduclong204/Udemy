import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import type { ApiResponse, ApiPagination, CourseSummaryResponse } from '@/types';

export interface SearchCoursesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  level?: string;
  minRating?: number;
  priceType?: 'all' | 'free' | 'paid';
  sort?: string;
}

const searchService = {
  searchCourses: async (params: SearchCoursesParams): Promise<ApiPagination<CourseSummaryResponse>> => {
    const page     = params.page     ?? 1;
    const pageSize = params.pageSize ?? 12;

    // ── Build spring-filter string ──────────────────────────────────────────
    const filters: string[] = [];

    if (params.search) filters.push(`title~'%${params.search}%'`);
    if (params.category) filters.push(`category.name:'${params.category}'`);
    if (params.level && params.level !== 'ALL') filters.push(`level:'${params.level}'`);
    if (params.minRating) filters.push(`rating>=${params.minRating}`);
    if (params.priceType === 'free') filters.push(`price:0`);
    if (params.priceType === 'paid') filters.push(`price>0`);

    const response = await axiosInstance.get<ApiResponse<ApiPagination<CourseSummaryResponse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page: page,
          size:   pageSize,
          filter: filters.length > 0 ? filters.join(' and ') : undefined,
          sort:   params.sort ?? 'createdAt,desc',
        },
      }
    );

    return response.data.data;
  },
};

export default searchService;
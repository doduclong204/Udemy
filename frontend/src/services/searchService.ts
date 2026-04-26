import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import type { ApiResponse, ApiPagination, CourseSummaryResponse } from '@/types';

export interface SearchCoursesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  levels?: string[];
  minRating?: number;
  priceType?: 'all' | 'free' | 'paid';
  sort?: string;
}

const searchService = {
  searchCourses: async (params: SearchCoursesParams): Promise<ApiPagination<CourseSummaryResponse>> => {
    const page     = params.page     ?? 1;
    const pageSize = params.pageSize ?? 12;

    // ── Build SpringFilter 3.x filter string ──────────────────────────────
    // Operator ~ = LIKE (tự thêm % xung quanh, KHÔNG truyền % thủ công)
    // Operator : = EQUALS (exact match)
    // Operator >= <= > < = so sánh số
    const filters: string[] = [];

    if (params.search?.trim()) {
      const kw = params.search.trim();
      // ~ tự wrap '%value%' — search theo tên, mô tả ngắn, danh mục, giảng viên
      filters.push(`(title~'${kw}' or smallDescription~'${kw}' or category.name~'${kw}' or instructor.name~'${kw}')`);
    }

    if (params.category) {
      filters.push(`category.name:'${params.category}'`);
    }

    // Multiple levels với OR grouping
    const activeLevels = (params.levels ?? []).filter((l) => l !== 'ALL');
    if (activeLevels.length === 1) {
      filters.push(`level:'${activeLevels[0]}'`);
    } else if (activeLevels.length > 1) {
      const levelOr = activeLevels.map((l) => `level:'${l}'`).join(' or ');
      filters.push(`(${levelOr})`);
    }

    if (params.minRating != null) {
      filters.push(`rating>=${params.minRating}`);
    }

    if (params.priceType === 'free') {
      filters.push(`price:0`);
    } else if (params.priceType === 'paid') {
      filters.push(`price>0`);
    }

    const filterStr = filters.length > 0 ? filters.join(' and ') : undefined;

    const response = await axiosInstance.get<ApiResponse<ApiPagination<CourseSummaryResponse>>>(
      API_ENDPOINTS.COURSES.BASE,
      {
        params: {
          page,
          size: pageSize,
          filter: filterStr,
          sort: params.sort ?? 'createdAt,desc',
        },
      }
    );

    return response.data.data;
  },
};

export default searchService;
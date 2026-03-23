import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import {
  ApiResponse,
  ApiPagination,
  EnrollmentResponse,
  EnrollmentCreationRequest,
  GetEnrollmentsParams,
} from '@/types';

const enrollmentService = {
  getMyEnrollments: async (
    params?: GetEnrollmentsParams
  ): Promise<ApiPagination<EnrollmentResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    const filters: string[] = [];
    if (params?.status) filters.push(`status:'${params.status}'`);

    const response = await axiosInstance.get<ApiResponse<ApiPagination<EnrollmentResponse>>>(
      API_ENDPOINTS.ENROLLMENTS.BASE,
      {
        params: {
          page: page,
          size: pageSize,
          filter: filters.length > 0 ? filters.join(' and ') : undefined,
        },
      }
    );

    return response.data.data;
  },

  create: async (data: EnrollmentCreationRequest): Promise<EnrollmentResponse> => {
    const response = await axiosInstance.post<ApiResponse<EnrollmentResponse>>(
      API_ENDPOINTS.ENROLLMENTS.BASE,
      data
    );
    return response.data.data;
  },
};

export default enrollmentService;
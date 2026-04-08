import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import {
  ApiResponse,
  DashboardStatsResponse,
  GetDashboardStatsParams,
} from '@/types';

const dashboardService = {
  getStats: async (params: GetDashboardStatsParams): Promise<DashboardStatsResponse> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStatsResponse>>(
      API_ENDPOINTS.DASHBOARD.STATS,
      { params },
    );
    return response.data.data;
  },
};

export default dashboardService;
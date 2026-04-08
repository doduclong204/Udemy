import axiosInstance from '@/config/api';
import { ApiResponse, ProcessUpdateRequest, ProcessResponse } from '@/types';

const processService = {
  getProgress: async (enrollmentId: string): Promise<ProcessResponse[]> => {
    const res = await axiosInstance.get<ApiResponse<ProcessResponse[]>>(
      `/enrollments/${enrollmentId}/progress`
    );
    return res.data.data;
  },

  updateProgress: async (enrollmentId: string, data: ProcessUpdateRequest): Promise<ProcessResponse> => {
    const res = await axiosInstance.patch<ApiResponse<ProcessResponse>>(
      `/enrollments/${enrollmentId}/progress`, data
    );
    return res.data.data;
  },
};

export default processService;
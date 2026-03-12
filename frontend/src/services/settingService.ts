import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { ApiResponse, SettingRequest, SettingResponse } from '@/types';

const settingService = {
  getSettings: async (): Promise<SettingResponse> => {
    const response = await axiosInstance.get<ApiResponse<ApiResponse<SettingResponse>>>(
      API_ENDPOINTS.SETTINGS.BASE
    );
    return response.data.data.data;
  },

  updateSettings: async (data: SettingRequest): Promise<SettingResponse> => {
    const response = await axiosInstance.put<ApiResponse<ApiResponse<SettingResponse>>>(
      API_ENDPOINTS.SETTINGS.BASE,
      data
    );
    return response.data.data.data;
  },
};

export default settingService;
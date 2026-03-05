import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { ApiResponse, SettingRequest, SettingResponse } from '@/types';

const settingService = {
  /**
   * Lấy cài đặt hiện tại
   * GET /settings
   */
  getSettings: async (): Promise<SettingResponse> => {
    const response = await axiosInstance.get<ApiResponse<SettingResponse>>(
      API_ENDPOINTS.SETTINGS.BASE
    );
    return response.data.data;
  },

  /**
   * Cập nhật cài đặt
   * PUT /settings
   */
  updateSettings: async (data: SettingRequest): Promise<SettingResponse> => {
    const response = await axiosInstance.put<ApiResponse<SettingResponse>>(
      API_ENDPOINTS.SETTINGS.BASE,
      data
    );
    return response.data.data;
  },
};

export default settingService;
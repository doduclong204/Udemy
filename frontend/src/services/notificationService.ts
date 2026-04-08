import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import {
  ApiResponse,
  ApiPagination,
  NotificationResponse,
  NotificationCreationRequest,
  GetNotificationsParams,
  NotificationStatus,
} from "@/types";

const notificationService = {
  /**
   * Lấy danh sách thông báo (Admin)
   * GET /notifications?page=0&size=10&filter=...
   */
  getAdminNotifications: async (
    params?: GetNotificationsParams & {
      search?: string;
      status?: NotificationStatus;
    },
  ): Promise<ApiPagination<NotificationResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const filters: string[] = [];
    if (params?.search) filters.push(`title~'*${params.search}*'`);
    if (params?.status) filters.push(`status:'${params.status}'`);
    if (params?.type) filters.push(`type:'${params.type}'`);

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<NotificationResponse>>
    >(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: {
        page: page,
        size: pageSize,
        filter: filters.length > 0 ? filters.join(" and ") : undefined,
      },
    });
    return response.data.data;
  },

  /**
   * Tạo thông báo mới
   * POST /notifications
   */
  createNotification: async (
    data: NotificationCreationRequest,
  ): Promise<NotificationResponse> => {
    const response = await axiosInstance.post<
      ApiResponse<NotificationResponse>
    >(API_ENDPOINTS.NOTIFICATIONS.BASE, data);
    return response.data.data;
  },

  /**
   * Lấy chi tiết thông báo
   * GET /notifications/:id
   */
  getNotificationById: async (id: string): Promise<NotificationResponse> => {
    const response = await axiosInstance.get<ApiResponse<NotificationResponse>>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`,
    );
    return response.data.data;
  },

  /**
   * Cập nhật thông báo (chỉ được phép khi còn là DRAFT)
   * PUT /notifications/:id
   */
  updateNotification: async (
    id: string,
    data: Partial<NotificationCreationRequest>,
  ): Promise<NotificationResponse> => {
    const response = await axiosInstance.put<ApiResponse<NotificationResponse>>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Gửi thông báo (chuyển từ DRAFT → SENT)
   * POST /notifications/:id/send
   */
  sendNotification: async (id: string): Promise<NotificationResponse> => {
    const response = await axiosInstance.post<
      ApiResponse<NotificationResponse>
    >(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}/send`);
    return response.data.data;
  },

  /**
   * Xóa thông báo
   * DELETE /notifications/:id
   */
  deleteNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`);
  },
};

export default notificationService;
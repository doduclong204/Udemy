import axiosInstance from '@/config/api';
import { ApiResponse, ApiPagination, UserNotificationResponse, GetNotificationsParams } from '@/types';

const USER_NOTIF_BASE = '/user-notifications';

const userNotificationService = {
  getMyNotifications: async (params?: GetNotificationsParams): Promise<ApiPagination<UserNotificationResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const filters: string[] = [];
    if (params?.isRead !== undefined) filters.push(`isRead:${params.isRead}`);
    if (params?.type) filters.push(`type:'${params.type}'`);

    const response = await axiosInstance.get<ApiResponse<ApiPagination<UserNotificationResponse>>>(
      USER_NOTIF_BASE,
      {
        params: {
          page: page,
          size: pageSize,
          filter: filters.length > 0 ? filters.join(' and ') : undefined,
        },
      },
    );
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.patch(`${USER_NOTIF_BASE}/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch(`${USER_NOTIF_BASE}/read-all`);
  },

  deleteNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${USER_NOTIF_BASE}/${id}`);
  },
};

export default userNotificationService;
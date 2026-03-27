import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import {
  ApiResponse,
  ApiPagination,
  OrderResponse,
  OrderCreationRequest,
  OrderUpdateRequest,
  GetOrdersParams,
} from "@/types";

const orderService = {
  // ==================== Client ====================

  checkout: async (data: OrderCreationRequest): Promise<OrderResponse> => {
    const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
      API_ENDPOINTS.ORDERS.BASE,
      data,
    );
    return response.data.data;
  },

  createVnpayUrl: async (orderId: string): Promise<string> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/vnpay`,
    );
    return response.data.data.message;
  },

  getMyOrders: async (
    params?: GetOrdersParams,
  ): Promise<ApiPagination<OrderResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<OrderResponse>>
    >(`${API_ENDPOINTS.ORDERS.BASE}/my-orders`, {
      params: {
        page: page,
        size: pageSize,
        filter: params?.status ? `paymentStatus:'${params.status}'` : undefined,
      },
    });
    return response.data.data;
  },

  // ==================== Admin ====================

  getAdminOrders: async (
    params?: GetOrdersParams & { search?: string },
  ): Promise<ApiPagination<OrderResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const filters: string[] = [];
    if (params?.search) filters.push(`orderCode~'*${params.search}*'`);
    if (params?.status) filters.push(`paymentStatus:'${params.status}'`);
    if (params?.startDate) filters.push(`createdAt>:'${params.startDate}'`);
    if (params?.endDate) filters.push(`createdAt<:'${params.endDate}'`);

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<OrderResponse>>
    >(API_ENDPOINTS.ORDERS.BASE, {
      params: {
        page: page,
        size: pageSize,
        filter: filters.length > 0 ? filters.join(" and ") : undefined,
      },
    });
    return response.data.data;
  },

  createOrder: async (
    data: OrderCreationRequest & { userId: string },
  ): Promise<OrderResponse> => {
    const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
      `${API_ENDPOINTS.ORDERS.BASE}/admin`,
      data,
    );
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await axiosInstance.get<ApiResponse<OrderResponse>>(
      `${API_ENDPOINTS.ORDERS.BASE}/${id}`,
    );
    return response.data.data;
  },

  updateOrder: async (
    id: string,
    data: OrderUpdateRequest,
  ): Promise<OrderResponse> => {
    const response = await axiosInstance.put<ApiResponse<OrderResponse>>(
      `${API_ENDPOINTS.ORDERS.BASE}/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ORDERS.BASE}/${id}`);
  },
};

export default orderService;
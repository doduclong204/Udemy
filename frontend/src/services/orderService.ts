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
  /**
   * Lấy tất cả đơn hàng (Admin) - server-side pagination + filter
   * GET /orders?page=0&size=15&filter=...
   */
  getAdminOrders: async (
    params?: GetOrdersParams & { search?: string },
  ): Promise<ApiPagination<OrderResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 15;

    const filters: string[] = [];
    if (params?.search) {
      filters.push(`orderCode~'*${params.search}*'`);
    }
    if (params?.status) {
      filters.push(`paymentStatus:'${params.status}'`);
    }
    if (params?.startDate) {
      filters.push(`createdAt>:'${params.startDate}'`);
    }
    if (params?.endDate) {
      filters.push(`createdAt<:'${params.endDate}'`);
    }

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<OrderResponse>>
    >(API_ENDPOINTS.ORDERS.BASE, {
      params: {
        page: Math.max(0, page - 1),
        size: pageSize,
        filter: filters.length > 0 ? filters.join(" and ") : undefined,
      },
    });

    return response.data.data;
  },

  /**
   * Admin tạo đơn hàng thủ công cho một user cụ thể
   * POST /orders/admin
   */
  createOrder: async (
    data: OrderCreationRequest & { userId: string },
  ): Promise<OrderResponse> => {
    const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
      `${API_ENDPOINTS.ORDERS.BASE}/admin`,
      data,
    );
    return response.data.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await axiosInstance.get<ApiResponse<OrderResponse>>(
      `${API_ENDPOINTS.ORDERS.BASE}/${id}`,
    );
    return response.data.data;
  },

  /**
   * Cập nhật trạng thái / phương thức thanh toán (Admin)
   * PUT /orders/:id
   */
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

  /**
   * Xóa đơn hàng (Admin)
   */
  deleteOrder: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ORDERS.BASE}/${id}`);
  },

  /**
   * Lấy lịch sử đơn hàng của user hiện tại
   */
  getMyOrders: async (
    params?: GetOrdersParams,
  ): Promise<ApiPagination<OrderResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const response = await axiosInstance.get<
      ApiResponse<ApiPagination<OrderResponse>>
    >(`${API_ENDPOINTS.ORDERS.BASE}/my-orders`, {
      params: {
        page: Math.max(0, page - 1),
        size: pageSize,
        filter: params?.status ? `paymentStatus:'${params.status}'` : undefined,
      },
    });

    return response.data.data;
  },
};

export default orderService;

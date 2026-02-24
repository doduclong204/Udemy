import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Order, 
  ApiResponse, 
  ApiPagination, 
  CreateOrderRequest, 
  GetOrdersParams 
} from '@/types';
import { adminOrders as mockOrders } from '@/data/adminMockData';

const orderService = {
  /**
   * Lấy lịch sử đơn hàng của user
   * TODO: Implement thật với API sau
   */
  getMyOrders: async (params?: GetOrdersParams): Promise<ApiPagination<Order>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<Order>>('/orders/my-orders', { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const userOrders = mockOrders.filter(o => o.studentId === 'student-1').slice(0, 5);
    
    return {
      meta: {
        current: page - 1,
        pageSize,
        pages: 1,
        total: userOrders.length,
      },
      result: userOrders,
    };
  },

  /**
   * Tạo đơn hàng mới
   * TODO: Implement thật với API sau
   */
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.BASE, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `ORD-${String(Date.now()).slice(-5)}`,
      studentId: '1',
      studentName: 'Current User',
      studentEmail: 'user@example.com',
      courseId: data.courseId,
      courseTitle: 'Course Title',
      amount: 299000,
      originalPrice: 500000,
      discount: 201000,
      couponCode: data.couponCode,
      paymentMethod: data.paymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Lấy chi tiết đơn hàng
   * TODO: Implement thật với API sau
   */
  getOrderById: async (id: string): Promise<Order | null> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Order>>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(o => o.id === id) || null;
  },

  // ==================== Admin Methods ====================

  /**
   * Lấy tất cả đơn hàng (Admin)
   * TODO: Implement thật với API sau
   */
  getAdminOrders: async (params?: GetOrdersParams): Promise<ApiPagination<Order>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<Order>>('/admin/orders', { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredOrders = [...mockOrders];
    
    if (params?.status) {
      filteredOrders = filteredOrders.filter(o => o.status === params.status);
    }
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);
    
    return {
      meta: {
        current: page - 1,
        pageSize,
        pages: Math.ceil(filteredOrders.length / pageSize),
        total: filteredOrders.length,
      },
      result: paginatedOrders,
    };
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   * TODO: Implement thật với API sau
   */
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.put(`/admin/orders/${orderId}/status`, { status });
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Order status updated:', orderId, status);
  },

  /**
   * Hoàn tiền đơn hàng (Admin)
   * TODO: Implement thật với API sau
   */
  refundOrder: async (orderId: string, reason: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.post(`/admin/orders/${orderId}/refund`, { reason });
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Order refunded:', orderId, reason);
  },

  /**
   * Export đơn hàng ra Excel (Admin)
   * TODO: Implement thật với API sau
   */
  exportOrders: async (params?: GetOrdersParams): Promise<Blob> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get('/admin/orders/export', { 
    //   params, 
    //   responseType: 'blob' 
    // });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return new Blob(['Mock Excel Data'], { type: 'application/vnd.ms-excel' });
  },
};

export default orderService;

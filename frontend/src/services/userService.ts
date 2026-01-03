import axiosInstance from '@/config/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constant/common.constant';
import { 
  User, 
  ApiResponse, 
  PaginationResponse, 
  Student, 
  UpdateProfileRequest, 
  ChangePasswordRequest,
  GetStudentsParams 
} from '@/types';
import { adminStudents as mockStudents } from '@/data/adminMockData';

const userService = {
  /**
   * Lấy thông tin user hiện tại
   * TODO: Implement thật với API sau
   */
  getCurrentUser: async (): Promise<User> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<User>>(API_ENDPOINTS.USERS.PROFILE);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    throw new Error('User not found');
  },

  /**
   * Cập nhật profile
   * TODO: Implement thật với API sau
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.put<ApiResponse<User>>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) {
      throw new Error('User not found');
    }
    
    const currentUser = JSON.parse(userStr);
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  /**
   * Đổi mật khẩu
   * TODO: Implement thật với API sau
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (data.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    console.log('Password changed successfully');
  },

  /**
   * Lấy user theo ID
   * TODO: Implement thật với API sau
   */
  getUserById: async (id: string): Promise<User | null> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<User>>(`${API_ENDPOINTS.USERS.BASE}/${id}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const student = mockStudents.find(s => s.id === id);
    if (student) {
      return {
        id: student.id,
        email: student.email,
        name: student.name,
        avatar: student.avatar,
        role: 'user',
      };
    }
    
    return null;
  },

  // ==================== Admin Methods ====================

  /**
   * Lấy danh sách học viên (Admin)
   * TODO: Implement thật với API sau
   */
  getStudents: async (params?: GetStudentsParams): Promise<PaginationResponse<Student>> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<PaginationResponse<Student>>('/admin/students', { params });
    // return response.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredStudents = [...mockStudents];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.email.toLowerCase().includes(search)
      );
    }
    
    if (params?.status) {
      filteredStudents = filteredStudents.filter(s => s.status === params.status);
    }
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      data: paginatedStudents,
      meta: {
        page,
        pageSize,
        totalItems: filteredStudents.length,
        totalPages: Math.ceil(filteredStudents.length / pageSize),
        hasNextPage: startIndex + pageSize < filteredStudents.length,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Cập nhật trạng thái học viên (Admin)
   * TODO: Implement thật với API sau
   */
  updateStudentStatus: async (studentId: string, status: 'Active' | 'Inactive'): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.put(`/admin/students/${studentId}/status`, { status });
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Student status updated:', studentId, status);
  },

  /**
   * Xóa học viên (Admin)
   * TODO: Implement thật với API sau
   */
  deleteStudent: async (studentId: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.delete(`/admin/students/${studentId}`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Student deleted:', studentId);
  },
};

export default userService;

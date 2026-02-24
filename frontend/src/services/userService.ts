import axiosInstance from '@/config/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constant/common.constant';
import { 
  User, 
  ApiResponse, 
  ApiPagination,
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
        username: student.email,
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
  getStudents: async (params?: GetStudentsParams): Promise<ApiPagination<Student>> => {
    // Try real backend first
    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const response = await axiosInstance.get<ApiResponse<any>>(`${API_ENDPOINTS.USERS.BASE}`, {
        params: {
          // Spring pageable is 0-based
          page: Math.max(0, page - 1),
          size: pageSize,
          search: params?.search,
          status: params?.status,
        },
      });
      // Backend returns ApiResponse<ApiPagination<UserResponse>>
      const payload = response.data.data as any;
      const list = payload?.result ?? [];
      const meta = payload?.meta ?? { current: page - 1, pageSize, pages: 1, total: Array.isArray(list) ? list.length : 0 };

      const students: Student[] = (Array.isArray(list) ? list : []).map((u: any) => ({
        id: u._id ?? u.id,
        name: u.name ?? u.username,
        email: u.username ?? u.email,
        avatar: u.avatar ?? '',
        enrolledCourses: u.enrolledCourses ?? 0,
        completedCourses: u.completedCourses ?? 0,
        totalSpent: u.totalSpent ?? 0,
        joinedAt: u.createdAt ?? '',
        lastActive: u.updatedAt ?? '',
        status: (u.active ?? u.status) ? 'Active' : 'Inactive',
      }));

      return {
        meta: {
          current: meta.current ?? (page - 1),
          pageSize: meta.pageSize ?? pageSize,
          pages: meta.pages ?? 1,
          total: meta.total ?? students.length,
        },
        result: students,
      };
    } catch (err) {
      // Fallback to mock
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
        meta: {
          current: page - 1,
          pageSize,
          pages: Math.ceil(filteredStudents.length / pageSize),
          total: filteredStudents.length,
        },
        result: paginatedStudents,
      };
    }
  },

  /**
   * Cập nhật trạng thái học viên (Admin)
   * TODO: Implement thật với API sau
   */
  updateStudentStatus: async (studentId: string, status: 'Active' | 'Inactive' | boolean): Promise<void> => {
    // Backend expects a raw boolean in body indicating `active`
    const active = typeof status === 'boolean' ? status : status === 'Active';
    try {
      await axiosInstance.patch(`${API_ENDPOINTS.USERS.BASE}/${studentId}/status`, active);
      return;
    } catch (err) {
      // fallback to mock
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Student status updated (mock):', studentId, active);
    }
  },

  /**
   * Xóa học viên (Admin)
   * TODO: Implement thật với API sau
   */
  deleteStudent: async (studentId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.USERS.BASE}/${studentId}`);
      return;
    } catch (err) {
      // fallback to mock
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Student deleted (mock):', studentId);
    }
  },
  
  /**
   * Tạo user (Admin / Public)
   */
  createUser: async (data: { name: string; email: string; password?: string; role?: string }): Promise<any> => {
    // backend expects `username` (not email)
    const payload = { ...data, username: data.email } as any;
    delete payload.email;
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.USERS.BASE}`, payload);
      return response.data?.data ?? response.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Create user failed';
      throw new Error(msg);
    }
  },

  /**
   * Cập nhật user (Admin)
   */
  updateUser: async (id: string, data: Partial<{ name: string; email: string; role?: string }>): Promise<any> => {
    const payload: any = { ...data };
    if ((payload as any).email) {
      payload.username = (payload as any).email;
      delete payload.email;
    }
    const response = await axiosInstance.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, payload);
    return response.data?.data ?? response.data;
  },
};

export default userService;

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
   * GET /users/my-info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(
      `${API_ENDPOINTS.USERS.BASE}/my-info`,
    );
    return response.data.data;
  },

  /**
   * Cập nhật profile
   * PUT /users/:id
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const userId = userStr ? (JSON.parse(userStr)?._id ?? JSON.parse(userStr)?.id) : null;
    if (!userId) throw new Error('User not found');

    const response = await axiosInstance.put<ApiResponse<User>>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}`,
      data,
    );
    const updated = response.data.data;

    // Sync localStorage để refresh page vẫn đúng
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...JSON.parse(userStr!), ...updated }));

    return updated;
  },

  /**
   * Đổi mật khẩu
   * PATCH /users/change-password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.patch(`${API_ENDPOINTS.USERS.BASE}/change-password`, data);
  },

  /**
   * Lấy user theo ID
   * GET /users/:id
   */
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>(
        `${API_ENDPOINTS.USERS.BASE}/${id}`,
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  // ==================== Admin Methods ====================

  getStudents: async (params?: GetStudentsParams): Promise<ApiPagination<Student>> => {
    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const response = await axiosInstance.get<ApiResponse<any>>(`${API_ENDPOINTS.USERS.BASE}`, {
        params: {
          page: Math.max(0, page - 1),
          size: pageSize,
          search: params?.search,
          status: params?.status,
        },
      });
      const payload = response.data.data as any;
      const list = payload?.result ?? [];
      const meta = payload?.meta ?? { current: page - 1, pageSize, pages: 1, total: Array.isArray(list) ? list.length : 0 };

      const students: Student[] = (Array.isArray(list) ? list : []).map((u: any) => ({
        id: u._id ?? u.id,
        name: u.name ?? u.username,
        email: u.username ?? u.email,
        avatar: u.avatar ?? '',
enrolledCourses: u.enrollmentCount ?? 0,   
completedCourses: u.completedCount ?? 0,   
        totalSpent: u.totalSpent ?? 0,
        joinedAt: u.createdAt ?? '',
        lastActive: u.updatedAt ?? '',
        status: (u.active ?? u.status) ? 'Active' : 'Inactive',
        role: u.role ? u.role.toString().toUpperCase() : undefined,
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
    } catch {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filteredStudents = [...mockStudents].map(s => ({ ...s, role: 'USER' } as any));

      if (params?.search) {
        const search = params.search.toLowerCase();
        filteredStudents = filteredStudents.filter(s =>
          s.name.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search),
        );
      }
      if (params?.status) {
        filteredStudents = filteredStudents.filter(s => s.status === params.status);
      }

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;

      return {
        meta: {
          current: page - 1,
          pageSize,
          pages: Math.ceil(filteredStudents.length / pageSize),
          total: filteredStudents.length,
        },
        result: filteredStudents.slice(startIndex, startIndex + pageSize),
      };
    }
  },

  updateStudentStatus: async (studentId: string, status: 'Active' | 'Inactive' | boolean): Promise<void> => {
    const active = typeof status === 'boolean' ? status : status === 'Active';
    try {
      await axiosInstance.patch(`${API_ENDPOINTS.USERS.BASE}/${studentId}/status`, active);
    } catch {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Student status updated (mock):', studentId, active);
    }
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.USERS.BASE}/${studentId}`);
    } catch {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Student deleted (mock):', studentId);
    }
  },

  createUser: async (data: { name: string; email: string; password?: string; role?: string }): Promise<any> => {
    const payload: any = { ...data, username: data.email };
    delete payload.email;
    payload.role = payload.role ? payload.role.toString().toUpperCase() : 'USER';

    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.USERS.BASE}`, payload);
      return response.data?.data ?? response.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Create user failed';
      throw new Error(msg);
    }
  },

  updateUser: async (id: string, data: Partial<{ name: string; email: string; role?: string }>): Promise<any> => {
    const payload: any = { ...data };
    if (payload.email) { payload.username = payload.email; delete payload.email; }
    if (payload.role)  { payload.role = payload.role.toString().toUpperCase(); }

    const response = await axiosInstance.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, payload);
    return response.data?.data ?? response.data;
  },
};

export default userService;
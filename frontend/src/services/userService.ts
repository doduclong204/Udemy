import axiosInstance from "@/config/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constant/common.constant";
import {
  User,
  ApiResponse,
  ApiPagination,
  Student,
  UpdateProfileRequest,
  ChangePasswordRequest,
  GetStudentsParams,
} from "@/types";
import { adminStudents as mockStudents } from "@/data/adminMockData";

interface RawUserResponse {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  enrollmentCount?: number;
  completedCount?: number;
  totalSpent?: number;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
  status?: boolean;
  role?: string;
}

interface RawPaginatedResponse {
  result?: RawUserResponse[];
  meta?: {
    current?: number;
    pageSize?: number;
    pages?: number;
    total?: number;
  };
}

interface CreateUserPayload {
  name: string;
  username: string;
  password?: string;
  role?: string;
}

interface UpdateUserPayload {
  name?: string;
  username?: string;
  role?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  avatar?: string;
}

const buildFilter = (search?: string, status?: string): string | undefined => {
  const parts: string[] = [];
  if (search) parts.push(`(name~'*${search}*' or username~'*${search}*')`);
  if (status && status !== "all") {
    parts.push(`active:'${status === "Active" ? "true" : "false"}'`);
  }
  return parts.length > 0 ? parts.join(" and ") : undefined;
};

const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(
      `${API_ENDPOINTS.USERS.BASE}/my-info`,
    );
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const userId = userStr
      ? (JSON.parse(userStr)?._id ?? JSON.parse(userStr)?.id)
      : null;
    if (!userId) throw new Error("User not found");

    const response = await axiosInstance.put<ApiResponse<User>>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}`,
      data,
    );
    const updated = response.data.data;
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({ ...JSON.parse(userStr!), ...updated }),
    );
    return updated;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.patch(
      `${API_ENDPOINTS.USERS.BASE}/change-password`,
      data,
    );
  },

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

  getStudents: async (
    params?: GetStudentsParams,
  ): Promise<ApiPagination<Student>> => {
    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const response = await axiosInstance.get<
        ApiResponse<RawPaginatedResponse>
      >(`${API_ENDPOINTS.USERS.BASE}`, {
        params: {
          page: Math.max(0, page - 1),
          size: pageSize,
          filter: buildFilter(params?.search, params?.status),
        },
      });
      const payload = response.data.data;
      const list: RawUserResponse[] = payload?.result ?? [];
      const meta = payload?.meta ?? {
        current: page - 1,
        pageSize,
        pages: 1,
        total: list.length,
      };

      const students: Student[] = list.map((u) => ({
        id: u._id ?? u.id ?? "",
        name: u.name ?? u.username ?? "",
        email: u.username ?? u.email ?? "",
        avatar: u.avatar ?? "",
        phone: u.phone ?? "",
        bio: u.bio ?? "",
        dateOfBirth: u.dateOfBirth ?? "",
        enrolledCourses: u.enrollmentCount ?? 0,
        completedCourses: u.completedCount ?? 0,
        totalSpent: u.totalSpent ?? 0,
        joinedAt: u.createdAt ?? "",
        lastActive: u.updatedAt ?? "",
        status: (u.active ?? u.status) ? "Active" : "Inactive",
        role: u.role ? u.role.toString().toUpperCase() : undefined,
      }));

      return {
        meta: {
          current: meta.current ?? page - 1,
          pageSize: meta.pageSize ?? pageSize,
          pages: meta.pages ?? 1,
          total: meta.total ?? students.length,
        },
        result: students,
      };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filteredStudents: (Student & { role?: string })[] = [
        ...mockStudents,
      ].map((s) => ({ ...s, role: "USER" }));

      if (params?.search) {
        const search = params.search.toLowerCase();
        filteredStudents = filteredStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search),
        );
      }
      if (params?.status) {
        filteredStudents = filteredStudents.filter(
          (s) => s.status === params.status,
        );
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

  updateStudentStatus: async (
    studentId: string,
    status: "Active" | "Inactive" | boolean,
  ): Promise<void> => {
    const active = typeof status === "boolean" ? status : status === "Active";
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.USERS.BASE}/${studentId}/status`,
        active,
      );
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Student status updated (mock):", studentId, active);
    }
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.USERS.BASE}/${studentId}`);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Student deleted (mock):", studentId);
    }
  },

  createUser: async (data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
  }): Promise<User> => {
    const payload: CreateUserPayload = {
      name: data.name,
      username: data.email,
      password: data.password,
      role: data.role ? data.role.toString().toUpperCase() : "USER",
    };

    try {
      const response = await axiosInstance.post<ApiResponse<User>>(
        `${API_ENDPOINTS.USERS.BASE}`,
        payload,
      );
      return response.data?.data ?? response.data;
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.error ||
        axiosErr?.message ||
        "Create user failed";
      throw new Error(msg);
    }
  },

  updateUser: async (
    id: string,
    data: Partial<{
      name: string;
      role?: string;
      phone?: string;
      bio?: string;
      dateOfBirth?: string;
      avatar?: string;
    }>,
  ): Promise<User> => {
    const payload: UpdateUserPayload = { name: data.name };
    if (data.role) {
      payload.role = data.role.toString().toUpperCase();
    }
    if (data.phone !== undefined) {
      payload.phone = data.phone;
    }
    if (data.bio !== undefined) {
      payload.bio = data.bio;
    }
    if (data.dateOfBirth !== undefined) {
      payload.dateOfBirth = data.dateOfBirth;
    }
    if (data.avatar !== undefined) {
      payload.avatar = data.avatar;
    }

    const response = await axiosInstance.put<ApiResponse<User>>(
      `${API_ENDPOINTS.USERS.BASE}/${id}`,
      payload,
    );
    return response.data?.data ?? response.data;
  },
};

export default userService;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, AdminCourse, CreateCourseRequest, UpdateCourseRequest, GetCoursesParams } from '@/types';
import courseService from '@/services/courseService';
import type { RootState } from '../store';

interface CourseState {
  courses: Course[];
  adminCourses: AdminCourse[];
  currentCourse: Course | null;
  featuredCourses: Course[];
  popularCourses: Course[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const initialState: CourseState = {
  courses: [],
  adminCourses: [],
  currentCourse: null,
  featuredCourses: [],
  popularCourses: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

// Helper: lấy id dù backend trả _id hay id
const getId = (course: any): string => course._id || course.id || '';

// Async Thunks
export const fetchCoursesAsync = createAsyncThunk(
  'courses/fetchCourses',
  async (params: { page?: number; pageSize?: number; category?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourses(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải danh sách khóa học');
    }
  }
);

export const fetchCourseByIdAsync = createAsyncThunk(
  'courses/fetchCourseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const course = await courseService.getCourseById(id);
      return course;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải thông tin khóa học');
    }
  }
);

export const fetchFeaturedCoursesAsync = createAsyncThunk(
  'courses/fetchFeaturedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const courses = await courseService.getFeaturedCourses();
      return courses;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải khóa học nổi bật');
    }
  }
);

export const fetchPopularCoursesAsync = createAsyncThunk(
  'courses/fetchPopularCourses',
  async (_, { rejectWithValue }) => {
    try {
      const courses = await courseService.getPopularCourses();
      return courses;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải khóa học phổ biến');
    }
  }
);

// Admin Thunks
export const fetchAdminCoursesAsync = createAsyncThunk(
  'courses/fetchAdminCourses',
  async (params: GetCoursesParams = {}, { rejectWithValue }) => {
    try {
      const response = await courseService.getAdminCourses(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải danh sách khóa học');
    }
  }
);

export const createAdminCourseAsync = createAsyncThunk(
  'courses/createAdminCourse',
  async (data: CreateCourseRequest, { rejectWithValue }) => {
    try {
      const course = await courseService.createCourse(data);
      return course;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tạo khóa học');
    }
  }
);

export const updateAdminCourseAsync = createAsyncThunk(
  'courses/updateAdminCourse',
  async (data: UpdateCourseRequest & { id: string }, { rejectWithValue }) => {
    try {
      const course = await courseService.updateCourse(data);
      return course;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể cập nhật khóa học');
    }
  }
);

export const deleteAdminCourseAsync = createAsyncThunk(
  'courses/deleteAdminCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      await courseService.deleteCourse(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa khóa học');
    }
  }
);

// Slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },
    clearCoursesError: (state) => {
      state.error = null;
    },
    resetCoursesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCoursesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.result;
        state.pagination = {
          page: action.payload.meta.current + 1,
          pageSize: action.payload.meta.pageSize,
          totalItems: action.payload.meta.total,
          totalPages: action.payload.meta.pages,
        };
      })
      .addCase(fetchCoursesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Course By Id
      .addCase(fetchCourseByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Featured Courses
      .addCase(fetchFeaturedCoursesAsync.fulfilled, (state, action) => {
        state.featuredCourses = action.payload;
      })

      // Fetch Popular Courses
      .addCase(fetchPopularCoursesAsync.fulfilled, (state, action) => {
        state.popularCourses = action.payload;
      })

      // Admin Fetch Courses
      .addCase(fetchAdminCoursesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminCourses = action.payload.result;
        state.pagination = {
          page: action.payload.meta.current + 1,
          pageSize: action.payload.meta.pageSize,
          totalItems: action.payload.meta.total,
          totalPages: action.payload.meta.pages,
        };
      })
      .addCase(fetchAdminCoursesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Admin Course
      .addCase(createAdminCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminCourses.unshift(action.payload);
      })
      .addCase(createAdminCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Admin Course
      .addCase(updateAdminCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ So sánh cả _id lẫn id phòng backend trả tên khác nhau
        const updatedId = getId(action.payload);
        const idx = state.adminCourses.findIndex(c => getId(c) === updatedId);
        if (idx !== -1) {
          state.adminCourses[idx] = action.payload;
        }
      })
      .addCase(updateAdminCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Admin Course
      .addCase(deleteAdminCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ So sánh cả _id lẫn id
        state.adminCourses = state.adminCourses.filter(
          c => getId(c) !== action.payload
        );
      })
      .addCase(deleteAdminCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setCurrentCourse, clearCoursesError, resetCoursesState } = courseSlice.actions;

// Selectors
export const selectCourses = (state: RootState) => state.courses.courses;
export const selectAdminCourses = (state: RootState) => state.courses.adminCourses;
export const selectCurrentCourse = (state: RootState) => state.courses.currentCourse;
export const selectFeaturedCourses = (state: RootState) => state.courses.featuredCourses;
export const selectPopularCourses = (state: RootState) => state.courses.popularCourses;
export const selectCoursesLoading = (state: RootState) => state.courses.loading;
export const selectCoursesError = (state: RootState) => state.courses.error;
export const selectCoursesPagination = (state: RootState) => state.courses.pagination;

export default courseSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, AdminCourse, PaginationResponse } from '@/types';
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
  async (params: { page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await courseService.getAdminCourses(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải danh sách khóa học');
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
        state.courses = action.payload.data ?? action.payload.result;
        state.pagination = {
          page: (action.payload.meta.current ?? action.payload.meta.page) + 1,
          pageSize: action.payload.meta.pageSize ?? action.payload.meta.pageSize,
          totalItems: action.payload.meta.total ?? action.payload.meta.totalItems,
          totalPages: action.payload.meta.pages ?? action.payload.meta.totalPages,
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
      // Admin Courses
      .addCase(fetchAdminCoursesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminCourses = action.payload.data ?? action.payload.result;
        state.pagination = {
          page: (action.payload.meta.current ?? action.payload.meta.page) + 1,
          pageSize: action.payload.meta.pageSize ?? action.payload.meta.pageSize,
          totalItems: action.payload.meta.total ?? action.payload.meta.totalItems,
          totalPages: action.payload.meta.pages ?? action.payload.meta.totalPages,
        };
      })
      .addCase(fetchAdminCoursesAsync.rejected, (state, action) => {
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

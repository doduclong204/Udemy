import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminCourse,
  CourseSummaryResponse,
  CourseDetailResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  GetCoursesParams,
} from "@/types";
import courseService from "@/services/courseService";
import type { RootState } from "../store";

interface CourseState {
  courses: CourseSummaryResponse[];
  adminCourses: AdminCourse[];
  currentCourse: CourseDetailResponse | null;
  featuredCourses: CourseSummaryResponse[];
  popularCourses: CourseSummaryResponse[];
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

const getId = (course: { _id?: string; id?: string }): string =>
  course._id || course.id || "";

// Lấy message từ response body của server thay vì message của axios
const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message) return err.message;
  }
  return fallback;
};

export const fetchCoursesAsync = createAsyncThunk(
  "courses/fetchCourses",
  async (
    params: {
      page?: number;
      pageSize?: number;
      category?: string;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await courseService.getCourses(params);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể tải danh sách khóa học"),
      );
    }
  },
);

export const fetchCourseByIdAsync = createAsyncThunk(
  "courses/fetchCourseById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await courseService.getCourseById(id);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể tải thông tin khóa học"),
      );
    }
  },
);

export const fetchFeaturedCoursesAsync = createAsyncThunk(
  "courses/fetchFeaturedCourses",
  async (_, { rejectWithValue }) => {
    try {
      return await courseService.getFeaturedCourses();
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể tải khóa học nổi bật"),
      );
    }
  },
);

export const fetchPopularCoursesAsync = createAsyncThunk(
  "courses/fetchPopularCourses",
  async (_, { rejectWithValue }) => {
    try {
      return await courseService.getPopularCourses();
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể tải khóa học phổ biến"),
      );
    }
  },
);

export const fetchAdminCoursesAsync = createAsyncThunk(
  "courses/fetchAdminCourses",
  async (params: GetCoursesParams = {}, { rejectWithValue }) => {
    try {
      return await courseService.getAdminCourses(params);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể tải danh sách khóa học"),
      );
    }
  },
);

export const createAdminCourseAsync = createAsyncThunk(
  "courses/createAdminCourse",
  async (data: CreateCourseRequest, { rejectWithValue }) => {
    try {
      return await courseService.createCourse(data);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể tạo khóa học"),
      );
    }
  },
);

export const updateAdminCourseAsync = createAsyncThunk(
  "courses/updateAdminCourse",
  async (data: UpdateCourseRequest & { id: string }, { rejectWithValue }) => {
    try {
      return await courseService.updateCourse(data);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể cập nhật khóa học"),
      );
    }
  },
);

export const deleteAdminCourseAsync = createAsyncThunk(
  "courses/deleteAdminCourse",
  async (id: string, { rejectWithValue }) => {
    try {
      await courseService.deleteCourse(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Không thể xóa khóa học"),
      );
    }
  },
);

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCurrentCourse: (
      state,
      action: PayloadAction<CourseDetailResponse | null>,
    ) => {
      state.currentCourse = action.payload;
    },
    clearCoursesError: (state) => {
      state.error = null;
    },
    resetCoursesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
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

      .addCase(fetchFeaturedCoursesAsync.fulfilled, (state, action) => {
        state.featuredCourses = action.payload;
      })
      .addCase(fetchPopularCoursesAsync.fulfilled, (state, action) => {
        state.popularCourses = action.payload;
      })

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

      .addCase(updateAdminCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedId = getId(action.payload);
        const idx = state.adminCourses.findIndex((c) => getId(c) === updatedId);
        if (idx !== -1) state.adminCourses[idx] = action.payload;
      })
      .addCase(updateAdminCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAdminCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminCourses = state.adminCourses.filter(
          (c) => getId(c) !== action.payload,
        );
      })
      .addCase(deleteAdminCourseAsync.rejected, (state) => {
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setCurrentCourse, clearCoursesError, resetCoursesState } =
  courseSlice.actions;

export const selectCourses = (state: RootState) => state.courses.courses;
export const selectAdminCourses = (state: RootState) =>
  state.courses.adminCourses;
export const selectCurrentCourse = (state: RootState) =>
  state.courses.currentCourse;
export const selectFeaturedCourses = (state: RootState) =>
  state.courses.featuredCourses;
export const selectPopularCourses = (state: RootState) =>
  state.courses.popularCourses;
export const selectCoursesLoading = (state: RootState) => state.courses.loading;
export const selectCoursesError = (state: RootState) => state.courses.error;
export const selectCoursesPagination = (state: RootState) =>
  state.courses.pagination;

export default courseSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enrollmentService from '@/services/enrollmentService';
import type { RootState } from '../store';

interface EnrollmentState {
  enrolledCount: number;
}

const initialState: EnrollmentState = {
  enrolledCount: 0,
};

export const fetchEnrolledCount = createAsyncThunk(
  'enrollment/fetchEnrolledCount',
  async () => {
    const res = await enrollmentService.getMyEnrollments({ pageSize: 1 });
    return res.meta.total;
  },
);

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEnrolledCount.fulfilled, (state, action) => {
      state.enrolledCount = action.payload;
    });
  },
});

export const selectEnrolledCount = (state: RootState) => state.enrollment.enrolledCount;

export default enrollmentSlice.reducer;
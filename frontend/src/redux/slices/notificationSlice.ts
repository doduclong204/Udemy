import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userNotificationService from '@/services/userNotificationService';
import type { RootState } from '../store';

interface NotificationState {
  unreadCount: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
};

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async () => {
    const res = await userNotificationService.getMyNotifications({ pageSize: 10 });
    return res.result.filter((n: { isRead: boolean }) => !n.isRead).length;
  },
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { decrementUnread, clearUnread } = notificationSlice.actions;

export const selectUnreadCount = (state: RootState) => state.notification.unreadCount;

export default notificationSlice.reducer;
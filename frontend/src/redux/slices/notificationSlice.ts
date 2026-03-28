import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userNotificationService from '@/services/userNotificationService';
import type { RootState } from '../store';
import type { UserNotificationResponse } from '@/types';

interface NotificationState {
  notifications: UserNotificationResponse[];
  unreadCount: number;
  loaded: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loaded: false,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async () => {
    const res = await userNotificationService.getMyNotifications({ pageSize: 10 });
    return res.result;
  },
);

export const fetchUnreadCount = fetchNotifications;

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    markOneAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    },
    removeOne: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      state.loaded = true;
    });
  },
});

export const {
  markOneAsRead,
  markAllAsRead,
  removeOne,
  decrementUnread,
  clearUnread,
} = notificationSlice.actions;

export const selectUnreadCount   = (state: RootState) => state.notification.unreadCount;
export const selectNotifications = (state: RootState) => state.notification.notifications;
export const selectNotiLoaded    = (state: RootState) => state.notification.loaded;

export default notificationSlice.reducer;
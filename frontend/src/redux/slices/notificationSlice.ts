import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userNotificationService from '@/services/userNotificationService';
import type { RootState } from '../store';
import type { UserNotificationResponse } from '@/types';

interface NotificationState {
  notifications: UserNotificationResponse[];
  unreadCount: number;
  loaded: boolean;
  lastFetchedAt: number;
  optimisticReadIds: string[];
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loaded: false,
  lastFetchedAt: 0,
  optimisticReadIds: [],
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async () => {
    const listRes = await userNotificationService.getMyNotifications({ pageSize: 20 });
    return { list: listRes.result };
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
        if (!state.optimisticReadIds.includes(action.payload)) {
          state.optimisticReadIds.push(action.payload);
        }
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        if (!n.isRead && !state.optimisticReadIds.includes(n._id)) {
          state.optimisticReadIds.push(n._id);
        }
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    clearOptimisticReadIds: (state) => {
      state.optimisticReadIds = [];
    },
    removeOne: (state, action: PayloadAction<string>) => {
      const idx = state.notifications.findIndex((n) => n._id === action.payload);
      if (idx === -1) return;
      const notif = state.notifications[idx];
      if (!notif.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.optimisticReadIds = state.optimisticReadIds.filter((id) => id !== action.payload);
      state.notifications.splice(idx, 1);
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<UserNotificationResponse>) => {
      const exists = state.notifications.some((n) => n._id === action.payload._id);
      if (exists) return;
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      const incoming = action.payload.list as UserNotificationResponse[];
      const incomingIds = new Set(incoming.map((n) => n._id));
      const realtimeOnly = state.notifications.filter((n) => !incomingIds.has(n._id));

      const merged = [
        ...realtimeOnly,
        ...incoming.map((n) => {
          if (state.optimisticReadIds.includes(n._id)) {
            return { ...n, isRead: true };
          }
          return n;
        }),
      ];

      state.notifications = merged;
      state.unreadCount = merged.filter((n) => !n.isRead).length;
      state.loaded = true;
      state.lastFetchedAt = Date.now();
    });
  },
});

export const {
  markOneAsRead,
  markAllAsRead,
  removeOne,
  decrementUnread,
  clearUnread,
  addNotification,
  clearOptimisticReadIds,
} = notificationSlice.actions;

export const selectUnreadCount   = (state: RootState) => state.notification.unreadCount;
export const selectNotifications = (state: RootState) => state.notification.notifications;
export const selectNotiLoaded    = (state: RootState) => state.notification.loaded;
export const selectLastFetchedAt = (state: RootState) => state.notification.lastFetchedAt;

export default notificationSlice.reducer;
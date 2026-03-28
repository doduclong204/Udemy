import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import notificationReducer from './slices/notificationSlice';
import enrollmentReducer from './slices/enrollmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    notification: notificationReducer,
    enrollment: enrollmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
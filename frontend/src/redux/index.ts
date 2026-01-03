// Export store
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export auth slice
export {
  setUser,
  clearError,
  resetAuthState,
  loginAsync,
  registerAsync,
  logoutAsync,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
} from './slices/authSlice';

// Export course slice
export {
  setCurrentCourse,
  clearCoursesError,
  resetCoursesState,
  fetchCoursesAsync,
  fetchCourseByIdAsync,
  fetchFeaturedCoursesAsync,
  fetchPopularCoursesAsync,
  fetchAdminCoursesAsync,
  selectCourses,
  selectAdminCourses,
  selectCurrentCourse,
  selectFeaturedCourses,
  selectPopularCourses,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesPagination,
} from './slices/courseSlice';

// Export cart slice
export {
  addToCart,
  removeFromCart,
  clearCart,
  setCartItems,
  selectCartItems,
  selectCartItemsCount,
  selectIsInCart,
  selectCartTotalPrice,
  selectCartTotalOriginalPrice,
} from './slices/cartSlice';

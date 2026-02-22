// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ==================== Auth Types

export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  role: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  bio?: string;
  role?: string;
}
// ==================== Course Types ====================

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  lectures: number;
  badge?: 'bestseller' | 'new' | 'hot';
  description: string;
  whatYouLearn: string[];
  requirements: string[];
  lastUpdated: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  price: number;
  discountPrice?: number;
  students: number;
  rating: string;
  reviews: number;
  lectures: number;
  duration: string;
  status: 'Published' | 'Draft' | 'Pending';
  isFeatured: boolean;
  isBestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  subtitle?: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: string;
  price: number;
  discountPrice?: number;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string;
}

export interface GetCoursesParams {
  page?: number;
  pageSize?: number;
  category?: string;
  level?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== Category Types ====================

export interface Category {
  id: string;
  name: string;
  icon: string;
  courseCount: number;
  subcategories?: string[];
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// ==================== Lesson Types ====================

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz';
  preview?: boolean;
  videoUrl?: string;
  content?: string;
  order?: number;
}

export interface Section {
  id: string;
  title: string;
  lectures: Lesson[];
}

// ==================== Enrollment Types ====================

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  lastAccessedAt?: string;
}

export interface EnrollCourseRequest {
  courseId: string;
  paymentMethod?: string;
  couponCode?: string;
}

export interface UpdateProgressRequest {
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
}

// ==================== Review Types ====================

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export interface AdminReview {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  courseId: string;
  courseTitle: string;
  rating: number;
  content: string;
  isHidden: boolean;
  adminReply?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  courseId: string;
  rating: number;
  comment: string;
}

export interface GetReviewsParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  rating?: number;
}

// ==================== Order Types ====================

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  originalPrice: number;
  discount: number;
  couponCode?: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
  createdAt: string;
}

export interface CreateOrderRequest {
  courseId: string;
  paymentMethod: string;
  couponCode?: string;
}

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ==================== Student Types ====================

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: number;
  completedCourses: number;
  totalSpent: number;
  joinedAt: string;
  lastActive: string;
  status: 'Active' | 'Inactive';
}

export interface GetStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

// ==================== User Types ====================

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== Coupon Types ====================

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  usageLimit: number;
  usedCount: number;
  minOrder: number;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Used';
}

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  avgRating: string;
  newStudentsThisMonth: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  orders: number;
}

// ==================== Site Settings Types ====================

export interface SiteSettings {
  siteName: string;
  logo: string;
  primaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebook: string;
  youtube: string;
  description: string;
  footerText: string;
}

// ==================== Cart Types ====================

export interface CartItem extends Course {
  quantity?: number;
}

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

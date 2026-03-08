// ==================== API Response Types ====================

export interface ApiResponse<T> {
  statusCode?: number;
  message?: any;
  error?: string;
  data: T;
}

export interface ApiPagination<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ==================== Auth Types ====================

export interface User {
  _id?: string;
  id?: string;
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
  // refreshToken is part of entity but typically not returned in responses
  // pull from AuthResponse if needed
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// mirrors com.education.udemy.dto.response.user.UserInToken
export interface UserInToken {
  id: string;          // serialized as _id in JSON
  username: string;
  role: string;
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

// ==================== Category Types ====================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  totalCourses: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  description?: string;
}

// ==================== Coupon Types ====================

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED',
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUsage: number;
  usedCount: number;
  minOrderAmount: number;
  couponStatus: CouponStatus;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCouponRequest {
  code: string;
  discountType: string;
  discountValue: number;
  maxUsage: number;
  minOrderAmount: number;
  couponStatus: CouponStatus;
  expiresAt: string;
}

export interface UpdateCouponRequest {
  discountType?: string;
  discountValue?: number;
  maxUsage?: number;
  minOrderAmount?: number;
  couponStatus?: CouponStatus;
  expiresAt?: string;
}

export interface CouponCheckRequest {
  code: string;
  orderAmount: number;
}

// ==================== User Types (Client - tự cập nhật profile) ====================

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

// ==================== User Types (Admin - quản lý user) ====================

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
  // backend may return role when managing users
  role?: string;
}

export interface GetStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

// ==================== Enums ====================

// Level.java: BASIC, INTERMEDIATE, ADVANCED
export type Level = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

// LectureType.java: VIDEO, ARTICLE
export type LectureType = 'VIDEO' | 'ARTICLE';

// EnrollmentStatus.java: ENROLLED, LEARNING, COMPLETED
export type EnrollmentStatus = 'ENROLLED' | 'LEARNING' | 'COMPLETED';

// OrderStatus.java: PENDING, COMPLETED, CANCELLED, REFUNDED
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

// PaymentMethod.java: VNPAY, MOMO, BANK_TRANSFER, PAYPAL
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'PAYPAL';

// NotificationType.java: PROMOTION, COURSE, SYSTEM
export type NotificationType = 'PROMOTION' | 'COURSE' | 'SYSTEM';

// NotificationTarget.java: ALL, ENROLLED, NEW_USER
export type NotificationTarget = 'ALL' | 'ENROLLED' | 'NEW_USER';

// NotificationStatus.java: DRAFT, SENT
export type NotificationStatus = 'DRAFT' | 'SENT';

// ==================== Lecture Types ====================

export interface LectureCreationRequest {
  title: string;
  type: LectureType;
  videoUrl?: string;
  content?: string;
  duration?: number; // seconds (Integer)
  isFree?: boolean;  // default false
}

export interface LectureUpdateRequest {
  id?: string;       // ID bài học hiện tại khi update
  title?: string;
  type?: LectureType;
  videoUrl?: string;
  content?: string;
  duration?: number;
  isFree?: boolean;
}

export interface LectureResponse {
  _id: string;
  title: string;
  type: LectureType;
  videoUrl?: string;
  content?: string;
  duration?: number;
  isFree: boolean;
}

// ==================== Section Types ====================

export interface SectionCreationRequest {
  title: string;
  lectures?: LectureCreationRequest[];
}

export interface SectionUpdateRequest {
  id?: string;       // ID chương hiện tại khi update
  title?: string;
  lectures?: LectureUpdateRequest[];
}

export interface SectionResponse {
  _id: string;
  title: string;
  lectures: LectureResponse[];
}

// ==================== Course Types ====================

export interface Course {
  _id?: string;
  id: string;
  title: string;
  thumbnail?: string;
  category?: string;
  level?: string;
  price?: number;
  discountPrice?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  students?: number;
  rating?: string;
  reviews?: number;
  lectures?: number;
  duration?: string;
}

export interface AdminCourse extends Course {
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseRequest {
  title: string;
  smallDescription: string;
  description: string;
  thumbnail: string;
  banner: string;
  price: number;
  discountPrice?: number;
  level: Level;
  learningOutcomes?: string;
  categoryId: string;
  sections?: SectionCreationRequest[];
}

export interface UpdateCourseRequest {
  title?: string;
  smallDescription?: string;
  description?: string;
  thumbnail?: string;
  banner?: string;
  price?: number;
  discountPrice?: number;
  level?: Level;
  learningOutcomes?: string;
  categoryId?: string;
  outstanding?: boolean;
  sections?: SectionUpdateRequest[];
}

export interface CourseDetailResponse {
  _id: string;
  title: string;
  smallDescription: string;
  description: string;
  thumbnail: string;
  banner: string;
  price: number;
  discountPrice?: number;
  level: Level;
  learningOutcomes?: string;
  rating: number;
  ratingCount: number;
  totalStudents: number;
  totalLectures: number;
  totalDuration: number;
  instructorName: string;
  instructorBio?: string;
  categoryId: string;
  categoryName: string;
  outstanding: boolean;
  isEnrolled: boolean;
  isInWishlist: boolean;
  isInCart: boolean;
  sections: SectionResponse[];
  updatedAt?: string;
}

export interface CourseSummaryResponse {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  level: Level;
  totalStudents: number;
  categoryName: string;
  outstanding: boolean;
}

export interface GetCoursesParams {
  page?: number;
  pageSize?: number;
  category?: string;
  level?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  outstanding?: boolean;
}

// ==================== Enrollment Types ====================

export interface EnrollmentCreationRequest {
  courseId: string;
}

export interface EnrollmentResponse {
  _id: string;
  progress: number;          // BigDecimal (0-100)
  status: EnrollmentStatus;
  enrolledAt: string;        // Instant -> ISO string
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface GetEnrollmentsParams {
  page?: number;
  pageSize?: number;
  status?: EnrollmentStatus;
}

// ==================== Process (Learning Progress) Types ====================

export interface ProcessUpdateRequest {
  lectureId: string;
  watchedDuration?: number;
  completed?: boolean;
}

export interface ProcessResponse {
  _id: string;
  lectureId: string;
  enrollmentId: string;
  completed: boolean;
  watchedDuration: number;
  lastWatchedAt: string;
  completedAt?: string;
}

// ==================== Lecture Note Types ====================

export interface LectureNoteCreationRequest {
  content: string;
  timeInSeconds: number;
  lectureId: string;
}

export interface LectureNoteUpdateRequest {
  content: string;
  timeInSeconds: number;
}

export interface LectureNoteResponse {
  _id: string;
  content: string;
  timeInSeconds: number;
  lectureId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ==================== Review Types ====================

// ReviewRequest dùng chung cho: tạo review, admin reply, ẩn/hiện review
export interface ReviewRequest {
  rating?: number;        // @Min(1) @Max(5) - bắt buộc khi tạo mới
  comment?: string;
  courseId?: string;      // bắt buộc khi tạo mới
  adminReply?: string;    // chỉ dùng khi admin reply
  reviewStatus?: boolean; // chỉ dùng khi admin ẩn/hiện
}

export interface ReviewResponse {
  _id: string;
  rating: number;
  comment: string;
  adminReply?: string;
  reviewStatus: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  course: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetReviewsParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  rating?: number;
}

// ==================== Order Types ====================

export interface OrderCreationRequest {
  courseIds: string[];      // @NotEmpty - có thể mua nhiều khóa cùng lúc
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

export interface OrderUpdateRequest {
  paymentStatus?: OrderStatus;
  paymentMethod?: PaymentMethod;
}

export interface OrderItemResponse {
  _id: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  courseId: string;
  courseName: string;
}

export interface OrderResponse {
  _id: string;
  orderCode: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderStatus;
  orderItems: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

// ==================== Cart Types ====================

export interface CartItemResponse {
  _id: string;
  courseId: string;
  courseName: string;
  courseImage: string;
  author: string;
  rating: number;
  totalReviews: number;
  originalPrice: number;
  salePrice: number;
}

export interface CartResponse {
  _id: string;
  items: CartItemResponse[];
  totalOriginalPrice: number;
  totalSalePrice: number;
  totalDiscount: number;
  discountPercentage: string;
}

// ==================== Wishlist Types ====================

export interface WishlistRequest {
  courseId: string;
}

export interface WishlistResponse {
  _id: string;
  courseId: string;
  title: string;
  thumbnail: string;
  price: number;
  oldPrice: number;
}

// ==================== QA Types ====================

// QARequest dùng chung cho: đặt câu hỏi và trả lời
export interface QARequest {
  content: string;      // @NotBlank - bắt buộc
  title?: string;       // chỉ dùng khi đặt câu hỏi
  courseId?: string;    // chỉ dùng khi đặt câu hỏi
  lectureId?: string;   // chỉ dùng khi đặt câu hỏi
  questionId?: string;  // chỉ dùng khi trả lời
}

export interface QAResponse {
  _id: string;
  title?: string;
  content: string;
  answered: boolean;
  instructorAnswer: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetQAParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  lectureId?: string;
  answered?: boolean;
}

// ==================== Notification Types ====================

export interface NotificationCreationRequest {
  type: NotificationType;
  title: string;
  message: string;
  targetType: NotificationTarget;
  status?: NotificationStatus;
  relatedId?: string;
  relatedType?: string;
}

// NotificationResponse - Admin quản lý thông báo
export interface NotificationResponse {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetType: NotificationTarget;
  status: NotificationStatus;
  relatedId?: string;
  relatedType?: string;
  totalSent: number;
  totalRead: number;
  createdAt: string;
  createdBy: string;
}

// UserNotificationResponse - Thông báo phía người dùng
export interface UserNotificationResponse {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  type?: NotificationType;
}

// ==================== Settings Types ====================

export interface SettingRequest {
  siteName: string;
  siteDescription?: string;
  logo: string;
  favicon?: string;
  primaryColor?: string; // hex, e.g. "#FF0000"
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  facebookLink?: string;
  youtubeLink?: string;
  footerText?: string;
}

export interface SettingResponse {
  _id: string;
  siteName: string;
  siteDescription?: string;
  logo: string;
  favicon?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  facebookLink?: string;
  youtubeLink?: string;
  footerText?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
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
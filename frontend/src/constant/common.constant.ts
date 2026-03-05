// User Roles
export const ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type RoleType = typeof ROLE[keyof typeof ROLE];

// Course Status
export const COURSE_STATUS = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  PENDING: 'Pending',
} as const;

export type CourseStatusType = typeof COURSE_STATUS[keyof typeof COURSE_STATUS];

// Course Levels
export const COURSE_LEVEL = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All Levels',
} as const;

export type CourseLevelType = typeof COURSE_LEVEL[keyof typeof COURSE_LEVEL];

// Order Status
export const ORDER_STATUS = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Payment Methods
export const PAYMENT_METHOD = {
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT_CARD: 'Credit Card',
  ZALOPAY: 'ZaloPay',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ACCOUNT: '/auth/account',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  COURSES: {
    BASE: '/courses',
    FEATURED: '/courses/featured',
    POPULAR: '/courses/popular',
    BY_CATEGORY: '/courses/category',
  },
  CATEGORIES: {
    BASE: '/categories',
  },
  ENROLLMENTS: {
    BASE: '/enrollments',
    MY_COURSES: '/enrollments/my-courses',
  },
  REVIEWS: {
    BASE: '/reviews',
  },
  ORDERS: {
    BASE: '/orders',
  },
  COUPONS: {
    BASE: '/coupons',
  },
  LESSONS: {
    BASE: '/lessons',
  },
  NOTIFICATIONS: {   
    BASE: '/notifications',
  },
  SETTINGS: {
  BASE: '/settings',
},
} as const;

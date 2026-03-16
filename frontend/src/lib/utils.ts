import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";

/**
 * Merge Tailwind CSS classes với clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ngày tháng
 * @param date - Date string hoặc Date object
 * @param locale - Locale (mặc định: 'vi-VN')
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'vi-VN'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return dateObj.toLocaleDateString(locale, defaultOptions);
}

/**
 * Format tiền tệ
 * @param amount - Số tiền
 * @param currency - Loại tiền (mặc định: 'VND')
 * @param locale - Locale (mặc định: 'vi-VN')
 */
export function formatCurrency(
  amount: number,
  currency: string = 'VND',
  locale: string = 'vi-VN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số với dấu phân cách
 * @param num - Số cần format
 * @param locale - Locale (mặc định: 'vi-VN')
 */
export function formatNumber(num: number, locale: string = 'vi-VN'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Cắt ngắn text với ellipsis
 * @param text - Text cần cắt
 * @param maxLength - Độ dài tối đa
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Lấy message lỗi từ Axios error
 * @param error - Axios error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Lấy message từ response data
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Lấy message từ response data errors array
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.join(', ');
    }
    // Lấy status text
    if (error.response?.statusText) {
      return error.response.statusText;
    }
    // Network error
    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    // Timeout
    if (error.code === 'ECONNABORTED') {
      return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định';
}

/**
 * Debounce function
 * @param func - Function cần debounce
 * @param wait - Thời gian chờ (ms)
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Throttle function
 * @param func - Function cần throttle
 * @param limit - Thời gian giới hạn (ms)
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep/delay function
 * @param ms - Thời gian chờ (ms)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Kiểm tra email hợp lệ
 * @param email - Email cần kiểm tra
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Kiểm tra password đủ mạnh
 * @param password - Password cần kiểm tra
 * @param minLength - Độ dài tối thiểu (mặc định: 6)
 */
export function isStrongPassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength;
}

/**
 * Generate random string
 * @param length - Độ dài chuỗi
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Capitalize first letter
 * @param str - String cần capitalize
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Slugify string (tạo URL slug)
 * @param str - String cần chuyển đổi
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse query string thành object
 * @param queryString - Query string
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string từ object
 * @param params - Object params
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Deep clone object
 * @param obj - Object cần clone
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 * @param obj - Object cần kiểm tra
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
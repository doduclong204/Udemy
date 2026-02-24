import axiosInstance from '@/config/api';
import { API_ENDPOINTS } from '@/constant/common.constant';
import { 
  Enrollment, 
  Course, 
  ApiResponse, 
  EnrollCourseRequest, 
  UpdateProgressRequest 
} from '@/types';
import { courses as mockCourses } from '@/data/mockData';

const enrollmentService = {
  /**
   * Lấy danh sách khóa học đã đăng ký
   * TODO: Implement thật với API sau
   */
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Enrollment[]>>(API_ENDPOINTS.ENROLLMENTS.MY_COURSES);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Giả lập user đã đăng ký 2 khóa học đầu tiên
    const enrolledCourses = mockCourses.slice(0, 2);
    
    return enrolledCourses.map((course, index) => ({
      id: `enrollment-${index + 1}`,
      userId: '1',
      courseId: course.id,
      course,
      progress: Math.floor(Math.random() * 100),
      completedLessons: [],
      enrolledAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      lastAccessedAt: new Date().toISOString(),
    }));
  },

  /**
   * Đăng ký khóa học
   * TODO: Implement thật với API sau
   */
  enrollCourse: async (data: EnrollCourseRequest): Promise<Enrollment> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.post<ApiResponse<Enrollment>>(API_ENDPOINTS.ENROLLMENTS.BASE, data);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const course = mockCourses.find(c => c.id === data.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    return {
      id: `enrollment-${Date.now()}`,
      userId: '1',
      courseId: data.courseId,
      course,
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
    };
  },

  /**
   * Lấy chi tiết enrollment
   * TODO: Implement thật với API sau
   */
  getEnrollmentById: async (id: string): Promise<Enrollment | null> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<Enrollment>>(`${API_ENDPOINTS.ENROLLMENTS.BASE}/${id}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id,
      userId: '1',
      courseId: '1',
      course: mockCourses[0],
      progress: 35,
      completedLessons: ['1-1', '1-2'],
      enrolledAt: new Date(2024, 6, 15).toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
  },

  /**
   * Cập nhật tiến độ học
   * TODO: Implement thật với API sau
   */
  updateProgress: async (data: UpdateProgressRequest): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.put(`${API_ENDPOINTS.ENROLLMENTS.BASE}/${data.enrollmentId}/progress`, data);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Progress updated:', data);
  },

  /**
   * Kiểm tra đã đăng ký khóa học chưa
   * TODO: Implement thật với API sau
   */
  checkEnrollment: async (courseId: string): Promise<boolean> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // const response = await axiosInstance.get<ApiResponse<boolean>>(`${API_ENDPOINTS.ENROLLMENTS.BASE}/check/${courseId}`);
    // return response.data.data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: 2 khóa học đầu tiên đã được đăng ký
    return courseId === '1' || courseId === '2';
  },

  /**
   * Hủy đăng ký khóa học
   * TODO: Implement thật với API sau
   */
  unenrollCourse: async (enrollmentId: string): Promise<void> => {
    // TODO: Uncomment khi kết nối Spring Boot
    // await axiosInstance.delete(`${API_ENDPOINTS.ENROLLMENTS.BASE}/${enrollmentId}`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Unenrolled:', enrollmentId);
  },
};

export default enrollmentService;

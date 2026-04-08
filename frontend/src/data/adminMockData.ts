// Generate mock admin data

const categories = ['Development', 'Business', 'Design', 'Marketing', 'IT & Software', 'Personal Development'];
const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const statuses = ['Published', 'Draft', 'Pending'];

const courseNames = [
  'Complete Web Development Bootcamp 2025',
  'React & TypeScript Masterclass',
  'Python for Data Science',
  'AWS Cloud Practitioner',
  'UI/UX Design Fundamentals',
  'Digital Marketing Complete Guide',
  'Machine Learning A-Z',
  'Node.js Backend Development',
  'Flutter Mobile App Development',
  'Blockchain & Cryptocurrency',
  'Ethical Hacking Masterclass',
  'Project Management Professional',
  'Business Analytics with Excel',
  'Photography Masterclass',
  'Adobe Photoshop CC',
  'Leadership & Management Skills',
  'Public Speaking & Presentation',
  'Financial Trading Mastery',
  'SEO & Content Marketing',
  'Game Development with Unity',
];

const studentNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Đỗ Văn Inh', 'Ngô Thị Kim',
  'Đinh Văn Long', 'Trịnh Thị Mai', 'Dương Văn Nam', 'Lý Thị Oanh', 'Phan Văn Phúc',
  'Hồ Thị Quỳnh', 'Tô Văn Rạng', 'Lưu Thị Sen', 'Vương Văn Tâm', 'Mai Thị Uyên',
];

const couponCodes = ['SAVE20', 'NEWYEAR2025', 'FLASH50', 'STUDENT30', 'VIP40', 'SUMMER25'];

// Generate 60 courses
export const adminCourses = Array.from({ length: 60 }, (_, i) => ({
  id: `course-${i + 1}`,
  title: courseNames[i % courseNames.length] + (i >= courseNames.length ? ` Vol. ${Math.floor(i / courseNames.length) + 1}` : ''),
  subtitle: 'Khóa học được thiết kế dành cho người mới bắt đầu đến nâng cao',
  description: 'Khóa học toàn diện giúp bạn nắm vững kiến thức từ cơ bản đến chuyên sâu.',
  thumbnail: `https://images.unsplash.com/photo-${1516321318423 + i * 100}-f06f85e504b3?w=400&h=225&fit=crop`,
  category: categories[i % categories.length],
  level: levels[i % levels.length],
  price: Math.floor(Math.random() * 1500000) + 299000,
  discountPrice: Math.random() > 0.3 ? Math.floor(Math.random() * 500000) + 199000 : undefined,
  students: Math.floor(Math.random() * 5000) + 100,
  rating: (Math.random() * 1.5 + 3.5).toFixed(1),
  reviews: Math.floor(Math.random() * 500) + 20,
  lectures: Math.floor(Math.random() * 100) + 20,
  duration: `${Math.floor(Math.random() * 40) + 5} giờ`,
  status: statuses[Math.floor(Math.random() * statuses.length)] as 'Published' | 'Draft' | 'Pending',
  isFeatured: Math.random() > 0.7,
  isBestseller: Math.random() > 0.8,
  createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  updatedAt: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString(),
}));

// Generate 500 students
export const adminStudents = Array.from({ length: 500 }, (_, i) => ({
  id: `student-${i + 1}`,
  name: studentNames[i % studentNames.length] + (i >= studentNames.length ? ` ${Math.floor(i / studentNames.length)}` : ''),
  email: `student${i + 1}@email.com`,
  avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
  enrolledCourses: Math.floor(Math.random() * 10) + 1,
  completedCourses: Math.floor(Math.random() * 5),
  totalSpent: Math.floor(Math.random() * 5000000) + 200000,
  joinedAt: new Date(2023, Math.floor(Math.random() * 24), Math.floor(Math.random() * 28) + 1).toISOString(),
  lastActive: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString(),
  status: Math.random() > 0.1 ? 'Active' : 'Inactive' as 'Active' | 'Inactive',
}));

// Generate 300 orders
export const adminOrders = Array.from({ length: 300 }, (_, i) => {
  const student = adminStudents[i % adminStudents.length];
  const course = adminCourses[Math.floor(Math.random() * adminCourses.length)];
  const orderStatuses = ['Completed', 'Pending', 'Refunded', 'Failed'];
  const paymentMethods = ['MoMo', 'VNPay', 'Bank Transfer', 'Credit Card', 'ZaloPay'];
  
  return {
    id: `ORD-${String(i + 1).padStart(5, '0')}`,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    courseId: course.id,
    courseTitle: course.title,
    amount: course.discountPrice || course.price,
    originalPrice: course.price,
    discount: course.price - (course.discountPrice || course.price),
    couponCode: Math.random() > 0.7 ? couponCodes[Math.floor(Math.random() * couponCodes.length)] : undefined,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as 'Completed' | 'Pending' | 'Refunded' | 'Failed',
    createdAt: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
  };
});

// Generate coupons
export const adminCoupons = [
  { id: 'coup-1', code: 'SAVE20', discount: 20, type: 'percentage' as const, usageLimit: 100, usedCount: 45, minOrder: 500000, expiresAt: '2025-12-31', status: 'Active' as const },
  { id: 'coup-2', code: 'NEWYEAR2025', discount: 25, type: 'percentage' as const, usageLimit: 200, usedCount: 180, minOrder: 300000, expiresAt: '2025-01-31', status: 'Expired' as const },
  { id: 'coup-3', code: 'FLASH50', discount: 50, type: 'percentage' as const, usageLimit: 50, usedCount: 50, minOrder: 1000000, expiresAt: '2025-06-30', status: 'Used' as const },
  { id: 'coup-4', code: 'STUDENT30', discount: 30, type: 'percentage' as const, usageLimit: 500, usedCount: 123, minOrder: 200000, expiresAt: '2025-09-01', status: 'Active' as const },
  { id: 'coup-5', code: 'VIP40', discount: 40, type: 'percentage' as const, usageLimit: 20, usedCount: 8, minOrder: 2000000, expiresAt: '2025-08-15', status: 'Active' as const },
  { id: 'coup-6', code: 'FIXED100K', discount: 100000, type: 'fixed' as const, usageLimit: 100, usedCount: 67, minOrder: 500000, expiresAt: '2025-07-31', status: 'Active' as const },
  { id: 'coup-7', code: 'SUMMER25', discount: 25, type: 'percentage' as const, usageLimit: 300, usedCount: 0, minOrder: 300000, expiresAt: '2025-08-31', status: 'Active' as const },
];

// Generate reviews
export const adminReviews = Array.from({ length: 150 }, (_, i) => {
  const student = adminStudents[i % adminStudents.length];
  const course = adminCourses[Math.floor(Math.random() * adminCourses.length)];
  const reviewTexts = [
    'Khóa học rất hay và bổ ích!',
    'Giảng viên giảng dạy dễ hiểu, tôi rất hài lòng.',
    'Nội dung khóa học chất lượng, đáng đồng tiền.',
    'Tôi đã học được nhiều điều mới từ khóa học này.',
    'Khóa học tuyệt vời, sẽ giới thiệu cho bạn bè.',
    'Cần cập nhật thêm nội dung mới hơn.',
    'Video chất lượng cao, âm thanh rõ ràng.',
    'Bài tập thực hành rất hữu ích.',
    'Hỗ trợ học viên rất tốt.',
    'Khóa học đáng giá mỗi đồng bỏ ra.',
  ];
  
  return {
    id: `review-${i + 1}`,
    studentId: student.id,
    studentName: student.name,
    studentAvatar: student.avatar,
    courseId: course.id,
    courseTitle: course.title,
    rating: Math.floor(Math.random() * 2) + 4,
    content: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
    isHidden: Math.random() > 0.95,
    adminReply: Math.random() > 0.8 ? 'Cảm ơn bạn đã đánh giá!' : undefined,
    createdAt: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString(),
  };
});

// Dashboard stats
export const dashboardStats = {
  totalRevenue: adminOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.amount, 0),
  totalStudents: adminStudents.length,
  totalCourses: adminCourses.length,
  totalOrders: adminOrders.length,
  completedOrders: adminOrders.filter(o => o.status === 'Completed').length,
  pendingOrders: adminOrders.filter(o => o.status === 'Pending').length,
  avgRating: (adminCourses.reduce((sum, c) => sum + parseFloat(c.rating), 0) / adminCourses.length).toFixed(1),
  newStudentsThisMonth: adminStudents.filter(s => new Date(s.joinedAt) > new Date(2025, 5, 1)).length,
};

// Revenue data for chart (last 12 months)
export const revenueChartData = [
  { month: 'T1', revenue: 45000000, orders: 32 },
  { month: 'T2', revenue: 52000000, orders: 38 },
  { month: 'T3', revenue: 48000000, orders: 35 },
  { month: 'T4', revenue: 61000000, orders: 45 },
  { month: 'T5', revenue: 55000000, orders: 41 },
  { month: 'T6', revenue: 67000000, orders: 50 },
  { month: 'T7', revenue: 72000000, orders: 55 },
  { month: 'T8', revenue: 68000000, orders: 52 },
  { month: 'T9', revenue: 80000000, orders: 62 },
  { month: 'T10', revenue: 85000000, orders: 68 },
  { month: 'T11', revenue: 92000000, orders: 75 },
  { month: 'T12', revenue: 98000000, orders: 82 },
];

// Top 5 courses by revenue
export const topCourses = adminCourses
  .sort((a, b) => (b.students * (b.discountPrice || b.price)) - (a.students * (a.discountPrice || a.price)))
  .slice(0, 5)
  .map(c => ({
    ...c,
    revenue: c.students * (c.discountPrice || c.price),
  }));

// Recent orders
export const recentOrders = adminOrders
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10);

// Site settings
export const siteSettings = {
  siteName: 'LearnHub Vietnam',
  logo: '/placeholder.svg',
  primaryColor: '#7c3aed',
  contactEmail: 'contact@learnhub.vn',
  contactPhone: '+84 28 1234 5678',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  facebook: 'https://facebook.com/learnhubvn',
  youtube: 'https://youtube.com/learnhubvn',
  description: 'Nền tảng học trực tuyến hàng đầu Việt Nam',
  footerText: '© 2025 LearnHub Việt Nam. Bảo lưu mọi quyền.',
};

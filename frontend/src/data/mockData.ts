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

export interface Category {
  id: string;
  name: string;
  icon: string;
  courseCount: number;
  subcategories?: string[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export interface Section {
  id: string;
  title: string;
  lectures: {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'article' | 'quiz';
    preview?: boolean;
  }[];
}

export const categories: Category[] = [
  { id: '1', name: 'Lập trình', icon: '💻', courseCount: 12543, subcategories: ['Phát triển Web', 'Phát triển Mobile', 'Phát triển Game', 'Thiết kế Database'] },
  { id: '2', name: 'Kinh doanh', icon: '📊', courseCount: 8234, subcategories: ['Khởi nghiệp', 'Giao tiếp', 'Quản lý', 'Bán hàng'] },
  { id: '3', name: 'Tài chính & Kế toán', icon: '💰', courseCount: 5432, subcategories: ['Kế toán', 'Tiền điện tử', 'Mô hình tài chính', 'Đầu tư'] },
  { id: '4', name: 'CNTT & Phần mềm', icon: '🖥️', courseCount: 9876, subcategories: ['Chứng chỉ IT', 'An ninh mạng', 'Phần cứng', 'Hệ điều hành'] },
  { id: '5', name: 'Văn phòng', icon: '📁', courseCount: 3456, subcategories: ['Microsoft', 'Google', 'SAP', 'Oracle'] },
  { id: '6', name: 'Phát triển bản thân', icon: '🧠', courseCount: 6789, subcategories: ['Lãnh đạo', 'Phát triển nghề nghiệp', 'Hạnh phúc', 'Năng suất cá nhân'] },
  { id: '7', name: 'Thiết kế', icon: '🎨', courseCount: 7654, subcategories: ['Thiết kế Web', 'Thiết kế đồ họa', 'UX Design', 'Đồ họa 3D'] },
  { id: '8', name: 'Marketing', icon: '📢', courseCount: 4567, subcategories: ['Digital Marketing', 'SEO', 'Mạng xã hội', 'Thương hiệu'] },
  { id: '9', name: 'Nhiếp ảnh & Video', icon: '📷', courseCount: 3210, subcategories: ['Nhiếp ảnh', 'Sản xuất video', 'Nhiếp ảnh thương mại'] },
  { id: '10', name: 'Sức khỏe & Fitness', icon: '💪', courseCount: 2345, subcategories: ['Fitness', 'Dinh dưỡng', 'Yoga', 'Sức khỏe tinh thần'] },
  { id: '11', name: 'Âm nhạc', icon: '🎵', courseCount: 1987, subcategories: ['Nhạc cụ', 'Sản xuất nhạc', 'Lý thuyết âm nhạc', 'Thanh nhạc'] },
  { id: '12', name: 'Giảng dạy & Học thuật', icon: '📚', courseCount: 4321, subcategories: ['Toán học', 'Khoa học', 'Ngôn ngữ', 'Luyện thi'] },
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'The Complete 2024 Web Development Bootcamp',
    instructor: 'Dr. Angela Yu',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 4.7,
    reviewCount: 234567,
    studentCount: 892345,
    price: 12.99,
    originalPrice: 84.99,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
    category: 'Development',
    level: 'All Levels',
    duration: '65 hours',
    lectures: 438,
    badge: 'bestseller',
    description: 'Become a full-stack web developer with just ONE course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps.',
    whatYouLearn: [
      'Build 16 web development projects for your portfolio',
      'Learn the latest technologies, including Javascript, React, Node and MongoDB',
      'Build fully-fledged websites and web apps for your startup or business',
      'Master frontend development with React',
      'Master backend development with Node.js',
      'Learn professional developer best practices',
    ],
    requirements: ['No programming experience needed', 'A computer with access to the internet', 'No paid software required'],
    lastUpdated: 'January 2024',
  },
  {
    id: '2',
    title: 'Machine Learning A-Z: AI, Python & R + ChatGPT Bonus',
    instructor: 'Kirill Eremenko',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 4.5,
    reviewCount: 178234,
    studentCount: 745123,
    price: 14.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=225&fit=crop',
    category: 'Development',
    level: 'All Levels',
    duration: '44 hours',
    lectures: 382,
    badge: 'bestseller',
    description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.',
    whatYouLearn: [
      'Master Machine Learning on Python & R',
      'Make accurate predictions',
      'Make powerful analysis',
      'Create robust Machine Learning models',
      'Handle specific topics like Reinforcement Learning, NLP and Deep Learning',
      'Know which Machine Learning model to choose for each type of problem',
    ],
    requirements: ['High School Mathematics', 'Basic Python or R knowledge helpful but not required'],
    lastUpdated: 'December 2023',
  },
  {
    id: '3',
    title: 'React - The Complete Guide 2024 (incl. React Router & Redux)',
    instructor: 'Maximilian Schwarzmüller',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4.6,
    reviewCount: 189456,
    studentCount: 678234,
    price: 11.99,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    category: 'Development',
    level: 'All Levels',
    duration: '68 hours',
    lectures: 512,
    badge: 'hot',
    description: 'Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, Best Practices and way more!',
    whatYouLearn: [
      'Build powerful, fast, user-friendly and reactive web apps',
      'Apply for high-paid jobs or work as a freelancer in one of the most-demanded sectors',
      'Learn all about React Hooks and React Components',
      'Learn React Router to build single-page applications',
    ],
    requirements: ['JavaScript + HTML + CSS fundamentals are required', 'ES6+ JavaScript knowledge is beneficial but not required'],
    lastUpdated: 'February 2024',
  },
  {
    id: '4',
    title: 'The Complete Digital Marketing Course - 12 Courses in 1',
    instructor: 'Rob Percival',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 4.4,
    reviewCount: 145678,
    studentCount: 523456,
    price: 13.99,
    originalPrice: 94.99,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    category: 'Marketing',
    level: 'Beginner',
    duration: '23 hours',
    lectures: 178,
    description: 'Master Digital Marketing Strategy, Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!',
    whatYouLearn: [
      'Develop Digital Marketing Strategies',
      'Create and optimize Facebook Ads',
      'Master SEO and rank on Google',
      'Build and grow social media presence',
    ],
    requirements: ['No marketing experience needed', 'Access to a computer and internet'],
    lastUpdated: 'November 2023',
  },
  {
    id: '5',
    title: 'Python for Data Science and Machine Learning Bootcamp',
    instructor: 'Jose Portilla',
    instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    rating: 4.6,
    reviewCount: 134567,
    studentCount: 456789,
    price: 12.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop',
    category: 'Development',
    level: 'Intermediate',
    duration: '25 hours',
    lectures: 165,
    badge: 'bestseller',
    description: 'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, and more!',
    whatYouLearn: [
      'Use Python for Data Science and Machine Learning',
      'Implement Machine Learning Algorithms',
      'Use NumPy for Numerical Data',
      'Use Pandas for Data Analysis',
    ],
    requirements: ['Some Python programming experience', 'Basic understanding of mathematics'],
    lastUpdated: 'January 2024',
  },
  {
    id: '6',
    title: 'AWS Certified Solutions Architect - Associate 2024',
    instructor: 'Stephane Maarek',
    instructorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    rating: 4.7,
    reviewCount: 167890,
    studentCount: 534567,
    price: 14.99,
    originalPrice: 109.99,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    category: 'IT & Software',
    level: 'Intermediate',
    duration: '27 hours',
    lectures: 289,
    badge: 'new',
    description: 'Pass the AWS Solutions Architect Associate Certification SAA-C03. Complete Amazon Web Services Cloud training!',
    whatYouLearn: [
      'PASS the AWS Certified Solutions Architect Associate exam',
      'All 700+ slides available as downloadable PDF',
      'Full Practice Exam with Explanations included',
      'Learn the AWS Fundamentals (EC2, ELB, ASG, RDS, ElastiCache, S3)',
    ],
    requirements: ['No AWS cloud experience needed', 'Basic IT knowledge helpful'],
    lastUpdated: 'February 2024',
  },
  {
    id: '7',
    title: 'Complete Figma Course - From Beginner to Expert',
    instructor: 'Daniel Walter Scott',
    instructorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop',
    rating: 4.8,
    reviewCount: 45678,
    studentCount: 189234,
    price: 11.99,
    originalPrice: 74.99,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    category: 'Design',
    level: 'All Levels',
    duration: '18 hours',
    lectures: 142,
    badge: 'hot',
    description: 'Learn UI/UX Design with Figma. Create stunning designs for websites and apps. Become a professional designer!',
    whatYouLearn: [
      'Learn Figma from scratch to advanced',
      'Create professional UI designs',
      'Build design systems and components',
      'Collaborate with teams effectively',
    ],
    requirements: ['No design experience needed', 'Free Figma account required'],
    lastUpdated: 'December 2023',
  },
  {
    id: '8',
    title: 'The Complete JavaScript Course 2024: From Zero to Expert!',
    instructor: 'Jonas Schmedtmann',
    instructorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    rating: 4.7,
    reviewCount: 189234,
    studentCount: 712345,
    price: 13.99,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop',
    category: 'Development',
    level: 'All Levels',
    duration: '69 hours',
    lectures: 320,
    badge: 'bestseller',
    description: 'The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one!',
    whatYouLearn: [
      'Become an advanced, confident, and modern JavaScript developer',
      'Build 6 beautiful real-world projects',
      'JavaScript fundamentals: variables, if/else, operators, boolean logic, functions, arrays, objects, loops, strings, etc.',
      'Modern ES6+ from the beginning: arrow functions, destructuring, spread operator, optional chaining, etc.',
    ],
    requirements: ['No coding experience necessary', 'Any computer and OS will work'],
    lastUpdated: 'January 2024',
  },
];

export const sections: Section[] = [
  {
    id: '1',
    title: 'Getting Started',
    lectures: [
      { id: '1-1', title: 'Welcome to the Course', duration: '5:32', type: 'video', preview: true },
      { id: '1-2', title: 'Setting Up Your Development Environment', duration: '12:45', type: 'video', preview: true },
      { id: '1-3', title: 'Course Overview and Resources', duration: '8:20', type: 'article' },
    ],
  },
  {
    id: '2',
    title: 'HTML Fundamentals',
    lectures: [
      { id: '2-1', title: 'Introduction to HTML', duration: '15:30', type: 'video' },
      { id: '2-2', title: 'HTML Document Structure', duration: '18:45', type: 'video' },
      { id: '2-3', title: 'Working with Text Elements', duration: '22:10', type: 'video' },
      { id: '2-4', title: 'HTML Quiz', duration: '10 questions', type: 'quiz' },
    ],
  },
  {
    id: '3',
    title: 'CSS Basics',
    lectures: [
      { id: '3-1', title: 'Introduction to CSS', duration: '14:20', type: 'video' },
      { id: '3-2', title: 'Selectors and Properties', duration: '25:15', type: 'video' },
      { id: '3-3', title: 'Box Model Deep Dive', duration: '19:30', type: 'video' },
      { id: '3-4', title: 'Flexbox Layout', duration: '28:45', type: 'video' },
      { id: '3-5', title: 'CSS Grid Fundamentals', duration: '32:10', type: 'video' },
    ],
  },
  {
    id: '4',
    title: 'JavaScript Essentials',
    lectures: [
      { id: '4-1', title: 'Variables and Data Types', duration: '20:30', type: 'video' },
      { id: '4-2', title: 'Functions and Scope', duration: '24:15', type: 'video' },
      { id: '4-3', title: 'Arrays and Objects', duration: '28:40', type: 'video' },
      { id: '4-4', title: 'DOM Manipulation', duration: '35:20', type: 'video' },
      { id: '4-5', title: 'JavaScript Challenge', duration: '5 questions', type: 'quiz' },
    ],
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    userName: 'Michael R.',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
    rating: 5,
    date: '2 weeks ago',
    comment: 'This course is absolutely fantastic! The instructor explains everything so clearly and the projects are really engaging. I went from knowing nothing about web development to building my own full-stack applications.',
    helpful: 234,
  },
  {
    id: '2',
    userName: 'Sarah K.',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    date: '1 month ago',
    comment: 'Best investment I have made in my career. The course content is up-to-date and the instructor is very responsive to questions. Highly recommend!',
    helpful: 189,
  },
  {
    id: '3',
    userName: 'David L.',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4,
    date: '3 weeks ago',
    comment: 'Great course overall. Some sections could be a bit more detailed, but the practical projects really help solidify the concepts. Would recommend for beginners.',
    helpful: 156,
  },
];

export const trustedCompanies = [
  { name: 'Volkswagen', logo: '🚗' },
  { name: 'Samsung', logo: '📱' },
  { name: 'Cisco', logo: '🌐' },
  { name: 'Vimeo', logo: '🎬' },
  { name: 'P&G', logo: '🧴' },
  { name: 'Hewlett Packard', logo: '💻' },
  { name: 'Citi', logo: '🏦' },
  { name: 'Ericsson', logo: '📡' },
];

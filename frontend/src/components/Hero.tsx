import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import courseService from '@/services/courseService';
import axiosInstance from '@/config/api';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { settings } = useSettings();

  const primaryColor = settings?.primaryColor || '#A435F0';

  const heroStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 50%, #1e1b4b 100%)`,
  };

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalOrders: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/auth/stats');
        const data = res.data.data;
        setStats({
          totalCourses: data.totalCourses || 20,
          totalStudents: data.totalStudents || 10,
          totalOrders: data.totalOrders || 20,
          avgRating: data.avgRating || 4.8,
        });
      } catch {
        // Giữ nguyên giá trị mặc định nếu lỗi
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const statItems = [
    { value: stats.totalCourses > 0 ? `${stats.totalCourses.toLocaleString()}+` : '...', label: 'Khóa học trực tuyến' },
    { value: stats.totalStudents > 0 ? `${stats.totalStudents.toLocaleString()}+` : '...', label: 'Học viên' },
    { value: stats.totalOrders > 0 ? `${stats.totalOrders.toLocaleString()}+` : '...', label: 'Đơn hàng hoàn thành' },
    { value: `${stats.avgRating.toFixed(1)} ⭐`, label: 'Đánh giá trung bình' },
  ];

  return (
    <section className="relative overflow-hidden" style={heroStyle}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-background rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-background rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in">
            Học Mọi Thứ,{' '}
            <span className="text-udemy-yellow">Theo Lịch Của Bạn</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Khám phá hàng nghìn khóa học từ các giảng viên hàng đầu.
            Bắt đầu học ngay hôm nay và mở khóa tiềm năng của bạn.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Bạn muốn học gì hôm nay?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-5 pl-14 text-lg rounded-full bg-background text-foreground shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                style={{ backgroundColor: `${primaryColor}dd` }}
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {['Lập trình', 'Thiết kế đồ họa', 'Marketing', 'Kinh doanh'].map((topic) => (
              <button
                key={topic}
                onClick={() => navigate(`/search?category=${encodeURIComponent(topic)}`)}
                className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-white text-center">
            {statItems.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-bold">{item.value}</p>
                <p className="text-sm opacity-80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
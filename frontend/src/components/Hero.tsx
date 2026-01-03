import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-udemy-purple via-udemy-purple-dark to-udemy-navy overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-background rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-background rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-background mb-6 animate-fade-in">
            Học Mọi Thứ,{' '}
            <span className="text-udemy-yellow">Theo Lịch Của Bạn</span>
          </h1>
          <p className="text-lg md:text-xl text-background/90 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
                className="w-full px-5 py-5 pl-14 text-lg rounded-full bg-background text-foreground shadow-2xl focus:outline-none focus:ring-4 focus:ring-udemy-yellow/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-udemy-purple-dark transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh'].map((topic) => (
              <button
                key={topic}
                onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}
                className="px-4 py-2 bg-background/20 text-background rounded-full text-sm font-medium hover:bg-background/30 transition-colors border border-background/30"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-background/10 backdrop-blur-sm border-t border-background/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-background text-center">
            <div>
              <p className="text-3xl font-bold">210k+</p>
              <p className="text-sm opacity-80">Khóa học trực tuyến</p>
            </div>
            <div>
              <p className="text-3xl font-bold">75k+</p>
              <p className="text-sm opacity-80">Giảng viên chuyên nghiệp</p>
            </div>
            <div>
              <p className="text-3xl font-bold">62M+</p>
              <p className="text-sm opacity-80">Học viên toàn cầu</p>
            </div>
            <div>
              <p className="text-3xl font-bold">850M+</p>
              <p className="text-sm opacity-80">Lượt đăng ký</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CourseCarousel } from '@/components/CourseCarousel';
import { CategoryGrid } from '@/components/CategoryGrid';
import { TrustedCompanies } from '@/components/TrustedCompanies';
import { PromoBar } from '@/components/PromoBar';
import { courses } from '@/data/mockData';

const Index = () => {
  const featuredCourses = courses.filter((c) => c.badge === 'bestseller');
  const newCourses = courses.filter((c) => c.badge === 'new' || c.badge === 'hot');
  const developmentCourses = courses.filter((c) => c.category === 'Development');

  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Header />
      
      <main>
        <Hero />
        
        <div className="container mx-auto px-4">
          <CourseCarousel
            title="Khóa học nổi bật"
            subtitle="Những khóa học được đánh giá cao nhất của chúng tôi"
            courses={featuredCourses}
          />
          
          <CategoryGrid />
          
          <CourseCarousel
            title="Học viên đang xem"
            subtitle="Khám phá những gì người khác đang học ngay bây giờ"
            courses={courses}
          />
          
          <TrustedCompanies />
          
          <CourseCarousel
            title="Khóa học Lập trình hàng đầu"
            subtitle="Nắm vững các công nghệ lập trình mới nhất"
            courses={developmentCourses}
          />
          
          {newCourses.length > 0 && (
            <CourseCarousel
              title="Mới & Xu hướng"
              subtitle="Những khóa học vừa được thêm vào danh mục"
              courses={newCourses}
            />
          )}
          
          {/* CTA Section - Student Encouragement */}
          <section className="py-16 my-12 bg-gradient-to-r from-udemy-purple to-udemy-purple-dark rounded-2xl text-center text-background">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hành trình học tập bắt đầu từ hôm nay
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto px-4">
              Mỗi ngày học một điều mới là một bước tiến gần hơn đến thành công. Đừng ngại bắt đầu, hãy tin vào chính mình!
            </p>
            <button className="bg-background text-primary font-bold px-8 py-4 rounded-lg hover:bg-secondary transition-colors">
              Khám phá khóa học ngay
            </button>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

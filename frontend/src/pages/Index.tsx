import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { CourseCarousel } from "@/components/CourseCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { TrustedCompanies } from "@/components/TrustedCompanies";
import { PromoBar } from "@/components/PromoBar";
import { useSettings } from "@/contexts/SettingsContext";
import courseService from "@/services/courseService";
import type { CourseSummaryResponse } from "@/types";

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState<CourseSummaryResponse[]>([]);
  const [popularCourses, setPopularCourses] = useState<CourseSummaryResponse[]>([]);
  const [allCourses, setAllCourses] = useState<CourseSummaryResponse[]>([]);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const primaryColor = settings?.primaryColor || '#A435F0';

  useEffect(() => {
    courseService.getCourses({ pageSize: 10, outstanding: true })
      .then((res) => setFeaturedCourses(res.result))
      .catch(() => {});

    courseService.getCourses({ pageSize: 10, sort: 'totalStudents,desc' })
      .then((res) => setPopularCourses(res.result))
      .catch(() => {});

    courseService.getCourses({ pageSize: 10, sort: 'createdAt,desc' })
      .then((res) => setAllCourses(res.result))
      .catch(() => {});
  }, []);

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
            courses={popularCourses}
          />

          <TrustedCompanies />

          <CourseCarousel
            title="Khóa học Lập trình hàng đầu"
            subtitle="Nắm vững các công nghệ lập trình mới nhất"
            courses={allCourses}
          />

          {/* CTA Section - màu động từ settings */}
          <section
            className="py-16 my-12 rounded-2xl text-center text-white"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)`,
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hành trình học tập bắt đầu từ hôm nay
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto px-4">
              Mỗi ngày học một điều mới là một bước tiến gần hơn đến thành công. Đừng ngại bắt đầu, hãy tin vào chính mình!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-white font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: primaryColor }}
            >
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
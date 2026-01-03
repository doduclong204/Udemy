import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Rating } from '@/components/Rating';
import { CourseCarousel } from '@/components/CourseCarousel';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { courses, sections, reviews } from '@/data/mockData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Play,
  FileText,
  HelpCircle,
  Clock,
  BarChart3,
  Award,
  Globe,
  Heart,
  Share2,
  Check,
  ChevronDown,
  Users,
  PlayCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value * 25000);
};

export default function CourseDetail() {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  
  const course = courses.find((c) => c.id === id) || courses[0];
  const relatedCourses = courses.filter((c) => c.category === course.category && c.id !== course.id);

  const handleAddToCart = () => {
    addToCart(course);
    toast({
      title: 'Đã thêm vào giỏ hàng',
      description: `${course.title} đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Course Header */}
      <div className="bg-udemy-navy text-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {course.badge && (
                <div className="mb-4">
                  {course.badge === 'bestseller' && (
                    <span className="badge-bestseller text-sm">Bán chạy</span>
                  )}
                  {course.badge === 'new' && <span className="badge-new text-sm">Mới</span>}
                  {course.badge === 'hot' && <span className="badge-hot text-sm">Hot & Mới</span>}
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-background/80 mb-4">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Rating rating={course.rating} reviewCount={course.reviewCount} size="lg" />
                <span className="text-background/80">
                  ({course.studentCount.toLocaleString()} học viên)
                </span>
              </div>
              
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-background/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Cập nhật lần cuối {course.lastUpdated}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Tiếng Việt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* What you'll learn */}
            <div className="border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {course.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span>{sections.length} phần</span>
                <span>•</span>
                <span>{course.lectures} bài giảng</span>
                <span>•</span>
                <span>{course.duration} tổng thời lượng</span>
              </div>
              
              <Accordion type="multiple" className="border border-border rounded-lg overflow-hidden">
                {sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="px-4 py-3 bg-secondary hover:bg-secondary/80">
                      <div className="flex items-center gap-4 text-left">
                        <span className="font-semibold">{section.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {section.lectures.length} bài giảng
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      {section.lectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          className="flex items-center justify-between px-4 py-3 border-t border-border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getLectureIcon(lecture.type)}
                            <span className="text-sm">{lecture.title}</span>
                            {lecture.preview && (
                              <button className="text-primary text-sm underline">Xem trước</button>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{lecture.duration}</span>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Yêu cầu</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 flex-shrink-0"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>


            {/* Reviews */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Phản hồi học viên</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex gap-4 mb-2">
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex items-center gap-2">
                          <Rating rating={review.rating} showNumber={false} size="sm" />
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">{review.comment}</p>
                    <button className="text-sm text-muted-foreground mt-2 hover:text-foreground transition-colors">
                      Hữu ích ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-primary font-semibold flex items-center gap-1 hover:underline">
                Xem tất cả đánh giá
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-border rounded-lg overflow-hidden shadow-course bg-card">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold">{formatCurrency(course.price)}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(course.originalPrice)}
                  </span>
                  <span className="text-primary font-semibold">
                    Giảm {Math.round((1 - course.price / course.originalPrice) * 100)}%
                  </span>
                </div>
                
                <p className="text-destructive text-sm font-medium mb-4">
                  ⏰ Còn 2 ngày với giá này!
                </p>
                
                {isInCart(course.id) ? (
                  <Button variant="cart" className="mb-3" disabled>
                    Đã thêm vào giỏ
                  </Button>
                ) : (
                  <Button variant="cart" className="mb-3" onClick={handleAddToCart}>
                    Thêm vào giỏ hàng
                  </Button>
                )}
                
                <Button variant="wishlist" className="w-full mb-4">
                  Mua ngay
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Đảm bảo hoàn tiền trong 30 ngày
                </p>
                
                <div className="space-y-3 text-sm">
                  <p className="font-bold">Khóa học này bao gồm:</p>
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-muted-foreground" />
                    <span>{course.duration} video theo yêu cầu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>12 bài viết</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span>Truy cập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>Chứng chỉ hoàn thành</span>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-border">
                  <button className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </button>
                  <button className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    Yêu thích
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <CourseCarousel
            title="Các khóa học tương tự"
            courses={relatedCourses}
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
}

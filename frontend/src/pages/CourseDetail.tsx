import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Rating } from "@/components/Rating";
import { CourseCarousel } from "@/components/CourseCarousel";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import courseService from "@/services/courseService";
import reviewService from "@/services/reviewService";
import type {
  CourseDetailResponse,
  CourseSummaryResponse,
  ReviewResponse,
} from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Play,
  FileText,
  BarChart3,
  Award,
  Globe,
  Heart,
  Share2,
  Check,
  Clock,
  BookOpen,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}g ${m}p` : `${m} phút`;
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseSummaryResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    courseService
      .getCourseById(id)
      .then((data) => {
        setCourse(data);
        reviewService
          .getReviewsByCourse(data._id, { pageSize: 5 })
          .then((res) => setReviews(res.result))
          .catch(() => {});
        return courseService.getCourses({
          category: data.categoryName,
          pageSize: 10,
        });
      })
      .then((res) => {
        setRelatedCourses(res.result.filter((c) => c._id !== id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Không tìm thấy khóa học.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const learningOutcomesList = course.learningOutcomes
    ? course.learningOutcomes
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const price = Number(course.price) || 0;
  const discountPrice = Number(course.discountPrice) || 0;
  const displayPrice = discountPrice > 0 ? discountPrice : price;
  const discountPercent =
    discountPrice > 0 ? Math.round((1 - discountPrice / price) * 100) : 0;

  const inWishlist = isInWishlist(course._id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    if (isInCart(course._id)) return;
    await addToCart(course._id);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${course.title} đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    if (!isInCart(course._id)) {
      await addToCart(course._id);
    }
    navigate("/cart");
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    toggleWishlist(course._id);
    toast({
      title: inWishlist ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
      description: `${course.title} đã được ${inWishlist ? "xóa khỏi" : "thêm vào"} danh sách yêu thích.`,
    });
  };

  const handleGoToLearning = () => {
    navigate(`/course/${course._id}/learn`);
  };

  const getLectureIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "VIDEO":
        return <Play className="w-4 h-4" />;
      case "ARTICLE":
        return <FileText className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-udemy-navy text-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {course.outstanding && (
                <div className="mb-4">
                  <span className="badge-bestseller text-sm">Nổi bật</span>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">
                {course.title}
              </h1>
              <p className="text-lg text-background/80 mb-4">
                {course.smallDescription}
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Rating
                  rating={Number(course.rating) || 0}
                  reviewCount={Number(course.ratingCount) || 0}
                  size="lg"
                />
                <span className="text-background/80">
                  ({(course.totalStudents || 0).toLocaleString()} học viên)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-background/70">
                {course.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Cập nhật lần cuối{" "}
                    {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Online Video Course
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {learningOutcomesList.length > 0 && (
              <div className="border border-border rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {learningOutcomesList.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.sections && course.sections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span>{course.sections.length} phần</span>
                  <span>•</span>
                  <span>{course.totalLectures} bài giảng</span>
                  <span>•</span>
                  <span>{formatDuration(course.totalDuration || 0)} tổng thời lượng</span>
                </div>
                <Accordion type="multiple" className="border border-border rounded-lg overflow-hidden">
                  {course.sections.map((section) => (
                    <AccordionItem key={section._id} value={section._id}>
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
                            key={lecture._id}
                            className="flex items-center justify-between px-4 py-3 border-t border-border hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getLectureIcon(lecture.type)}
                              <span className="text-sm">{lecture.title}</span>
                              {lecture.isFree && (
                                <button className="text-primary text-sm underline">
                                  Xem trước
                                </button>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {lecture.duration ? formatDuration(lecture.duration) : ""}
                            </span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {course.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Mô tả khóa học</h2>
                <p className="text-sm text-foreground/80 whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Phản hồi học viên</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có ai phản hồi về khóa học này.
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex gap-4 mb-2">
                        <img
                          src={review.user.avatar || "/placeholder-avatar.jpg"}
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{review.user.name}</p>
                          <div className="flex items-center gap-2">
                            <Rating rating={review.rating} showNumber={false} size="sm" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80">{review.comment}</p>
                      {review.adminReply && (
                        <div className="mt-3 pl-4 border-l-2 border-primary">
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            Phản hồi từ giảng viên:
                          </p>
                          <p className="text-sm">{review.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-border rounded-lg overflow-hidden shadow-course bg-card">
              <img
                src={course.thumbnail || course.banner}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                {course.isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
                      <Check className="w-4 h-4" />
                      Bạn đã sở hữu khóa học này
                    </div>
                    <Button
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
                      onClick={handleGoToLearning}
                    >
                      <BookOpen className="w-4 h-4" />
                      Vào học ngay
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-3xl font-bold">
                        {formatCurrency(displayPrice)}
                      </span>
                      {discountPrice > 0 && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            {formatCurrency(price)}
                          </span>
                          <span className="text-primary font-semibold">
                            Giảm {discountPercent}%
                          </span>
                        </>
                      )}
                    </div>

                    {isInCart(course._id) ? (
                      <Button variant="cart" className="mb-3" disabled>
                        Đã thêm vào giỏ
                      </Button>
                    ) : (
                      <Button variant="cart" className="mb-3" onClick={handleAddToCart}>
                        Thêm vào giỏ hàng
                      </Button>
                    )}

                    <Button variant="default" className="w-full mb-4" onClick={handleBuyNow}>
                      Mua ngay
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Đảm bảo hoàn tiền trong 30 ngày
                    </p>
                  </>
                )}

                <div className="space-y-3 text-sm mt-2">
                  <p className="font-bold">Khóa học này bao gồm:</p>
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDuration(course.totalDuration || 0)} video theo yêu cầu</span>
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
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      inWishlist ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? "fill-primary" : ""}`} />
                    {inWishlist ? "Đã yêu thích" : "Yêu thích"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedCourses.length > 0 && (
          <CourseCarousel title="Các khóa học tương tự" courses={relatedCourses} />
        )}
      </div>

      <Footer />
    </div>
  );
}
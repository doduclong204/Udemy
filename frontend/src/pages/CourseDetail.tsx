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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoPlayer from "@/pages/VideoPlayer";
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
  Download,
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

type PreviewLecture = {
  title: string;
  type: "VIDEO" | "ARTICLE";
  videoUrl?: string;
  content?: string;
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
  const [previewLecture, setPreviewLecture] = useState<PreviewLecture | null>(null);

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

  const handleDownloadArticle = (title: string, content: string) => {
    const filename = `${title}.md`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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

      {/* ── Preview Modal ── */}
      <Dialog
        open={!!previewLecture}
        onOpenChange={(open) => { if (!open) setPreviewLecture(null); }}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle className="text-base font-semibold pr-8 flex items-center gap-2">
              {previewLecture?.type === "ARTICLE"
                ? <FileText className="w-4 h-4 text-violet-500" />
                : <Play className="w-4 h-4 text-violet-500" />}
              {previewLecture?.title}
            </DialogTitle>
          </DialogHeader>

          {previewLecture?.type === "VIDEO" && (
            <div className="w-full bg-black">
              {previewLecture.videoUrl ? (
                <VideoPlayer
                  key={previewLecture.videoUrl}
                  src={previewLecture.videoUrl}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <p className="text-white/50 text-sm">Không có video preview</p>
                </div>
              )}
            </div>
          )}

          {previewLecture?.type === "ARTICLE" && (
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: "70vh",
                background: "linear-gradient(135deg, #f8f7ff 0%, #f0f4ff 100%)",
              }}
            >
              {/* Article header */}
              <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-violet-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                    Bài tập
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleDownloadArticle(
                      previewLecture.title,
                      previewLecture.content ?? ""
                    )
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống
                </button>
              </div>

              {/* Article content */}
              <div className="max-w-2xl mx-auto px-6 py-6">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-0.5">
                        Bài tập thực hành
                      </p>
                      <h2 className="text-base font-bold text-slate-800">
                        {previewLecture.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {previewLecture.content ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {previewLecture.content}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Bài tập này chưa có nội dung</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                                <button
                                  onClick={() =>
                                    setPreviewLecture({
                                      title: lecture.title,
                                      type: lecture.type?.toUpperCase() === "ARTICLE"
                                        ? "ARTICLE"
                                        : "VIDEO",
                                      videoUrl: lecture.videoUrl ?? undefined,
                                      content: (lecture as any).content ?? undefined,
                                    })
                                  }
                                  className="text-primary text-sm underline hover:text-primary/80 transition-colors"
                                >
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
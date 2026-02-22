import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { courses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Rating } from "@/components/Rating";
import { toast } from "@/hooks/use-toast";
import {
  BookOpen,
  Heart,
  Settings,
  MessageSquare,
  Play,
  Clock,
  Award,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentPath = location.pathname;
  const isMyLearning =
    currentPath === "/dashboard" || currentPath === "/dashboard/my-learning";
  const isWishlist = currentPath === "/dashboard/wishlist";
  const isSettings = currentPath === "/dashboard/settings";

  // Mock enrolled courses with progress
  const enrolledCourses = courses.slice(0, 4).map((course, index) => ({
    ...course,
    progress: [30, 65, 90, 10][index],
    lastAccessed: ["2 giờ trước", "Hôm qua", "3 ngày trước", "1 tuần trước"][
      index
    ],
  }));

  const handleRemoveFromWishlist = (
    e: React.MouseEvent,
    courseId: string,
    courseTitle: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(courseId);
    toast({
      title: "Đã bỏ yêu thích",
      description: `${courseTitle} đã được xóa khỏi danh sách yêu thích.`,
    });
  };

  const navItems = [
    { label: "Khóa học của tôi", path: "/dashboard", icon: BookOpen },
    { label: "Danh sách yêu thích", path: "/dashboard/wishlist", icon: Heart },
    { label: "Tin nhắn", path: "/dashboard/messages", icon: MessageSquare },
    { label: "Cài đặt tài khoản", path: "/dashboard/settings", icon: Settings },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value * 25000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-2">
              <div className="flex items-center gap-3 mb-6 p-4 bg-secondary rounded-lg">
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  }
                  alt={user?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.username}
                  </p>
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPath === item.path ||
                    (item.path === "/dashboard" &&
                      currentPath === "/dashboard/my-learning")
                      ? "bg-udemy-purple-light text-primary font-medium"
                      : "hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Nav */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    currentPath === item.path
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Khóa học của tôi */}
            {isMyLearning && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Khóa học của tôi</h1>

                {enrolledCourses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {enrolledCourses.map((course) => (
                      <Link
                        key={course.id}
                        to={`/course/${course.id}/learn`}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-course-hover transition-shadow group"
                      >
                        <div className="relative h-40">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-primary fill-primary" />
                            </div>
                          </div>
                          {course.progress === 100 && (
                            <div className="absolute top-2 right-2 bg-udemy-green text-background px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Hoàn thành
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <Progress
                            value={course.progress}
                            className="h-2 mb-2"
                          />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Hoàn thành {course.progress}%</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {course.lastAccessed}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary rounded-lg">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      Bắt đầu học ngay!
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Khi bạn đăng ký khóa học, nó sẽ xuất hiện tại đây.
                    </p>
                    <Link
                      to="/"
                      className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-udemy-purple-dark transition-colors"
                    >
                      Khám phá khóa học
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Danh sách yêu thích */}
            {isWishlist && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Danh sách yêu thích</h1>

                {wishlist.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((course) => (
                      <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-course-hover transition-shadow group relative"
                      >
                        <div className="relative">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-36 object-cover"
                          />
                          <button
                            onClick={(e) =>
                              handleRemoveFromWishlist(
                                e,
                                course.id,
                                course.title,
                              )
                            }
                            className="absolute top-2 right-2 w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center transition-colors"
                            title="Bỏ yêu thích"
                          >
                            <Heart className="w-5 h-5 text-primary fill-primary" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {course.instructor}
                          </p>
                          <Rating
                            rating={course.rating}
                            reviewCount={course.reviewCount}
                            size="sm"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold">
                              {formatCurrency(course.price)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(course.originalPrice)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary rounded-lg">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      Danh sách yêu thích trống
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Lưu các khóa học bạn quan tâm bằng cách nhấn biểu tượng
                      trái tim.
                    </p>
                    <Link
                      to="/"
                      className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-udemy-purple-dark transition-colors"
                    >
                      Khám phá khóa học
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Cài đặt */}
            {isSettings && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>

                <div className="max-w-2xl space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Hồ sơ cá nhân
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={
                          user?.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                        }
                        alt={user?.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <button className="text-primary font-semibold hover:underline">
                          Đổi ảnh đại diện
                        </button>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG hoặc GIF. Tối đa 2MB
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Họ
                          </label>
                          <input
                            type="text"
                            defaultValue={
                              user?.name?.split(" ").slice(0, -1).join(" ") ||
                              ""
                            }
                            placeholder="Nguyễn Văn"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Tên
                          </label>
                          <input
                            type="text"
                            defaultValue={user?.name?.split(" ").pop() || ""}
                            placeholder="A"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.username}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          placeholder="0912345678"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Giới thiệu bản thân
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Viết vài dòng về bản thân bạn..."
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                      <button className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-udemy-purple-dark transition-colors">
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Bảo mật</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-udemy-purple-dark transition-colors">
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Liên kết tài khoản
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            G
                          </div>
                          <span>Google</span>
                        </div>
                        <button className="text-primary font-medium hover:underline text-sm">
                          Liên kết
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            F
                          </div>
                          <span>Facebook</span>
                        </div>
                        <button className="text-primary font-medium hover:underline text-sm">
                          Liên kết
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Thông báo</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="accent-primary w-4 h-4"
                        />
                        <span>Nhận email khi có cập nhật khóa học</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="accent-primary w-4 h-4"
                        />
                        <span>Nhận email khuyến mãi</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="accent-primary w-4 h-4"
                        />
                        <span>Thông báo qua trình duyệt</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-primary w-4 h-4"
                        />
                        <span>Nhận bản tin hàng tuần</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-card border border-destructive rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-destructive mb-2">
                      Xóa tài khoản
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh
                      viễn và không thể khôi phục.
                    </p>
                    <button className="px-4 py-2 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/10 transition-colors">
                      Xóa tài khoản
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

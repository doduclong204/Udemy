import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import { setUser } from "@/redux/slices/authSlice";
import {
  markOneAsRead,
  markAllAsRead,
  removeOne,
  clearUnread,
  fetchNotifications,
  selectUnreadCount,
  selectNotifications,
} from "@/redux/slices/notificationSlice";
import {
  fetchEnrolledCount,
  selectEnrolledCount,
} from "@/redux/slices/enrollmentSlice";
import { Progress } from "@/components/ui/progress";
import { AppPagination } from "@/components/AppPagination";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import enrollmentService from "@/services/enrollmentService";
import userNotificationService from "@/services/userNotificationService";
import userService from "@/services/userService";
import uploadService from "@/services/uploadService";
import axiosInstance from "@/config/api";
import { API_ENDPOINTS } from "@/constant/common.constant";
import type {
  EnrollmentResponse,
  NotificationType,
  UserNotificationResponse,
  WishlistResponse,
  ApiResponse,
  ApiPagination,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Heart,
  Settings,
  Bell,
  Play,
  Clock,
  Award,
  Loader2,
  Camera,
  Info,
  CheckCircle,
  X,
  Check,
} from "lucide-react";

type NotifPrefKey = "courseUpdates" | "promotions" | "browser" | "newsletter";
type NotifPrefs = Record<NotifPrefKey, boolean>;

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  courseUpdates: true,
  promotions: true,
  browser: true,
  newsletter: false,
};

const ENROLLMENT_PAGE_SIZE = 6;
const WISHLIST_PAGE_SIZE = 6;
const NOTIF_PAGE_SIZE = 10;

const getIconStyle = (type: NotificationType) => {
  switch (type) {
    case "COURSE":
      return { icon: BookOpen, className: "text-primary bg-primary/10" };
    case "PROMOTION":
      return { icon: CheckCircle, className: "text-green-500 bg-green-500/10" };
    case "SYSTEM":
      return { icon: Info, className: "text-blue-500 bg-blue-500/10" };
    default:
      return { icon: Bell, className: "text-blue-500 bg-blue-500/10" };
  }
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
};

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    removeFromWishlist: ctxRemoveFromWishlist,
    refetch: refetchWishlistBadge,
  } = useWishlist();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const currentPath = location.pathname;
  const isMyLearning =
    currentPath === "/dashboard" || currentPath === "/dashboard/my-learning";
  const isWishlist = currentPath === "/dashboard/wishlist";
  const isNotifications = currentPath === "/dashboard/notifications";
  const isSettings = currentPath === "/dashboard/settings";

  const unreadCount = useSelector(selectUnreadCount);
  const reduxNotifications = useSelector(selectNotifications);
  const enrolledCount = useSelector(selectEnrolledCount);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [enrollmentTotalPages, setEnrollmentTotalPages] = useState(1);

  useEffect(() => {
    if (!isMyLearning) return;
    setLoadingEnrollments(true);
    enrollmentService
      .getMyEnrollments({
        page: enrollmentPage,
        pageSize: ENROLLMENT_PAGE_SIZE,
      })
      .then((res) => {
        setEnrollments(res.result);
        setEnrollmentTotalPages(
          Math.ceil(res.meta.total / ENROLLMENT_PAGE_SIZE) || 1,
        );
        dispatch(fetchEnrolledCount());
      })
      .catch(() => {})
      .finally(() => setLoadingEnrollments(false));
  }, [enrollmentPage, isMyLearning, dispatch]);

  useEffect(() => {
    setEnrollmentPage(1);
  }, [isMyLearning]);

  // ── Wishlist (server-side) ──────────────────────────────────────────
  const [wishlistItems, setWishlistItems] = useState<WishlistResponse[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [wishlistTotalPages, setWishlistTotalPages] = useState(1);
  const [wishlistTotal, setWishlistTotal] = useState(0);

  // Fetch total riêng để badge sidebar luôn đúng dù chưa vào tab wishlist
  useEffect(() => {
    axiosInstance
      .get<ApiResponse<ApiPagination<WishlistResponse>>>(
        API_ENDPOINTS.WISHLIST.BASE,
        {
          params: { page: 1, size: 1 },
        },
      )
      .then((res) => setWishlistTotal(res.data.data.meta.total))
      .catch(() => {});
  }, []);

  const fetchWishlistPage = (page: number) => {
    setLoadingWishlist(true);
    axiosInstance
      .get<ApiResponse<ApiPagination<WishlistResponse>>>(
        API_ENDPOINTS.WISHLIST.BASE,
        {
          params: { page, size: WISHLIST_PAGE_SIZE },
        },
      )
      .then((res) => {
        setWishlistItems(res.data.data.result);
        setWishlistTotal(res.data.data.meta.total);
        setWishlistTotalPages(
          Math.ceil(res.data.data.meta.total / WISHLIST_PAGE_SIZE) || 1,
        );
      })
      .catch(() => {})
      .finally(() => setLoadingWishlist(false));
  };

  useEffect(() => {
    if (!isWishlist) return;
    fetchWishlistPage(wishlistPage);
  }, [wishlistPage, isWishlist]);

  useEffect(() => {
    setWishlistPage(1);
  }, [isWishlist]);

  // ── Notification ────────────────────────────────────────────────────────
  // Root cause fix:
  //   Trang 1 → dùng reduxNotifications trực tiếp (SSE push vào Redux → UI cập nhật ngay)
  //   Trang 2+ → fetch server bình thường
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [notifTotal, setNotifTotal] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [serverNotifItems, setServerNotifItems] = useState<
    UserNotificationResponse[]
  >([]);

  // Trang 1: dùng Redux (realtime SSE); trang 2+: dùng server fetch
  const notifItems = notifPage === 1 ? reduxNotifications.slice(0, NOTIF_PAGE_SIZE) : serverNotifItems;

  const fetchNotifPage = (page: number) => {
    setLoadingNotifs(true);
    userNotificationService
      .getMyNotifications({ page, pageSize: NOTIF_PAGE_SIZE })
      .then((res) => {
        setNotifTotal(res.meta.total);
        setNotifTotalPages(Math.ceil(res.meta.total / NOTIF_PAGE_SIZE) || 1);
        if (page === 1) {
          // Trang 1: sync Redux để reduxNotifications + unreadCount chính xác
          dispatch(fetchNotifications());
        } else {
          setServerNotifItems(res.result);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingNotifs(false));
  };

  // Vào tab hoặc đổi trang → fetch để có total/totalPages + sync Redux trang 1
  useEffect(() => {
    if (!isNotifications) return;
    fetchNotifPage(notifPage);
  }, [notifPage, isNotifications]);

  // Reset về trang 1 khi vào tab
  useEffect(() => {
    if (isNotifications) setNotifPage(1);
  }, [isNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const target = notifItems.find((n) => n._id === id);
    if (!target || target.isRead) return;
    // Dispatch Redux → cập nhật reduxNotifications + unreadCount ngay (trang 1 hiển thị liền)
    dispatch(markOneAsRead(id));
    try {
      await userNotificationService.markAsRead(id);
      sonnerToast.success("Đã đánh dấu là đã đọc");
    } catch {
      dispatch(fetchNotifications());
      sonnerToast.error("Có lỗi xảy ra");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifItems.some((n) => !n.isRead)) return;
    dispatch(markAllAsRead());
    try {
      await userNotificationService.markAllAsRead();
      sonnerToast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      dispatch(fetchNotifications());
      sonnerToast.error("Có lỗi xảy ra");
    }
  };

  const handleRemoveNotif = async (id: string) => {
    // Optimistic: removeOne() trong slice tự trừ unreadCount nếu chưa đọc → không cần decrementUnread()
    dispatch(removeOne(id));
    const newTotal = Math.max(0, notifTotal - 1);
    setNotifTotal(newTotal);
    setNotifTotalPages(Math.ceil(newTotal / NOTIF_PAGE_SIZE) || 1);

    try {
      await userNotificationService.deleteNotification(id);
      sonnerToast.success("Đã xóa thông báo");
      if (notifPage === 1) {
        // Trang 1: Redux đã update, chỉ cần sync total từ server
        fetchNotifPage(1);
      } else if (serverNotifItems.length <= 1 && notifPage > 1) {
        // Xóa item cuối trang → lùi về trang trước
        setNotifPage((p) => p - 1);
      } else {
        fetchNotifPage(notifPage);
      }
    } catch {
      dispatch(fetchNotifications());
      if (notifPage > 1) fetchNotifPage(notifPage);
      sonnerToast.error("Có lỗi xảy ra");
    }
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Ảnh quá lớn",
        description: "Tối đa 2MB",
        variant: "destructive",
      });
      return;
    }
    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadService.uploadImage(file);
      const updated = await userService.updateProfile({ avatar: avatarUrl });
      dispatch(setUser(updated));
      toast({ title: "Đã cập nhật ảnh đại diện" });
    } catch {
      toast({ title: "Upload thất bại", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const currentPwRef = useRef<HTMLInputElement>(null);
  const newPwRef = useRef<HTMLInputElement>(null);
  const confirmPwRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => {
    try {
      const saved = localStorage.getItem("notif_prefs");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIF_PREFS;
    } catch {
      return DEFAULT_NOTIF_PREFS;
    }
  });

  const toggleNotifPref = (key: NotifPrefKey) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notif_prefs", JSON.stringify(next));
      return next;
    });
  };

  const handleSaveProfile = async () => {
    const firstName = firstNameRef.current?.value?.trim() ?? "";
    const lastName = lastNameRef.current?.value?.trim() ?? "";
    const name = `${firstName} ${lastName}`.trim();
    const phone = phoneRef.current?.value?.trim() ?? "";
    const bio = bioRef.current?.value?.trim() ?? "";
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile({ name, phone, bio });
      dispatch(setUser(updated));
      toast({
        title: "Đã lưu thay đổi",
        description: "Hồ sơ của bạn đã được cập nhật.",
      });
    } catch {
      toast({
        title: "Lưu thất bại",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = currentPwRef.current?.value ?? "";
    const newPassword = newPwRef.current?.value ?? "";
    const confirmPassword = confirmPwRef.current?.value ?? "";
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Vui lòng điền đầy đủ", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }
    setSavingPw(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast({ title: "Đổi mật khẩu thành công" });
      if (currentPwRef.current) currentPwRef.current.value = "";
      if (newPwRef.current) newPwRef.current.value = "";
      if (confirmPwRef.current) confirmPwRef.current.value = "";
    } catch (err: any) {
      toast({ title: err?.message ?? "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lockingAccount, setLockingAccount] = useState(false);

  const handleLockAccount = async () => {
    const userId = user?._id ?? user?.id;
    if (!userId) return;
    setLockingAccount(true);
    try {
      await userService.updateStudentStatus(userId, false);
      toast({
        title: "Tài khoản đã bị khóa",
        description: "Bạn sẽ được đăng xuất.",
      });
      setTimeout(() => logout(), 1500);
    } catch {
      toast({ title: "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setLockingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleRemoveFromWishlist = async (
    e: React.MouseEvent,
    courseId: string,
    title: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const remainingAfterDelete = wishlistItems.filter((c) => c.courseId !== courseId).length;
    // Optimistic update
    setWishlistItems((prev) => prev.filter((c) => c.courseId !== courseId));
    setWishlistTotal((t) => Math.max(0, t - 1));
    await ctxRemoveFromWishlist(courseId);
    refetchWishlistBadge();
    toast({ title: "Đã bỏ yêu thích", description: `${title} đã được xóa.` });
    // Nếu xóa hết trang hiện tại thì lùi 1 trang, ngược lại refetch trang này
    if (remainingAfterDelete === 0 && wishlistPage > 1) {
      setWishlistPage((p) => p - 1);
    } else {
      fetchWishlistPage(wishlistPage);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  const nameParts = user?.name?.split(" ") ?? [];
  const lastName = nameParts.at(-1) ?? "";
  const firstName = nameParts.slice(0, -1).join(" ");

  const navItems = [
    {
      label: "Khóa học của tôi",
      path: "/dashboard",
      icon: BookOpen,
      count: enrolledCount,
    },
    {
      label: "Danh sách yêu thích",
      path: "/dashboard/wishlist",
      icon: Heart,
      count: wishlistTotal,
    },
    {
      label: "Thông báo",
      path: "/dashboard/notifications",
      icon: Bell,
      count: unreadCount,
    },
    {
      label: "Cài đặt tài khoản",
      path: "/dashboard/settings",
      icon: Settings,
      count: 0,
    },
  ];

  const notifPrefItems: { key: NotifPrefKey; label: string }[] = [
    { key: "courseUpdates", label: "Nhận email khi có cập nhật khóa học" },
    { key: "promotions", label: "Nhận email khuyến mãi" },
    { key: "browser", label: "Thông báo qua trình duyệt" },
    { key: "newsletter", label: "Nhận bản tin hàng tuần" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-2">
              <div className="flex items-center gap-3 mb-6 p-4 bg-secondary rounded-lg">
                <img
                  src={
                    user?.avatar ||
                    "https://fptshop.com.vn/tin-tuc/thu-thuat/avatar-trang-154450"
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
                  {item.count > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
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
                  {item.count > 0 && (
                    <span className="bg-white text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {isMyLearning && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Khóa học của tôi</h1>
                {loadingEnrollments ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : enrollments.length > 0 ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {enrollments.map((e) => (
                        <Link
                          key={e._id}
                          to={`/course/${e.courseId}/learn`}
                          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-course-hover transition-shadow group"
                        >
                          <div className="relative h-44">
                            <img
                              src={e.courseThumbnail}
                              alt={e.courseTitle}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center">
                                <Play className="w-7 h-7 text-primary fill-primary" />
                              </div>
                            </div>
                            {e.status === "COMPLETED" && (
                              <div className="absolute top-2 right-2 bg-udemy-green text-background px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Hoàn thành
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                              {e.courseTitle}
                            </h3>
                            <Progress
                              value={Number(e.progress)}
                              className="h-2 mb-2"
                            />
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>
                                Hoàn thành {Math.round(Number(e.progress))}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(e.enrolledAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <AppPagination
                      page={enrollmentPage}
                      totalPages={enrollmentTotalPages}
                      onPageChange={(p) => {
                        setEnrollmentPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </>
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

            {isWishlist && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Danh sách yêu thích</h1>
                {loadingWishlist ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : wishlistItems.length > 0 ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {wishlistItems.map((item) => (
                        <Link
                          key={item._id}
                          to={`/course/${item.courseId}`}
                          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-course-hover transition-shadow group relative"
                        >
                          <div className="relative">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-44 object-cover"
                            />
                            <button
                              onClick={(e) =>
                                handleRemoveFromWishlist(
                                  e,
                                  item.courseId,
                                  item.title,
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
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold">
                                {formatCurrency(Number(item.price))}
                              </span>
                              {item.oldPrice > item.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(Number(item.oldPrice))}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <AppPagination
                      page={wishlistPage}
                      totalPages={wishlistTotalPages}
                      onPageChange={(p) => {
                        setWishlistPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </>
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

            {isNotifications && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold">Thông báo</h1>
                    {unreadCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {unreadCount} thông báo chưa đọc
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="hidden sm:flex"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Đánh dấu tất cả đã đọc
                    </Button>
                  )}
                </div>

                {loadingNotifs && notifItems.length === 0 ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : notifItems.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {notifItems.map((n) => {
                        const { icon: Icon, className } = getIconStyle(n.type);
                        return (
                          <div
                            key={n._id}
                            className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
                              !n.isRead ? "border-l-4 border-l-primary" : ""
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3
                                        className={`font-semibold ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}
                                      >
                                        {n.title}
                                      </h3>
                                      {!n.isRead && (
                                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {n.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {formatTime(n.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {!n.isRead && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(n._id)}
                                        className="h-8 w-8 p-0 hover:bg-primary/10"
                                        title="Đánh dấu đã đọc"
                                      >
                                        <Check className="w-4 h-4 text-primary" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveNotif(n._id)}
                                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                                      title="Xóa thông báo"
                                    >
                                      <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <AppPagination
                      page={notifPage}
                      totalPages={notifTotalPages}
                      onPageChange={(p) => {
                        setNotifPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </>
                ) : (
                  <div className="text-center py-16 bg-secondary rounded-lg">
                    <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      Chưa có thông báo
                    </h2>
                    <p className="text-muted-foreground">
                      Các thông báo từ khóa học và hệ thống sẽ xuất hiện tại
                      đây.
                    </p>
                  </div>
                )}
              </div>
            )}

            {isSettings && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>
                <div className="max-w-2xl space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Hồ sơ cá nhân
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img
                          src={
                            user?.avatar ||
                            "https://fptshop.com.vn/tin-tuc/thu-thuat/avatar-trang-154450"
                          }
                          alt={user?.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        {uploadingAvatar && (
                          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <button
                          onClick={handleAvatarClick}
                          disabled={uploadingAvatar}
                          className="flex items-center gap-2 text-primary font-semibold hover:underline disabled:opacity-60"
                        >
                          <Camera className="w-4 h-4" />
                          {uploadingAvatar
                            ? "Đang tải lên..."
                            : "Đổi ảnh đại diện"}
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
                            ref={firstNameRef}
                            type="text"
                            defaultValue={firstName}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Tên
                          </label>
                          <input
                            ref={lastNameRef}
                            type="text"
                            defaultValue={lastName}
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
                          disabled
                          className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Số điện thoại
                        </label>
                        <input
                          ref={phoneRef}
                          type="tel"
                          defaultValue={user?.phone ?? ""}
                          placeholder="0912345678"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ngày sinh
                        </label>
                        <input
                          ref={dobRef}
                          type="date"
                          defaultValue={user?.dateOfBirth ?? ""}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Giới thiệu bản thân
                        </label>
                        <textarea
                          ref={bioRef}
                          rows={3}
                          defaultValue={user?.bio ?? ""}
                          placeholder="Viết vài dòng về bản thân bạn..."
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-udemy-purple-dark transition-colors disabled:opacity-60 flex items-center gap-2"
                      >
                        {savingProfile && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>

                  {user?.provider?.toUpperCase() === "LOCAL" ||
                  !user?.provider ? (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h2 className="text-lg font-semibold mb-4">Bảo mật</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            ref={currentPwRef}
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
                            ref={newPwRef}
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
                            ref={confirmPwRef}
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <button
                          onClick={handleChangePassword}
                          disabled={savingPw}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-udemy-purple-dark transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                          {savingPw && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h2 className="text-lg font-semibold mb-4">Bảo mật</h2>
                      <p className="text-sm text-muted-foreground">
                        Tài khoản của bạn đăng nhập bằng{" "}
                        <span className="font-semibold">{user?.provider}</span>.
                        Vui lòng đổi mật khẩu trên nền tảng đó.
                      </p>
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Liên kết tài khoản
                    </h2>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Google",
                          color: "bg-red-500",
                          letter: "G",
                          provider: "GOOGLE",
                        },
                        {
                          label: "Facebook",
                          color: "bg-blue-600",
                          letter: "F",
                          provider: "FACEBOOK",
                        },
                      ].map((s) => {
                        const isLinked =
                          user?.provider?.toUpperCase() === s.provider;
                        return (
                          <div
                            key={s.label}
                            className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                              >
                                {s.letter}
                              </div>
                              <span>{s.label}</span>
                            </div>
                            {isLinked ? (
                              <span className="text-green-500 font-medium text-sm flex items-center gap-1">
                                <Check className="w-4 h-4" /> Đã liên kết
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  toast({
                                    title: "Tính năng đang phát triển",
                                    description: `Liên kết với ${s.label} sẽ sớm có.`,
                                  })
                                }
                                className="text-primary font-medium hover:underline text-sm"
                              >
                                Liên kết
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-card border border-destructive rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-destructive mb-2">
                      Khóa tài khoản
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tài khoản của bạn sẽ bị vô hiệu hóa và bạn sẽ không thể
                      đăng nhập cho đến khi được kích hoạt lại bởi quản trị
                      viên.
                    </p>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/10 transition-colors"
                      >
                        Khóa tài khoản
                      </button>
                    ) : (
                      <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4">
                        <p className="text-sm font-medium mb-3">
                          Bạn có chắc chắn muốn khóa tài khoản?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleLockAccount}
                            disabled={lockingAccount}
                            className="px-4 py-2 bg-destructive text-white rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                          >
                            {lockingAccount && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Xác nhận khóa
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
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
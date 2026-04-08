import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Heart,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { logoutAsync } from "@/redux/slices/authSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSettings } from "@/contexts/SettingsContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import categoryService from "@/services/categoryService";
import type { Category } from "@/types";
import { fetchEnrolledCount, selectEnrolledCount } from "@/redux/slices/enrollmentSlice";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSettings();
  const location = useLocation();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const isAdmin = useSelector(
    (state: RootState) =>
      !!state.auth.user?.role && state.auth.user.role.toUpperCase() === "ADMIN",
  );

  // Wishlist count từ WishlistContext (đã có sẵn)
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  // Enrollment count từ Redux slice mới
  const enrolledCount = useSelector(selectEnrolledCount);

  const { items } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    categoryService
      .getCategories({ pageSize: 10 })
      .then((res) => setCategories(res.result))
      .catch(() => {});
  }, []);

  // Fetch enrolled count khi login hoặc đổi trang
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchEnrolledCount());
    }
  }, [isAuthenticated, location.pathname, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  // Badge dùng chung — giống style notification (đỏ)
  const Badge = ({ count }: { count: number }) =>
    count > 0 ? (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            reloadDocument
            className="flex-shrink-0 flex items-center gap-2"
          >
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings?.siteName || "Logo"}
                className="h-28 w-auto object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {settings?.siteName || "LearnHub"}
              </span>
            )}
          </Link>

          {/* Categories Dropdown - Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden lg:flex">
              <Button variant="nav" className="gap-1">
                Danh mục
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <DropdownMenuItem key={category._id} asChild>
                  <Link
                    to={`/search?category=${category.name}`}
                    className="flex items-center gap-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl hidden md:block"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "#7c3aed" }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Quản trị</span>
              </Link>
            )}

            {isAuthenticated && (
              <>
                {/* Khóa học của tôi + badge */}
                <Link to="/dashboard" className="relative nav-link p-2">
                  <BookOpen className="w-5 h-5" />
                  <Badge count={enrolledCount} />
                </Link>

                {/* Wishlist + badge */}
                <Link to="/dashboard/wishlist" className="relative nav-link p-2">
                  <Heart className="w-5 h-5" />
                  <Badge count={wishlistCount} />
                </Link>

                {/* Notification (giữ nguyên) */}
                <NotificationDropdown />
              </>
            )}

            {/* Giỏ hàng + badge */}
            <Link to="/cart" className="relative nav-link p-2">
              <ShoppingCart className="w-5 h-5" />
              <Badge count={items.length} />
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary">
                    <img
                      src={
                        user?.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                      }
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.username}
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Khóa học của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/wishlist">Danh sách yêu thích</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/notifications">Thông báo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">Cài đặt tài khoản</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-login">
                  Đăng nhập
                </Link>
                <Link to="/signup" className="btn-signup">
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 animate-fade-in">
            <nav className="flex flex-col gap-3">
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg font-medium"
                  style={{ color: "#7c3aed" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Quản trị
                </Link>
              )}

              {/* Giỏ hàng mobile */}
              <Link
                to="/cart"
                className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Giỏ hàng</span>
                {items.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  {/* Khóa học mobile */}
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Khóa học của tôi</span>
                    {enrolledCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {enrolledCount > 99 ? "99+" : enrolledCount}
                      </span>
                    )}
                  </Link>

                  {/* Wishlist mobile */}
                  <Link
                    to="/dashboard/wishlist"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Danh sách yêu thích</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/dashboard/notifications"
                    className="px-4 py-2 hover:bg-secondary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Thông báo
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="px-4 py-2 hover:bg-secondary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cài đặt tài khoản
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-left text-destructive hover:bg-secondary rounded-lg"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Button variant="outline" asChild>
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Đăng ký</Link>
                  </Button>
                </div>
              )}

              <div className="border-t border-border pt-3 mt-2">
                <p className="px-4 py-2 font-semibold text-sm text-muted-foreground">
                  Danh mục
                </p>
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category._id}
                    to={`/search?category=${category.name}`}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
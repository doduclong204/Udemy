import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Heart,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { logoutAsync } from "@/redux/slices/authSlice";
import type { RootState, AppDispatch } from "@/redux/store"; // ← import AppDispatch ở đây
import { useCart } from "@/contexts/CartContext";
import { categories } from "@/data/mockData";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sử dụng AppDispatch để dispatch async thunk không lỗi TS
  const dispatch = useDispatch<AppDispatch>();

  // Lấy state từ Redux
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const isAdmin = useSelector(
    (state: RootState) =>
      !!state.auth.user?.role && state.auth.user.role.toUpperCase() === "ADMIN",
  );

  const { items } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Logout dùng Redux async thunk
  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary">LearnHub</span>
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
                <DropdownMenuItem key={category.id} asChild>
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
            {/* Admin Button - Only show when logged in as admin */}
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
                <Link to="/dashboard/wishlist" className="nav-link">
                  <Heart className="w-5 h-5" />
                </Link>
                <NotificationDropdown />
              </>
            )}

            <Link to="/cart" className="relative nav-link">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
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
                    </p>{" "}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Khóa học của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/wishlist">Danh sách yêu thích</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/messages">Tin nhắn</Link>
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
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Đăng ký</Link>
                </Button>
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
              {/* Admin link in mobile menu */}
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

              <Link
                to="/cart"
                className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Giỏ hàng ({items.length})
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 hover:bg-secondary rounded-lg"
                  >
                    Khóa học của tôi
                  </Link>
                  <Link
                    to="/dashboard/wishlist"
                    className="px-4 py-2 hover:bg-secondary rounded-lg"
                  >
                    Danh sách yêu thích
                  </Link>
                  <Link
                    to="/dashboard/messages"
                    className="px-4 py-2 hover:bg-secondary rounded-lg"
                  >
                    Tin nhắn
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="px-4 py-2 hover:bg-secondary rounded-lg"
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
                    key={category.id}
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

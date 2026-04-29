import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Ticket,
  Star,
  Settings,
  X,
  GraduationCap,
  FolderOpen,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/courses', icon: BookOpen, label: 'Khoá học', exact: false },
  { path: '/admin/categories', icon: FolderOpen, label: 'Danh mục', exact: false },
  { path: '/admin/students', icon: Users, label: 'Học viên', exact: false },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng', exact: false },
  { path: '/admin/coupons', icon: Ticket, label: 'Mã giảm giá', exact: false },
  { path: '/admin/notifications', icon: Bell, label: 'Thông báo', exact: false },
  { path: '/admin/reviews', icon: Star, label: 'Đánh giá', exact: false },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt', exact: false },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();

  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - fixed on all screens */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-admin-sidebar border-r border-admin-border z-50 transition-transform duration-300 w-64",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-admin-border">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-admin-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-admin-foreground">Admin Panel</span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-admin-accent rounded-lg"
          >
            <X className="w-5 h-5 text-admin-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  active 
                    ? "bg-admin-primary text-white shadow-lg shadow-admin-primary/25" 
                    : "text-admin-muted-foreground hover:bg-admin-accent hover:text-admin-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        
        {/* <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 rounded-lg bg-admin-accent/50 border border-admin-border">
            <p className="text-sm text-admin-muted-foreground">
              LongDucDo
            </p>
          </div>
        </div> */}
      </aside>
    </>
  );
}
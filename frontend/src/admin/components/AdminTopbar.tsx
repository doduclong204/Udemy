import { Menu, Bell, LogOut, Home } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-admin-card border-b border-admin-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-admin-accent rounded-lg"
        >
          <Menu className="w-6 h-6 text-admin-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-admin-foreground hidden sm:block">
          Quản trị hệ thống
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-admin-accent rounded-lg">
          <Bell className="w-5 h-5 text-admin-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-admin-primary rounded-full" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 hover:bg-admin-accent rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={admin?.avatar} />
                <AvatarFallback className="bg-admin-primary text-white">
                  {admin?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-admin-foreground">{admin?.name}</p>
                <p className="text-xs text-admin-muted-foreground">{admin?.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-2 cursor-pointer">
                <Home className="w-4 h-4" />
                Trang chủ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

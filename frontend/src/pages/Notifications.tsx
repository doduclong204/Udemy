import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Heart,
  Settings,
  Bell,
  Info,
  CheckCircle,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
}

// Mock notifications data
const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'course',
    title: 'Khóa học mới đã được thêm',
    message: 'Khóa học "React Pro" vừa được cập nhật với 5 bài giảng mới.',
    time: '2 giờ trước',
    read: false,
    icon: BookOpen,
  },
  {
    id: '2',
    type: 'system',
    title: 'Chào mừng bạn đến với LearnHub',
    message: 'Cảm ơn bạn đã đăng ký! Hãy bắt đầu khám phá các khóa học.',
    time: '1 ngày trước',
    read: false,
    icon: Info,
  },
  {
    id: '3',
    type: 'success',
    title: 'Thanh toán thành công',
    message: 'Bạn đã đăng ký thành công khóa học "JavaScript Nâng cao".',
    time: '3 ngày trước',
    read: true,
    icon: CheckCircle,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Khóa học sắp hết hạn',
    message: 'Khóa học "Python Cơ bản" của bạn sẽ hết hạn trong 7 ngày.',
    time: '5 ngày trước',
    read: true,
    icon: AlertCircle,
  },
];

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Khóa học của tôi', path: '/dashboard', icon: BookOpen },
    { label: 'Danh sách yêu thích', path: '/dashboard/wishlist', icon: Heart },
    { label: 'Tin nhắn', path: '/notifications', icon: Bell },
    { label: 'Cài đặt tài khoản', path: '/dashboard/settings', icon: Settings },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'text-primary bg-primary/10';
      case 'success':
        return 'text-green-500 bg-green-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'error':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    toast.success('Đã đánh dấu là đã đọc');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleRemove = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Đã xóa thông báo');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.path === '/notifications'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-secondary'
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
                    item.path === '/notifications'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Tin nhắn</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">{unreadCount} thông báo chưa đọc</p>
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
            
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                        <notification.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                title="Đánh dấu đã đọc"
                              >
                                <Check className="w-4 h-4 text-primary" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(notification.id)}
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
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-secondary rounded-lg">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Bạn chưa có tin nhắn nào</h2>
                <p className="text-muted-foreground mb-4">
                  Khi có thông báo mới, chúng sẽ xuất hiện tại đây.
                </p>
                <Link
                  to="/"
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Khám phá khóa học
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

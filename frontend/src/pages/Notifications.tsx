import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpen, Heart, Settings, Bell,
  Info, CheckCircle, X, Check, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import userNotificationService from '@/services/userNotificationService';
import {
  fetchNotifications,
  markOneAsRead,
  markAllAsRead,
  removeOne,
  clearOptimisticReadIds,
  selectUnreadCount,
  selectNotifications,
  selectNotiLoaded,
} from '@/redux/slices/notificationSlice';
import type { AppDispatch } from '@/redux/store';
import type { NotificationType } from '@/types';

const getIconStyle = (type: NotificationType) => {
  switch (type) {
    case 'COURSE':    return { icon: BookOpen,    className: 'text-primary bg-primary/10' };
    case 'PROMOTION': return { icon: CheckCircle, className: 'text-green-500 bg-green-500/10' };
    case 'SYSTEM':    return { icon: Info,        className: 'text-blue-500 bg-blue-500/10' };
    default:          return { icon: Bell,        className: 'text-blue-500 bg-blue-500/10' };
  }
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
};

const navItems = [
  { label: 'Khóa học của tôi',    path: '/dashboard',                icon: BookOpen },
  { label: 'Danh sách yêu thích', path: '/dashboard/wishlist',       icon: Heart },
  { label: 'Thông báo',           path: '/dashboard/notifications',  icon: Bell },
  { label: 'Cài đặt tài khoản',  path: '/dashboard/settings',       icon: Settings },
];

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const dispatch       = useDispatch<AppDispatch>();
  const unreadCount    = useSelector(selectUnreadCount);
  const notifications  = useSelector(selectNotifications);
  const loaded         = useSelector(selectNotiLoaded);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchNotifications()).then(() => {
      dispatch(clearOptimisticReadIds());
    });
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleMarkAsRead = async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;
    dispatch(markOneAsRead(id));
    try {
      await userNotificationService.markAsRead(id);
      toast.success('Đã đánh dấu là đã đọc');
    } catch {
      dispatch(fetchNotifications());
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some((n) => !n.isRead);
    if (!hasUnread) return;
    dispatch(markAllAsRead());
    try {
      await userNotificationService.markAllAsRead();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      dispatch(fetchNotifications());
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleRemove = async (id: string) => {
    dispatch(removeOne(id));
    try {
      await userNotificationService.deleteNotification(id);
      toast.success('Đã xóa thông báo');
    } catch {
      dispatch(fetchNotifications());
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-2">
              <div className="flex items-center gap-3 mb-6 p-4 bg-secondary rounded-lg">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user?.name} className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.username}</p>
                </div>
              </div>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.path === '/dashboard/notifications'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-secondary'
                  }`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.path === '/dashboard/notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    item.path === '/dashboard/notifications'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Thông báo</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">{unreadCount} thông báo chưa đọc</p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="hidden sm:flex">
                  <Check className="w-4 h-4 mr-2" />Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>

            {!loaded ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((n) => {
                  const { icon: Icon, className } = getIconStyle(n.type);
                  return (
                    <div key={n._id}
                      className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        !n.isRead ? 'border-l-4 border-l-primary' : ''
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {n.title}
                                </h3>
                                {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{formatTime(n.createdAt)}</p>
                              {(n.relatedType === 'COURSE_ANSWER' || n.relatedType === 'QUESTION') && n.relatedCourseId && (
                                <Link
                                  to={`/course/${n.relatedCourseId}/learn?tab=qa${n.relatedId ? `&questionId=${n.relatedId}` : ''}`}
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                  Xem câu hỏi →
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!n.isRead && (
                                <Button variant="ghost" size="sm"
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                  title="Đánh dấu đã đọc">
                                  <Check className="w-4 h-4 text-primary" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm"
                                onClick={() => handleRemove(n._id)}
                                className="h-8 w-8 p-0 hover:bg-red-500/10"
                                title="Xóa thông báo">
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
            ) : (
              <div className="text-center py-16 bg-secondary rounded-lg">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Chưa có thông báo nào</h2>
                <p className="text-muted-foreground mb-4">Khi có thông báo mới, chúng sẽ xuất hiện tại đây.</p>
                <Link to="/"
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
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
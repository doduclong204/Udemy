import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, Info, CheckCircle, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import userNotificationService from '@/services/userNotificationService';
import type { UserNotificationResponse, NotificationType } from '@/types';

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

export function NotificationDropdown() {
  const [isOpen, setIsOpen]         = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationResponse[]>([]);
  const [loading, setLoading]       = useState(false);

  // Fetch khi mở dropdown
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    userNotificationService
      .getMyNotifications({ pageSize: 7 })
      .then((res) => setNotifications(res.result))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative nav-link p-2">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 bg-card border border-border shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} chưa đọc</span>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => {
              const { icon: Icon, className } = getIconStyle(n.type);
              return (
                <div
                  key={n._id}
                  className={`p-3 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors ${
                    !n.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-medium truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
            </div>
          )}
        </div>

        {/* Footer — ✅ đúng route /dashboard/notifications */}
        <div className="p-3 border-t border-border">
          <Link
            to="/dashboard/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
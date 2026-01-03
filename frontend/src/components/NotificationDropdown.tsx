import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, Info, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Mock notifications data
const mockNotifications = [
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
    read: true,
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
    message: 'Khóa học "Python cơ bản" sẽ hết hạn trong 7 ngày.',
    time: '4 ngày trước',
    read: false,
    icon: AlertCircle,
  },
  {
    id: '5',
    type: 'course',
    title: 'Bài giảng mới',
    message: 'Bài giảng "Advanced Hooks" đã được thêm vào khóa học của bạn.',
    time: '5 ngày trước',
    read: true,
    icon: BookOpen,
  },
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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const displayedNotifications = mockNotifications.slice(0, 7);

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
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Thông báo</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                    <notification.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Bạn chưa có tin nhắn nào</p>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-border">
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Xem tất cả tin nhắn
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from 'react';
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2, Bell, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'course' | 'promo';
  target: 'all' | 'students' | 'new_users';
  status: 'sent' | 'draft';
  sentAt: string | null;
  createdAt: string;
  readCount: number;
  totalRecipients: number;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Khuyến mãi cuối năm 2024',
    message: 'Giảm 50% tất cả khóa học từ ngày 20-31/12. Đừng bỏ lỡ!',
    type: 'promo',
    target: 'all',
    status: 'sent',
    sentAt: '2024-12-15T10:00:00',
    createdAt: '2024-12-14T08:00:00',
    readCount: 1250,
    totalRecipients: 2500,
  },
  {
    id: '2',
    title: 'Khóa học mới: React Advanced',
    message: 'Khóa học React nâng cao đã được cập nhật với 20 bài giảng mới về hooks và performance.',
    type: 'course',
    target: 'students',
    status: 'sent',
    sentAt: '2024-12-10T14:30:00',
    createdAt: '2024-12-10T14:00:00',
    readCount: 890,
    totalRecipients: 1500,
  },
  {
    id: '3',
    title: 'Chào mừng thành viên mới',
    message: 'Cảm ơn bạn đã tham gia LearnHub! Khám phá 1000+ khóa học chất lượng.',
    type: 'info',
    target: 'new_users',
    status: 'sent',
    sentAt: '2024-12-08T09:00:00',
    createdAt: '2024-12-07T16:00:00',
    readCount: 320,
    totalRecipients: 400,
  },
  {
    id: '4',
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 ngày 20/12. Xin lỗi vì sự bất tiện.',
    type: 'warning',
    target: 'all',
    status: 'draft',
    sentAt: null,
    createdAt: '2024-12-16T10:00:00',
    readCount: 0,
    totalRecipients: 0,
  },
  {
    id: '5',
    title: 'Hoàn thành khóa học - Chứng chỉ',
    message: 'Chúc mừng! Bạn đã hoàn thành khóa học và nhận được chứng chỉ.',
    type: 'success',
    target: 'students',
    status: 'sent',
    sentAt: '2024-12-05T11:00:00',
    createdAt: '2024-12-05T10:30:00',
    readCount: 150,
    totalRecipients: 150,
  },
];

const typeLabels: Record<Notification['type'], string> = {
  info: 'Thông tin',
  success: 'Thành công',
  warning: 'Cảnh báo',
  course: 'Khóa học',
  promo: 'Khuyến mãi',
};

const targetLabels: Record<Notification['target'], string> = {
  all: 'Tất cả người dùng',
  students: 'Học viên đã đăng ký',
  new_users: 'Người dùng mới',
};

const statusLabels: Record<Notification['status'], string> = {
  sent: 'Đã gửi',
  draft: 'Bản nháp',
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Chưa gửi';
  return new Date(dateString).toLocaleString('vi-VN');
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    target: 'all' as Notification['target'],
  });
  const itemsPerPage = 10;

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAdd = (sendNow: boolean) => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    const newNotification: Notification = {
      id: String(Date.now()),
      title: formData.title,
      message: formData.message,
      type: formData.type,
      target: formData.target,
      status: sendNow ? 'sent' : 'draft',
      sentAt: sendNow ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      readCount: 0,
      totalRecipients: sendNow ? (formData.target === 'all' ? 2500 : formData.target === 'students' ? 1500 : 400) : 0,
    };

    setNotifications([newNotification, ...notifications]);
    setFormData({ title: '', message: '', type: 'info', target: 'all' });
    setIsAddDialogOpen(false);
    toast.success(sendNow ? 'Đã gửi thông báo!' : 'Đã lưu bản nháp!');
  };

  const handleEdit = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    setNotifications(notifications.map(n =>
      n.id === selectedNotification?.id
        ? { ...n, title: formData.title, message: formData.message, type: formData.type, target: formData.target }
        : n
    ));
    setIsEditDialogOpen(false);
    setSelectedNotification(null);
    toast.success('Cập nhật thông báo thành công!');
  };

  const handleSendDraft = (notification: Notification) => {
    setNotifications(notifications.map(n =>
      n.id === notification.id
        ? { 
            ...n, 
            status: 'sent' as const, 
            sentAt: new Date().toISOString(),
            totalRecipients: n.target === 'all' ? 2500 : n.target === 'students' ? 1500 : 400,
          }
        : n
    ));
    toast.success('Đã gửi thông báo!');
  };

  const handleDelete = () => {
    if (selectedNotification) {
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
      toast.success('Đã xóa thông báo!');
    }
  };

  const openViewDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      target: notification.target,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 text-green-500';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500';
      case 'course': return 'bg-blue-500/10 text-blue-500';
      case 'promo': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-500/10 text-green-500';
      case 'draft': return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Thông báo</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {notifications.length} thông báo</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({ title: '', message: '', type: 'info', target: 'all' });
            setIsAddDialogOpen(true);
          }} 
          className="bg-admin-primary hover:bg-admin-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-admin-foreground">{notifications.length}</p>
          <p className="text-sm text-admin-muted-foreground">Tổng thông báo</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-green-500">{notifications.filter(n => n.status === 'sent').length}</p>
          <p className="text-sm text-admin-muted-foreground">Đã gửi</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-400">{notifications.filter(n => n.status === 'draft').length}</p>
          <p className="text-sm text-admin-muted-foreground">Bản nháp</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-admin-foreground">
            {notifications.reduce((sum, n) => sum + n.readCount, 0).toLocaleString()}
          </p>
          <p className="text-sm text-admin-muted-foreground">Lượt đọc</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm thông báo..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-40 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="sent">Đã gửi</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <Bell className="w-16 h-16 text-admin-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-admin-foreground mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Không tìm thấy thông báo' : 'Chưa có thông báo nào'}
          </h2>
          <p className="text-admin-muted-foreground mb-6">
            {searchQuery || statusFilter !== 'all' ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách tạo thông báo đầu tiên'}
          </p>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-accent">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Thông báo</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden md:table-cell">Loại</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden lg:table-cell">Đối tượng</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden sm:table-cell">Trạng thái</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden lg:table-cell">Thống kê</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-admin-muted-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotifications.map((notification) => (
                  <tr key={notification.id} className="border-t border-admin-border hover:bg-admin-accent/50">
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-admin-foreground truncate">{notification.title}</p>
                        <p className="text-sm text-admin-muted-foreground truncate">{notification.message}</p>
                        <p className="text-xs text-admin-muted-foreground mt-1">{formatDateTime(notification.sentAt || notification.createdAt)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                        {typeLabels[notification.type]}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-admin-muted-foreground" />
                        <span className="text-sm text-admin-foreground">{targetLabels[notification.target]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                        {statusLabels[notification.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      {notification.status === 'sent' ? (
                        <div className="text-sm">
                          <p className="text-admin-foreground">{notification.readCount.toLocaleString()} / {notification.totalRecipients.toLocaleString()}</p>
                          <p className="text-xs text-admin-muted-foreground">
                            {Math.round((notification.readCount / notification.totalRecipients) * 100)}% đã đọc
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-admin-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openViewDialog(notification)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {notification.status === 'draft' && (
                              <>
                                <DropdownMenuItem onClick={() => openEditDialog(notification)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendDraft(notification)} className="text-green-400 hover:text-green-300">
                                  <Send className="w-4 h-4 mr-2" />
                                  Gửi ngay
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(notification)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-admin-border gap-4">
            <p className="text-sm text-admin-muted-foreground">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} / {filteredNotifications.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-admin-border text-admin-foreground hover:bg-admin-accent"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-admin-border text-admin-foreground hover:bg-admin-accent"
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[hsl(220,25%,14%)] border-[hsl(220,20%,30%)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Tiêu đề</p>
                <p className="text-white text-lg font-semibold">{selectedNotification.title}</p>
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Nội dung</p>
                <p className="text-white">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Loại</p>
                  <p className="text-white">{typeLabels[selectedNotification.type]}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Đối tượng</p>
                  <p className="text-white">{targetLabels[selectedNotification.target]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Trạng thái</p>
                  <p className="text-white">{statusLabels[selectedNotification.status]}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Thời gian gửi</p>
                  <p className="text-white">{formatDateTime(selectedNotification.sentAt)}</p>
                </div>
              </div>
              {selectedNotification.status === 'sent' && (
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Thống kê</p>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">Đã đọc</span>
                    <span className="text-white font-semibold">{selectedNotification.readCount.toLocaleString()} / {selectedNotification.totalRecipients.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-600/50 rounded-full h-2">
                    <div 
                      className="bg-admin-primary h-2 rounded-full transition-all"
                      style={{ width: `${(selectedNotification.readCount / selectedNotification.totalRecipients) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo thông báo mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin thông báo muốn gửi đến người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                placeholder="Nhập tiêu đề thông báo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung *</Label>
              <Textarea
                placeholder="Nhập nội dung thông báo..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white resize-none"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại thông báo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Notification['type'] })}>
                  <SelectTrigger className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Thông tin</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="promo">Khuyến mãi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Đối tượng</Label>
                <Select value={formData.target} onValueChange={(v) => setFormData({ ...formData, target: v as Notification['target'] })}>
                  <SelectTrigger className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    <SelectItem value="students">Học viên đã đăng ký</SelectItem>
                    <SelectItem value="new_users">Người dùng mới</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button variant="outline" onClick={() => handleAdd(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Lưu nháp
            </Button>
            <Button onClick={() => handleAdd(true)} className="bg-admin-primary hover:bg-admin-primary/90">
              <Send className="w-4 h-4 mr-2" />
              Gửi ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông báo</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin thông báo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                placeholder="Nhập tiêu đề thông báo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung *</Label>
              <Textarea
                placeholder="Nhập nội dung thông báo..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white resize-none"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại thông báo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Notification['type'] })}>
                  <SelectTrigger className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Thông tin</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="promo">Khuyến mãi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Đối tượng</Label>
                <Select value={formData.target} onValueChange={(v) => setFormData({ ...formData, target: v as Notification['target'] })}>
                  <SelectTrigger className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    <SelectItem value="students">Học viên đã đăng ký</SelectItem>
                    <SelectItem value="new_users">Người dùng mới</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button onClick={handleEdit} className="bg-admin-primary hover:bg-admin-primary/90">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo "{selectedNotification?.title}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

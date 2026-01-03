import { useState } from 'react';
import { Search, Download, Eye, MoreVertical, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { adminOrders, adminStudents, adminCourses } from '@/data/adminMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState(adminOrders);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof adminOrders[0] | null>(null);
  const [newOrder, setNewOrder] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    couponCode: '',
    status: 'Completed',
    paymentMethod: 'Thẻ tín dụng',
  });
  const [editOrder, setEditOrder] = useState({
    status: '',
    paymentMethod: '',
  });
  const itemsPerPage = 15;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Mã đơn', 'Học viên', 'Email', 'Khoá học', 'Số tiền', 'Phương thức', 'Trạng thái', 'Ngày tạo'];
    const csvData = filteredOrders.map(order => [
      order.id,
      order.studentName,
      order.studentEmail,
      order.courseTitle,
      order.amount,
      order.paymentMethod,
      order.status,
      formatDateTime(order.createdAt),
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Xuất CSV thành công!');
  };

  const handleAddOrder = () => {
    if (!newOrder.studentId || !newOrder.courseId || !newOrder.amount) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const student = adminStudents.find(s => s.id === newOrder.studentId);
    const course = adminCourses.find(c => c.id === newOrder.courseId);

    if (!student || !course) {
      toast.error('Không tìm thấy học viên hoặc khóa học!');
      return;
    }

    const order = {
      id: `ORD${String(orders.length + 1).padStart(5, '0')}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      courseId: course.id,
      courseTitle: course.title,
      amount: parseInt(newOrder.amount),
      originalPrice: course.price,
      discount: 0,
      couponCode: newOrder.couponCode || undefined,
      paymentMethod: newOrder.paymentMethod,
      status: newOrder.status as 'Completed' | 'Pending' | 'Refunded' | 'Failed',
      createdAt: new Date().toISOString(),
    };

    setOrders([order, ...orders]);
    setNewOrder({
      studentId: '',
      courseId: '',
      amount: '',
      couponCode: '',
      status: 'Completed',
      paymentMethod: 'Thẻ tín dụng',
    });
    setIsAddDialogOpen(false);
    toast.success('Thêm đơn hàng thành công!');
  };

  const handleViewOrder = (order: typeof adminOrders[0]) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (order: typeof adminOrders[0]) => {
    setSelectedOrder(order);
    setEditOrder({
      status: order.status,
      paymentMethod: order.paymentMethod,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, status: editOrder.status as any, paymentMethod: editOrder.paymentMethod }
          : o
      ));
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      toast.success('Cập nhật đơn hàng thành công!');
    }
  };

  const handleDeleteClick = (order: typeof adminOrders[0]) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedOrder) {
      setOrders(orders.filter(o => o.id !== selectedOrder.id));
      toast.success('Đã xóa đơn hàng!');
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleRefund = (orderId: string) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: 'Refunded' as const } : o
    ));
    toast.success('Đã hoàn tiền đơn hàng!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Đơn hàng</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {orders.length} đơn hàng</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-admin-primary hover:bg-admin-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Thêm đơn hàng
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="border-admin-border text-admin-foreground hover:bg-admin-accent">
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-admin-muted-foreground">Tổng doanh thu</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-admin-foreground">{orders.filter(o => o.status === 'Completed').length}</p>
          <p className="text-sm text-admin-muted-foreground">Đơn hoàn thành</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-500">{orders.filter(o => o.status === 'Pending').length}</p>
          <p className="text-sm text-admin-muted-foreground">Đang xử lý</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-red-500">{orders.filter(o => o.status === 'Refunded').length}</p>
          <p className="text-sm text-admin-muted-foreground">Hoàn tiền</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, tên học viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
              <SelectItem value="Pending">Đang xử lý</SelectItem>
              <SelectItem value="Refunded">Hoàn tiền</SelectItem>
              <SelectItem value="Failed">Thất bại</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-accent">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Mã đơn</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Học viên</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden lg:table-cell">Khoá học</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Số tiền</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden md:table-cell">Thanh toán</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Trạng thái</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden sm:table-cell">Ngày tạo</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-admin-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-t border-admin-border hover:bg-admin-accent/50">
                  <td className="py-4 px-4">
                    <span className="text-sm font-mono text-admin-primary">{order.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-admin-foreground truncate max-w-[120px]">{order.studentName}</p>
                      <p className="text-xs text-admin-muted-foreground truncate max-w-[120px]">{order.studentEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <p className="text-sm text-admin-muted-foreground truncate max-w-[200px]">{order.courseTitle}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">{formatCurrency(order.amount)}</p>
                      {order.couponCode && (
                        <p className="text-xs text-green-500">-{formatCurrency(order.discount)} ({order.couponCode})</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden md:table-cell">
                    {order.paymentMethod}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      order.status === 'Refunded' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {order.status === 'Completed' ? 'Hoàn thành' :
                       order.status === 'Pending' ? 'Đang xử lý' :
                       order.status === 'Refunded' ? 'Hoàn tiền' : 'Thất bại'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden sm:table-cell whitespace-nowrap">
                    {formatDateTime(order.createdAt)}
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
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(order)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          {order.status === 'Completed' && (
                            <DropdownMenuItem 
                              onClick={() => handleRefund(order.id)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Hoàn tiền
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(order)}
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
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} / {filteredOrders.length}
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

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-admin-card border-admin-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-admin-foreground">Thêm đơn hàng mới</DialogTitle>
            <DialogDescription className="text-admin-muted-foreground">
              Tạo đơn hàng thủ công cho học viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-admin-foreground">Học viên</Label>
              <Select value={newOrder.studentId} onValueChange={(value) => setNewOrder({ ...newOrder, studentId: value })}>
                <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                  <SelectValue placeholder="Chọn học viên" />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border max-h-60 z-[100]">
                  {adminStudents.slice(0, 20).map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-admin-foreground">Khóa học</Label>
              <Select value={newOrder.courseId} onValueChange={(value) => {
                const course = adminCourses.find(c => c.id === value);
                setNewOrder({ 
                  ...newOrder, 
                  courseId: value,
                  amount: course ? String(course.price) : ''
                });
              }}>
                <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border max-h-60 z-[100]">
                  {adminCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} - {formatCurrency(course.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-admin-foreground">Số tiền (VNĐ)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newOrder.amount}
                onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                className="bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-admin-foreground">Mã giảm giá (tùy chọn)</Label>
              <Input
                placeholder="VD: SALE50"
                value={newOrder.couponCode}
                onChange={(e) => setNewOrder({ ...newOrder, couponCode: e.target.value })}
                className="bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-admin-foreground">Phương thức thanh toán</Label>
                <Select value={newOrder.paymentMethod} onValueChange={(value) => setNewOrder({ ...newOrder, paymentMethod: value })}>
                  <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border z-[100]">
                    <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                    <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                    <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                    <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-admin-foreground">Trạng thái</Label>
                <Select value={newOrder.status} onValueChange={(value) => setNewOrder({ ...newOrder, status: value })}>
                  <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border z-[100]">
                    <SelectItem value="Completed">Hoàn thành</SelectItem>
                    <SelectItem value="Pending">Đang xử lý</SelectItem>
                    <SelectItem value="Failed">Thất bại</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-accent">
              Hủy
            </Button>
            <Button onClick={handleAddOrder} className="bg-admin-primary hover:bg-admin-primary/90">
              Tạo đơn hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-admin-card border-admin-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-admin-foreground">Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-admin-primary">{selectedOrder.id}</span>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  selectedOrder.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                  selectedOrder.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                  selectedOrder.status === 'Refunded' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {selectedOrder.status === 'Completed' ? 'Hoàn thành' :
                   selectedOrder.status === 'Pending' ? 'Đang xử lý' :
                   selectedOrder.status === 'Refunded' ? 'Hoàn tiền' : 'Thất bại'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Học viên</p>
                  <p className="text-sm font-medium text-white">{selectedOrder.studentName}</p>
                  <p className="text-xs text-slate-400">{selectedOrder.studentEmail}</p>
                </div>
                
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Khóa học</p>
                  <p className="text-sm font-medium text-white">{selectedOrder.courseTitle}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Số tiền</p>
                    <p className="text-lg font-semibold text-green-400">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Phương thức</p>
                    <p className="text-sm font-medium text-white">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Ngày tạo</p>
                  <p className="text-sm font-medium text-white">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                
                {selectedOrder.couponCode && (
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Mã giảm giá</p>
                    <p className="text-sm font-medium text-green-400">{selectedOrder.couponCode} (-{formatCurrency(selectedOrder.discount)})</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-accent">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-admin-card border-admin-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-admin-foreground">Chỉnh sửa đơn hàng</DialogTitle>
            <DialogDescription className="text-admin-muted-foreground">
              Cập nhật thông tin đơn hàng {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-admin-foreground">Trạng thái</Label>
              <Select value={editOrder.status} onValueChange={(value) => setEditOrder({ ...editOrder, status: value })}>
                <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border z-[100]">
                  <SelectItem value="Completed">Hoàn thành</SelectItem>
                  <SelectItem value="Pending">Đang xử lý</SelectItem>
                  <SelectItem value="Refunded">Hoàn tiền</SelectItem>
                  <SelectItem value="Failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-admin-foreground">Phương thức thanh toán</Label>
              <Select value={editOrder.paymentMethod} onValueChange={(value) => setEditOrder({ ...editOrder, paymentMethod: value })}>
                <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border z-[100]">
                  <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                  <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-accent">
              Hủy
            </Button>
            <Button onClick={handleEditOrder} className="bg-admin-primary hover:bg-admin-primary/90">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-admin-card border-admin-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-admin-foreground">Xác nhận xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription className="text-admin-muted-foreground">
              Bạn có chắc chắn muốn xóa đơn hàng "{selectedOrder?.id}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-accent">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
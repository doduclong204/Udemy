import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, Copy, Eye } from 'lucide-react';
import { adminCoupons } from '@/data/adminMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  usageLimit: number;
  usedCount: number;
  minOrder: number;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Used';
}

export default function AdminCoupons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coupons, setCoupons] = useState<Coupon[]>(adminCoupons);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    usageLimit: '',
    minOrder: '',
    expiresAt: '',
  });

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã giảm giá!');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount: '',
      type: 'percentage',
      usageLimit: '',
      minOrder: '',
      expiresAt: '',
    });
  };

  const handleCreateCoupon = () => {
    if (!formData.code || !formData.discount) {
      toast.error('Vui lòng nhập mã và mức giảm giá!');
      return;
    }

    const coupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: formData.code.toUpperCase(),
      discount: parseInt(formData.discount),
      type: formData.type as 'percentage' | 'fixed',
      usageLimit: parseInt(formData.usageLimit) || 100,
      usedCount: 0,
      minOrder: parseInt(formData.minOrder) || 0,
      expiresAt: formData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
    };
    
    setCoupons([coupon, ...coupons]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success('Tạo mã giảm giá thành công!');
  };

  const handleEditCoupon = () => {
    if (!formData.code || !formData.discount) {
      toast.error('Vui lòng nhập mã và mức giảm giá!');
      return;
    }

    setCoupons(coupons.map(c => 
      c.id === selectedCoupon?.id
        ? {
            ...c,
            code: formData.code.toUpperCase(),
            discount: parseInt(formData.discount),
            type: formData.type as 'percentage' | 'fixed',
            usageLimit: parseInt(formData.usageLimit) || 100,
            minOrder: parseInt(formData.minOrder) || 0,
            expiresAt: formData.expiresAt || c.expiresAt,
          }
        : c
    ));
    setIsEditDialogOpen(false);
    setSelectedCoupon(null);
    toast.success('Cập nhật mã giảm giá thành công!');
  };

  const handleDeleteCoupon = () => {
    if (selectedCoupon) {
      setCoupons(coupons.filter(c => c.id !== selectedCoupon.id));
      setIsDeleteDialogOpen(false);
      setSelectedCoupon(null);
      toast.success('Đã xoá mã giảm giá!');
    }
  };

  const openViewDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount: String(coupon.discount),
      type: coupon.type,
      usageLimit: String(coupon.usageLimit),
      minOrder: String(coupon.minOrder),
      expiresAt: coupon.expiresAt,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Mã giảm giá</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {coupons.length} mã giảm giá</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="bg-admin-primary hover:bg-admin-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã mới
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm mã giảm giá..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Active">Hoạt động</SelectItem>
              <SelectItem value="Expired">Hết hạn</SelectItem>
              <SelectItem value="Used">Đã dùng hết</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCoupons.map((coupon) => (
          <div 
            key={coupon.id} 
            className="bg-admin-card border border-admin-border rounded-xl p-6 relative overflow-hidden"
          >
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-admin-primary/5 rounded-full -translate-y-12 translate-x-12" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    coupon.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                    coupon.status === 'Expired' ? 'bg-red-500/10 text-red-500' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {coupon.status === 'Active' ? 'Hoạt động' :
                     coupon.status === 'Expired' ? 'Hết hạn' : 'Đã dùng hết'}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => openViewDialog(coupon)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyCode(coupon.code)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Sao chép
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(coupon)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(coupon)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xoá
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div 
                className="bg-admin-accent border-2 border-dashed border-admin-border rounded-lg p-4 mb-4 cursor-pointer hover:border-admin-primary transition-colors"
                onClick={() => handleCopyCode(coupon.code)}
              >
                <p className="text-center text-2xl font-bold text-admin-primary tracking-wider">
                  {coupon.code}
                </p>
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-admin-foreground">
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : formatCurrency(coupon.discount)}
                </span>
                <p className="text-sm text-admin-muted-foreground">Giảm giá</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-admin-muted-foreground">Đã sử dụng</span>
                  <span className="text-admin-foreground font-medium">{coupon.usedCount} / {coupon.usageLimit}</span>
                </div>
                <div className="w-full bg-admin-accent rounded-full h-2">
                  <div 
                    className="bg-admin-primary h-2 rounded-full transition-all"
                    style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-admin-muted-foreground">Đơn tối thiểu</span>
                  <span className="text-admin-foreground">{formatCurrency(coupon.minOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-admin-muted-foreground">Hết hạn</span>
                  <span className="text-admin-foreground">{coupon.expiresAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredCoupons.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-admin-card border border-admin-border rounded-xl gap-4">
          <p className="text-sm text-admin-muted-foreground">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} / {filteredCoupons.length}
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
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[hsl(220,25%,14%)] border-[hsl(220,20%,30%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Chi tiết mã giảm giá</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4 py-4">
              <div className="text-center p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg border-dashed">
                <p className="text-3xl font-bold text-admin-primary">{selectedCoupon.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Mức giảm</p>
                  <p className="text-white text-lg font-semibold">
                    {selectedCoupon.type === 'percentage' ? `${selectedCoupon.discount}%` : formatCurrency(selectedCoupon.discount)}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Loại</p>
                  <p className="text-white">{selectedCoupon.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Đã sử dụng</p>
                  <p className="text-white">{selectedCoupon.usedCount} / {selectedCoupon.usageLimit}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Đơn tối thiểu</p>
                  <p className="text-white">{formatCurrency(selectedCoupon.minOrder)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Hết hạn</p>
                  <p className="text-white">{selectedCoupon.expiresAt}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Trạng thái</p>
                  <p className={`font-medium ${
                    selectedCoupon.status === 'Active' ? 'text-green-400' :
                    selectedCoupon.status === 'Expired' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {selectedCoupon.status === 'Active' ? 'Hoạt động' :
                     selectedCoupon.status === 'Expired' ? 'Hết hạn' : 'Đã dùng hết'}
                  </p>
                </div>
              </div>
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
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo mã giảm giá mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin mã giảm giá
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Mã giảm giá *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: SUMMER25"
                className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giảm giá *</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="VD: 25"
                  className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
                />
              </div>
              <div>
                <Label>Loại</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giới hạn sử dụng</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="VD: 100"
                  className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
                />
              </div>
              <div>
                <Label>Đơn tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  placeholder="VD: 500000"
                  className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
                />
              </div>
            </div>
            <div>
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button
              onClick={handleCreateCoupon}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              Tạo mã giảm giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mã giảm giá</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin mã giảm giá
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Mã giảm giá *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: SUMMER25"
                className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giảm giá *</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="VD: 25"
                  className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
                />
              </div>
              <div>
                <Label>Loại</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giới hạn sử dụng</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="VD: 100"
                  className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
                />
              </div>
              <div>
                <Label>Đơn tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  placeholder="VD: 500000"
                  className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
                />
              </div>
            </div>
            <div>
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-1.5 bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button
              onClick={handleEditCoupon}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá "{selectedCoupon?.code}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCoupon} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Search, MoreVertical, Eye } from 'lucide-react';
import categoryService from '@/services/categoryService';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const iconOptions = ['💻', '🎨', '📊', '🎵', '📸', '✏️', '📱', '🎬', '💼', '🏋️', '🗣️', '🔬'];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💻',
  });
  const itemsPerPage = 10;

  // Server-side filtered & paginated
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCategories = categories;

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getCategories({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchQuery || undefined,
      });

      // categoryService returns ApiPagination<Category>
      setCategories(res.result);
      setTotalItems(res.meta.total);
    } catch (err) {
      console.error('Fetch categories error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories();
    }, 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAddCategory = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    (async () => {
      try {
        await categoryService.createCategory({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        setFormData({ name: '', description: '', icon: '💻' });
        setIsAddDialogOpen(false);
        toast.success('Thêm danh mục thành công!');
        fetchCategories();
      } catch (err: any) {
        console.error('Create category error', err);
        const message = err?.message || err?.response?.data?.message || 'Thêm danh mục thất bại';
        toast.error(message);
      }
    })();
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '💻',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditCategory = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    (async () => {
      try {
        if (!selectedCategory) return;
        await categoryService.updateCategory(selectedCategory._id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        toast.success('Cập nhật danh mục thành công!');
        fetchCategories();
      } catch (err) {
        console.error(err);
        toast.error('Cập nhật thất bại');
      }
    })();
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    (async () => {
      if (!selectedCategory) return;
      try {
        await categoryService.deleteCategory(selectedCategory._id);
        toast.success('Đã xóa danh mục!');
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } catch (err) {
        console.error(err);
        toast.error('Xóa thất bại');
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý danh mục khóa học</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {totalItems} danh mục</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({ name: '', description: '', icon: '💻' });
            setIsAddDialogOpen(true);
          }} 
          className="bg-admin-primary hover:bg-admin-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục mới
        </Button>
      </div>

      {/* Search */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
          <Input
            placeholder="Tìm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
          />
        </div>
      </div>

      {paginatedCategories.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <FolderOpen className="w-16 h-16 text-admin-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-admin-foreground mb-2">
            {searchQuery ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
          </h2>
          <p className="text-admin-muted-foreground mb-6">
            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách thêm danh mục đầu tiên cho khóa học của bạn'}
          </p>
          {!searchQuery && (
            <Button 
              onClick={() => {
                setFormData({ name: '', description: '', icon: '💻' });
                setIsAddDialogOpen(true);
              }}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm danh mục đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden hidden md:block">
            <table className="w-full">
              <thead className="bg-admin-accent">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">STT</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Tên danh mục</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Slug</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Số khóa học</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-admin-muted-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category, index) => (
                  <tr key={category._id} className="border-t border-admin-border hover:bg-admin-accent/50">
                    <td className="py-4 px-4 text-sm text-admin-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <p className="font-medium text-admin-foreground">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-admin-muted-foreground line-clamp-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-admin-muted-foreground font-mono">{category.slug}</td>
                    <td className="py-4 px-4 text-sm text-admin-foreground">{category.totalCourses}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewCategory(category)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(category)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(category)}
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-admin-border gap-4">
              <p className="text-sm text-admin-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
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
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="border-admin-border text-admin-foreground hover:bg-admin-accent"
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {paginatedCategories.map((category, index) => (
              <div key={category._id} className="bg-admin-card border border-admin-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <p className="font-semibold text-admin-foreground">{category.name}</p>
                      <p className="text-sm text-admin-muted-foreground font-mono">{category.slug}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewCategory(category)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(category)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {category.description && (
                  <p className="text-sm text-admin-muted-foreground mt-2">{category.description}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-admin-border">
                  <span className="text-sm text-admin-foreground">{category.totalCourses} khóa học</span>
                  <span className="text-xs text-admin-muted-foreground">#{(currentPage - 1) * itemsPerPage + index + 1}</span>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            <div className="flex items-center justify-between p-4 bg-admin-card border border-admin-border rounded-xl">
              <p className="text-sm text-admin-muted-foreground">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
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
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="border-admin-border text-admin-foreground hover:bg-admin-accent"
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[hsl(220,25%,14%)] border-[hsl(220,20%,30%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Chi tiết danh mục</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{selectedCategory.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedCategory.name}</h3>
                  <p className="text-sm text-slate-400 font-mono">{selectedCategory.slug}</p>
                </div>
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Mô tả</p>
                <p className="text-white">{selectedCategory.description || 'Chưa có mô tả'}</p>
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Số khóa học</p>
                <p className="text-white font-semibold">{selectedCategory.totalCourses} khóa học</p>
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
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin danh mục khóa học
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên danh mục *</Label>
              <Input
                placeholder="Ví dụ: Lập trình Web"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea
                placeholder="Mô tả về danh mục này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon danh mục</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                      formData.icon === icon
                        ? 'border-primary bg-primary/20'
                        : 'border-[hsl(220,20%,28%)] hover:border-primary/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button onClick={handleAddCategory} className="bg-admin-primary hover:bg-admin-primary/90">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên danh mục *</Label>
              <Input
                placeholder="Ví dụ: Lập trình Web"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea
                placeholder="Mô tả về danh mục này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon danh mục</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                      formData.icon === icon
                        ? 'border-primary bg-primary/20'
                        : 'border-[hsl(220,20%,28%)] hover:border-primary/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button onClick={handleEditCategory} className="bg-admin-primary hover:bg-admin-primary/90">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.name}"? 
              Các khóa học sẽ không bị xóa mà chỉ mất liên kết danh mục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import {
  fetchAdminCoursesAsync,
  deleteAdminCourseAsync,
  selectAdminCourses,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesPagination,
} from '@/redux/slices/courseSlice';
import categoryService from '@/services/categoryService';
import { Category } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
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

// Helper: lấy id dù backend trả _id hay id
const getCourseId = (course: any): string => course._id || course.id || '';

// Placeholder image khi không có thumbnail (không cần internet)
const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-size='14' font-family='sans-serif'%3EKh%C3%B4ng c%C3%B3 %E1%BA%A3nh%3C/text%3E%3C/svg%3E`;

// Helper: map level enum backend → label tiếng Việt
const getLevelLabel = (level: string) => {
  switch (level) {
    case 'BASIC':        return 'Cơ bản';
    case 'INTERMEDIATE': return 'Trung cấp';
    case 'ADVANCED':     return 'Nâng cao';
    // fallback cho data cũ
    case 'Beginner':     return 'Cơ bản';
    case 'Intermediate': return 'Trung cấp';
    case 'Advanced':     return 'Nâng cao';
    default:             return level || 'Cơ bản';
  }
};

// Helper: màu badge level
const getLevelClass = (level: string) => {
  switch (level) {
    case 'ADVANCED':
    case 'Advanced':
      return 'bg-red-500/10 text-red-400';
    case 'INTERMEDIATE':
    case 'Intermediate':
      return 'bg-yellow-500/10 text-yellow-400';
    default:
      return 'bg-green-500/10 text-green-400';
  }
};

export default function AdminCourses() {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector(selectAdminCourses);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const pagination = useSelector(selectCoursesPagination);

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Load danh mục
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Không có token xác thực. Vui lòng đăng nhập lại.');
          return;
        }
        const res = await categoryService.getCategories({ page: 1, pageSize: 100 });
        setCategories(res.result);
      } catch (err: any) {
        console.error('Failed to load categories', err);
        if (err.response?.status === 403) {
          toast.error('Bạn không có quyền truy cập tài nguyên này');
        }
      }
    };
    loadCategories();
  }, []);

  // Hiển thị lỗi
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Fetch courses khi filter/page thay đổi
  useEffect(() => {
    const params: any = { page: currentPage, pageSize: itemsPerPage };
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (levelFilter !== 'all') params.level = levelFilter;
    if (searchQuery) params.search = searchQuery;
    dispatch(fetchAdminCoursesAsync(params));
  }, [dispatch, currentPage, categoryFilter, levelFilter, searchQuery]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, levelFilter, searchQuery]);

  const totalItems = pagination.totalItems;
  const totalPages = pagination.totalPages;
  const showCountStart = totalItems === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const showCountEnd = Math.min(pagination.page * pagination.pageSize, totalItems);

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (course: any) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCourse) {
      try {
        await dispatch(deleteAdminCourseAsync(getCourseId(selectedCourse))).unwrap();
        toast.success('Đã xóa khóa học thành công!');
      } catch (err) {
        console.error('Delete course error', err);
        toast.error('Xóa thất bại');
      }
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Khoá học</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {totalItems} khoá học</p>
        </div>
        <Link to="/admin/courses/new">
          <Button className="bg-admin-primary hover:bg-admin-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Thêm khoá học mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khoá học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full md:w-40 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {/* ✅ Dùng enum đúng của backend */}
              <SelectItem value="BASIC">Cơ bản</SelectItem>
              <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
              <SelectItem value="ADVANCED">Nâng cao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="p-4 text-center text-admin-muted-foreground">Đang tải dữ liệu...</div>
      )}
      {error && !loading && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
          <p className="text-sm">{error}</p>
          <p className="text-xs text-red-300 mt-2">Vui lòng đảm bảo bạn đã đăng nhập với tài khoản ADMIN</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-accent">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Khoá học</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden lg:table-cell">Danh mục</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Giá</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden md:table-cell">Học viên</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden sm:table-cell">Cấp độ</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-admin-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: any) => {
                const courseId = getCourseId(course);
                return (
                  // ✅ key dùng _id hoặc id từ backend
                  <tr key={courseId} className="border-t border-admin-border hover:bg-admin-accent/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail || PLACEHOLDER_IMG}
                          alt={course.title}
                          className="w-16 h-10 object-cover rounded"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-admin-foreground truncate max-w-[200px] lg:max-w-[300px]">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {course.isBestseller && (
                              <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">Bán chạy</span>
                            )}
                            {(course.isFeatured || course.outstanding) && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-500 rounded">Nổi bật</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden lg:table-cell">
                      {course.category || course.categoryName || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-admin-foreground">
                          {formatCurrency(course.discountPrice || course.price || 0)}
                        </p>
                        {course.discountPrice && course.discountPrice !== course.price && (
                          <p className="text-xs text-admin-muted-foreground line-through">
                            {formatCurrency(course.price || 0)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-admin-foreground hidden md:table-cell">
                      {(course.students || course.totalStudents || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelClass(course.level)}`}>
                        {getLevelLabel(course.level)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/courses/${courseId}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(course)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-admin-border">
          <p className="text-sm text-admin-muted-foreground">
            {totalItems === 0 ? 'Không có dữ liệu' : `Hiển thị ${showCountStart} - ${showCountEnd} / ${totalItems}`}
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
              disabled={currentPage >= totalPages}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-admin-card border-admin-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-admin-foreground">Chi tiết khóa học</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              {/* Thumbnail */}
              {selectedCourse.thumbnail ? (
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                />
              ) : (
                <div className="w-full h-48 bg-admin-accent rounded-lg flex items-center justify-center">
                  <p className="text-admin-muted-foreground text-sm">Chưa có ảnh</p>
                </div>
              )}

              {/* Title & subtitle */}
              <div>
                <h3 className="text-lg font-semibold text-admin-foreground">{selectedCourse.title}</h3>
                {(selectedCourse.subtitle || selectedCourse.smallDescription) && (
                  <p className="text-sm text-admin-muted-foreground mt-1">
                    {selectedCourse.subtitle || selectedCourse.smallDescription}
                  </p>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Danh mục</p>
                  <p className="text-sm font-medium text-admin-foreground">
                    {selectedCourse.category || selectedCourse.categoryName || '—'}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Trình độ</p>
                  <p className="text-sm font-medium text-admin-foreground">
                    {getLevelLabel(selectedCourse.level)}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Giá gốc</p>
                  <p className="text-sm font-medium text-admin-foreground line-through">
                    {formatCurrency(selectedCourse.price || 0)}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Giá bán</p>
                  <p className="text-sm font-medium text-green-400">
                    {formatCurrency(selectedCourse.discountPrice || selectedCourse.price || 0)}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Học viên</p>
                  <p className="text-sm font-medium text-admin-foreground">
                    {(selectedCourse.students || selectedCourse.totalStudents || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Đánh giá</p>
                  <p className="text-sm font-medium text-admin-foreground">
                    {selectedCourse.rating ? `${selectedCourse.rating} ⭐` : '—'}
                  </p>
                </div>
              </div>

              {/* Badges - chỉ hiện khi có giá trị thật */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelClass(selectedCourse.level)}`}>
                  {getLevelLabel(selectedCourse.level)}
                </span>
                {selectedCourse.isBestseller === true && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Bán chạy</span>
                )}
                {(selectedCourse.isFeatured === true || selectedCourse.outstanding === true) && (
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">Nổi bật</span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-admin-card border-admin-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-admin-foreground">Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription className="text-admin-muted-foreground">
              Bạn có chắc chắn muốn xóa khóa học "{selectedCourse?.title}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-accent">Hủy</AlertDialogCancel>
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
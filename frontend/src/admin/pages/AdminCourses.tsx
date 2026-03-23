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
import courseService from '@/services/courseService';
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
  const [loadingDetail, setLoadingDetail] = useState(false);
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
        const res = await categoryService.getCategories({ page: 1, pageSize: 10 });
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
const showCountStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
const showCountEnd = Math.min(currentPage * itemsPerPage, totalItems);

  const handleViewCourse = async (course: any) => {
    setIsViewDialogOpen(true);
    setSelectedCourse(course); // hiện ngay data tóm tắt trước
    const id = getCourseId(course);
    if (!id) return;
    try {
      setLoadingDetail(true);
      const detail = await courseService.getCourseById(id);
      setSelectedCourse(detail);
    } catch {
      // giữ nguyên data tóm tắt nếu load detail thất bại
    } finally {
      setLoadingDetail(false);
    }
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
        setIsDeleteDialogOpen(false);
        setSelectedCourse(null);
      } catch (err: any) {
        console.error('Delete course error', err);
        const message = err?.message || err?.response?.data?.message || 'Xóa thất bại';
        toast.error(message);
      }
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
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => { setIsViewDialogOpen(open); if (!open) setSelectedCourse(null); }}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ background: '#0f1117', border: '1px solid #1e2230' }}
        >
          {/* Loading skeleton */}
          {loadingDetail && !selectedCourse && (
            <div className="flex items-center justify-center h-64" style={{ color: '#475569' }}>
              <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Đang tải...
            </div>
          )}

          {selectedCourse && (
            <>
              {/* Banner / Thumbnail full-width */}
              <div className="relative w-full h-52 overflow-hidden rounded-t-xl">
                <img
                  src={selectedCourse.banner || selectedCourse.thumbnail || PLACEHOLDER_IMG}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                />
                {/* gradient overlay phía dưới ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent" />
                {/* loading spinner overlay khi đang fetch detail */}
                {loadingDetail && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,17,23,0.5)' }}>
                    <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ color: '#6366f1' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="px-6 pb-6 pt-4 space-y-5">
                {/* Label + Title + badges */}
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#6366f1' }}
                  >
                    Chi tiết khóa học
                  </p>
                  <h3 className="text-xl font-bold leading-snug" style={{ color: '#f1f5f9' }}>
                    {selectedCourse.title}
                  </h3>
                  {(selectedCourse.smallDescription || selectedCourse.subtitle) && (
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                      {selectedCourse.smallDescription || selectedCourse.subtitle}
                    </p>
                  )}
                  {/* {selectedCourse.instructorName && (
                    <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#818cf8' }}>
                      <span>👤</span> {selectedCourse.instructorName}
                    </p>
                  )} */}

                  {/* Badges — đặt dưới title */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        border: '1px solid',
                        borderColor:
                          selectedCourse.level === 'ADVANCED' ? 'rgba(248,113,113,0.4)' :
                          selectedCourse.level === 'INTERMEDIATE' ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.4)',
                        background:
                          selectedCourse.level === 'ADVANCED' ? 'rgba(248,113,113,0.1)' :
                          selectedCourse.level === 'INTERMEDIATE' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)',
                        color:
                          selectedCourse.level === 'ADVANCED' ? '#f87171' :
                          selectedCourse.level === 'INTERMEDIATE' ? '#fbbf24' : '#4ade80',
                      }}
                    >
                      {getLevelLabel(selectedCourse.level)}
                    </span>
                    {(selectedCourse.isFeatured || selectedCourse.outstanding) && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: 'rgba(139,92,246,0.12)',
                          border: '1px solid rgba(139,92,246,0.35)',
                          color: '#c4b5fd',
                        }}
                      >
                        ✨ Nổi bật
                      </span>
                    )}
                    {selectedCourse.isBestseller && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: 'rgba(234,179,8,0.12)',
                          border: '1px solid rgba(234,179,8,0.35)',
                          color: '#fde68a',
                        }}
                      >
                        🔥 Bán chạy
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedCourse.description && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: '#161b27', border: '1px solid #1e2a3a' }}
                  >
                    <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: '#475569' }}>
                      Mô tả
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#cbd5e1' }}>
                      {selectedCourse.description}
                    </p>
                  </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Danh mục', value: selectedCourse.categoryName || selectedCourse.category || '—', icon: '🏷️' },
                    { label: 'Trình độ', value: getLevelLabel(selectedCourse.level), icon: '📊' },
                    { label: 'Giá gốc', value: formatCurrency(selectedCourse.price || 0), icon: '💰', strikethrough: true },
                    {
                      label: 'Giá bán',
                      value: selectedCourse.discountPrice
                        ? formatCurrency(selectedCourse.discountPrice)
                        : formatCurrency(selectedCourse.price || 0),
                      icon: '💸',
                      green: true,
                    },
                    {
                      label: 'Học viên',
                      value: (selectedCourse.totalStudents || selectedCourse.students || 0).toLocaleString(),
                      icon: '👥',
                    },
                    {
                      label: 'Đánh giá',
                      value: selectedCourse.rating
                        ? `${selectedCourse.rating} ⭐ (${(selectedCourse.ratingCount || 0).toLocaleString()})`
                        : '—',
                      icon: '⭐',
                    },
                    ...(selectedCourse.totalLectures != null ? [{ label: 'Bài giảng', value: `${selectedCourse.totalLectures} bài`, icon: '🎬' }] : []),
                    ...(selectedCourse.totalDuration != null ? [{
                      label: 'Thời lượng',
                      value: `${Math.floor(selectedCourse.totalDuration / 3600)}h ${Math.floor((selectedCourse.totalDuration % 3600) / 60)}m`,
                      icon: '⏱️',
                    }] : []),
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-3.5"
                      style={{
                        background: 'linear-gradient(135deg, #161b27 0%, #1a2035 100%)',
                        border: '1px solid #252d42',
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">{stat.icon}</span>
                        <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#475569' }}>
                          {stat.label}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${(stat as any).strikethrough ? 'line-through' : ''}`}
                        style={{ color: (stat as any).green ? '#4ade80' : '#e2e8f0' }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setIsViewDialogOpen(false)}
                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: '#1e2230', border: '1px solid #2d3550', color: '#94a3b8' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#252d42'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1e2230'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </>
          )}
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
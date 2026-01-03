import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { adminCourses } from '@/data/adminMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

export default function AdminCourses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState(adminCourses);
  const [selectedCourse, setSelectedCourse] = useState<typeof adminCourses[0] | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = [...new Set(courses.map(c => c.category))];

  const handleViewCourse = (course: typeof adminCourses[0]) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (course: typeof adminCourses[0]) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCourse) {
      setCourses(courses.filter(c => c.id !== selectedCourse.id));
      toast.success('Đã xóa khóa học thành công!');
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Khoá học</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {courses.length} khoá học</p>
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
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full md:w-40 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Beginner">Cơ bản</SelectItem>
              <SelectItem value="Intermediate">Trung cấp</SelectItem>
              <SelectItem value="Advanced">Nâng cao</SelectItem>
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
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Khoá học</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden lg:table-cell">Danh mục</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Giá</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden md:table-cell">Học viên</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden sm:table-cell">Cấp độ</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-admin-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map((course) => (
                <tr key={course.id} className="border-t border-admin-border hover:bg-admin-accent/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-admin-foreground truncate max-w-[200px] lg:max-w-[300px]">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {course.isBestseller && (
                            <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">Bán chạy</span>
                          )}
                          {course.isFeatured && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-500 rounded">Nổi bật</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden lg:table-cell">{course.category}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">
                        {formatCurrency(course.discountPrice || course.price)}
                      </p>
                      {course.discountPrice && (
                        <p className="text-xs text-admin-muted-foreground line-through">
                          {formatCurrency(course.price)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-foreground hidden md:table-cell">{course.students.toLocaleString()}</td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      course.level === 'Advanced' ? 'bg-red-500/10 text-red-400' :
                      course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {course.level === 'Advanced' ? 'Nâng cao' :
                       course.level === 'Intermediate' ? 'Trung cấp' : 'Cơ bản'}
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
                          <Link to={`/admin/courses/${course.id}/edit`}>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-admin-border">
          <p className="text-sm text-admin-muted-foreground">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCourses.length)} / {filteredCourses.length}
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

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-admin-card border-admin-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-admin-foreground">Chi tiết khóa học</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <img 
                src={selectedCourse.thumbnail} 
                alt={selectedCourse.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-admin-foreground">{selectedCourse.title}</h3>
                {selectedCourse.subtitle && (
                  <p className="text-sm text-admin-muted-foreground mt-1">{selectedCourse.subtitle}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Danh mục</p>
                  <p className="text-sm font-medium text-admin-foreground">{selectedCourse.category}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Trình độ</p>
                  <p className="text-sm font-medium text-admin-foreground">{selectedCourse.level || 'Chưa xác định'}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Giá bán</p>
                  <p className="text-sm font-medium text-green-400">{formatCurrency(selectedCourse.discountPrice || selectedCourse.price)}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-admin-muted-foreground">Học viên</p>
                  <p className="text-sm font-medium text-admin-foreground">{selectedCourse.students.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedCourse.level === 'Advanced' ? 'bg-red-500/20 text-red-400' :
                  selectedCourse.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {selectedCourse.level === 'Advanced' ? 'Nâng cao' :
                   selectedCourse.level === 'Intermediate' ? 'Trung cấp' : 'Cơ bản'}
                </span>
                {selectedCourse.isBestseller && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Bán chạy</span>
                )}
                {selectedCourse.isFeatured && (
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
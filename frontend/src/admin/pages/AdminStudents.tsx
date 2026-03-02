import { useEffect, useState } from 'react';
import { Search, Mail, MoreVertical, Eye, Ban, UserCheck, UserPlus, Edit, Trash2 } from 'lucide-react';
import userService from '@/services/userService';
import { Student } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

import { ROLE, RoleType } from '@/constant/common.constant';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};


export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // use constant roles


  const [newStudent, setNewStudent] = useState<{
    name: string;
    email: string;
    password: string;
    role: RoleType;
  }>({
    name: '',
    email: '',
    password: '',
    role: ROLE.USER,
  });
  
  const [editStudent, setEditStudent] = useState<{
    name: string;
    email: string;
    role: RoleType;
  }>({
    name: '',
    email: '',
    role: ROLE.USER,
  });
  const [emailContent, setEmailContent] = useState({
    subject: '',
    message: '',
  });
  const itemsPerPage = 15;

  // Server-side filtered & paginated
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStudents = students;

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getStudents({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      // userService returns ApiPagination<Student>
      setStudents(res.result);
      setTotalItems(res.meta.total);
    } catch (err) {
      console.error('Fetch students error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchStudents();
    }, 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    (async () => {
      try {
        await userService.createUser({
          name: newStudent.name,
          email: newStudent.email,
          password: newStudent.password,
          role: newStudent.role?.toString().toUpperCase(),
        });
        setNewStudent({ name: '', email: '', password: '', role: ROLE.USER });
        setIsAddDialogOpen(false);
        toast.success('Thêm học viên thành công!');
        fetchStudents();
      } catch (err: any) {
        console.error('Create user error', err);
        const message = err?.message || err?.response?.data?.message || 'Thêm học viên thất bại';
        toast.error(message);
      }
    })();
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setEditStudent({
      name: student.name,
      email: student.email,
      role: (student.role?.toString().toUpperCase() as RoleType) || ROLE.USER,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditStudent = () => {
    if (!editStudent.name.trim() || !editStudent.email.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    (async () => {
      try {
        if (!selectedStudent) return;
        await userService.updateUser(selectedStudent.id, {
          name: editStudent.name,
          email: editStudent.email,
          role: editStudent.role?.toString().toUpperCase(),
        });
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
        toast.success('Cập nhật học viên thành công!');
        fetchStudents();
      } catch (err) {
        console.error(err);
        toast.error('Cập nhật thất bại');
      }
    })();
  };

  const handleEmailClick = (student: Student) => {
    setSelectedStudent(student);
    setEmailContent({ subject: '', message: '' });
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!emailContent.subject.trim() || !emailContent.message.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }
    toast.success(`Đã gửi email đến ${selectedStudent?.email}!`);
    setIsEmailDialogOpen(false);
    setSelectedStudent(null);
    setEmailContent({ subject: '', message: '' });
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    (async () => {
      if (!selectedStudent) return;
      try {
        await userService.deleteStudent(selectedStudent.id);
        toast.success('Đã xóa học viên!');
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
        fetchStudents();
      } catch (err) {
        console.error(err);
        toast.error('Xóa thất bại');
      }
    })();
  };

  const handleToggleStatus = (studentId: string) => {
    (async () => {
      try {
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
        await userService.updateStudentStatus(studentId, newStatus as 'Active' | 'Inactive');
        toast.success('Đã cập nhật trạng thái học viên!');
        fetchStudents();
      } catch (err) {
        console.error(err);
        toast.error('Cập nhật trạng thái thất bại');
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Học viên</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {students.length} học viên đã đăng ký</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-admin-primary hover:bg-admin-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm học viên mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-admin-foreground">{students.length}</p>
          <p className="text-sm text-admin-muted-foreground">Tổng học viên</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-green-500">{students.filter(s => s.status === 'Active').length}</p>
          <p className="text-sm text-admin-muted-foreground">Đang hoạt động</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-admin-foreground">
            {formatCurrency(students.reduce((sum, s) => sum + s.totalSpent, 0))}
          </p>
          <p className="text-sm text-admin-muted-foreground">Tổng chi tiêu</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-xl p-4">
          <p className="text-2xl font-bold text-admin-foreground">
            {students.reduce((sum, s) => sum + s.enrolledCourses, 0)}
          </p>
          <p className="text-sm text-admin-muted-foreground">Lượt đăng ký</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Active">Hoạt động</SelectItem>
              <SelectItem value="Inactive">Không hoạt động</SelectItem>
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
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Học viên</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden md:table-cell">Khoá học</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden lg:table-cell">Chi tiêu</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground hidden sm:table-cell">Ngày tham gia</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-admin-muted-foreground">Trạng thái</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-admin-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="border-t border-admin-border hover:bg-admin-accent/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="bg-admin-primary text-white text-sm">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-admin-foreground truncate max-w-[150px]">{student.name}</p>
                        <p className="text-xs text-admin-muted-foreground truncate max-w-[150px]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div>
                      <p className="text-sm text-admin-foreground">{student.enrolledCourses} đăng ký</p>
                      <p className="text-xs text-admin-muted-foreground">{student.completedCourses} hoàn thành</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-admin-foreground hidden lg:table-cell">
                    {formatCurrency(student.totalSpent)}
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden sm:table-cell">
                    {formatDate(student.joinedAt)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      student.status === 'Active' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {student.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(student)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmailClick(student)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Gửi email
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(student.id)}
                            className={student.status === 'Active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}
                          >
                            {student.status === 'Active' ? (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Vô hiệu hoá
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Kích hoạt
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(student)}
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
              disabled={currentPage === totalPages}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm học viên mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin học viên mới vào form bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input
                placeholder="Nguyễn Văn A"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select value={newStudent.role} onValueChange={(value) => setNewStudent({ ...newStudent, role: value as RoleType })}>
                <SelectTrigger className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,20%,15%)] border-[hsl(220,20%,28%)] text-white z-[10000]">
                  <SelectItem value={ROLE.USER}>Học viên</SelectItem>
                  <SelectItem value={ROLE.ADMIN}>Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button onClick={handleAddStudent} className="bg-admin-primary hover:bg-admin-primary/90">
              Thêm học viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin học viên</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedStudent.avatar} />
                  <AvatarFallback className="bg-admin-primary text-white text-xl">
                    {selectedStudent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedStudent.name}</p>
                  <p className="text-sm text-[hsl(220,10%,65%)]">{selectedStudent.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    selectedStudent.status === 'Active' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {selectedStudent.status === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[hsl(220,20%,22%)] p-3 rounded-lg">
                  <p className="text-xs text-[hsl(220,10%,65%)]">Khóa học đăng ký</p>
                  <p className="text-lg font-semibold">{selectedStudent.enrolledCourses}</p>
                </div>
                <div className="bg-[hsl(220,20%,22%)] p-3 rounded-lg">
                  <p className="text-xs text-[hsl(220,10%,65%)]">Khóa học hoàn thành</p>
                  <p className="text-lg font-semibold">{selectedStudent.completedCourses}</p>
                </div>
                <div className="bg-[hsl(220,20%,22%)] p-3 rounded-lg">
                  <p className="text-xs text-[hsl(220,10%,65%)]">Tổng chi tiêu</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedStudent.totalSpent)}</p>
                </div>
                <div className="bg-[hsl(220,20%,22%)] p-3 rounded-lg">
                  <p className="text-xs text-[hsl(220,10%,65%)]">Ngày tham gia</p>
                  <p className="text-lg font-semibold">{formatDate(selectedStudent.joinedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học viên</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin học viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input
                placeholder="Nguyễn Văn A"
                value={editStudent.name}
                onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={editStudent.email}
                onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select value={editStudent.role} onValueChange={(value) => setEditStudent({ ...editStudent, role: value as RoleType })}>
                <SelectTrigger className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220,20%,15%)] border-[hsl(220,20%,28%)] text-white z-[10000]">
                  <SelectItem value={ROLE.USER}>Học viên</SelectItem>
                  <SelectItem value={ROLE.ADMIN}>Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button onClick={handleEditStudent} className="bg-admin-primary hover:bg-admin-primary/90">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gửi email cho học viên</DialogTitle>
            <DialogDescription>
              Gửi email đến: {selectedStudent?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                placeholder="Nhập tiêu đề email..."
                value={emailContent.subject}
                onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung</Label>
              <Textarea
                placeholder="Nhập nội dung email..."
                value={emailContent.message}
                onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                rows={6}
                className="bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
              Hủy
            </Button>
            <Button onClick={handleSendEmail} className="bg-admin-primary hover:bg-admin-primary/90">
              <Mail className="w-4 h-4 mr-2" />
              Gửi email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa học viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa học viên "{selectedStudent?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">
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
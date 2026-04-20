import { useEffect, useState, useRef } from "react";
import {
  Search, Mail, MoreVertical, Eye, Ban, UserCheck,
  UserPlus, Edit, Trash2, Phone, Calendar, BookOpen, Star, Upload,
  Users, Activity, Wallet,
} from "lucide-react";
import userService from "@/services/userService";
import notificationService from "@/services/notificationService";
import { Student, NotificationType, UserStats } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE, RoleType } from "@/constant/common.constant";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import uploadService from "@/services/uploadService";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: "SYSTEM", label: "Hệ thống" },
  { value: "COURSE", label: "Khoá học" },
  { value: "PROMOTION", label: "Khuyến mãi" },
];

const INPUT_CLS = "bg-[hsl(220,20%,18%)] border-[hsl(220,20%,28%)] text-white placeholder:text-[hsl(220,10%,45%)] focus:border-admin-primary focus:ring-admin-primary/20";
const LABEL_CLS = "text-[hsl(220,10%,70%)] text-xs font-semibold uppercase tracking-wider";

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [userStats, setUserStats] = useState<UserStats>({
    activeCount: 0,
    inactiveCount: 0,
    totalSpent: 0,
    enrolledCourses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotifDialogOpen, setIsNotifDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const isMounted = useRef(false);

  const [newStudent, setNewStudent] = useState<{ name: string; email: string; password: string; role: RoleType }>({
    name: "", email: "", password: "", role: ROLE.USER,
  });

  const [editStudent, setEditStudent] = useState<{
    name: string; role: RoleType; phone: string; bio: string; dateOfBirth: string; avatar: string;
  }>({ name: "", role: ROLE.USER, phone: "", bio: "", dateOfBirth: "", avatar: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [notifContent, setNotifContent] = useState<{ title: string; message: string; type: NotificationType }>({
    title: "", message: "", type: "SYSTEM",
  });

  const { refreshAdmin } = useAdminAuth();
  const itemsPerPage = 15;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchStudents = async (
    page = currentPage,
    search = searchQuery,
    status = statusFilter
  ) => {
    setIsLoading(true);
    try {
      const res = await userService.getStudents({
        page,
        pageSize: itemsPerPage,
        search: search || undefined,
        status: status === "all" ? undefined : status,
      });
      setStudents(res.result);
      setTotalItems(res.meta.total);
      if (res.stats) setUserStats(res.stats as unknown as UserStats);
    } catch (err) {
      console.error("Fetch students error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage, searchQuery, statusFilter);
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchStudents(1, searchQuery, statusFilter);
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin!"); return;
    }
    try {
      await userService.createUser({ name: newStudent.name, email: newStudent.email, password: newStudent.password, role: newStudent.role?.toString().toUpperCase() });
      setNewStudent({ name: "", email: "", password: "", role: ROLE.USER });
      setIsAddDialogOpen(false);
      toast.success("Thêm học viên thành công!");
      fetchStudents();
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.message || "Thêm học viên thất bại");
    }
  };

  const handleViewStudent = (student: Student) => { setSelectedStudent(student); setIsViewDialogOpen(true); };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setAvatarFile(null);
    setAvatarPreview(student.avatar || "");
    setEditStudent({
      name: student.name,
      role: (student.role?.toString().toUpperCase() as RoleType) || ROLE.USER,
      phone: (student as any).phone || "",
      bio: (student as any).bio || "",
      dateOfBirth: (student as any).dateOfBirth || "",
      avatar: student.avatar || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditStudent = async () => {
    if (!editStudent.name.trim()) { toast.error("Vui lòng điền đầy đủ thông tin!"); return; }
    try {
      if (!selectedStudent) return;
      let avatarUrl = editStudent.avatar;
      if (avatarFile) {
        avatarUrl = await uploadService.uploadImage(avatarFile);
      }
      await userService.updateUser(selectedStudent.id, {
        name: editStudent.name,
        role: editStudent.role?.toString().toUpperCase(),
        phone: editStudent.phone, bio: editStudent.bio,
        dateOfBirth: editStudent.dateOfBirth,
        avatar: avatarUrl,
      });
      setIsEditDialogOpen(false); setSelectedStudent(null); setAvatarFile(null);
      toast.success("Cập nhật học viên thành công!");
      await refreshAdmin();
      fetchStudents();
    } catch (err) { toast.error("Cập nhật thất bại"); }
  };

  const handleNotifClick = (student: Student) => {
    setSelectedStudent(student); setNotifContent({ title: "", message: "", type: "SYSTEM" }); setIsNotifDialogOpen(true);
  };

  const handleSendNotification = async () => {
    if (!notifContent.title.trim() || !notifContent.message.trim()) { toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!"); return; }
    if (!selectedStudent) return;
    setIsSending(true);
    try {
      const created = await notificationService.createNotification({
        type: notifContent.type, title: notifContent.title, message: notifContent.message,
        targetType: "SPECIFIC_USERS", targetUserIds: [selectedStudent.id], status: "DRAFT",
      });
      await notificationService.sendNotification(created._id);
      toast.success(`Đã gửi thông báo đến ${selectedStudent.name}!`);
      setIsNotifDialogOpen(false); setSelectedStudent(null); setNotifContent({ title: "", message: "", type: "SYSTEM" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi thông báo thất bại");
    } finally { setIsSending(false); }
  };

  const handleDeleteClick = (student: Student) => { setSelectedStudent(student); setIsDeleteDialogOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      await userService.deleteStudent(selectedStudent.id);
      toast.success("Đã xóa học viên!"); setIsDeleteDialogOpen(false); setSelectedStudent(null); fetchStudents();
    } catch { toast.error("Xóa thất bại"); }
  };

  const handleToggleStatus = async (studentId: string) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const newStatus = student.status === "Active" ? "Inactive" : "Active";
      await userService.updateStudentStatus(studentId, newStatus as "Active" | "Inactive");
      toast.success("Đã cập nhật trạng thái học viên!"); fetchStudents();
    } catch { toast.error("Cập nhật trạng thái thất bại"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Học viên</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {totalItems} học viên đã đăng ký</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-admin-primary hover:bg-admin-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />Thêm học viên mới
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng học viên",
            value: totalItems.toLocaleString(),
            color: "text-admin-foreground",
            icon: <Users className="w-5 h-5" />,
            iconBg: "rgba(99,102,241,0.15)",
            iconColor: "#818cf8",
          },
          {
            label: "Đang hoạt động",
            value: userStats.activeCount.toLocaleString(),
            color: "text-green-400",
            icon: <Activity className="w-5 h-5" />,
            iconBg: "rgba(34,197,94,0.15)",
            iconColor: "#4ade80",
          },
          {
            label: "Tổng chi tiêu",
            value: formatCurrency(userStats.totalSpent),
            color: "text-yellow-400",
            icon: <Wallet className="w-5 h-5" />,
            iconBg: "rgba(234,179,8,0.15)",
            iconColor: "#facc15",
          },
          {
            label: "Lượt đăng ký",
            value: userStats.enrolledCourses.toLocaleString(),
            color: "text-blue-400",
            icon: <BookOpen className="w-5 h-5" />,
            iconBg: "rgba(59,130,246,0.15)",
            iconColor: "#60a5fa",
          },
        ].map((card) => (
          <div key={card.label} className="bg-admin-card border border-admin-border rounded-xl p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div>
              <p className={`text-xl font-bold leading-tight ${card.color}`}>{card.value}</p>
              <p className="text-xs text-admin-muted-foreground mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input placeholder="Tìm theo tên hoặc email..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground" />
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
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-t border-admin-border animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-admin-accent" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-admin-accent rounded" />
                          <div className="h-2.5 w-32 bg-admin-accent rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell"><div className="h-3 w-16 bg-admin-accent rounded" /></td>
                    <td className="py-4 px-4 hidden lg:table-cell"><div className="h-3 w-20 bg-admin-accent rounded" /></td>
                    <td className="py-4 px-4 hidden sm:table-cell"><div className="h-3 w-16 bg-admin-accent rounded" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-admin-accent rounded-full" /></td>
                    <td className="py-4 px-4"><div className="h-6 w-6 bg-admin-accent rounded ml-auto" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-admin-muted-foreground text-sm">Không có học viên nào</td></tr>
              ) : students.map((student) => (
                <tr key={student.id} className="border-t border-admin-border hover:bg-admin-accent/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="bg-admin-primary text-white text-sm">{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-admin-foreground truncate max-w-[150px]">{student.name}</p>
                        <p className="text-xs text-admin-muted-foreground truncate max-w-[150px]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-sm text-admin-foreground">{student.enrolledCourses} đăng ký</p>
                    <p className="text-xs text-admin-muted-foreground">{student.completedCourses} hoàn thành</p>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-admin-foreground hidden lg:table-cell">{formatCurrency(student.totalSpent)}</td>
                  <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden sm:table-cell">{formatDate(student.joinedAt)}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${student.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-400"}`}>
                      {student.status === "Active" ? "Hoạt động" : "Không hoạt động"}
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
                          <DropdownMenuItem onClick={() => handleViewStudent(student)}><Eye className="w-4 h-4 mr-2" />Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(student)}><Edit className="w-4 h-4 mr-2" />Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleNotifClick(student)}><Mail className="w-4 h-4 mr-2" />Gửi thông báo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(student.id)} className={student.status === "Active" ? "text-yellow-400" : "text-green-400"}>
                            {student.status === "Active" ? <><Ban className="w-4 h-4 mr-2" />Vô hiệu hoá</> : <><UserCheck className="w-4 h-4 mr-2" />Kích hoạt</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(student)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4 mr-2" />Xóa
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
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-admin-border gap-4">
          <p className="text-sm text-admin-muted-foreground">
            Hiển thị {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-admin-border text-admin-foreground hover:bg-admin-accent">Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="border-admin-border text-admin-foreground hover:bg-admin-accent">Sau</Button>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md" style={{ background: '#0f1117', border: '1px solid #1e2230' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#f1f5f9' }}>Thêm học viên mới</DialogTitle>
            <DialogDescription style={{ color: '#64748b' }}>Nhập thông tin học viên mới vào form bên dưới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { label: "Họ và tên", key: "name", type: "text", placeholder: "Nguyễn Văn A" },
              { label: "Email", key: "email", type: "email", placeholder: "email@example.com" },
              { label: "Mật khẩu", key: "password", type: "password", placeholder: "••••••••" },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className={LABEL_CLS}>{f.label}</Label>
                <Input type={f.type} placeholder={f.placeholder} value={(newStudent as any)[f.key]}
                  onChange={e => setNewStudent({ ...newStudent, [f.key]: e.target.value })} className={INPUT_CLS} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className={LABEL_CLS}>Vai trò</Label>
              <Select value={newStudent.role} onValueChange={v => setNewStudent({ ...newStudent, role: v as RoleType })}>
                <SelectTrigger className={INPUT_CLS}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,20%,15%)] border-[hsl(220,20%,28%)] text-white z-[10000]">
                  <SelectItem value={ROLE.USER}>Học viên</SelectItem>
                  <SelectItem value={ROLE.ADMIN}>Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} style={{ background: '#1e2230', border: '1px solid #2d3550', color: '#94a3b8' }}>Hủy</Button>
            <Button onClick={handleAddStudent} className="bg-admin-primary hover:bg-admin-primary/90">Thêm học viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden [&::-webkit-scrollbar]:hidden" style={{ background: '#0f1117', border: '1px solid #1e2230' }}>
          {selectedStudent && (
            <>
              <div className="relative px-6 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #1a1f35 0%, #161b27 100%)', borderBottom: '1px solid #1e2230' }}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 ring-2 ring-admin-primary/40">
                      <AvatarImage src={selectedStudent.avatar} />
                      <AvatarFallback className="bg-admin-primary text-white text-xl">{selectedStudent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f1117] ${selectedStudent.status === "Active" ? "bg-green-500" : "bg-gray-500"}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>{selectedStudent.name}</h3>
                    <p className="text-sm flex items-center gap-1.5" style={{ color: '#64748b' }}>
                      <Mail className="w-3.5 h-3.5" />{selectedStudent.email}
                    </p>
                    {(selectedStudent as any).phone && (
                      <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: '#64748b' }}>
                        <Phone className="w-3.5 h-3.5" />{(selectedStudent as any).phone}
                      </p>
                    )}
                  </div>
                  <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${selectedStudent.status === "Active" ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-gray-500/15 text-gray-400 border border-gray-500/30"}`}>
                    {selectedStudent.status === "Active" ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </div>
                {(selectedStudent as any).bio && (
                  <p className="mt-3 text-sm italic" style={{ color: '#475569' }}>"{(selectedStudent as any).bio}"</p>
                )}
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: BookOpen, label: "Khóa học đăng ký", value: selectedStudent.enrolledCourses, color: '#818cf8' },
                    { icon: Star, label: "Khóa học hoàn thành", value: selectedStudent.completedCourses, color: '#4ade80' },
                    { icon: null, label: "Tổng chi tiêu", value: formatCurrency(selectedStudent.totalSpent), color: '#fbbf24' },
                    { icon: Calendar, label: "Ngày tham gia", value: formatDate(selectedStudent.joinedAt), color: '#94a3b8' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3.5" style={{ background: 'linear-gradient(135deg, #161b27 0%, #1a2035 100%)', border: '1px solid #252d42' }}>
                      <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#475569' }}>{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-5 flex justify-end">
                <button onClick={() => setIsViewDialogOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: '#1e2230', border: '1px solid #2d3550', color: '#94a3b8' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#252d42'; (e.currentTarget as HTMLElement).style.color = '#f1f5f9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1e2230'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                  Đóng
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:hidden" style={{ background: '#0f1117', border: '1px solid #1e2230' }}>
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #1e2230' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6366f1' }}>Chỉnh sửa học viên</p>
            <h3 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>{selectedStudent?.name}</h3>
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>Cập nhật thông tin tài khoản</p>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="w-20 h-20 ring-2 ring-admin-primary/30">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-admin-primary text-white text-2xl">{editStudent.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <p className={LABEL_CLS + " mb-2"}>Ảnh đại diện</p>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                    e.target.value = "";
                  }} />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-fit" style={{ background: '#161b27', border: '1px solid #252d42', color: '#94a3b8' }}>
                    <Upload className="w-4 h-4" />
                    {avatarFile ? avatarFile.name : "Chọn ảnh mới"}
                  </div>
                </label>
                {avatarFile && <p className="text-xs mt-1.5" style={{ color: '#4ade80' }}>✓ Đã chọn ảnh mới</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className={LABEL_CLS}>Họ và tên</Label>
                <Input placeholder="Nguyễn Văn A" value={editStudent.name}
                  onChange={e => setEditStudent({ ...editStudent, name: e.target.value })} className={INPUT_CLS} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className={LABEL_CLS}>Email</Label>
                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#161b27', border: '1px solid #1e2a3a', color: '#475569' }}>
                  {selectedStudent?.email}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={LABEL_CLS}>Số điện thoại</Label>
                <Input placeholder="0912345678" value={editStudent.phone}
                  onChange={e => setEditStudent({ ...editStudent, phone: e.target.value })} className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <Label className={LABEL_CLS}>Ngày sinh</Label>
                <Input type="date" value={editStudent.dateOfBirth}
                  onChange={e => setEditStudent({ ...editStudent, dateOfBirth: e.target.value })} className={INPUT_CLS} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className={LABEL_CLS}>Bio</Label>
                <Textarea placeholder="Giới thiệu bản thân..." value={editStudent.bio} rows={3}
                  onChange={e => setEditStudent({ ...editStudent, bio: e.target.value })} className={INPUT_CLS + " resize-none"} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className={LABEL_CLS}>Vai trò</Label>
                <Select value={editStudent.role} onValueChange={v => setEditStudent({ ...editStudent, role: v as RoleType })}>
                  <SelectTrigger className={INPUT_CLS}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[hsl(220,20%,15%)] border-[hsl(220,20%,28%)] text-white z-[10000]">
                    <SelectItem value={ROLE.USER}>Học viên</SelectItem>
                    <SelectItem value={ROLE.ADMIN}>Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setIsEditDialogOpen(false)}
                className="px-5 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#1e2230', border: '1px solid #2d3550', color: '#94a3b8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#252d42'; (e.currentTarget as HTMLElement).style.color = '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1e2230'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                Hủy
              </button>
              <button onClick={handleEditStudent}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#6366f1', color: '#fff', border: '1px solid #818cf8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4f46e5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#6366f1'; }}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={isNotifDialogOpen} onOpenChange={setIsNotifDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg" style={{ background: '#0f1117', border: '1px solid #1e2230' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#f1f5f9' }}>Gửi thông báo</DialogTitle>
            <DialogDescription style={{ color: '#64748b' }}>
              Gửi đến: <span className="font-medium text-white">{selectedStudent?.name}</span> ({selectedStudent?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className={LABEL_CLS}>Loại thông báo</Label>
              <Select value={notifContent.type} onValueChange={v => setNotifContent({ ...notifContent, type: v as NotificationType })}>
                <SelectTrigger className={INPUT_CLS}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(220,20%,15%)] border-[hsl(220,20%,28%)] text-white z-[10000]">
                  {NOTIFICATION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={LABEL_CLS}>Tiêu đề</Label>
              <Input placeholder="Nhập tiêu đề thông báo..." value={notifContent.title}
                onChange={e => setNotifContent({ ...notifContent, title: e.target.value })} className={INPUT_CLS} />
            </div>
            <div className="space-y-1.5">
              <Label className={LABEL_CLS}>Nội dung</Label>
              <Textarea placeholder="Nhập nội dung thông báo..." value={notifContent.message} rows={5}
                onChange={e => setNotifContent({ ...notifContent, message: e.target.value })} className={INPUT_CLS + " resize-none"} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifDialogOpen(false)} disabled={isSending} style={{ background: '#1e2230', border: '1px solid #2d3550', color: '#94a3b8' }}>Hủy</Button>
            <Button onClick={handleSendNotification} disabled={isSending} className="bg-admin-primary hover:bg-admin-primary/90">
              <Mail className="w-4 h-4 mr-2" />{isSending ? "Đang gửi..." : "Gửi thông báo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa học viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa học viên "{selectedStudent?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
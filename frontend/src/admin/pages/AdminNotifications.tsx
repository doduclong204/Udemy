import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Bell,
  Send,
  Users,
  User,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  FileText,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService from "@/services/notificationService";
import qaService from "@/services/qaService";
import {
  NotificationResponse,
  NotificationStatus,
  NotificationType,
  NotificationTarget,
  NotificationCreationRequest,
  NotificationStats,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "Chưa gửi";
  return new Date(dateString).toLocaleString("vi-VN");
};

const INPUT_CLASS =
  "bg-white border-[hsl(220,15%,87%)] text-gray-800 placeholder:text-gray-400 focus:border-[#6366f1] transition-colors";
const BTN_CANCEL =
  "border-[hsl(220,15%,80%)] text-gray-700 hover:bg-[hsl(220,15%,95%)]";
const DROPDOWN_BG =
  "bg-white border border-[hsl(220,15%,87%)] rounded-xl shadow-lg z-[9999]";
const ITEM_BASE =
  "w-full text-left px-3 py-2.5 text-sm transition-colors cursor-pointer rounded-lg";
const ITEM_DEFAULT = "text-gray-600 hover:bg-[hsl(220,15%,95%)] hover:text-gray-900";
const ITEM_SEL = "bg-[#6366f1]/10 text-[#6366f1] font-medium";

const isQuestionNotif = (n: NotificationResponse) =>
  n.relatedType === "QUESTION" || n.relatedType === "COURSE_QUESTION";

const TYPE_LABELS: Record<NotificationType, string> = {
  PROMOTION: "Khuyến mãi",
  COURSE: "Khóa học",
  SYSTEM: "Hệ thống",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  PROMOTION: "bg-purple-500/10 text-purple-400",
  COURSE: "bg-blue-500/10 text-blue-400",
  SYSTEM: "bg-gray-500/10 text-gray-400",
};

const TARGET_LABELS: Record<NotificationTarget, string> = {
  ALL: "Tất cả người dùng",
  ENROLLED: "Học viên đã đăng ký",
  NEW_USER: "Người dùng mới",
  SPECIFIC_USERS: "Người dùng cụ thể",
};

const STATUS_COLORS: Record<NotificationStatus, string> = {
  SENT: "bg-green-500/10 text-green-500",
  DRAFT: "bg-gray-500/10 text-gray-400",
};

const STATUS_LABELS: Record<NotificationStatus, string> = {
  SENT: "Đã gửi",
  DRAFT: "Bản nháp",
};

function TargetCell({ n }: { n: NotificationResponse }) {
  if (isQuestionNotif(n)) {
    return (
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-sm text-amber-400 font-medium">
          Câu hỏi học viên
        </span>
      </div>
    );
  }
  if (n.targetType === "SPECIFIC_USERS") {
    return (
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-admin-muted-foreground shrink-0" />
        <span className="text-sm text-admin-foreground">
          {TARGET_LABELS[n.targetType]}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-admin-muted-foreground shrink-0" />
      <span className="text-sm text-admin-foreground">
        {n.targetType ? (TARGET_LABELS[n.targetType] ?? n.targetType) : "-"}
      </span>
    </div>
  );
}

function StatsCell({ n }: { n: NotificationResponse }) {
  if (isQuestionNotif(n)) {
    return <span className="text-sm text-admin-muted-foreground">-</span>;
  }
  if (n.status === "SENT" && n.totalSent > 0) {
    return (
      <div className="text-sm">
        <p className="text-admin-foreground">
          {(n.totalRead ?? 0).toLocaleString()} / {n.totalSent.toLocaleString()}
        </p>
        <p className="text-xs text-admin-muted-foreground">
          {Math.round(((n.totalRead ?? 0) / n.totalSent) * 100)}% đã đọc
        </p>
      </div>
    );
  }
  return <span className="text-sm text-admin-muted-foreground">-</span>;
}

function CustomSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className={`absolute top-full mt-1.5 w-full p-1 ${DROPDOWN_BG}`}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`${ITEM_BASE} ${value === opt.value ? ITEM_SEL : ITEM_DEFAULT}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "PROMOTION", label: "Khuyến mãi" },
  { value: "COURSE", label: "Khóa học" },
  { value: "SYSTEM", label: "Hệ thống" },
];

const TARGET_OPTIONS: { value: NotificationTarget; label: string }[] = [
  { value: "ALL", label: "Tất cả người dùng" },
  { value: "ENROLLED", label: "Học viên đã đăng ký" },
  { value: "NEW_USER", label: "Người dùng mới" },
];

interface FormData {
  title: string;
  message: string;
  type: NotificationType;
  targetType: NotificationTarget;
}

interface NotificationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData, sendNow: boolean) => void;
  initialData?: FormData;
  isEdit?: boolean;
  isLoading?: boolean;
}

function NotificationFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit,
  isLoading,
}: NotificationFormDialogProps) {
  const [form, setForm] = useState<FormData>(
    initialData ?? {
      title: "",
      message: "",
      type: "SYSTEM",
      targetType: "ALL",
    },
  );

  useEffect(() => {
    if (open)
      setForm(
        initialData ?? {
          title: "",
          message: "",
          type: "SYSTEM",
          targetType: "ALL",
        },
      );
  }, [open]); // eslint-disable-line

  const set = (k: keyof FormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="admin-dialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">
            {isEdit ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit
              ? "Cập nhật nội dung thông báo bản nháp"
              : "Nhập thông tin thông báo gửi đến người dùng"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-800">
              Tiêu đề <span className="text-red-400">*</span>
            </Label>
            <Input
              placeholder="Nhập tiêu đề thông báo"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-800">
              Nội dung <span className="text-red-400">*</span>
            </Label>
            <Textarea
              placeholder="Nhập nội dung thông báo..."
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              className={`${INPUT_CLASS} resize-none`}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-800">Loại thông báo</Label>
              <CustomSelect<NotificationType>
                value={form.type}
                onChange={(v) => set("type", v)}
                options={TYPE_OPTIONS}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-800">Đối tượng</Label>
              <CustomSelect<NotificationTarget>
                value={form.targetType}
                onChange={(v) => set("targetType", v)}
                options={TARGET_OPTIONS}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className={BTN_CANCEL} disabled={isLoading}>
            Hủy
          </Button>
          {!isEdit && (
            <Button
              variant="outline"
              onClick={() => onSubmit(form, false)}
              className={BTN_CANCEL}
              disabled={isLoading}
            >
              Lưu nháp
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onSubmit(form, true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : (
              <><Send className="w-4 h-4 mr-2" />Gửi ngay</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [notifStats, setNotifStats] = useState<NotificationStats>({
    sentCount: 0,
    draftCount: 0,
    totalRead: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [answeredMap, setAnsweredMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchRef = useRef(searchQuery);
  searchRef.current = searchQuery;

  const fetchNotifications = async (
    page: number,
    search: string,
    status: NotificationStatus | "all",
  ) => {
    setIsLoading(true);
    try {
      const res = await notificationService.getAdminNotifications({
        page,
        pageSize: itemsPerPage,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      setNotifications(res.result);
      setTotalItems(res.meta.total);
      if (res.stats) setNotifStats(res.stats as unknown as NotificationStats);

      // Fetch answered status cho các notification loại QUESTION
      const questionNotifs = res.result.filter(
        (n) => isQuestionNotif(n) && n.relatedId
      );
      if (questionNotifs.length > 0) {
        const entries = await Promise.all(
          questionNotifs.map(async (n) => {
            const q = await qaService.getQuestionById(n.relatedId!);
            return [n.relatedId!, q?.answered ?? false] as [string, boolean];
          })
        );
        setAnsweredMap(Object.fromEntries(entries));
      } else {
        setAnsweredMap({});
      }
    } catch {
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(
      () => fetchNotifications(currentPage, searchRef.current, statusFilter),
      currentPage === 1 ? 350 : 0,
    );
    return () => clearTimeout(t);
  }, [currentPage, searchQuery, statusFilter]); // eslint-disable-line

  const handleFormSubmit = async (data: FormData, sendNow: boolean) => {
    if (!data.title.trim() || !data.message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: NotificationCreationRequest = {
        type: data.type,
        title: data.title,
        message: data.message,
        targetType: data.targetType,
        status: sendNow ? "SENT" : "DRAFT",
      };
      await notificationService.createNotification(payload);
      toast.success(sendNow ? "Đã gửi thông báo!" : "Đã lưu bản nháp!");
      setIsAddOpen(false);
      fetchNotifications(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo thông báo thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: FormData, _sendNow: boolean) => {
    if (!selected) return;
    if (!data.title.trim() || !data.message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
      return;
    }
    setIsSubmitting(true);
    try {
      await notificationService.updateNotification(selected._id, {
        type: data.type,
        title: data.title,
        message: data.message,
        targetType: data.targetType,
      });
      toast.success("Cập nhật thông báo thành công!");
      setIsEditOpen(false);
      setSelected(null);
      fetchNotifications(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendDraft = async (n: NotificationResponse) => {
    try {
      await notificationService.sendNotification(n._id);
      toast.success("Đã gửi thông báo!");
      fetchNotifications(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi thất bại");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    try {
      await notificationService.deleteNotification(selected._id);
      toast.success("Đã xóa thông báo!");
      setIsDeleteOpen(false);
      setSelected(null);
      // Nếu đang ở trang cuối và chỉ còn 1 item thì về trang trước
      const newTotal = totalItems - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      const targetPage = currentPage > newTotalPages && newTotalPages > 0
        ? newTotalPages
        : currentPage;
      setCurrentPage(targetPage);
      fetchNotifications(targetPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleReplyQuestion = (n: NotificationResponse) => {
    if (n.relatedCourseId) {
      navigate(`/course/${n.relatedCourseId}/learn?tab=qa${n.relatedId ? `&questionId=${n.relatedId}` : ''}`);
    }
  };

  const openView = (n: NotificationResponse) => { setSelected(n); setIsViewOpen(true); };
  const openEdit = (n: NotificationResponse) => { setSelected(n); setIsEditOpen(true); };
  const openDelete = (n: NotificationResponse) => { setSelected(n); setIsDeleteOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Thông báo</h1>
          <p className="text-admin-muted-foreground">Tổng cộng {totalItems} thông báo</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-admin-primary hover:bg-admin-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng thông báo",
            value: totalItems.toLocaleString(),
            color: "text-admin-foreground",
            icon: <Bell className="w-5 h-5" />,
            iconBg: "rgba(99,102,241,0.15)",
            iconColor: "#818cf8",
          },
          {
            label: "Đã gửi",
            value: notifStats.sentCount.toLocaleString(),
            color: "text-green-400",
            icon: <Send className="w-5 h-5" />,
            iconBg: "rgba(34,197,94,0.15)",
            iconColor: "#4ade80",
          },
          {
            label: "Bản nháp",
            value: notifStats.draftCount.toLocaleString(),
            color: "text-gray-400",
            icon: <FileText className="w-5 h-5" />,
            iconBg: "rgba(148,163,184,0.15)",
            iconColor: "#94a3b8",
          },
          {
            label: "Lượt đọc",
            value: notifStats.totalRead.toLocaleString(),
            color: "text-blue-400",
            icon: <BookOpen className="w-5 h-5" />,
            iconBg: "rgba(59,130,246,0.15)",
            iconColor: "#60a5fa",
          },
        ].map((s) => (
          <div key={s.label} className="bg-admin-card border border-admin-border rounded-xl p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.iconBg, color: s.iconColor }}
            >
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-bold leading-tight ${s.color}`}>{s.value}</p>
              <p className="text-xs text-admin-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm thông báo..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v as NotificationStatus | "all"); setCurrentPage(1); }}
            >
              <SelectTrigger className="bg-admin-accent border-admin-border text-admin-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[hsl(220,15%,87%)] text-gray-800 shadow-lg">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="SENT">Đã gửi</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!isLoading && notifications.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <Bell className="w-16 h-16 text-admin-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-admin-foreground mb-2">
            {searchQuery || statusFilter !== "all" ? "Không tìm thấy thông báo" : "Chưa có thông báo nào"}
          </h2>
          <p className="text-admin-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Thử tìm kiếm với từ khóa khác"
              : "Bắt đầu bằng cách tạo thông báo đầu tiên"}
          </p>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-accent">
                <tr>
                  {["Thông báo", "Loại", "Đối tượng", "Trạng thái", "Thống kê", "Hành động"].map((h, i) => (
                    <th
                      key={h}
                      className={`py-4 px-4 text-sm font-medium text-admin-muted-foreground
                        ${i === 5 ? "text-center" : i === 1 || i === 3 || i === 4 ? "text-center" : "text-left"}
                        ${i === 1 ? "hidden md:table-cell" : ""}
                        ${i === 2 ? "hidden lg:table-cell" : ""}
                        ${i === 3 ? "hidden sm:table-cell" : ""}
                        ${i === 4 ? "hidden lg:table-cell" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-admin-muted-foreground">
                      Đang tải...
                    </td>
                  </tr>
                ) : (
                  notifications.map((n) => (
                    <tr key={n._id} className="border-t border-admin-border hover:bg-admin-accent/50">
                      <td className="py-4 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-admin-foreground truncate">{n.title}</p>
                          <p className="text-sm text-admin-muted-foreground truncate">{n.message}</p>
                          <p className="text-xs text-admin-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[n.type]}`}>
                          {TYPE_LABELS[n.type]}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <TargetCell n={n} />
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell text-center">
                        {isQuestionNotif(n) ? (
                          answeredMap[n.relatedId ?? ""] ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400">
                              Đã trả lời
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400">
                              Chưa trả lời
                            </span>
                          )
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[n.status]}`}>
                            {STATUS_LABELS[n.status]}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell text-center">
                        <StatsCell n={n} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => openView(n)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {isQuestionNotif(n) && n.relatedCourseId && (
                                <DropdownMenuItem
                                  onClick={() => handleReplyQuestion(n)}
                                  className="text-amber-400 hover:text-amber-300"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Phản hồi câu hỏi
                                </DropdownMenuItem>
                              )}
                              {n.status === "DRAFT" && (
                                <>
                                  <DropdownMenuItem onClick={() => openEdit(n)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSendDraft(n)}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Gửi ngay
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => openDelete(n)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-admin-border gap-4">
            <p className="text-sm text-admin-muted-foreground">
              Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} –{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-admin-border text-admin-foreground hover:bg-admin-accent"
              >
                Trước
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="border-admin-border text-admin-foreground hover:bg-admin-accent"
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      <NotificationFormDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      <NotificationFormDialog
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelected(null); }}
        onSubmit={handleEditSubmit}
        initialData={selected ? {
          title: selected.title,
          message: selected.message,
          type: selected.type,
          targetType: selected.targetType,
        } : undefined}
        isEdit
        isLoading={isSubmitting}
      />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="bg-[hsl(220,15%,96%)] border border-[hsl(220,15%,87%)] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Tiêu đề</p>
                <p className="text-gray-900 text-lg font-semibold">{selected.title}</p>
              </div>
              <div className="bg-[hsl(220,15%,96%)] border border-[hsl(220,15%,87%)] p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Nội dung</p>
                <p className="text-gray-800">{selected.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Loại", value: TYPE_LABELS[selected.type] },
                  {
                    label: "Đối tượng",
                    value: isQuestionNotif(selected)
                      ? "Câu hỏi học viên"
                      : selected.targetType
                        ? (TARGET_LABELS[selected.targetType] ?? selected.targetType)
                        : "-",
                  },
                  {
                    label: "Trạng thái",
                    value: isQuestionNotif(selected)
                      ? answeredMap[selected.relatedId ?? ""] ? "Đã trả lời" : "Chưa trả lời"
                      : STATUS_LABELS[selected.status],
                  },
                  { label: "Ngày tạo", value: formatDateTime(selected.createdAt) },
                ].map((f) => (
                  <div key={f.label} className="bg-[hsl(220,15%,96%)] border border-[hsl(220,15%,87%)] p-3 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">{f.label}</p>
                    <p className="text-sm text-gray-800 font-medium">{f.value}</p>
                  </div>
                ))}
              </div>

              {!isQuestionNotif(selected) && selected.status === "SENT" && selected.totalSent > 0 && (
                <div className="bg-[hsl(220,15%,96%)] border border-[hsl(220,15%,87%)] p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Thống kê</p>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 text-sm">Đã đọc</span>
                    <span className="text-gray-800 font-semibold text-sm">
                      {(selected.totalRead ?? 0).toLocaleString()} / {selected.totalSent.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[hsl(220,15%,87%)] rounded-full h-2">
                    <div
                      className="bg-admin-primary h-2 rounded-full"
                      style={{ width: `${((selected.totalRead ?? 0) / selected.totalSent) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {isQuestionNotif(selected) && selected.relatedCourseId && (
                <Button
                  onClick={() => { handleReplyQuestion(selected); setIsViewOpen(false); }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Đi đến câu hỏi để phản hồi
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)} className={BTN_CANCEL}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800">Xác nhận xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bạn có chắc chắn muốn xóa thông báo "{selected?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={BTN_CANCEL}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
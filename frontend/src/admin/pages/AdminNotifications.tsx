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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService from "@/services/notificationService";
import {
  NotificationResponse,
  NotificationStatus,
  NotificationType,
  NotificationTarget,
  NotificationCreationRequest,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// ==================== Helpers ====================

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "Chưa gửi";
  return new Date(dateString).toLocaleString("vi-VN");
};

const INPUT_CLASS =
  "bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white placeholder:text-slate-500";
const BTN_CANCEL =
  "border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]";
const DROPDOWN_BG =
  "bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,28%)] rounded-lg shadow-xl z-[200]";
const ITEM_BASE =
  "w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer";
const ITEM_DEFAULT = "text-slate-300 hover:bg-[hsl(220,20%,25%)]";
const ITEM_SEL = "bg-admin-primary/20 text-white";

// Thông báo là câu hỏi từ học viên
const isQuestionNotif = (n: NotificationResponse) =>
  n.relatedType === "QUESTION" || n.relatedType === "COURSE_QUESTION";

// ==================== Label maps ====================

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

// ==================== Target Icon ====================

function TargetCell({ n }: { n: NotificationResponse }) {
  // Câu hỏi từ học viên — icon riêng + label riêng
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

  // Gửi đến user cụ thể
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

  // Các loại còn lại
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-admin-muted-foreground shrink-0" />
      <span className="text-sm text-admin-foreground">
        {n.targetType ? (TARGET_LABELS[n.targetType] ?? n.targetType) : "-"}
      </span>
    </div>
  );
}

// ==================== Stats Cell ====================

function StatsCell({ n }: { n: NotificationResponse }) {
  // Câu hỏi học viên → không hiện thống kê
  if (isQuestionNotif(n)) {
    return <span className="text-sm text-admin-muted-foreground">-</span>;
  }

  // Các loại khác (kể cả SPECIFIC_USERS) → hiện thống kê bình thường
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

// ==================== Custom Select ====================

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
        className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className={`absolute top-full mt-1 w-full ${DROPDOWN_BG}`}>
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

// ==================== Form Dialog ====================

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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="admin-dialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
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
            <Label className="text-white">
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
            <Label className="text-white">
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
              <Label className="text-white">Loại thông báo</Label>
              <CustomSelect<NotificationType>
                value={form.type}
                onChange={(v) => set("type", v)}
                options={TYPE_OPTIONS}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Đối tượng</Label>
              <CustomSelect<NotificationTarget>
                value={form.targetType}
                onChange={(v) => set("targetType", v)}
                options={TARGET_OPTIONS}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={BTN_CANCEL}
            disabled={isLoading}
          >
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
            {isLoading ? (
              "Đang xử lý..."
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Gửi ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Main Component ====================

export default function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = async (
    page = currentPage,
    search = searchQuery,
    status = statusFilter
  ) => {
    setIsLoading(true);
    try {
      const res = await notificationService.getAdminNotifications({
        page,
        pageSize: itemsPerPage,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });
      const filtered = res.result.filter((n) => n.relatedType !== "COURSE_ANSWER");
setNotifications(filtered);
setTotalItems(res.meta.total - (res.result.length - filtered.length));

      // Lấy danh sách questionId đã được trả lời qua COURSE_ANSWER notification
      try {
        const allRes = await notificationService.getAdminNotifications({
          page: 1,
          pageSize: 200,
        });
        const answered = new Set(
          allRes.result
            .filter((n) => n.relatedType === "COURSE_ANSWER" && n.relatedId)
            .map((n) => n.relatedId as string)
        );
        setAnsweredIds(answered);
      } catch {
        // ignore
      }
    } catch {
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage, searchQuery, statusFilter);
  }, [currentPage]); // eslint-disable-line
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchNotifications(1, searchQuery, statusFilter);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, statusFilter]); // eslint-disable-line

  const sentCount = notifications.filter((n) => n.status === "SENT").length;
  const draftCount = notifications.filter((n) => n.status === "DRAFT").length;
  const totalRead = notifications.reduce((s, n) => s + (n.totalRead ?? 0), 0);

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
      fetchNotifications(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleReplyQuestion = (n: NotificationResponse) => {
    if (n.relatedCourseId) {
      navigate(`/course/${n.relatedCourseId}/learn`, { state: { defaultTab: "qa" } });
    }
  };

  const openView = (n: NotificationResponse) => {
    setSelected(n);
    setIsViewOpen(true);
  };
  const openEdit = (n: NotificationResponse) => {
    setSelected(n);
    setIsEditOpen(true);
  };
  const openDelete = (n: NotificationResponse) => {
    setSelected(n);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">
            Quản lý Thông báo
          </h1>
          <p className="text-admin-muted-foreground">
            Tổng cộng {totalItems} thông báo
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-admin-primary hover:bg-admin-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng thông báo",
            value: totalItems,
            color: "text-admin-foreground",
          },
          { label: "Đã gửi", value: sentCount, color: "text-green-500" },
          { label: "Bản nháp", value: draftCount, color: "text-gray-400" },
          {
            label: "Lượt đọc",
            value: totalRead.toLocaleString(),
            color: "text-admin-foreground",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-admin-card border border-admin-border rounded-xl p-4"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-admin-muted-foreground">{s.label}</p>
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <CustomSelect<NotificationStatus | "all">
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "SENT", label: "Đã gửi" },
                { value: "DRAFT", label: "Bản nháp" },
              ]}
            />
          </div>
        </div>
      </div>

      {!isLoading && notifications.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <Bell className="w-16 h-16 text-admin-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-admin-foreground mb-2">
            {searchQuery || statusFilter !== "all"
              ? "Không tìm thấy thông báo"
              : "Chưa có thông báo nào"}
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
                  {[
                    "Thông báo",
                    "Loại",
                    "Đối tượng",
                    "Trạng thái",
                    "Thống kê",
                    "Hành động",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`py-4 px-4 text-sm font-medium text-admin-muted-foreground
                      ${i === 5 ? "text-right" : "text-left"}
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
                    <td
                      colSpan={6}
                      className="py-12 text-center text-admin-muted-foreground"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : (
                  notifications.map((n) => (
                    <tr
                      key={n._id}
                      className="border-t border-admin-border hover:bg-admin-accent/50"
                    >
                      <td className="py-4 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-admin-foreground truncate">
                            {n.title}
                          </p>
                          <p className="text-sm text-admin-muted-foreground truncate">
                            {n.message}
                          </p>
                          <p className="text-xs text-admin-muted-foreground mt-1">
                            {formatDateTime(n.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[n.type]}`}
                        >
                          {TYPE_LABELS[n.type]}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <TargetCell n={n} />
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        {isQuestionNotif(n) ? (
                          answeredIds.has(n.relatedId ?? '') ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400">
                              Đã trả lời
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400">
                              Chờ trả lời
                            </span>
                          )
                        ) : (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[n.status]}`}
                          >
                            {STATUS_LABELS[n.status]}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <StatsCell n={n} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
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
              Hiển thị{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-admin-border text-admin-foreground hover:bg-admin-accent"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
        onClose={() => {
          setIsEditOpen(false);
          setSelected(null);
        }}
        onSubmit={handleEditSubmit}
        initialData={
          selected
            ? {
                title: selected.title,
                message: selected.message,
                type: selected.type,
                targetType: selected.targetType,
              }
            : undefined
        }
        isEdit
        isLoading={isSubmitting}
      />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Tiêu đề</p>
                <p className="text-white text-lg font-semibold">
                  {selected.title}
                </p>
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Nội dung</p>
                <p className="text-white">{selected.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Loại", value: TYPE_LABELS[selected.type] },
                  {
                    label: "Đối tượng",
                    value: isQuestionNotif(selected)
                      ? "Câu hỏi học viên"
                      : selected.targetType
                        ? (TARGET_LABELS[selected.targetType] ??
                          selected.targetType)
                        : "-",
                  },
                  {
                    label: "Trạng thái",
                    value: isQuestionNotif(selected)
                      ? answeredIds.has(selected.relatedId ?? '')
                        ? "Đã trả lời"
                        : "Chờ trả lời"
                      : STATUS_LABELS[selected.status],
                  },
                  {
                    label: "Ngày tạo",
                    value: formatDateTime(selected.createdAt),
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg"
                  >
                    <p className="text-xs text-slate-400 mb-1">{f.label}</p>
                    <p className="text-sm text-white font-medium">{f.value}</p>
                  </div>
                ))}
              </div>

              {!isQuestionNotif(selected) &&
                selected.status === "SENT" &&
                selected.totalSent > 0 && (
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-2">Thống kê</p>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Đã đọc</span>
                      <span className="text-white font-semibold text-sm">
                        {(selected.totalRead ?? 0).toLocaleString()} /{" "}
                        {selected.totalSent.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                      <div
                        className="bg-admin-primary h-2 rounded-full"
                        style={{
                          width: `${((selected.totalRead ?? 0) / selected.totalSent) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

              {isQuestionNotif(selected) && selected.relatedCourseId && (
                <Button
                  onClick={() => {
                    handleReplyQuestion(selected);
                    setIsViewOpen(false);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Đi đến câu hỏi để phản hồi
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewOpen(false)}
              className={BTN_CANCEL}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Xác nhận xóa thông báo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bạn có chắc chắn muốn xóa thông báo "{selected?.title}"? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={BTN_CANCEL}>Hủy</AlertDialogCancel>
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
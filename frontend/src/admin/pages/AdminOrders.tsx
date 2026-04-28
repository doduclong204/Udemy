import { useEffect, useRef, useState } from "react";
import {
  Search,
  Download,
  Eye,
  MoreVertical,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  X,
  DollarSign,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import orderService from "@/services/orderService";
import userService from "@/services/userService";
import courseService from "@/services/courseService";
import {
  OrderResponse,
  OrderStatus,
  OrderStats,
  PaymentMethod,
  Student,
  AdminCourse,
} from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN");

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
  PENDING: {
    label: "Đang xử lý",
    className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  REFUNDED: {
    label: "Hoàn tiền",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  VNPAY: "VNPay",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản",
  PAYPAL: "PayPal",
};

const INPUT_CLASS =
  "bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white placeholder:text-slate-500 focus:border-[#6366f1] transition-colors";
const DROPDOWN_BG =
  "bg-[hsl(220,25%,10%)] border border-[hsl(220,20%,22%)] rounded-xl shadow-2xl";
const ITEM_BASE =
  "w-full text-left px-3 py-2.5 text-sm transition-colors cursor-pointer rounded-lg";
const ITEM_DEFAULT =
  "text-slate-300 hover:bg-[hsl(220,20%,20%)] hover:text-white";
const ITEM_SELECTED = "bg-[#6366f1]/20 text-white font-medium";

const DETAIL_BLOCK_STYLE = {
  background: "#161b27",
  border: "1px solid #1e2a3a",
};
const STAT_CARD_STYLE = {
  background: "linear-gradient(135deg,#161b27 0%,#1a2035 100%)",
  border: "1px solid #252d42",
};

const dialogBtnSecondary: React.CSSProperties = {
  background: "#1e2230",
  border: "1px solid #2d3550",
  color: "#94a3b8",
};
const dialogBtnPrimary: React.CSSProperties = {
  background: "#6366f1",
};

interface StudentComboboxProps {
  students: Student[];
  value: string;
  onChange: (id: string) => void;
}

function StudentCombobox({ students, value, onChange }: StudentComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = students.find((s) => s.id === value);
  const showDropdown = open && query.trim().length > 0;
  const filtered = showDropdown
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.email.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 3)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-text ${INPUT_CLASS}`}
      >
        <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none min-w-0"
          placeholder={
            selected ? selected.name : "Nhập tên hoặc email để tìm..."
          }
          value={open ? query : selected ? selected.name : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            if (value) setQuery("");
          }}
        />
      </div>
      {showDropdown && (
        <div
          className={`absolute top-full mt-1.5 w-full overflow-y-auto p-1 ${DROPDOWN_BG}`}
          style={{ maxHeight: "10rem", zIndex: 9999 }}
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500 text-center">
              Không tìm thấy học viên
            </p>
          ) : (
            <>
              {filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={() => handleSelect(s.id)}
                  className={`${ITEM_BASE} flex items-center justify-between gap-2 ${value === s.id ? ITEM_SELECTED : ITEM_DEFAULT}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.email}</p>
                  </div>
                  {value === s.id && (
                    <span className="text-[#6366f1] text-xs shrink-0">✓</span>
                  )}
                </button>
              ))}
              {students.filter(
                (s) =>
                  s.name.toLowerCase().includes(query.toLowerCase()) ||
                  s.email.toLowerCase().includes(query.toLowerCase()),
              ).length > 3 && (
                <p className="px-3 py-2 text-xs text-slate-500 text-center border-t border-[hsl(220,20%,22%)] mt-1 pt-2">
                  Nhập cụ thể hơn để thu hẹp kết quả
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface CourseComboboxProps {
  courses: AdminCourse[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function CourseCombobox({
  courses,
  selectedIds,
  onToggle,
}: CourseComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const showDropdown = open && query.trim().length > 0;
  const allFiltered = courses.filter((c) =>
    c.title?.toLowerCase().includes(query.toLowerCase()),
  );
  const filtered = allFiltered.slice(0, 3);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative space-y-2">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-text ${INPUT_CLASS}`}
        onClick={() => setOpen(true)}
      >
        <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          placeholder="Nhập tên khóa học để tìm..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {showDropdown && (
        <div
          className={`absolute top-[calc(100%-0.5rem)] mt-1.5 w-full overflow-y-auto p-1 ${DROPDOWN_BG}`}
          style={{ maxHeight: "10rem", zIndex: 9999 }}
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500 text-center">
              Không tìm thấy khóa học
            </p>
          ) : (
            <>
              {filtered.map((c) => {
                const courseId = (c as any)._id ?? c.id;
                const isSelected = selectedIds.includes(courseId);
                return (
                  <button
                    key={courseId}
                    type="button"
                    onMouseDown={() => onToggle(courseId)}
                    className={`${ITEM_BASE} flex items-center gap-3 ${isSelected ? ITEM_SELECTED : ITEM_DEFAULT}`}
                  >
                    <span
                      className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-[10px] transition-colors
                        ${isSelected ? "bg-[#6366f1] border-[#6366f1] text-white" : "border-slate-500"}`}
                    >
                      {isSelected && "✓"}
                    </span>
                    <span className="flex-1 truncate">{c.title}</span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {c.price !== undefined ? formatCurrency(c.price) : ""}
                    </span>
                  </button>
                );
              })}
              {allFiltered.length > 3 && (
                <p className="px-3 py-2 text-xs text-slate-500 text-center border-t border-[hsl(220,20%,22%)] mt-1 pt-2">
                  Nhập cụ thể hơn để thu hẹp kết quả
                </p>
              )}
            </>
          )}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedIds.map((id) => {
            const c = courses.find((x) => ((x as any)._id ?? x.id) === id);
            return c ? (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.35)",
                  color: "#818cf8",
                }}
              >
                <span>{c.title}</span>
                <button
                  type="button"
                  onMouseDown={() => onToggle(id)}
                  className="hover:text-white shrink-0 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "PENDING", label: "Đang xử lý" },
  { value: "REFUNDED", label: "Hoàn tiền" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function StatusSelect({
  value,
  onChange,
}: {
  value: OrderStatus;
  onChange: (v: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = STATUS_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1.5 w-full p-1 ${DROPDOWN_BG}`}
          style={{ zIndex: 9999 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`${ITEM_BASE} ${value === opt.value ? ITEM_SELECTED : ITEM_DEFAULT}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "VNPAY", label: "VNPay" },
  { value: "MOMO", label: "MoMo" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
  { value: "PAYPAL", label: "PayPal" },
];

function PaymentSelect({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = PAYMENT_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1.5 w-full p-1 ${DROPDOWN_BG}`}
          style={{ zIndex: 9999 }}
        >
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`${ITEM_BASE} ${value === opt.value ? ITEM_SELECTED : ITEM_DEFAULT}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalRevenue: 0,
    completedCount: 0,
    pendingCount: 0,
    refundedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null,
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newOrder, setNewOrder] = useState({
    studentId: "",
    courseIds: [] as string[],
    couponCode: "",
    paymentMethod: "VNPAY" as PaymentMethod,
  });

  const [editData, setEditData] = useState<{
    paymentStatus: OrderStatus;
    paymentMethod: PaymentMethod;
  }>({ paymentStatus: "PENDING", paymentMethod: "VNPAY" });

  const fetchOrders = async (
    page = currentPage,
    search = searchQuery,
    status = statusFilter,
  ) => {
    setIsLoading(true);
    try {
      const res = await orderService.getAdminOrders({
        page,
        pageSize: itemsPerPage,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });
      setOrders(res.result);
      setTotalItems(res.meta.total);
      if (res.stats) setOrderStats(res.stats as unknown as OrderStats);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, searchQuery, statusFilter);
  }, [currentPage]); // eslint-disable-line

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1, searchQuery, statusFilter);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, statusFilter]); // eslint-disable-line

  const openAddDialog = async () => {
    setIsAddDialogOpen(true);
    if (students.length > 0 && courses.length > 0) return;
    setLoadingLookup(true);
    try {
      const [stuRes, crsRes] = await Promise.all([
        userService.getStudents({ page: 1, pageSize: 10 }),
        courseService.getAdminCourses({ page: 1, pageSize: 10 }),
      ]);
      setStudents(stuRes.result);
      setCourses(crsRes.result);
    } catch (err) {
      toast.error("Không thể tải danh sách học viên / khóa học");
    } finally {
      setLoadingLookup(false);
    }
  };

  const resetAddForm = () =>
    setNewOrder({
      studentId: "",
      courseIds: [],
      couponCode: "",
      paymentMethod: "VNPAY",
    });

  const handleAddOrder = async () => {
    if (!newOrder.studentId) {
      toast.error("Vui lòng chọn học viên!");
      return;
    }
    if (newOrder.courseIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 khóa học!");
      return;
    }
    setIsAdding(true);
    try {
      await orderService.createOrder({
        userId: newOrder.studentId,
        courseIds: newOrder.courseIds,
        couponCode: newOrder.couponCode.trim() || undefined,
        paymentMethod: newOrder.paymentMethod,
      });
      toast.success("Tạo đơn hàng thành công!");
      resetAddForm();
      setIsAddDialogOpen(false);
      fetchOrders(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo đơn hàng thất bại");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleCourse = (courseId: string) =>
    setNewOrder((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));

  const handleView = (o: OrderResponse) => {
    setSelectedOrder(o);
    setIsViewDialogOpen(true);
  };
  const handleEditClick = (o: OrderResponse) => {
    setSelectedOrder(o);
    setEditData({
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
    });
    setIsEditDialogOpen(true);
  };
  const handleDeleteClick = (o: OrderResponse) => {
    setSelectedOrder(o);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.updateOrder(selectedOrder._id, {
        paymentStatus: editData.paymentStatus,
        paymentMethod: editData.paymentMethod,
      });
      toast.success("Cập nhật đơn hàng thành công!");
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.deleteOrder(selectedOrder._id);
      toast.success("Đã xóa đơn hàng!");
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleRefund = async (o: OrderResponse) => {
    try {
      await orderService.updateOrder(o._id, { paymentStatus: "REFUNDED" });
      toast.success("Đã hoàn tiền đơn hàng!");
      fetchOrders(currentPage, searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Hoàn tiền thất bại");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Mã đơn",
      "Số tiền gốc",
      "Giảm giá",
      "Thực trả",
      "Phương thức",
      "Trạng thái",
      "Ngày tạo",
    ];
    const rows = orders.map((o) => [
      o.orderCode,
      o.totalAmount,
      o.discountAmount,
      o.finalAmount,
      PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod,
      STATUS_MAP[o.paymentStatus]?.label ?? o.paymentStatus,
      formatDateTime(o.createdAt),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Xuất CSV thành công!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">
            Quản lý Đơn hàng
          </h1>
          <p className="text-admin-muted-foreground">
            Tổng cộng {totalItems} đơn hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openAddDialog}
            className="bg-admin-primary hover:bg-admin-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm đơn hàng
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng doanh thu",
            value: formatCurrency(orderStats.totalRevenue),
            color: "text-green-400",
            icon: <DollarSign className="w-5 h-5" />,
            iconBg: "rgba(34,197,94,0.15)",
            iconColor: "#4ade80",
          },
          {
            label: "Đơn hoàn thành",
            value: orderStats.completedCount,
            color: "text-admin-foreground",
            icon: <CheckCircle2 className="w-5 h-5" />,
            iconBg: "rgba(99,102,241,0.15)",
            iconColor: "#818cf8",
          },
          {
            label: "Đang xử lý",
            value: orderStats.pendingCount,
            color: "text-yellow-400",
            icon: <Clock className="w-5 h-5" />,
            iconBg: "rgba(234,179,8,0.15)",
            iconColor: "#facc15",
          },
          {
            label: "Hoàn tiền",
            value: orderStats.refundedCount,
            color: "text-blue-400",
            icon: <RotateCcw className="w-5 h-5" />,
            iconBg: "rgba(59,130,246,0.15)",
            iconColor: "#60a5fa",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-admin-card border border-admin-border rounded-xl p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.iconBg, color: s.iconColor }}
            >
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-bold leading-tight ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs text-admin-muted-foreground mt-0.5">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-48 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="PENDING">Đang xử lý</SelectItem>
              <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-accent">
              <tr>
                {[
                  "Mã đơn",
                  "Học viên",
                  "Khoá học",
                  "Số tiền",
                  "Thanh toán",
                  "Trạng thái",
                  "Ngày tạo",
                  "Hành động",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-admin-muted-foreground
                      ${i === 7 ? "text-right" : "text-left"}
                      ${i === 2 ? "hidden lg:table-cell" : ""}
                      ${i === 4 ? "hidden md:table-cell" : ""}
                      ${i === 6 ? "hidden sm:table-cell" : ""}`}
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
                    colSpan={8}
                    className="py-16 text-center text-admin-muted-foreground"
                  >
                    <svg
                      className="animate-spin w-5 h-5 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-admin-muted-foreground"
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = STATUS_MAP[order.paymentStatus];
                  return (
                    <tr
                      key={order._id}
                      className="border-t border-admin-border hover:bg-admin-accent/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span
                          className="text-sm font-mono font-medium"
                          style={{ color: "#818cf8" }}
                        >
                          {order.orderCode}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-admin-foreground truncate max-w-[130px]">
                          {order.createdBy}
                        </p>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="space-y-1 max-w-[200px]">
                          {order.orderItems.map((item) => (
                            <p
                              key={item._id}
                              className="text-xs text-admin-muted-foreground truncate"
                            >
                              {item.courseName}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-admin-foreground">
                          {formatCurrency(order.finalAmount)}
                        </p>
                        {order.discountAmount > 0 && (
                          <p className="text-xs text-green-400 mt-0.5">
                            -{formatCurrency(order.discountAmount)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-admin-accent text-admin-muted-foreground border border-admin-border">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                            order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${status?.className}`}
                        >
                          {status?.label ?? order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-admin-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-admin-accent"
                              >
                                <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleView(order)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(order)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              {order.paymentStatus === "COMPLETED" && (
                                <DropdownMenuItem
                                  onClick={() => handleRefund(order)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Hoàn tiền
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(order)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-admin-border gap-4">
          <p className="text-sm text-admin-muted-foreground">
            Hiển thị{" "}
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} –{" "}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent
          className="sm:max-w-lg p-0 gap-0"
          style={{
            background: "#0f1117",
            border: "1px solid #1e2230",
            overflow: "visible",
          }}
        >
          <div className="px-6 pt-6 pb-4 border-b border-[#1e2230]">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#6366f1" }}
            >
              Đơn hàng mới
            </p>
            <DialogTitle className="text-xl font-bold text-white">
              Thêm đơn hàng thủ công
            </DialogTitle>
            <DialogDescription
              className="text-sm mt-1"
              style={{ color: "#94a3b8" }}
            >
              Tạo đơn hàng cho học viên không qua cổng thanh toán
            </DialogDescription>
          </div>

          {loadingLookup ? (
            <div
              className="flex items-center justify-center py-16"
              style={{ color: "#475569" }}
            >
              <svg
                className="animate-spin w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Học viên <span className="text-red-400">*</span>
                </Label>
                <StudentCombobox
                  students={students}
                  value={newOrder.studentId}
                  onChange={(id) => setNewOrder({ ...newOrder, studentId: id })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Khóa học <span className="text-red-400">*</span>
                </Label>
                <CourseCombobox
                  courses={courses}
                  selectedIds={newOrder.courseIds}
                  onToggle={toggleCourse}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mã giảm giá
                  </Label>
                  <input
                    placeholder="VD: SALE50"
                    value={newOrder.couponCode}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, couponCode: e.target.value })
                    }
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${INPUT_CLASS}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phương thức
                  </Label>
                  <PaymentSelect
                    value={newOrder.paymentMethod}
                    onChange={(v) =>
                      setNewOrder({ ...newOrder, paymentMethod: v })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setIsAddDialogOpen(false);
                resetAddForm();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-125"
              style={dialogBtnSecondary}
            >
              Hủy
            </button>
            <button
              onClick={handleAddOrder}
              disabled={isAdding || loadingLookup}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={dialogBtnPrimary}
            >
              {isAdding ? "Đang tạo..." : "Tạo đơn hàng"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent
          className="sm:max-w-lg p-0 gap-0 overflow-hidden"
          style={{ background: "#0f1117", border: "1px solid #1e2230" }}
        >
          {selectedOrder && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-[#1e2230]">
                <p
                  className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "#6366f1" }}
                >
                  Chi tiết đơn hàng
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xl font-bold font-mono"
                    style={{ color: "#818cf8" }}
                  >
                    {selectedOrder.orderCode}
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${STATUS_MAP[selectedOrder.paymentStatus]?.className}`}
                  >
                    {STATUS_MAP[selectedOrder.paymentStatus]?.label}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={DETAIL_BLOCK_STYLE}
                >
                  <p
                    className="text-[11px] uppercase tracking-wider font-semibold mb-3"
                    style={{ color: "#475569" }}
                  >
                    🎬 Khóa học
                  </p>
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm text-slate-300">
                        {item.courseName}
                      </p>
                      <p className="text-sm font-semibold text-green-400">
                        {formatCurrency(item.finalPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Tổng tiền",
                      value: formatCurrency(selectedOrder.totalAmount),
                      icon: "💰",
                      color: "#e2e8f0",
                    },
                    {
                      label: "Giảm giá",
                      value: `-${formatCurrency(selectedOrder.discountAmount)}`,
                      icon: "🏷️",
                      color: "#4ade80",
                    },
                    {
                      label: "Thực trả",
                      value: formatCurrency(selectedOrder.finalAmount),
                      icon: "💸",
                      color: "#818cf8",
                    },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="rounded-xl p-3.5 text-center"
                      style={STAT_CARD_STYLE}
                    >
                      <p className="text-lg mb-1">{f.icon}</p>
                      <p
                        className="text-[11px] uppercase tracking-wider font-semibold mb-1"
                        style={{ color: "#475569" }}
                      >
                        {f.label}
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: f.color }}
                      >
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Phương thức",
                      value:
                        PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] ??
                        selectedOrder.paymentMethod,
                      icon: "💳",
                    },
                    {
                      label: "Ngày tạo",
                      value: formatDateTime(selectedOrder.createdAt),
                      icon: "📅",
                    },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="rounded-xl p-3.5"
                      style={STAT_CARD_STYLE}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{f.icon}</span>
                        <p
                          className="text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: "#475569" }}
                        >
                          {f.label}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-200">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-3.5" style={STAT_CARD_STYLE}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">👤</span>
                    <p
                      className="text-[11px] uppercase tracking-wider font-semibold"
                      style={{ color: "#475569" }}
                    >
                      Người tạo
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    {selectedOrder.createdBy}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 flex justify-end">
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-125"
                  style={dialogBtnSecondary}
                >
                  Đóng
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="sm:max-w-md p-0 gap-0"
          style={{
            background: "#0f1117",
            border: "1px solid #1e2230",
            overflow: "visible",
          }}
        >
          <div className="px-6 pt-6 pb-4 border-b border-[#1e2230]">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#6366f1" }}
            >
              Chỉnh sửa
            </p>
            <DialogTitle className="text-xl font-bold text-white">
              Cập nhật đơn hàng
            </DialogTitle>
            <DialogDescription
              className="text-sm mt-1 font-mono"
              style={{ color: "#818cf8" }}
            >
              {selectedOrder?.orderCode}
            </DialogDescription>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Trạng thái
              </Label>
              <StatusSelect
                value={editData.paymentStatus}
                onChange={(v) => setEditData({ ...editData, paymentStatus: v })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Phương thức thanh toán
              </Label>
              <PaymentSelect
                value={editData.paymentMethod}
                onChange={(v) => setEditData({ ...editData, paymentMethod: v })}
              />
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-125"
              style={dialogBtnSecondary}
            >
              Hủy
            </button>
            <button
              onClick={handleEditSave}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={dialogBtnPrimary}
            >
              Lưu thay đổi
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent
          className="p-0 gap-0 overflow-hidden sm:max-w-md"
          style={{ background: "#0f1117", border: "1px solid #1e2230" }}
        >
          <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-[#1e2230]">
            <AlertDialogTitle className="text-white text-lg font-bold">
              Xác nhận xóa đơn hàng
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#94a3b8" }}>
              Bạn có chắc muốn xóa đơn hàng{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: "#818cf8" }}
              >
                {selectedOrder?.orderCode}
              </span>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 flex justify-end gap-3">
            <AlertDialogCancel
              style={dialogBtnSecondary}
              className="border-0 hover:brightness-125 transition-all"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Xóa đơn hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
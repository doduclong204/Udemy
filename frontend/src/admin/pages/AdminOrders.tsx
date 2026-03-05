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
} from "lucide-react";
import orderService from "@/services/orderService";
import userService from "@/services/userService";
import courseService from "@/services/courseService";
import {
  OrderResponse,
  OrderStatus,
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
    className: "bg-green-500/10 text-green-500",
  },
  PENDING: {
    label: "Đang xử lý",
    className: "bg-yellow-500/10 text-yellow-500",
  },
  REFUNDED: { label: "Hoàn tiền", className: "bg-blue-500/10 text-blue-500" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-500/10 text-red-500" },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  VNPAY: "VNPay",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản",
  PAYPAL: "PayPal",
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
const ITEM_SELECTED = "bg-admin-primary/20 text-white";

// ==================== Combobox: Student ====================

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

  // Chỉ hiện dropdown khi có query gõ vào
  const showDropdown = open && query.trim().length > 0;

  const filtered = showDropdown
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.email.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 3) // tối đa 3 kết quả
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

  const handleFocus = () => {
    setOpen(true);
    // Nếu đã có giá trị, xóa để gõ lại
    if (value) setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-text ${INPUT_CLASS}`}
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
          onFocus={handleFocus}
        />
      </div>

      {showDropdown && (
        <div
          className={`absolute top-full mt-1 w-full overflow-y-auto ${DROPDOWN_BG}`}
          style={{ maxHeight: "9.5rem" }}
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
                    <span className="text-admin-primary text-xs shrink-0">
                      ✓
                    </span>
                  )}
                </button>
              ))}
              {students.filter(
                (s) =>
                  s.name.toLowerCase().includes(query.toLowerCase()) ||
                  s.email.toLowerCase().includes(query.toLowerCase()),
              ).length > 3 && (
                <p className="px-3 py-2 text-xs text-slate-500 text-center border-t border-[hsl(220,20%,28%)]">
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

// ==================== Combobox: Course (multi-select) ====================

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
      {/* Input search */}
      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-text ${INPUT_CLASS}`}
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

      {/* Dropdown - chỉ hiện khi có query */}
      {showDropdown && (
        <div
          className={`absolute top-full mt-1 w-full overflow-y-auto ${DROPDOWN_BG}`}
          style={{ maxHeight: "9.5rem" }}
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
                      className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-[10px]
                      ${isSelected ? "bg-admin-primary border-admin-primary text-white" : "border-slate-500"}`}
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
                <p className="px-3 py-2 text-xs text-slate-500 text-center border-t border-[hsl(220,20%,28%)]">
                  Nhập cụ thể hơn để thu hẹp kết quả
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Selected tags - chỉ hiện khi dropdown đóng */}
      {!open && selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedIds.map((id) => {
            const c = courses.find((x) => ((x as any)._id ?? x.id) === id);
            return c ? (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                bg-admin-primary/20 text-admin-primary border border-admin-primary/30 whitespace-normal break-words max-w-full"
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

// ==================== Custom Select: Order Status ====================

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
        className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className={`absolute top-full mt-1 w-full ${DROPDOWN_BG}`}>
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

// ==================== Custom Select: Payment Method ====================

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
        className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className={`absolute top-full mt-1 w-full ${DROPDOWN_BG}`}>
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

// ==================== Main Component ====================

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
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

  // ── Fetch orders ────────────────────────────────────────────

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getAdminOrders({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setOrders(res.result);
      setTotalItems(res.meta.total);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, statusFilter]); // eslint-disable-line

  // ── Fetch lookup ─────────────────────────────────────────────

  const openAddDialog = async () => {
    setIsAddDialogOpen(true);
    if (students.length > 0 && courses.length > 0) return;
    setLoadingLookup(true);
    try {
      const [stuRes, crsRes] = await Promise.all([
        userService.getStudents({ page: 1, pageSize: 100 }),
        courseService.getAdminCourses({ page: 1, pageSize: 100 }),
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

  // ── Stats ──────────────────────────────────────────────────

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "COMPLETED")
    .reduce((s, o) => s + o.finalAmount, 0);
  const completedCount = orders.filter(
    (o) => o.paymentStatus === "COMPLETED",
  ).length;
  const pendingCount = orders.filter(
    (o) => o.paymentStatus === "PENDING",
  ).length;
  const refundedCount = orders.filter(
    (o) => o.paymentStatus === "REFUNDED",
  ).length;

  // ── Handlers ─────────────────────────────────────────────

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
      fetchOrders();
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
      fetchOrders();
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
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleRefund = async (o: OrderResponse) => {
    try {
      await orderService.updateOrder(o._id, { paymentStatus: "REFUNDED" });
      toast.success("Đã hoàn tiền đơn hàng!");
      fetchOrders();
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

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng doanh thu",
            value: formatCurrency(totalRevenue),
            color: "text-green-500",
          },
          {
            label: "Đơn hoàn thành",
            value: completedCount,
            color: "text-admin-foreground",
          },
          {
            label: "Đang xử lý",
            value: pendingCount,
            color: "text-yellow-500",
          },
          { label: "Hoàn tiền", value: refundedCount, color: "text-blue-500" },
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

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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

      {/* Table */}
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
                    className={`py-4 px-4 text-sm font-medium text-admin-muted-foreground
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
                    className="py-12 text-center text-admin-muted-foreground"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-admin-muted-foreground"
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
                      className="border-t border-admin-border hover:bg-admin-accent/50"
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-admin-primary">
                          {order.orderCode}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-admin-foreground truncate max-w-[120px]">
                          {order.createdBy}
                        </p>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="space-y-1 max-w-[200px]">
                          {order.orderItems.map((item) => (
                            <p
                              key={item._id}
                              className="text-sm text-admin-muted-foreground truncate"
                            >
                              {item.courseName}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-admin-foreground">
                          {formatCurrency(order.finalAmount)}
                        </p>
                        {order.discountAmount > 0 && (
                          <p className="text-xs text-green-500">
                            -{formatCurrency(order.discountAmount)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden md:table-cell">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                          order.paymentMethod}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${status?.className}`}
                        >
                          {status?.label ?? order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-admin-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Add Dialog ===== */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Thêm đơn hàng mới</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tạo đơn hàng thủ công cho học viên
            </DialogDescription>
          </DialogHeader>

          {loadingLookup ? (
            <div className="py-10 text-center text-slate-400">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="space-y-5 py-4">
              {/* Học viên combobox */}
              <div className="space-y-2">
                <Label className="text-white">
                  Học viên <span className="text-red-400">*</span>
                </Label>
                <StudentCombobox
                  students={students}
                  value={newOrder.studentId}
                  onChange={(id) => setNewOrder({ ...newOrder, studentId: id })}
                />
              </div>

              {/* Khóa học combobox multi */}
              <div className="space-y-2">
                <Label className="text-white">
                  Khóa học <span className="text-red-400">*</span>
                </Label>
                <CourseCombobox
                  courses={courses}
                  selectedIds={newOrder.courseIds}
                  onToggle={toggleCourse}
                />
              </div>

              {/* Mã giảm giá */}
              <div className="space-y-2">
                <Label className="text-white">Mã giảm giá (tùy chọn)</Label>
                <Input
                  placeholder="VD: SALE50"
                  value={newOrder.couponCode}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, couponCode: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>

              {/* Phương thức */}
              <div className="space-y-2">
                <Label className="text-white">Phương thức thanh toán</Label>
                <PaymentSelect
                  value={newOrder.paymentMethod}
                  onChange={(v) =>
                    setNewOrder({ ...newOrder, paymentMethod: v })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetAddForm();
              }}
              className={BTN_CANCEL}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddOrder}
              disabled={isAdding || loadingLookup}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              {isAdding ? "Đang tạo..." : "Tạo đơn hàng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== View Dialog ===== */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-admin-primary">
                  {selectedOrder.orderCode}
                </span>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${STATUS_MAP[selectedOrder.paymentStatus]?.className}`}
                >
                  {STATUS_MAP[selectedOrder.paymentStatus]?.label}
                </span>
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg space-y-2">
                <p className="text-xs text-slate-400 mb-2">Khóa học</p>
                {selectedOrder.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
                    <p className="text-sm text-white">{item.courseName}</p>
                    <p className="text-sm font-medium text-green-400">
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
                    color: "text-white",
                  },
                  {
                    label: "Giảm giá",
                    value: `-${formatCurrency(selectedOrder.discountAmount)}`,
                    color: "text-green-400",
                  },
                  {
                    label: "Thực trả",
                    value: formatCurrency(selectedOrder.finalAmount),
                    color: "text-white",
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg"
                  >
                    <p className="text-xs text-slate-400 mb-1">{f.label}</p>
                    <p className={`text-sm font-semibold ${f.color}`}>
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Phương thức</p>
                  <p className="text-sm font-medium text-white">
                    {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] ??
                      selectedOrder.paymentMethod}
                  </p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Ngày tạo</p>
                  <p className="text-sm font-medium text-white">
                    {formatDateTime(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Người tạo</p>
                <p className="text-sm font-medium text-white">
                  {selectedOrder.createdBy}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className={BTN_CANCEL}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Edit Dialog ===== */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Chỉnh sửa đơn hàng</DialogTitle>
            <DialogDescription className="text-slate-400">
              Cập nhật thông tin đơn hàng {selectedOrder?.orderCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">Trạng thái</Label>
              <StatusSelect
                value={editData.paymentStatus}
                onChange={(v) => setEditData({ ...editData, paymentStatus: v })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Phương thức thanh toán</Label>
              <PaymentSelect
                value={editData.paymentMethod}
                onChange={(v) => setEditData({ ...editData, paymentMethod: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className={BTN_CANCEL}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditSave}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Dialog ===== */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Xác nhận xóa đơn hàng
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bạn có chắc chắn muốn xóa đơn hàng "{selectedOrder?.orderCode}"?
              Hành động này không thể hoàn tác.
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

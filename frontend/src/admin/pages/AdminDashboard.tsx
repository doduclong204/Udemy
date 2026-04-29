import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  DollarSign,
  Users,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
  GitCompare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import dashboardService from "@/services/dashboardService";
import { DashboardStatsResponse } from "@/types";
import { toast } from "sonner";

type RangeMode = "day" | "week" | "month" | "year" | "custom";
type CompareMode = "prev_period" | "prev_year" | "custom_compare" | "none";

interface DateRange {
  from: Date;
  to: Date;
}

interface Growth {
  value: string;
  isPositive: boolean;
  isNew: boolean;
  curValue: number;
  prevValue: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const formatShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

const toInputDate = (d: Date) => d.toISOString().split("T")[0];

function getRangeForMode(mode: RangeMode, custom: DateRange): DateRange {
  const now = new Date();
  if (mode === "custom") return custom;
  if (mode === "day") {
    return {
      from: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      ),
      to: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ),
    };
  }
  if (mode === "week") {
    const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const mon = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diff,
      0,
      0,
      0,
      0,
    );
    return {
      from: mon,
      to: new Date(
        mon.getFullYear(),
        mon.getMonth(),
        mon.getDate() + 6,
        23,
        59,
        59,
        999,
      ),
    };
  }
  if (mode === "month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }
  return {
    from: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
    to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

function getCompareRange(
  range: DateRange,
  mode: RangeMode,
  compareMode: CompareMode,
  compareCustom: DateRange,
): DateRange | null {
  if (compareMode === "none") return null;
  if (compareMode === "custom_compare") return compareCustom;
  if (compareMode === "prev_year") {
    return {
      from: new Date(
        range.from.getFullYear() - 1,
        range.from.getMonth(),
        range.from.getDate(),
        0,
        0,
        0,
        0,
      ),
      to: new Date(
        range.to.getFullYear() - 1,
        range.to.getMonth(),
        range.to.getDate(),
        23,
        59,
        59,
        999,
      ),
    };
  }
  const dur = range.to.getTime() - range.from.getTime() + 1;
  return {
    from: new Date(range.from.getTime() - dur),
    to: new Date(range.from.getTime() - 1),
  };
}

function fmtDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function rangeModeLabel(mode: RangeMode, range: DateRange): string {
  if (mode === "day") return `Hôm nay (${fmtDate(range.from)})`;
  if (mode === "week") return `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
  if (mode === "month")
    return `Tháng ${range.from.getMonth() + 1}/${range.from.getFullYear()}`;
  if (mode === "year") return `Năm ${range.from.getFullYear()}`;
  return `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
}

function compareModeLabel(
  cmp: CompareMode,
  range: DateRange,
  mode: RangeMode,
  compareCustom: DateRange,
): string {
  if (cmp === "none") return "Không so sánh";
  if (cmp === "custom_compare")
    return `${fmtDate(compareCustom.from)} – ${fmtDate(compareCustom.to)}`;
  const cr = getCompareRange(range, mode, cmp, compareCustom)!;
  if (cmp === "prev_year") {
    if (mode === "month")
      return `Tháng ${cr.from.getMonth() + 1}/${cr.from.getFullYear()}`;
    if (mode === "year") return `Năm ${cr.from.getFullYear()}`;
    return `${fmtDate(cr.from)} – ${fmtDate(cr.to)}`;
  }
  if (mode === "day") return `Hôm qua (${fmtDate(cr.from)})`;
  if (mode === "week") return `${fmtDate(cr.from)} – ${fmtDate(cr.to)}`;
  if (mode === "month")
    return `Tháng ${cr.from.getMonth() + 1}/${cr.from.getFullYear()}`;
  if (mode === "year") return `Năm ${cr.from.getFullYear()}`;
  return `${fmtDate(cr.from)} – ${fmtDate(cr.to)}`;
}

function buildGrowth(cur: number, prev: number, cmpMode: CompareMode): Growth {
  if (cmpMode === "none")
    return {
      value: "—",
      isPositive: true,
      isNew: false,
      curValue: cur,
      prevValue: 0,
    };
  if (prev === 0 && cur === 0)
    return {
      value: "—",
      isPositive: true,
      isNew: false,
      curValue: 0,
      prevValue: 0,
    };
  if (prev === 0)
    return {
      value: "Mới",
      isPositive: true,
      isNew: true,
      curValue: cur,
      prevValue: 0,
    };
  const pct = Math.round(((cur - prev) / prev) * 100);
  return {
    value: `${pct > 0 ? "+" : ""}${pct}%`,
    isPositive: pct >= 0,
    isNew: false,
    curValue: cur,
    prevValue: prev,
  };
}

function buildRateGrowth(
  curDone: number,
  curTotal: number,
  prevDone: number,
  prevTotal: number,
  cmpMode: CompareMode,
): Growth {
  const curRate = curTotal ? (curDone / curTotal) * 100 : 0;
  const prevRate = prevTotal ? (prevDone / prevTotal) * 100 : 0;
  if (cmpMode === "none")
    return {
      value: "—",
      isPositive: true,
      isNew: false,
      curValue: curRate,
      prevValue: 0,
    };
  if (prevTotal === 0 && curTotal === 0)
    return {
      value: "—",
      isPositive: true,
      isNew: false,
      curValue: 0,
      prevValue: 0,
    };
  if (prevTotal === 0)
    return {
      value: "Mới",
      isPositive: true,
      isNew: true,
      curValue: curRate,
      prevValue: 0,
    };
  const diff = Math.round(curRate - prevRate);
  return {
    value: `${diff > 0 ? "+" : ""}${diff}pp`,
    isPositive: diff >= 0,
    isNew: false,
    curValue: curRate,
    prevValue: prevRate,
  };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: "Hoàn thành", cls: "bg-green-500/10 text-green-500" },
  PENDING: { label: "Đang xử lý", cls: "bg-yellow-500/10 text-yellow-500" },
  REFUNDED: { label: "Hoàn tiền", cls: "bg-blue-500/10 text-blue-500" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-500/10 text-red-500" },
};

const RANGE_MODES: { key: RangeMode; label: string }[] = [
  { key: "day", label: "Hôm nay" },
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
  { key: "year", label: "Năm nay" },
];

const COMPARE_OPTIONS: { key: CompareMode; label: string; desc: string }[] = [
  { key: "prev_period", label: "Kỳ trước", desc: "Cùng độ dài, liền kề trước" },
  {
    key: "prev_year",
    label: "Cùng kỳ năm ngoái",
    desc: "Cùng khoảng, năm trước",
  },
  { key: "custom_compare", label: "Tùy chọn", desc: "Chọn thời gian so sánh" },
  { key: "none", label: "Không so sánh", desc: "Tắt tính năng so sánh" },
];

const H = "h-9";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [rangeMode, setRangeMode] = useState<RangeMode>("month");
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [showRangeDD, setShowRangeDD] = useState(false);
  const [tempFrom, setTempFrom] = useState(toInputDate(customRange.from));
  const [tempTo, setTempTo] = useState(toInputDate(customRange.to));

  const [compareMode, setCompareMode] = useState<CompareMode>("prev_period");
  const [compareCustom, setCompareCustom] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
  });
  const [showCmpDD, setShowCmpDD] = useState(false);
  const [showCmpCustom, setShowCmpCustom] = useState(false);
  const [cmpTempFrom, setCmpTempFrom] = useState(
    toInputDate(compareCustom.from),
  );
  const [cmpTempTo, setCmpTempTo] = useState(toInputDate(compareCustom.to));

  const rangeRef = useRef<HTMLDivElement>(null);
  const cmpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node))
        setShowRangeDD(false);
      if (cmpRef.current && !cmpRef.current.contains(e.target as Node)) {
        setShowCmpDD(false);
        setShowCmpCustom(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const range = useMemo(
  () => getRangeForMode(rangeMode, customRange),
  [rangeMode, customRange]
);

const compareRange = useMemo(
  () => getCompareRange(range, rangeMode, compareMode, compareCustom),
  [range, rangeMode, compareMode, compareCustom]
);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getStats({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        compareFrom: compareRange?.from.toISOString(),
        compareTo: compareRange?.to.toISOString(),
        rangeMode,
      });
      setStats(data);
    } catch {
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [range, compareRange, rangeMode]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const cur = stats?.current;
  const cmp = stats?.compare;

  const totalRevenue = cur?.revenue ?? 0;
  const orderCount = cur?.orderCount ?? 0;
  const completedCount = cur?.completedCount ?? 0;
  const pendingCount = cur?.pendingCount ?? 0;
  const revenueChart = stats?.chartData ?? [];
  const topCourses = stats?.topCourses ?? [];
  const recentOrders = stats?.recentOrders ?? [];
  const totalStudents = stats?.totalStudents ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const avgRating = stats?.avgRating ?? 0;

  const growth = {
    revenue: buildGrowth(totalRevenue, cmp?.revenue ?? 0, compareMode),
    orders: buildGrowth(orderCount, cmp?.orderCount ?? 0, compareMode),
    completion: buildRateGrowth(
      completedCount,
      orderCount,
      cmp?.completedCount ?? 0,
      cmp?.orderCount ?? 0,
      compareMode,
    ),
  };

  const handleExport = () => {
    const cmpLabel = compareModeLabel(
      compareMode,
      range,
      rangeMode,
      compareCustom,
    );
    const lines = [
      ["=== BÁO CÁO TỔNG QUAN ==="],
      ["Kỳ hiện tại", rangeModeLabel(rangeMode, range)],
      ["So sánh với", cmpLabel],
      ["Tổng doanh thu", formatCurrency(totalRevenue)],
      ["Tổng đơn hàng", orderCount],
      ["Đơn hoàn thành", completedCount],
      ["Đơn đang xử lý", pendingCount],
      [],
      ["=== DOANH THU THEO THỜI GIAN ==="],
      ["Nhãn", "Doanh thu", "Số đơn"],
      ...revenueChart.map((r) => [
        r.label,
        formatCurrency(r.revenue),
        r.orders,
      ]),
      [],
      ["=== TOP 5 KHÓA HỌC ==="],
      ["Tên khóa học", "Học viên", "Doanh thu"],
      ...topCourses.map((c) => [
        c.title,
        c.students,
        formatCurrency(c.revenue),
      ]),
    ];
    const csv = lines
      .map((r) => (Array.isArray(r) ? r.join(",") : r))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard_${rangeMode}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Xuất báo cáo thành công!");
  };

  const applyCustomRange = () => {
    setCustomRange({
      from: new Date(tempFrom),
      to: new Date(new Date(tempTo).setHours(23, 59, 59, 999)),
    });
    setRangeMode("custom");
    setShowRangeDD(false);
  };

  const applyCompareCustom = () => {
    setCompareCustom({
      from: new Date(cmpTempFrom),
      to: new Date(new Date(cmpTempTo).setHours(23, 59, 59, 999)),
    });
    setCompareMode("custom_compare");
    setShowCmpCustom(false);
    setShowCmpDD(false);
  };

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-admin-accent rounded w-48" />
        <div className="h-9 bg-admin-accent rounded w-[580px] max-w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-admin-card border border-admin-border rounded-xl h-24"
              />
            ))}
        </div>
      </div>
    );

  const cmpLabelShort = compareModeLabel(
    compareMode,
    range,
    rangeMode,
    compareCustom,
  );

  const kpiCards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      bg: "bg-green-500/10",
      color: "text-green-500",
      sub: `${completedCount} đơn hoàn thành`,
      growth: growth.revenue,
      fmtPrev: (v: number) => formatCurrency(v),
    },
    {
      title: "Học viên",
      value: totalStudents.toLocaleString(),
      icon: Users,
      bg: "bg-blue-500/10",
      color: "text-blue-500",
      sub: "Tổng số học viên",
      growth: null,
      fmtPrev: null,
    },
    {
      title: "Khóa học",
      value: totalCourses.toString(),
      icon: BookOpen,
      bg: "bg-purple-500/10",
      color: "text-purple-500",
      sub: "Đang hoạt động",
      growth: null,
      fmtPrev: null,
    },
    {
      title: "Đơn hàng",
      value: orderCount.toString(),
      icon: ShoppingCart,
      bg: "bg-orange-500/10",
      color: "text-orange-500",
      sub: `${pendingCount} đang xử lý`,
      growth: growth.orders,
      fmtPrev: (v: number) => v.toLocaleString(),
    },
    {
      title: "Tỉ lệ hoàn thành",
      value: orderCount
        ? `${Math.round((completedCount / orderCount) * 100)}%`
        : "0%",
      icon: TrendingUp,
      bg: "bg-emerald-500/10",
      color: "text-emerald-500",
      sub: "Đơn hoàn thành / Tổng",
      growth: growth.completion,
      fmtPrev: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: "Đánh giá TB",
      value: avgRating.toFixed(1),
      icon: Star,
      bg: "bg-yellow-500/10",
      color: "text-yellow-500",
      sub: "Toàn thời gian",
      growth: null,
      fmtPrev: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">
            Dashboard
          </h1>
          <p className="text-admin-muted-foreground text-sm">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchAll}
            className={`border-admin-border text-admin-foreground hover:bg-admin-accent ${H}`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button
            onClick={handleExport}
            className={`bg-admin-primary hover:bg-admin-primary/90 ${H}`}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`flex items-center gap-1 bg-admin-card border border-admin-border rounded-lg px-1 ${H}`}
        >
          {RANGE_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setRangeMode(m.key);
                setShowRangeDD(false);
              }}
              className={`px-3 h-7 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                rangeMode === m.key
                  ? "bg-admin-primary text-white"
                  : "text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative" ref={rangeRef}>
          <button
            onClick={() => setShowRangeDD((p) => !p)}
            className={`inline-flex items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${H} ${
              rangeMode === "custom"
                ? "border-admin-primary bg-admin-primary/10 text-admin-primary"
                : "border-admin-border bg-admin-card text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent"
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="max-w-[180px] truncate">
              {rangeMode === "custom"
                ? `${fmtDate(customRange.from)} – ${fmtDate(customRange.to)}`
                : "Tùy chọn"}
            </span>
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform ${showRangeDD ? "rotate-180" : ""}`}
            />
          </button>

          {showRangeDD && (
            <div className="absolute z-50 mt-1 left-0 bg-admin-card border border-admin-border rounded-xl shadow-xl p-4 w-72">
              <p className="text-xs font-semibold text-admin-muted-foreground uppercase tracking-wider mb-3">
                Khoảng thời gian
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-admin-muted-foreground mb-1 block">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={tempFrom}
                    max={tempTo}
                    onChange={(e) => setTempFrom(e.target.value)}
                    className="w-full bg-admin-accent border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-admin-muted-foreground mb-1 block">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={tempTo}
                    min={tempFrom}
                    max={toInputDate(new Date())}
                    onChange={(e) => setTempTo(e.target.value)}
                    className="w-full bg-admin-accent border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 border-admin-border text-sm h-8"
                    onClick={() => setShowRangeDD(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="flex-1 bg-admin-primary hover:bg-admin-primary/90 text-sm h-8"
                    onClick={applyCustomRange}
                    disabled={!tempFrom || !tempTo}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-admin-border self-stretch my-1" />

        <div className="relative" ref={cmpRef}>
          <button
            onClick={() => setShowCmpDD((p) => !p)}
            className={`inline-flex items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${H} ${
              compareMode !== "none"
                ? "border-admin-primary/50 bg-admin-primary/5 text-admin-primary"
                : "border-admin-border bg-admin-card text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent"
            }`}
          >
            <GitCompare className="w-4 h-4 shrink-0" />
            <span className="max-w-[200px] truncate">
              {compareMode === "none"
                ? "So sánh"
                : COMPARE_OPTIONS.find((o) => o.key === compareMode)?.label}
            </span>
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform ${showCmpDD ? "rotate-180" : ""}`}
            />
          </button>

          {showCmpDD && (
            <div className="absolute z-50 mt-1 left-0 bg-admin-card border border-admin-border rounded-xl shadow-xl w-72 overflow-hidden">
              <div className="p-3 border-b border-admin-border">
                <p className="text-xs font-semibold text-admin-muted-foreground uppercase tracking-wider">
                  So sánh với kỳ
                </p>
              </div>
              <div className="p-2">
                {COMPARE_OPTIONS.map((opt) => (
                  <div key={opt.key}>
                    <button
                      onClick={() => {
                        if (opt.key === "custom_compare") {
                          setShowCmpCustom((p) => !p);
                        } else {
                          setCompareMode(opt.key);
                          setShowCmpDD(false);
                          setShowCmpCustom(false);
                        }
                      }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        compareMode === opt.key
                          ? "bg-admin-primary/10 text-admin-primary"
                          : "text-admin-foreground hover:bg-admin-accent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {opt.label}
                        </p>
                        <p className="text-xs text-admin-muted-foreground mt-0.5 leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                      {compareMode === opt.key &&
                        opt.key !== "custom_compare" && (
                          <span className="w-2 h-2 rounded-full bg-admin-primary mt-1.5 shrink-0" />
                        )}
                      {opt.key === "custom_compare" && (
                        <ChevronDown
                          className={`w-4 h-4 mt-0.5 shrink-0 text-admin-muted-foreground transition-transform ${showCmpCustom ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {opt.key === "custom_compare" && showCmpCustom && (
                      <div className="mx-2 mb-2 mt-1 p-3 bg-admin-accent/40 rounded-lg border border-admin-border space-y-2">
                        <div>
                          <label className="text-xs text-admin-muted-foreground mb-1 block">
                            Từ ngày
                          </label>
                          <input
                            type="date"
                            value={cmpTempFrom}
                            max={cmpTempTo}
                            onChange={(e) => setCmpTempFrom(e.target.value)}
                            className="w-full bg-admin-card border border-admin-border rounded-md px-2 py-1.5 text-xs text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-admin-muted-foreground mb-1 block">
                            Đến ngày
                          </label>
                          <input
                            type="date"
                            value={cmpTempTo}
                            min={cmpTempFrom}
                            onChange={(e) => setCmpTempTo(e.target.value)}
                            className="w-full bg-admin-card border border-admin-border rounded-md px-2 py-1.5 text-xs text-admin-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 text-xs h-7 border-admin-border"
                            onClick={() => setShowCmpCustom(false)}
                          >
                            Hủy
                          </Button>
                          <Button
                            className="flex-1 text-xs h-7 bg-admin-primary hover:bg-admin-primary/90"
                            onClick={applyCompareCustom}
                            disabled={!cmpTempFrom || !cmpTempTo}
                          >
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {compareMode !== "none" && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs text-admin-muted-foreground bg-admin-card border border-admin-border px-3 rounded-full whitespace-nowrap ${H}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-admin-muted-foreground/40 shrink-0" />
            {cmpLabelShort}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const g = card.growth;
          const showGrowth = g && g.value !== "—" && compareMode !== "none";
          return (
            <div
              key={card.title}
              className="bg-admin-card border border-admin-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {showGrowth && (
                  <span
                    className={`flex items-center text-xs font-medium ${g!.isPositive ? "text-green-500" : "text-red-400"}`}
                  >
                    {g!.isNew ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10">
                        Mới
                      </span>
                    ) : (
                      <>
                        {g!.isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {g!.value}
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-admin-foreground truncate">
                {card.value}
              </p>
              <p className="text-sm text-admin-muted-foreground">
                {card.title}
              </p>
              <p className="text-xs text-admin-muted-foreground mt-1 truncate">
                {card.sub}
              </p>
              {showGrowth && !g!.isNew && g!.prevValue > 0 && card.fmtPrev && (
                <p className="text-[10px] text-admin-muted-foreground mt-1.5 pt-1.5 border-t border-admin-border/50 truncate">
                  Kỳ trước: {card.fmtPrev(g!.prevValue)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-admin-foreground">
              Doanh thu
            </h2>
            <span className="text-xs text-admin-muted-foreground">
              {rangeModeLabel(rangeMode, range)}
            </span>
          </div>
          {revenueChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-admin-muted-foreground">
              Không có dữ liệu
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatShort}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                    formatter={(v: number) => [formatCurrency(v), "Doanh thu"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-admin-foreground">
              Số đơn hàng
            </h2>
            <span className="text-xs text-admin-muted-foreground">
              {rangeModeLabel(rangeMode, range)}
            </span>
          </div>
          {revenueChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-admin-muted-foreground">
              Không có dữ liệu
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                    formatter={(v: number) => [v, "Đơn hàng"]}
                  />
                  <Bar dataKey="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">
            Top 5 Khóa học
          </h2>
          {topCourses.length === 0 ? (
            <p className="text-admin-muted-foreground text-sm">
              Chưa có dữ liệu trong khoảng này
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">
                      Khóa học
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground hidden sm:table-cell">
                      Số học viên
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((course, i) => (
                    <tr
                      key={course.id}
                      className="border-b border-admin-border/50 hover:bg-admin-accent/50"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              i === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : i === 1
                                  ? "bg-gray-400/20 text-gray-400"
                                  : i === 2
                                    ? "bg-orange-500/20 text-orange-500"
                                    : "bg-admin-accent text-admin-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs font-medium text-admin-foreground truncate max-w-[120px]">
                            {course.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-admin-muted-foreground hidden sm:table-cell">
                        {course.students}
                      </td>
                      <td className="py-2 px-2 text-xs font-semibold text-green-500 whitespace-nowrap">
                        {formatShort(course.revenue)}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">
            Đơn hàng gần đây
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-admin-muted-foreground text-sm">
              Không có đơn hàng trong khoảng này
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">
                      Mã đơn
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground hidden sm:table-cell">
                      Người mua
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">
                      Số tiền
                    </th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const s = STATUS_MAP[order.paymentStatus];
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-admin-border/50 hover:bg-admin-accent/50"
                      >
                        <td className="py-2 px-2 text-xs font-mono text-admin-primary">
                          {order.orderCode}
                        </td>
                        <td className="py-2 px-2 text-xs text-admin-foreground truncate max-w-[100px] hidden sm:table-cell">
                          {order.createdBy}
                        </td>
                        <td className="py-2 px-2 text-xs font-medium text-admin-foreground whitespace-nowrap">
                          {formatCurrency(order.finalAmount)}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${s?.cls}`}
                          >
                            {s?.label ?? order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

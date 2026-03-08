import { useEffect, useState } from 'react';
import {
  DollarSign, Users, BookOpen, ShoppingCart,
  TrendingUp, Star, ArrowUpRight, ArrowDownRight, Download, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import orderService from '@/services/orderService';
import userService from '@/services/userService';
import courseService from '@/services/courseService';
import reviewService from '@/services/reviewService';
import { OrderResponse, AdminCourse } from '@/types';
import { toast } from 'sonner';

// ==================== Helpers ====================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const formatShort = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000)     return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000)         return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const formatDateTime = (s: string) => new Date(s).toLocaleString('vi-VN');

const MONTH_NAMES = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

// Nhóm orders theo tháng → doanh thu + số đơn
function buildRevenueChart(orders: OrderResponse[]) {
  const map: Record<string, { revenue: number; orders: number }> = {};
  orders.forEach(o => {
    const d   = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = { revenue: 0, orders: 0 };
    if (o.paymentStatus === 'COMPLETED') map[key].revenue += o.finalAmount;
    map[key].orders++;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // 6 tháng gần nhất
    .map(([key, v]) => {
      const [, m] = key.split('-');
      return { month: MONTH_NAMES[parseInt(m) - 1], ...v };
    });
}

// Tính % tăng trưởng tháng này vs tháng trước
interface Growth { value: string; isPositive: boolean; isNew: boolean }

function calcGrowth(orders: OrderResponse[], mode: 'revenue' | 'orders' | 'students' | 'completed'): Growth {
  const now  = new Date();
  const thisY = now.getFullYear(), thisM = now.getMonth();
  const prevM = thisM === 0 ? 11 : thisM - 1;
  const prevY = thisM === 0 ? thisY - 1 : thisY;

  const inMonth = (o: OrderResponse, y: number, m: number) => {
    const d = new Date(o.createdAt);
    return d.getFullYear() === y && d.getMonth() === m;
  };

  let cur = 0, prev = 0;
  if (mode === 'revenue') {
    cur  = orders.filter(o => o.paymentStatus === 'COMPLETED' && inMonth(o, thisY, thisM)).reduce((s, o) => s + o.finalAmount, 0);
    prev = orders.filter(o => o.paymentStatus === 'COMPLETED' && inMonth(o, prevY, prevM)).reduce((s, o) => s + o.finalAmount, 0);
  } else if (mode === 'orders') {
    cur  = orders.filter(o => inMonth(o, thisY, thisM)).length;
    prev = orders.filter(o => inMonth(o, prevY, prevM)).length;
  } else if (mode === 'completed') {
    cur  = orders.filter(o => o.paymentStatus === 'COMPLETED' && inMonth(o, thisY, thisM)).length;
    prev = orders.filter(o => o.paymentStatus === 'COMPLETED' && inMonth(o, prevY, prevM)).length;
  }

  if (prev === 0 && cur === 0) return { value: '—', isPositive: true, isNew: false };
  if (prev === 0) return { value: 'Mới', isPositive: true, isNew: true };
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { value: `${pct > 0 ? '+' : ''}${pct}%`, isPositive: pct >= 0, isNew: false };
}

// Top 5 courses theo số đơn hàng chứa course đó
function buildTopCourses(orders: OrderResponse[]) {
  const map: Record<string, { title: string; students: number; revenue: number }> = {};
  orders.filter(o => o.paymentStatus === 'COMPLETED').forEach(o => {
    o.orderItems.forEach(item => {
      if (!map[item.courseId]) map[item.courseId] = { title: item.courseName, students: 0, revenue: 0 };
      map[item.courseId].students++;
      map[item.courseId].revenue += item.finalPrice;
    });
  });
  return Object.entries(map)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

// ==================== Component ====================

interface Stats {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  avgRating: number;
  growth: {
    revenue: Growth;
    orders: Growth;
    completed: Growth;
  };
  revenueChart: { month: string; revenue: number; orders: number }[];
  topCourses: { id: string; title: string; students: number; revenue: number }[];
  recentOrders: OrderResponse[];
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      // Fetch song song
      const [ordersRes, usersRes, coursesRes, reviewsRes] = await Promise.allSettled([
        orderService.getAdminOrders({ page: 1, pageSize: 200 }),
        userService.getStudents({ page: 1, pageSize: 1 }),
        courseService.getAdminCourses({ page: 1, pageSize: 1 }),
        reviewService.getAdminReviews({ page: 1, pageSize: 200 }),
      ]);

      const orders: OrderResponse[] =
        ordersRes.status === 'fulfilled' ? ordersRes.value.result : [];
      const totalStudents =
        usersRes.status === 'fulfilled' ? usersRes.value.meta.total : 0;
      const totalCourses =
        coursesRes.status === 'fulfilled' ? coursesRes.value.meta.total : 0;
      const reviews =
        reviewsRes.status === 'fulfilled' ? reviewsRes.value.result : [];

      const completedOrders = orders.filter(o => o.paymentStatus === 'COMPLETED');
      const pendingOrders   = orders.filter(o => o.paymentStatus === 'PENDING');
      const totalRevenue    = completedOrders.reduce((s, o) => s + o.finalAmount, 0);
      const avgRating       = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

      setStats({
        totalRevenue,
        totalStudents,
        totalCourses,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        avgRating,
        growth: {
          revenue:   calcGrowth(orders, 'revenue'),
          orders:    calcGrowth(orders, 'orders'),
          completed: calcGrowth(orders, 'completed'),
        },
        revenueChart: buildRevenueChart(orders),
        topCourses: buildTopCourses(orders),
        recentOrders: [...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
      });
    } catch (err) {
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Export CSV ──────────────────────────────────────────────
  const handleExport = () => {
    if (!stats) return;
    const lines = [
      ['=== BÁO CÁO TỔNG QUAN ==='],
      ['Tổng doanh thu', formatCurrency(stats.totalRevenue)],
      ['Tổng học viên', stats.totalStudents],
      ['Tổng khóa học', stats.totalCourses],
      ['Tổng đơn hàng', stats.totalOrders],
      ['Đơn hoàn thành', stats.completedOrders],
      ['Đơn đang xử lý', stats.pendingOrders],
      ['Đánh giá TB', stats.avgRating.toFixed(1)],
      [],
      ['=== DOANH THU THEO THÁNG ==='],
      ['Tháng', 'Doanh thu', 'Số đơn'],
      ...stats.revenueChart.map(r => [r.month, formatCurrency(r.revenue), r.orders]),
      [],
      ['=== TOP 5 KHÓA HỌC ==='],
      ['Tên khóa học', 'Học viên', 'Doanh thu'],
      ...stats.topCourses.map(c => [c.title, c.students, formatCurrency(c.revenue)]),
      [],
      ['=== ĐƠN HÀNG GẦN ĐÂY ==='],
      ['Mã đơn', 'Người mua', 'Số tiền', 'Trạng thái', 'Ngày tạo'],
      ...stats.recentOrders.map(o => [
        o.orderCode, o.createdBy, formatCurrency(o.finalAmount),
        o.paymentStatus, formatDateTime(o.createdAt),
      ]),
    ];
    const csv  = lines.map(r => (Array.isArray(r) ? r.join(',') : r)).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Xuất báo cáo thành công!');
  };

  // ── Skeleton ─────────────────────────────────────────────────
  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-admin-accent rounded w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-admin-card border border-admin-border rounded-xl p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-admin-card border border-admin-border rounded-xl h-80" />
        <div className="bg-admin-card border border-admin-border rounded-xl h-80" />
      </div>
    </div>
  );

  if (!stats) return null;

  const kpiCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      bg: 'bg-green-500/10', color: 'text-green-500',
      sub: `${stats.completedOrders} đơn hoàn thành`,
      growth: stats.growth.revenue,
    },
    {
      title: 'Học viên',
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      bg: 'bg-blue-500/10', color: 'text-blue-500',
      sub: 'Tổng số học viên',
      growth: null,
    },
    {
      title: 'Khóa học',
      value: stats.totalCourses.toString(),
      icon: BookOpen,
      bg: 'bg-purple-500/10', color: 'text-purple-500',
      sub: 'Đang hoạt động',
      growth: null,
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      bg: 'bg-orange-500/10', color: 'text-orange-500',
      sub: `${stats.pendingOrders} đang xử lý`,
      growth: stats.growth.orders,
    },
    {
      title: 'Tỉ lệ hoàn thành',
      value: stats.totalOrders
        ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`
        : '0%',
      icon: TrendingUp,
      bg: 'bg-emerald-500/10', color: 'text-emerald-500',
      sub: 'Đơn hoàn thành / Tổng',
      growth: stats.growth.completed,
    },
    {
      title: 'Đánh giá TB',
      value: stats.avgRating.toFixed(1),
      icon: Star,
      bg: 'bg-yellow-500/10', color: 'text-yellow-500',
      sub: 'Trên thang điểm 5',
      growth: null,
    },
  ];

  const STATUS_MAP: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Hoàn thành', className: 'bg-green-500/10 text-green-500' },
    PENDING:   { label: 'Đang xử lý', className: 'bg-yellow-500/10 text-yellow-500' },
    REFUNDED:  { label: 'Hoàn tiền',  className: 'bg-blue-500/10 text-blue-500' },
    CANCELLED: { label: 'Đã hủy',     className: 'bg-red-500/10 text-red-500' },
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">Dashboard</h1>
          <p className="text-admin-muted-foreground">Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAll}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent">
            <RefreshCw className="w-4 h-4 mr-2" />Làm mới
          </Button>
          <Button onClick={handleExport} className="bg-admin-primary hover:bg-admin-primary/90">
            <Download className="w-4 h-4 mr-2" />Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiCards.map((card) => {
          const Icon = card.icon;
          const g = card.growth;
          return (
            <div key={card.title}
              className="bg-admin-card border border-admin-border rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {g && g.value !== '—' && (
                  <span className={`flex items-center text-xs font-medium ${g.isPositive ? 'text-green-500' : 'text-red-400'}`}>
                    {g.isNew ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10">Mới</span>
                    ) : (
                      <>
                        {g.isPositive
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownRight className="w-3 h-3" />}
                        {g.value}
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-admin-foreground truncate">{card.value}</p>
              <p className="text-sm text-admin-muted-foreground">{card.title}</p>
              <p className="text-xs text-admin-muted-foreground mt-1 truncate">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Doanh thu theo tháng */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">Doanh thu theo tháng</h2>
          {stats.revenueChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-admin-muted-foreground">Chưa có dữ liệu</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={formatShort} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2}
                    fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Số đơn hàng theo tháng */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">Số đơn hàng theo tháng</h2>
          {stats.revenueChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-admin-muted-foreground">Chưa có dữ liệu</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(v: number) => [v, 'Đơn hàng']}
                  />
                  <Bar dataKey="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 5 courses */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">Top 5 Khóa học</h2>
          {stats.topCourses.length === 0 ? (
            <p className="text-admin-muted-foreground text-sm">Chưa có dữ liệu</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">Khóa học</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground hidden sm:table-cell">Học viên</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCourses.map((course, i) => (
                    <tr key={course.id} className="border-b border-admin-border/50 hover:bg-admin-accent/50">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            i === 1 ? 'bg-gray-400/20 text-gray-400' :
                            i === 2 ? 'bg-orange-500/20 text-orange-500' :
                            'bg-admin-accent text-admin-muted-foreground'
                          }`}>{i + 1}</span>
                          <span className="text-xs font-medium text-admin-foreground truncate max-w-[120px]">{course.title}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-admin-muted-foreground hidden sm:table-cell">{course.students}</td>
                      <td className="py-2 px-2 text-xs font-semibold text-green-500 whitespace-nowrap">{formatShort(course.revenue)}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">Đơn hàng gần đây</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-admin-muted-foreground text-sm">Chưa có đơn hàng nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">Mã đơn</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground hidden sm:table-cell">Người mua</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">Số tiền</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-admin-muted-foreground">TT</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => {
                    const s = STATUS_MAP[order.paymentStatus];
                    return (
                      <tr key={order._id} className="border-b border-admin-border/50 hover:bg-admin-accent/50">
                        <td className="py-2 px-2 text-xs font-mono text-admin-primary">{order.orderCode}</td>
                        <td className="py-2 px-2 text-xs text-admin-foreground truncate max-w-[100px] hidden sm:table-cell">
                          {order.createdBy}
                        </td>
                        <td className="py-2 px-2 text-xs font-medium text-admin-foreground whitespace-nowrap">
                          {formatCurrency(order.finalAmount)}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${s?.className}`}>
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
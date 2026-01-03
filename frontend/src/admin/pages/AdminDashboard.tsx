import { 
  DollarSign, 
  Users, 
  BookOpen, 
  ShoppingCart, 
  TrendingUp, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { 
  dashboardStats, 
  revenueChartData, 
  topCourses, 
  recentOrders 
} from '@/data/adminMockData';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortCurrency = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const kpiCards = [
  { 
    title: 'Tổng doanh thu', 
    value: formatCurrency(dashboardStats.totalRevenue), 
    icon: DollarSign, 
    change: '+12.5%', 
    isPositive: true,
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  { 
    title: 'Học viên', 
    value: dashboardStats.totalStudents.toLocaleString(), 
    icon: Users, 
    change: '+8.2%', 
    isPositive: true,
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  { 
    title: 'Khoá học', 
    value: dashboardStats.totalCourses.toString(), 
    icon: BookOpen, 
    change: '+3', 
    isPositive: true,
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  { 
    title: 'Đơn hàng', 
    value: dashboardStats.totalOrders.toString(), 
    icon: ShoppingCart, 
    change: '+15.3%', 
    isPositive: true,
    bgColor: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  { 
    title: 'Tỉ lệ hoàn thành', 
    value: `${Math.round((dashboardStats.completedOrders / dashboardStats.totalOrders) * 100)}%`, 
    icon: TrendingUp, 
    change: '+2.1%', 
    isPositive: true,
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  { 
    title: 'Đánh giá TB', 
    value: dashboardStats.avgRating, 
    icon: Star, 
    change: '+0.2', 
    isPositive: true,
    bgColor: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-foreground">Dashboard</h1>
        <p className="text-admin-muted-foreground">Tổng quan về hoạt động kinh doanh</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index}
              className="bg-admin-card border border-admin-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span className={`flex items-center text-xs font-medium ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-xl font-bold text-admin-foreground truncate">{card.value}</p>
              <p className="text-sm text-admin-muted-foreground">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">Doanh thu theo tháng</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis 
                  stroke="#9ca3af" 
                  tickFormatter={(value) => formatShortCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Courses */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-admin-foreground mb-4">Top 5 Khoá học</h2>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-500' :
                  'bg-admin-accent text-admin-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-admin-foreground truncate">{course.title}</p>
                  <p className="text-xs text-admin-muted-foreground">{course.students} học viên</p>
                </div>
                <span className="text-sm font-semibold text-green-500">
                  {formatShortCurrency(course.revenue)}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-admin-foreground mb-4">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-admin-muted-foreground">Mã đơn</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-admin-muted-foreground">Học viên</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-admin-muted-foreground hidden md:table-cell">Khoá học</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-admin-muted-foreground">Số tiền</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-admin-muted-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-admin-border/50 hover:bg-admin-accent/50">
                  <td className="py-3 px-4 text-sm font-mono text-admin-foreground">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-admin-foreground">{order.studentName}</td>
                  <td className="py-3 px-4 text-sm text-admin-muted-foreground truncate max-w-[200px] hidden md:table-cell">{order.courseTitle}</td>
                  <td className="py-3 px-4 text-sm font-medium text-admin-foreground">{formatCurrency(order.amount)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      order.status === 'Refunded' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {order.status === 'Completed' ? 'Hoàn thành' :
                       order.status === 'Pending' ? 'Chờ xử lý' :
                       order.status === 'Refunded' ? 'Hoàn tiền' : 'Thất bại'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Aggregating live business analytics..." />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      change: '+14.2% this month'
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      change: `${stats.pendingOrders} pending fulfillment`
    },
    {
      label: 'Products Catalog',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      change: `${stats.totalCategories} departments`
    },
    {
      label: 'Registered Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      change: 'Active shoppers'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Executive Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics, order throughput, inventory levels, and revenue performance.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>{card.change}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trends Chart (Recharts) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Revenue Trajectory
              </h3>
              <p className="text-xs text-slate-400">Monthly gross sales performance</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
              Live Aggregate
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Bar Chart) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Catalog Depth
              </h3>
              <p className="text-xs text-slate-400">Products per category</p>
            </div>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryStats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="productCount" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Tables: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              Recent Inbound Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((ord) => (
                <div key={ord._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{ord.orderNumber}</span>
                    <p className="text-[11px] text-slate-400">
                      {ord.userId?.name || 'Customer'} • {ord.items?.length || 1} items
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      ${ord.totalAmount?.toFixed(2)}
                    </span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No orders recorded yet.</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              Top Catalog Highlights
            </h3>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={p.mainImg}
                      alt={p.title}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-xs">{p.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {p.stock} in stock • {p.numReviews || 0} reviews
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-black text-slate-900">
                    ${p.finalPrice?.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No products available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

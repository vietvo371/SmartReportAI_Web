"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Users, UserCog, Activity, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

type StatusStat = { trang_thai: string; _count: { id: number } };
type TypeStat = { loai_su_co: string; _count: { id: number } };
type LocationStat = { vi_tri: string; _count: { id: number } };

type StatisticsResponse = {
  statistics: {
    totalReports: number;
    totalUsers: number;
    totalStaff: number;
    statusStats: StatusStat[];
    typeStats: TypeStat[];
    locationStats: LocationStat[];
    avgProcessingTime?: number | null;
    timeSeries?: Array<{ date: string; count: number }>; 
  };
};

export default function AdminStatisticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatisticsResponse["statistics"] | null>(null);
  const [filters, setFilters] = useState<{ loai_su_co: string; from: string; to: string }>({
    loai_su_co: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (filters.loai_su_co) params.append("loai_su_co", filters.loai_su_co);
        if (filters.from && filters.to) {
          params.append("thoi_gian_bat_dau", new Date(filters.from).toISOString());
          params.append("thoi_gian_ket_thuc", new Date(filters.to).toISOString());
        }
        const res = await fetch(`/api/admin/statistics?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: StatisticsResponse = await res.json();
        setStats(data.statistics);
      } catch (e: any) {
        setError(e?.message || "Không thể tải thống kê");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [filters]);

  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return stats.statusStats.map(s => ({ name: s.trang_thai, value: s._count.id }));
  }, [stats]);

  const typeChartData = useMemo(() => {
    if (!stats) return [];
    return stats.typeStats.map(t => ({ name: t.loai_su_co, value: t._count.id }));
  }, [stats]);

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6"]; 
  const timeSeriesData = useMemo(() => stats?.timeSeries || [], [stats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thống kê</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thống kê</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tổng quan hệ thống phản ánh đô thị</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4 text-gray-900 dark:text-white font-semibold">
          <Filter className="w-5 h-5" />
          Bộ lọc
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Loại sự cố</label>
            <input
              value={filters.loai_su_co}
              onChange={(e) => setFilters({ ...filters, loai_su_co: e.target.value })}
              placeholder="ví dụ: moi_truong, thien_tai"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ loai_su_co: "", from: "", to: "" })}
              className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReports}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng phản ánh</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <UserCog className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStaff}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng cán bộ</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgProcessingTime ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Thời gian xử lý TB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Xu hướng theo ngày</h3>
          <div className="h-72">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theo trạng thái</h3>
          <div className="h-64">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theo loại sự cố</h3>
          <div className="h-64">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {typeChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Khu vực nhiều sự cố</h3>
          <div className="space-y-3">
            {stats.locationStats.map((l) => (
              <div key={l.vi_tri} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[60%]">{l.vi_tri}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{l._count.id}</span>
              </div>
            ))}
            {stats.locationStats.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



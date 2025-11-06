"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Users, UserCog, Activity, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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

  const renderTrangThai = (trangThai: string) => {
    switch (trangThai) {
      case 'da_hoan_tat':
        return 'Đã hoàn thành';
      case 'cho_xu_ly':
        return 'Chờ xử lý';
      case 'dang_xu_ly':
        return 'Đang xử lý';
      default:
        return 'Chờ xử lý';
    }
  };

  const renderLoaiSuCo = (loaiSuCo: string) => {
    switch (loaiSuCo) {
      case 'pothole':
        return 'Hố ga/Lún đường';
      case 'flooding':
        return 'Ngập nước';
      case 'traffic_light':
        return 'Đèn giao thông';
      case 'waste':
        return 'Rác thải';
      case 'traffic_jam':
        return 'Kẹt xe';
      default:
        return 'Không xác định';  
    }
  };

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

  // Status Chart Data for ApexCharts
  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return stats.statusStats.map(s => s._count.id);
  }, [stats]);

  const statusChartCategories = useMemo(() => {
    if (!stats) return [];
    return stats.statusStats.map(s => renderTrangThai(s.trang_thai));
  }, [stats]);

  // Type Chart Data for ApexCharts
  const typeChartData = useMemo(() => {
    if (!stats) return [];
    return stats.typeStats.map(t => t._count.id);
  }, [stats]);

  const typeChartCategories = useMemo(() => {
    if (!stats) return [];
    return stats.typeStats.map(t => renderLoaiSuCo(t.loai_su_co));
  }, [stats]);

  // Time Series Data for ApexCharts
  const timeSeriesData = useMemo(() => {
    if (!stats?.timeSeries) return [];
    return stats.timeSeries.map(item => item.count);
  }, [stats]);

  const timeSeriesCategories = useMemo(() => {
    if (!stats?.timeSeries) return [];
    return stats.timeSeries.map(item => item.date);
  }, [stats]);
  // Status Chart Options
  const statusChartOptions: ApexOptions = {
    colors: ["#22c55e"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    xaxis: {
      categories: statusChartCategories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  // Type Chart Options (Pie)
  const typeChartOptions: ApexOptions = {
    colors: ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      toolbar: {
        show: false,
      },
    },
    labels: typeChartCategories,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
    },
  };

  // Time Series Chart Options
  const timeSeriesChartOptions: ApexOptions = {
    colors: ["#3b82f6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: timeSeriesCategories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
    },
    grid: {
      show: true,
      borderColor: "#e5e7eb",
    },
  };

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
        {/* Time Series Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Xu hướng theo ngày</h3>
          <div className="h-72">
            {timeSeriesData.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <ReactApexChart
                  options={timeSeriesChartOptions}
                  series={[
                    {
                      name: "Số lượng phản ánh",
                      data: timeSeriesData,
                    },
                  ]}
                  type="line"
                  height={280}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theo trạng thái</h3>
          <div className="h-64">
            {statusChartData.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <ReactApexChart
                  options={statusChartOptions}
                  series={[
                    {
                      name: "Số lượng",
                      data: statusChartData,
                    },
                  ]}
                  type="bar"
                  height={256}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Type Chart (Pie) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theo loại sự cố</h3>
          <div className="h-64">
            {typeChartData.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <ReactApexChart
                  options={typeChartOptions}
                  series={typeChartData}
                  type="pie"
                  height={256}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Location Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Khu vực nhiều sự cố</h3>
          <div className="space-y-4">
            {stats.locationStats.length > 0 ? (
              stats.locationStats.map((l, idx) => {
                const maxCount = Math.max(...stats.locationStats.map(x => x._count.id));
                const percentage = (l._count.id / maxCount) * 100;
                return (
                  <div key={l.vi_tri} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300" title={l.vi_tri}>
                        {l.vi_tri}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{l._count.id}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Không có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



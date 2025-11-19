"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  List,
  CheckCircle,
  Clock,
  Camera,
  Users,
  BarChart3,
  AlertCircle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

type StaffDashboardStats = {
  assignedTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
};

type RecentTask = {
  id: number;
  tieu_de: string;
  trang_thai: string;
  loai_su_co: string;
  muc_do_nghiem_trong: number;
  dia_chi: string | null;
  updated_at: string;
};

type RecentActivity = {
  id: number;
  phan_anh_id: number;
  noi_dung: string | null;
  trang_thai_moi: string;
  thoi_gian: string;
  phan_anh: {
    id: number;
    tieu_de: string;
  } | null;
};

type DashboardResponse = {
  stats: StaffDashboardStats;
  recentTasks: RecentTask[];
  recentActivities: RecentActivity[];
};

const defaultStats: StaffDashboardStats = {
  assignedTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  pendingTasks: 0,
};

export default function StaffDashboard() {
  const { token, user } = useAuthStore();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          setError("Bạn cần đăng nhập lại để xem số liệu.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/staff/dashboard", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Không thể tải dữ liệu bảng điều khiển.");
        }

        const payload: DashboardResponse = await res.json();
        setData(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const stats = data?.stats ?? defaultStats;

  const statCards = useMemo(
    () => [
      {
        label: "Nhiệm vụ được giao",
        value: stats.assignedTasks,
        icon: List,
        accent: "bg-blue-100 dark:bg-blue-900",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        label: "Đang xử lý",
        value: stats.inProgressTasks,
        icon: Clock,
        accent: "bg-yellow-100 dark:bg-yellow-900",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      },
      {
        label: "Đã hoàn thành",
        value: stats.completedTasks,
        icon: CheckCircle,
        accent: "bg-green-100 dark:bg-green-900",
        iconColor: "text-green-600 dark:text-green-400",
      },
      {
        label: "Chờ xử lý",
        value: stats.pendingTasks,
        icon: Users,
        accent: "bg-red-100 dark:bg-red-900",
        iconColor: "text-red-600 dark:text-red-400",
      },
    ],
    [stats],
  );

  const statusConfig: Record<
    string,
    { label: string; badge: string; color: string }
  > = {
    cho_xu_ly: {
      label: "Chờ xử lý",
      badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      color: "text-red-600 dark:text-red-400",
    },
    dang_xu_ly: {
      label: "Đang xử lý",
      badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      color: "text-yellow-600 dark:text-yellow-400",
    },
    da_hoan_tat: {
      label: "Hoàn thành",
      badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      color: "text-green-600 dark:text-green-400",
    },
  };

  const formatUpdatedAt = (value: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const quickActions = [
    {
      title: "Nhiệm vụ được giao",
      description: "Xem danh sách nhiệm vụ",
      icon: List,
      href: "/staff/assigned-tasks",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Đang xử lý",
      description: "Các phản ánh đang xử lý",
      icon: Clock,
      href: "/staff/in-progress",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      title: "Upload minh chứng",
      description: "Tải lên ảnh minh chứng",
      icon: Camera,
      href: "/staff/upload-evidence",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Thống kê cá nhân",
      description: "Xem hiệu suất làm việc",
      icon: BarChart3,
      href: "/staff/statistics",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bảng điều khiển Cán Bộ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Xin chào {user?.ho_ten || "cán bộ"}, đây là tình hình xử lý nhiệm vụ mới nhất.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.accent}`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {loading ? "..." : card.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link href={action.href}>
                <div className={`${action.color} text-white rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg`}>
                  <action.icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nhiệm vụ gần đây
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        ) : data?.recentTasks.length ? (
          <div className="space-y-4">
            {data.recentTasks.map((task) => {
              const config = statusConfig[task.trang_thai] ?? statusConfig["cho_xu_ly"];
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {task.tieu_de}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {config.label} • Cập nhật {formatUpdatedAt(task.updated_at)}
                    </p>
                    {task.dia_chi && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {task.dia_chi}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.badge}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có nhiệm vụ nào được ghi nhận.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nhật ký xử lý gần đây
          </h2>
          <Activity className="h-5 w-5 text-brand-500" />
        </div>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        ) : data?.recentActivities.length ? (
          <div className="space-y-4">
            {data.recentActivities.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {log.phan_anh?.tieu_de || `Phản ánh #${log.phan_anh_id}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatUpdatedAt(log.thoi_gian)}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {log.noi_dung || "Đã cập nhật trạng thái"}
                </p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusConfig[log.trang_thai_moi]?.badge || statusConfig["dang_xu_ly"].badge
                }`}>
                  {statusConfig[log.trang_thai_moi]?.label || log.trang_thai_moi}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có nhật ký xử lý nào được tạo.
          </p>
        )}
      </div>
    </div>
  );
}

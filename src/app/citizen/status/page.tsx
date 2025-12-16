"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  User,
  Calendar,
  MapPin,
  RefreshCw,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface ProcessingStatus {
  id: number;
  phan_anh_id: number;
  tieu_de: string;
  loai_su_co: string;
  trang_thai: string;
  noi_dung: string;
  thoi_gian: string;
  hinh_anh_minh_chung?: string | null;
  can_bo_ho_ten?: string;
  can_bo_email?: string | null;
  muc_do_nghiem_trong?: number;
  created_at?: string;
}

type StatusResponse = {
  statuses: ProcessingStatus[];
};

const statusConfig = {
  cho_xu_ly: {
    title: "Chờ xử lý",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
    description: "Phản ánh của bạn đã được tiếp nhận và đang chờ xử lý",
  },
  dang_xu_ly: {
    title: "Đang xử lý",
    icon: Clock,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    description: "Cán bộ đang tiến hành xử lý sự cố",
  },
  da_hoan_tat: {
    title: "Đã hoàn thành",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    description: "Sự cố đã được xử lý hoàn tất",
  },
};

const severityStyles: Record<string, string> = {
  Cao: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  "Trung bình":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Thấp: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const priorityLabels = (severity?: number) => {
  if (!severity) return "Không xác định";
  if (severity >= 4) return "Cao";
  if (severity >= 3) return "Trung bình";
  return "Thấp";
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(date);
};

const renderLoaiSuCo = (loaiSuCo: string) => {
  const labels: Record<string, string> = {
    pothole: "Ổ gà/Lún đường",
    flooding: "Ngập nước",
    traffic_light: "Đèn giao thông",
    waste: "Rác thải",
    traffic_jam: "Ùn tắc",
    other: "Khác",
  };
  return labels[loaiSuCo] || "Không xác định";
};

export default function CitizenStatusPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { error: showError } = useToast();
  const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    try {
      if (!token) {
        setError("Vui lòng đăng nhập để xem trạng thái");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await fetch("/api/citizen/status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải trạng thái");
      }

      const data: StatusResponse = await response.json();
      setStatuses(data.statuses || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Group statuses by status
  const statusesByStatus = useMemo(() => {
    const grouped: Record<string, ProcessingStatus[]> = {
      cho_xu_ly: [],
      dang_xu_ly: [],
      da_hoan_tat: [],
    };

    statuses.forEach((status) => {
      if (grouped[status.trang_thai]) {
        grouped[status.trang_thai].push(status);
      }
    });

    // Sort by thoi_gian descending
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort(
        (a, b) =>
          new Date(b.thoi_gian).getTime() - new Date(a.thoi_gian).getTime()
      );
    });

    return grouped;
  }, [statuses]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = statuses.length;
    const completed = statusesByStatus.da_hoan_tat.length;
    const inProgress = statusesByStatus.dang_xu_ly.length;
    const pending = statusesByStatus.cho_xu_ly.length;

    // Calculate average response time (time from created_at to first update)
    const statusesWithUpdate = statuses.filter(
      (s) => s.noi_dung && s.noi_dung !== "Phản ánh đã được tiếp nhận và đang chờ xử lý"
    );
    const responseTimes = statusesWithUpdate.map((s) => {
      const created = new Date(s.created_at || s.thoi_gian).getTime();
      const updated = new Date(s.thoi_gian).getTime();
      return (updated - created) / 60000; // minutes
    });
    const avgResponseMinutes =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : 0;

    // Calculate completion rate
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      avgResponseMinutes,
      completionRate,
    };
  }, [statuses, statusesByStatus]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error && statuses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Trạng thái phản ánh
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Theo dõi tiến độ xử lý phản ánh sự cố của bạn
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Không thể tải dữ liệu</h3>
              <p className="mt-1 text-sm">{error}</p>
              <button
                onClick={() => fetchStatuses()}
                className="mt-3 text-sm font-semibold underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trạng thái phản ánh
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Theo dõi tiến độ xử lý phản ánh sự cố của bạn
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="text-center">
            <Eye className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có phản ánh nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Trạng thái sẽ hiển thị khi bạn có phản ánh sự cố
            </p>
            <Link
              href="/citizen/new-report"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Tạo phản ánh mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stages = [
    {
      status: "cho_xu_ly" as const,
      ...statusConfig.cho_xu_ly,
      items: statusesByStatus.cho_xu_ly,
    },
    {
      status: "dang_xu_ly" as const,
      ...statusConfig.dang_xu_ly,
      items: statusesByStatus.dang_xu_ly,
    },
    {
      status: "da_hoan_tat" as const,
      ...statusConfig.da_hoan_tat,
      items: statusesByStatus.da_hoan_tat,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Theo dõi phản ánh
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Trạng thái phản ánh của tôi
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Theo dõi tiến độ xử lý phản ánh sự cố của bạn
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchStatuses()}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
          <Link
            href="/citizen/new-report"
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            + Tạo phản ánh mới
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Tổng số",
            value: summaryMetrics.total,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
          },
          {
            label: "Chờ xử lý",
            value: summaryMetrics.pending,
            color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
          },
          {
            label: "Đang xử lý",
            value: summaryMetrics.inProgress,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
          },
          {
            label: "Đã hoàn thành",
            value: summaryMetrics.completed,
            color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.status}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stage.title}
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stage.items.length} phản ánh
                  </h3>
                </div>
                <span className={`rounded-full p-2 ${stage.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {stage.items.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    Không có phản ánh nào
                  </p>
                ) : (
                  stage.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-100 p-4 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5 cursor-pointer"
                      onClick={() => router.push(`/citizen/my-requests`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase text-gray-400">
                          #{item.phan_anh_id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            severityStyles[priorityLabels(item.muc_do_nghiem_trong)]
                          }`}
                        >
                          {priorityLabels(item.muc_do_nghiem_trong)}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {item.tieu_de}
                      </p>
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                        <FileText className="h-3 w-3" />
                        <span>{renderLoaiSuCo(item.loai_su_co)}</span>
                      </div>
                      {item.can_bo_ho_ten && item.can_bo_ho_ten !== "Chưa phân công" && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3" />
                          <span>{item.can_bo_ho_ten}</span>
                        </div>
                      )}
                      {item.noi_dung && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {item.noi_dung}
                        </p>
                      )}
                      {item.hinh_anh_minh_chung && (
                        <div className="mb-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <ImageIcon className="h-3 w-3" />
                          <span>Có hình ảnh minh chứng</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimeAgo(item.thoi_gian)}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/citizen/my-requests`);
                          }}
                          className="flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tổng quan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Thống kê về phản ánh của bạn
            </p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {summaryMetrics.completionRate}% hoàn thành
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Thời gian phản hồi TB",
              value:
                summaryMetrics.avgResponseMinutes > 0
                  ? `${Math.floor(summaryMetrics.avgResponseMinutes / 60)}h ${summaryMetrics.avgResponseMinutes % 60}m`
                  : "--",
            },
            {
              label: "Tổng số phản ánh",
              value: summaryMetrics.total.toString(),
            },
            {
              label: "Tỷ lệ hoàn thành",
              value: `${summaryMetrics.completionRate}%`,
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-dashed border-gray-200 p-4 text-center dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Process Guide */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quy trình xử lý phản ánh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.status} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${stage.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {stage.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

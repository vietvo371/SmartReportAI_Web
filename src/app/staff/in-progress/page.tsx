"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ClipboardCheck,
  Loader2,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";

type StaffReport = {
  id: number;
  tieu_de: string;
  mo_ta: string | null;
  loai_su_co: string;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  dia_chi: string | null;
  created_at: string;
  updated_at: string;
  nguoi_dan: {
    ho_ten: string;
    email: string;
    so_dien_thoai: string | null;
  } | null;
  latestUpdate: {
    id: number;
    trang_thai_moi: string;
    noi_dung: string | null;
    hinh_anh_minh_chung: string | null;
    thoi_gian: string;
  } | null;
};

type AssignedReportResponse = {
  reports: StaffReport[];
};

const statusConfig = {
  cho_xu_ly: {
    title: "Chờ xử lý",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
  },
  dang_xu_ly: {
    title: "Đang xử lý",
    icon: Clock,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  },
  da_hoan_tat: {
    title: "Đã hoàn thành",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
  },
};

const severityStyles: Record<string, string> = {
  Cao: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  "Trung bình":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Thấp: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const priorityLabels = (severity: number) => {
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

export default function StaffInProgressPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { error: showError } = useToast();
  const [reports, setReports] = useState<StaffReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      if (!token) {
        setError("Vui lòng đăng nhập lại để xem danh sách nhiệm vụ.");
        return;
      }
      setLoading(true);
      setError(null);

      const res = await fetch("/api/staff/assigned-reports?scope=mine", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải danh sách nhiệm vụ.");
      }

      const payload: AssignedReportResponse = await res.json();
      setReports(payload.reports);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Group reports by status
  const reportsByStatus = useMemo(() => {
    const grouped: Record<string, StaffReport[]> = {
      cho_xu_ly: [],
      dang_xu_ly: [],
      da_hoan_tat: [],
    };

    reports.forEach((report) => {
      if (grouped[report.trang_thai]) {
        grouped[report.trang_thai].push(report);
      }
    });

    // Sort by updated_at descending
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

    return grouped;
  }, [reports]);

  // Calculate SLA metrics
  const slaMetrics = useMemo(() => {
    const total = reports.length;
    const completed = reportsByStatus.da_hoan_tat.length;
    const inProgress = reportsByStatus.dang_xu_ly.length;
    const pending = reportsByStatus.cho_xu_ly.length;

    // Calculate average response time (time from created_at to first xu_ly)
    const reportsWithResponse = reports.filter((r) => r.latestUpdate);
    const responseTimes = reportsWithResponse.map((r) => {
      const created = new Date(r.created_at).getTime();
      const firstUpdate = new Date(r.latestUpdate!.thoi_gian).getTime();
      return (firstUpdate - created) / 60000; // minutes
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

    // Count delayed tasks (in progress for more than 24 hours)
    const delayedCount = reportsByStatus.dang_xu_ly.filter((r) => {
      const updated = new Date(r.updated_at).getTime();
      const now = new Date().getTime();
      return (now - updated) / 3600000 > 24; // more than 24 hours
    }).length;

    return {
      total,
      completed,
      inProgress,
      pending,
      avgResponseMinutes,
      completionRate,
      delayedCount,
    };
  }, [reports, reportsByStatus]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Không thể tải dữ liệu</h3>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => fetchReports()}
              className="mt-3 text-sm font-semibold underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stages = [
    {
      status: "cho_xu_ly" as const,
      ...statusConfig.cho_xu_ly,
      items: reportsByStatus.cho_xu_ly,
    },
    {
      status: "dang_xu_ly" as const,
      ...statusConfig.dang_xu_ly,
      items: reportsByStatus.dang_xu_ly,
    },
    {
      status: "da_hoan_tat" as const,
      ...statusConfig.da_hoan_tat,
      items: reportsByStatus.da_hoan_tat,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Vòng đời xử lý
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Theo dõi tiến trình các phản ánh
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Cập nhật trạng thái theo thời gian thực để phối hợp hiệu quả.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchReports()}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Làm mới
          </button>
          <button
            onClick={() => router.push("/staff/assigned-tasks")}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Xem tất cả nhiệm vụ
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.status}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stage.title}
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stage.items.length} nhiệm vụ
                  </h3>
                </div>
                <span className={`rounded-full p-2 ${stage.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {stage.items.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    Không có nhiệm vụ nào
                  </p>
                ) : (
                  stage.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-100 p-4 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5 cursor-pointer"
                      onClick={() => router.push(`/staff/reports/${item.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-gray-400">
                          #{item.id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            severityStyles[priorityLabels(item.muc_do_nghiem_trong)]
                          }`}
                        >
                          {priorityLabels(item.muc_do_nghiem_trong)}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {item.tieu_de}
                      </p>
                      {item.nguoi_dan && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Người báo cáo:{" "}
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            {item.nguoi_dan.ho_ten}
                          </span>
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Cập nhật {formatTimeAgo(item.updated_at)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/staff/reports/${item.id}`);
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

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tổng quan SLA
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cam kết xử lý theo từng cấp độ ưu tiên
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {slaMetrics.completionRate}% hoàn thành
            </span>
            {slaMetrics.delayedCount > 0 && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                {slaMetrics.delayedCount} cảnh báo trễ
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Thời gian phản hồi TB",
              value:
                slaMetrics.avgResponseMinutes > 0
                  ? `${Math.floor(slaMetrics.avgResponseMinutes / 60)}h ${slaMetrics.avgResponseMinutes % 60}m`
                  : "--",
            },
            {
              label: "Tổng số nhiệm vụ",
              value: slaMetrics.total.toString(),
            },
            {
              label: "Tỷ lệ hoàn thành",
              value: `${slaMetrics.completionRate}%`,
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
    </div>
  );
}

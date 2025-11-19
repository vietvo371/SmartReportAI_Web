"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, Target, ShieldCheck, Activity } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";

type StatsResponse = {
  summary: {
    totalAssigned: number;
    inProgress: number;
    completed: number;
    pending: number;
    avgHandleHours: number | null;
    avgResponseMinutes: number | null;
    averageRating: number | null;
  };
  trend: {
    label: string;
    completed: number;
    inProgress: number;
  }[];
  recentRatings: {
    id: number;
    diem: number;
    nhan_xet: string | null;
    created_at: string;
  }[];
};

const formatDuration = (hours: number | null, fallback = "--") => {
  if (hours === null) return fallback;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const formatMinutes = (minutes: number | null, fallback = "--") => {
  if (minutes === null) return fallback;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m} phút`;
};

export default function StaffStatisticsPage() {
  const { token } = useAuthStore();
  const { error } = useToast();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/staff/statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải thống kê.");
      }
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể tải thống kê.");
    } finally {
      setLoading(false);
    }
  }, [error, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const performanceCards = useMemo(() => {
    const summary = data?.summary;
    return [
      {
        title: "Nhiệm vụ hoàn thành",
        value: loading ? "--" : summary?.completed ?? 0,
        change: `Tổng ${summary?.totalAssigned ?? 0} nhiệm vụ`,
        icon: ShieldCheck,
        color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
      },
      {
        title: "Trung bình xử lý",
        value: loading ? "--" : formatDuration(summary?.avgHandleHours),
        change: `Phản hồi: ${formatMinutes(summary?.avgResponseMinutes)}`,
        icon: Activity,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
      },
      {
        title: "Điểm đánh giá",
        value: loading
          ? "--"
          : summary?.averageRating
          ? `${summary.averageRating.toFixed(1)}/5`
          : "Chưa có",
        change: `${data?.recentRatings.length ?? 0} lượt đánh giá gần nhất`,
        icon: Target,
        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
      },
    ];
  }, [data, loading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Hiệu suất cá nhân
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thống kê và báo cáo hiệu quả công việc
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Đo lường mức độ hoàn thành, thời gian xử lý và đánh giá người dân.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Làm mới thống kê
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {performanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <span className={`rounded-full p-2 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Xu hướng hoàn thành theo tuần
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dữ liệu {data?.trend.length ?? 0} tuần gần nhất
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-brand-600" />
          </div>
          <div className="mt-6 space-y-4">
            {(data?.trend ?? []).map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span>{item.label}</span>
                  <div className="flex gap-6 text-xs">
                    <span>Hoàn thành: {item.completed}</span>
                    <span>Đang xử lý: {item.inProgress}</span>
                  </div>
                </div>
                <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <span
                    className="bg-brand-600"
                    style={{
                      width: `${item.completed + item.inProgress === 0 ? 0 : (item.completed / (item.completed + item.inProgress)) * 100}%`,
                    }}
                  />
                  <span
                    className="bg-yellow-400"
                    style={{
                      width: `${item.completed + item.inProgress === 0 ? 0 : (item.inProgress / (item.completed + item.inProgress)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {(!data?.trend || data.trend.length === 0) && !loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chưa có dữ liệu để hiển thị.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Phản hồi & đánh giá gần nhất
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data?.recentRatings.length ?? 0} phản hồi mới
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(data?.recentRatings ?? []).map((rating) => (
              <div
                key={rating.id}
                className="rounded-2xl border border-dashed border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "medium",
                    }).format(new Date(rating.created_at))}
                  </span>
                  <span className="font-semibold text-brand-600">
                    {rating.diem.toFixed(1)} ★
                  </span>
                </div>
                <p className="mt-2 text-gray-900 dark:text-white">
                  {rating.nhan_xet || "Không có nội dung đánh giá."}
                </p>
              </div>
            ))}
            {(!data?.recentRatings || data.recentRatings.length === 0) && !loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chưa có phản hồi nào gần đây.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


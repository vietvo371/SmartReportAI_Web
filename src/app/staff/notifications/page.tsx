"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Clock3, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";

type StaffNotification = {
  id: number;
  tieu_de: string;
  noi_dung: string;
  da_doc: boolean;
  created_at: string;
};

type NotificationCategory = "action" | "success" | "warning" | "info";

const typeStyles: Record<
  NotificationCategory,
  {
    icon: typeof Bell;
    color: string;
    badge: string;
  }
> = {
  action: {
    icon: Bell,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-200",
    badge: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-200",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-200",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200",
  },
  info: {
    icon: Clock3,
    color: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  },
};

const inferCategory = (notification: StaffNotification): NotificationCategory => {
  const title = notification.tieu_de.toLowerCase();
  if (title.includes("ưu tiên") || title.includes("nhận nhiệm vụ") || title.includes("minh chứng")) {
    return "action";
  }
  if (title.includes("đánh giá") || title.includes("cảm ơn")) {
    return "success";
  }
  if (title.includes("nhắc") || title.includes("hạn")) {
    return "warning";
  }
  return "info";
};

export default function StaffNotificationsPage() {
  const { token } = useAuthStore();
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/staff/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải thông báo.");
      }
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  }, [error, token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadIds = useMemo(
    () => notifications.filter((notif) => !notif.da_doc).map((notif) => notif.id),
    [notifications],
  );

  const handleMarkAllRead = async () => {
    if (unreadIds.length === 0 || !token) return;
    try {
      setMarking(true);
      const res = await fetch("/api/staff/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: unreadIds, read: true }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể cập nhật thông báo.");
      }
      success("Đã đánh dấu tất cả thông báo là đã đọc");
      await fetchNotifications();
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể cập nhật thông báo.");
    } finally {
      setMarking(false);
    }
  };

  const formatTimestamp = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Trung tâm thông báo
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thông báo và cập nhật mới nhất
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Nắm bắt các yêu cầu hành động, nhắc nhở và phản hồi quan trọng.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={handleMarkAllRead}
            disabled={unreadIds.length === 0 || marking}
          >
            {marking ? "Đang cập nhật..." : "Đánh dấu tất cả đã đọc"}
          </button>
          <button
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={fetchNotifications}
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải thông báo...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Không có thông báo nào gần đây.
            </p>
          ) : (
            notifications.map((item) => {
              const category = inferCategory(item);
              const styles = typeStyles[category];
              const Icon = styles.icon;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border border-gray-100 p-5 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/30 dark:border-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5 ${
                    item.da_doc ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl p-3 ${styles.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {item.tieu_de}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
                        >
                          {formatTimestamp(item.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {item.noi_dung}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bộ lọc nhanh
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                <span>Thông báo chưa đọc</span>
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-300">
                  {unreadIds.length}
                </span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                <span>Hành động ưu tiên</span>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-300">
                  {
                    notifications.filter(
                      (notification) => inferCategory(notification) === "warning",
                    ).length
                  }
                </span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                <span>Phản hồi tích cực</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-300">
                  {
                    notifications.filter(
                      (notification) => inferCategory(notification) === "success",
                    ).length
                  }
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">Tối ưu thông báo</h3>
            <p className="mt-2 text-sm text-brand-100">
              Cá nhân hóa kênh nhận thông báo để không bỏ lỡ yêu cầu quan trọng.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-brand-50">
              <li>• Nhận SMS khi có nhiệm vụ khẩn.</li>
              <li>• Tự động ghim thông báo hành động.</li>
              <li>• Đặt nhắc nhở lặp cho nhiệm vụ dài hạn.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


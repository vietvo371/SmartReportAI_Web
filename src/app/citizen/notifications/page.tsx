"use client";

import { useAuthStore } from "@/store/authStore";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface Notification {
  id: number;
  tieu_de: string;
  noi_dung: string;
  da_doc: boolean;
  created_at: string;
}

export default function CitizenNotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/citizen/notifications?userId=${user.id}&filter=${filter}`
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        } else {
          setError("Không thể tải thông báo");
        }
      } catch (err) {
        console.error("Fetch notifications error:", err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, filter]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `/api/citizen/notifications/${notificationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ da_doc: true }),
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, da_doc: true } : n
          )
        );
      }
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`/api/citizen/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, da_doc: true }))
        );
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.da_doc).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thông báo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý thông báo của bạn
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "unread"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "read"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Đã đọc
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không có thông báo nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn sẽ nhận được thông báo khi có cập nhật mới
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 transition-all ${
                notification.da_doc
                  ? "border-gray-200 bg-white dark:border-white/[0.08] dark:bg-gray-900/30"
                  : "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-900/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {notification.da_doc ? (
                    <CheckCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold ${
                      notification.da_doc
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {notification.tieu_de}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      notification.da_doc
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {notification.noi_dung}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                {!notification.da_doc && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-4 px-3 py-1 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Đánh dấu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


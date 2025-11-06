"use client";

import { useAuthStore } from "@/store/authStore";
import { Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ProcessingStatus {
  id: number;
  phan_anh_id: number;
  tieu_de: string;
  loai_su_co: string;
  trang_thai: string;
  noi_dung: string;
  thoi_gian: string;
}

export default function CitizenStatusPage() {
  const { user } = useAuthStore();
  const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStatuses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/citizen/status?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStatuses(data.statuses || []);
        } else {
          setError("Không thể tải trạng thái");
        }
      } catch (err) {
        console.error("Fetch status error:", err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "dang_xu_ly":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "da_hoan_tat":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return <AlertCircle className="w-5 h-5" />;
      case "dang_xu_ly":
        return <Clock className="w-5 h-5" />;
      case "da_hoan_tat":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return "Chờ xử lý";
      case "dang_xu_ly":
        return "Đang xử lý";
      case "da_hoan_tat":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Trạng thái cứu trợ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi tiến độ xử lý yêu cầu của bạn
        </p>
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
      ) : statuses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Eye className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Không có trạng thái nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Trạng thái sẽ hiển thị khi bạn có yêu cầu đang xử lý
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status.tieu_de}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ID yêu cầu: #{status.phan_anh_id}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    status.trang_thai
                  )}`}
                >
                  {getStatusIcon(status.trang_thai)}
                  {getStatusText(status.trang_thai)}
                </span>
              </div>

              <div className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Cập nhật mới nhất:</strong> {status.noi_dung || "Chưa có cập nhật"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(status.thoi_gian).toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Loại sự cố</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.loai_su_co}
                  </p>
                </div>
              </div>

              <button className="mt-4 w-full px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-medium transition-colors">
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Guide */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quy trình xử lý
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Chờ xử lý</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Yêu cầu của bạn đã nhận được
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Đang xử lý</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Đội ngũ đang tiếp cận giải quyết
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Đã hoàn thành</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Yêu cầu của bạn đã xong
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


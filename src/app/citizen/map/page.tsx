"use client";

import { useEffect, useState } from "react";
import { MapPin, AlertCircle, Loader } from "lucide-react";

interface Report {
  id: number;
  tieu_de: string;
  loai_su_co: string;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  vi_do: number;
  kinh_do: number;
  created_at: string;
}

export default function CitizenMapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed">("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/citizen/reports/map?filter=${filter}`);
        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        } else {
          setError("Không thể tải dữ liệu bản đồ");
        }
      } catch (err) {
        console.error("Fetch map error:", err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return "bg-yellow-100 text-yellow-800";
      case "dang_xu_ly":
        return "bg-blue-100 text-blue-800";
      case "da_hoan_tat":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getSeverityColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-orange-500";
      case 4:
        return "bg-red-500";
      case 5:
        return "bg-red-700";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityLabel = (level: number) => {
    const labels = {
      1: "Thấp",
      2: "Trung bình",
      3: "Cao",
      4: "Rất cao",
      5: "Khẩn cấp",
    };
    return labels[level as keyof typeof labels] || "Không xác định";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bản đồ sự cố
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Xem các sự cố được báo cáo trên bản đồ
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "pending"
              ? "bg-yellow-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Chờ xử lý
        </button>
        <button
          onClick={() => setFilter("processing")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "processing"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Đang xử lý
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "completed"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Đã hoàn thành
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <Loader className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải bản đồ...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không có sự cố nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy sự cố phù hợp với bộ lọc
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map placeholder */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.08] dark:bg-gray-800 p-6 h-96 lg:h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Bản đồ tương tác (cần tích hợp Google Maps hoặc Leaflet)
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Hiện tại đang hiển thị danh sách sự cố bên cạnh
                </p>
              </div>
            </div>
          </div>

          {/* Reports list */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Danh sách sự cố ({reports.length})
            </h3>
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReport?.id === report.id
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-800 hover:border-green-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${getSeverityColor(
                      report.muc_do_nghiem_trong
                    )}`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {report.tieu_de}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      #{report.id}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded ${getStatusColor(
                          report.trang_thai
                        )}`}
                      >
                        {getStatusText(report.trang_thai)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected report details */}
      {selectedReport && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Chi tiết sự cố
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tiêu đề</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedReport.tieu_de}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Loại sự cố</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedReport.loai_su_co}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái</span>
              <p
                className={`font-medium inline-block px-2 py-1 rounded text-sm ${getStatusColor(
                  selectedReport.trang_thai
                )}`}
              >
                {getStatusText(selectedReport.trang_thai)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Mức độ</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {getSeverityLabel(selectedReport.muc_do_nghiem_trong)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tọa độ</span>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {selectedReport.vi_do.toFixed(5)}, {selectedReport.kinh_do.toFixed(5)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Ngày tạo</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedReport.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


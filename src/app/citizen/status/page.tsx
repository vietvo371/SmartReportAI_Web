"use client";

import { useAuthStore } from "@/store/authStore";
import { Eye, CheckCircle, Clock, AlertCircle, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
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

export default function CitizenStatusPage() {
  const { token } = useAuthStore();
  const [statuses, setStatuses] = useState<ProcessingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!token) {
          setError("Vui lòng đăng nhập để xem trạng thái");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/citizen/status", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatuses(data.statuses || []);
        } else if (response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError("Không thể tải trạng thái");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchStatuses();
    } else {
      setIsLoading(false);
    }
  }, [token]);

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

  const getSeverityColor = (severity?: number) => {
    if (!severity) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    if (severity >= 4) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (severity >= 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  };

  const getSeverityText = (severity?: number) => {
    if (!severity) return 'Không xác định';
    if (severity >= 4) return 'Nghiêm trọng';
    if (severity >= 3) return 'Trung bình';
    return 'Nhẹ';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Trạng thái phản ánh
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi tiến độ xử lý phản ánh sự cố của bạn
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : statuses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Eye className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có phản ánh nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Trạng thái sẽ hiển thị khi bạn có phản ánh sự cố
            </p>
            <Link href="/citizen/new-report" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Tạo phản ánh mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {status.tieu_de}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: #{status.phan_anh_id}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSeverityColor(status.muc_do_nghiem_trong)}`}>
                      {getSeverityText(status.muc_do_nghiem_trong)}
                    </span>
                  </div>
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

              <div className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Cập nhật mới nhất:</strong>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {status.noi_dung || "Chưa có cập nhật"}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(status.thoi_gian).toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {status.hinh_anh_minh_chung && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Hình ảnh minh chứng:</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={status.hinh_anh_minh_chung}
                      alt="Hình ảnh minh chứng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Loại sự cố</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {renderLoaiSuCo(status.loai_su_co)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Cán bộ xử lý</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.can_bo_ho_ten || "Chưa phân công"}
                    </p>
                  </div>
                </div>
              </div>

              <Link href={`/citizen/my-requests`}>
                <button className="w-full px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors">
                  Xem chi tiết
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Guide */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quy trình xử lý phản ánh
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
                Phản ánh của bạn đã được tiếp nhận và đang chờ xử lý
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
                Cán bộ đang tiến hành xử lý sự cố
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
                Sự cố đã được xử lý hoàn tất
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


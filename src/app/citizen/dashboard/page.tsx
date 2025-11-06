"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { AlertCircle, FileText, CheckCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";

type Report = {
  id: number;
  tieu_de: string;
  loai_su_co: string;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  created_at: string;
};

type DashboardStats = {
  total: number;
  dang_xu_ly: number;
  da_hoan_tat: number;
  recent: Report[];
};

export default function CitizenDashboard() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!token) {
          setError("Token không có sẵn");
          setLoading(false);
          return;
        }
        
        const res = await fetch("/api/citizen/dashboard", {
          cache: "no-store",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else if (res.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError("Không thể tải dữ liệu thống kê");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [token]);

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

  const renderTrangThai = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly':
        return { text: 'Chờ xử lý', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
      case 'dang_xu_ly':
        return { text: 'Đang xử lý', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' };
      case 'da_hoan_tat':
        return { text: 'Đã hoàn thành', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
      default:
        return { text: 'Không xác định', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Xin chào, {user?.ho_ten}!</h1>
            <p className="text-blue-100 mt-1">
              Báo cáo sự cố đô thị và theo dõi tình trạng xử lý
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tổng phản ánh
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? "-" : stats?.total || 0}
              </p>
            </div>
            <FileText className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Đang xử lý
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {loading ? "-" : stats?.dang_xu_ly || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Đã hoàn thành
              </p>
              <p className="text-3xl font-bold text-green-600">
                {loading ? "-" : stats?.da_hoan_tat || 0}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Báo cáo sự cố?
        </h2>
        <Link href="/citizen/new-report" className="block">
          <button className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors font-semibold">
            <Plus className="w-6 h-6" />
            Tạo phản ánh sự cố mới
          </button>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
          Giúp chúng tôi cải thiện đô thị bằng cách báo cáo các sự cố
        </p>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Phản ánh gần đây
          </h2>
          <Link href="/citizen/my-requests" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : stats?.recent && stats.recent.length > 0 ? (
          <div className="space-y-3">
            {stats.recent.map((report) => {
              const status = renderTrangThai(report.trang_thai);
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {report.tieu_de}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {renderLoaiSuCo(report.loai_su_co)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Bạn chưa có phản ánh nào
            </p>
            <Link href="/citizen/new-report" className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium">
              Tạo phản ánh đầu tiên →
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Cách hoạt động
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>1. Báo cáo sự cố với mô tả chi tiết và hình ảnh</li>
              <li>2. Hệ thống sẽ xác minh và phân loại sự cố</li>
              <li>3. Cán bộ sẽ tiến hành xử lý vấn đề</li>
              <li>4. Theo dõi tiến độ xử lý thời gian thực</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}


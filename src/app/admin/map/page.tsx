"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { MapPin, AlertCircle, Loader, Filter as FilterIcon } from "lucide-react";
import MapboxMap from "@/components/ui/map/MapboxMap";
import { Report } from "@/types/report";

export default function MapPage() {
  const { token } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed">("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!token) {
          setError("Vui lòng đăng nhập để xem bản đồ");
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/admin/reports?limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform API response to Report type
          const transformedReports: Report[] = (data.reports || []).map((report: any) => ({
            id: report.id,
            loai_su_co: report.loai_su_co,
            vi_do: report.vi_do,
            kinh_do: report.kinh_do,
            trang_thai: report.trang_thai,
            muc_do_nghiem_trong: report.muc_do_nghiem_trong,
            tieu_de: report.tieu_de,
            mo_ta: report.mo_ta || '',
            nguoi_dung: report.nguoi_dung ? {
              ho_ten: report.nguoi_dung.ho_ten,
              email: report.nguoi_dung.email,
              so_dien_thoai: report.nguoi_dung.so_dien_thoai,
            } : undefined,
            created_at: report.created_at,
          }));
          setReports(transformedReports);
        } else if (response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else if (response.status === 403) {
          setError("Bạn không có quyền truy cập trang này.");
        } else {
          setError("Không thể tải dữ liệu bản đồ");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchReports();
    } else {
      setIsLoading(false);
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

  // Filter reports
  const filteredReports = reports.filter(report => {
    // Filter by status
    if (filter === "pending" && report.trang_thai !== "cho_xu_ly") return false;
    if (filter === "processing" && report.trang_thai !== "dang_xu_ly") return false;
    if (filter === "completed" && report.trang_thai !== "da_hoan_tat") return false;
    
    // Filter by issue type
    if (issueTypeFilter !== "all" && report.loai_su_co !== issueTypeFilter) return false;
    
    // Filter by priority
    if (priorityFilter !== "all") {
      const priority = report.muc_do_nghiem_trong >= 4 ? 'critical' : 
                     report.muc_do_nghiem_trong >= 3 ? 'high' :
                     report.muc_do_nghiem_trong >= 2 ? 'medium' : 'low';
      if (priority !== priorityFilter) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bản đồ phản ánh
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Xem trực quan tất cả phản ánh sự cố trên bản đồ Đà Nẵng
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Loader className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bản đồ phản ánh
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Xem trực quan tất cả phản ánh sự cố trên bản đồ Đà Nẵng
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bản đồ phản ánh
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Xem trực quan tất cả phản ánh sự cố trên bản đồ Đà Nẵng
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <FilterIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">Bộ lọc</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Chờ xử lý
            </button>
            <button
              onClick={() => setFilter("processing")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "processing"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Đang xử lý
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Đã hoàn thành
            </button>
          </div>

          {/* Issue Type Filter */}
          <select
            value={issueTypeFilter}
            onChange={(e) => setIssueTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả loại sự cố</option>
            <option value="pothole">Hố ga/Lún đường</option>
            <option value="flooding">Ngập nước</option>
            <option value="traffic_light">Đèn giao thông</option>
            <option value="waste">Rác thải</option>
            <option value="traffic_jam">Kẹt xe</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="critical">Nghiêm trọng (4-5)</option>
            <option value="high">Cao (3)</option>
            <option value="medium">Trung bình (2)</option>
            <option value="low">Nhẹ (1)</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Hiển thị <span className="font-semibold">{filteredReports.length}</span> / <span className="font-semibold">{reports.length}</span> phản ánh
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không có phản ánh nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy phản ánh phù hợp với bộ lọc
          </p>
        </div>
      ) : (
        <>
          {/* Map Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[600px]">
              <MapboxMap 
                className="w-full h-full" 
                reports={filteredReports}
                center={[108.2022, 16.0544]} // Đà Nẵng
                zoom={12}
                autoFitBounds={true} // Tự động fit bounds khi có reports
              />
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Chú thích
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Mức độ nghiêm trọng</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Nghiêm trọng (4-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Trung bình (3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Nhẹ (2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Rất nhẹ (1)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Trạng thái</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Chờ xử lý</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Đang xử lý</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Đã hoàn thành</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Loại sự cố</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Hố ga/Lún đường</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Ngập nước</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Đèn giao thông</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Rác thải</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Kẹt xe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

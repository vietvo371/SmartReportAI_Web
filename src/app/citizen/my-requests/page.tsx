"use client";

import { useAuthStore } from "@/store/authStore";
import { FileText, Plus, Clock, CheckCircle, AlertCircle, MapPin, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";

interface Request {
  id: number;
  tieu_de: string;
  mo_ta: string;
  loai_su_co: string;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  vi_do: number;
  kinh_do: number;
  dia_chi?: string | null;
  hinh_anh_url?: string;
  created_at: string;
}

export default function CitizenRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Request | null>(null);
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/citizen/reports?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data.reports || []);
        } else {
          setError("Không thể tải danh sách yêu cầu");
        }
      } catch (err) {
        console.error("Fetch requests error:", err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  // Initialize detail map
  useEffect(() => {
    if (!detailOpen || !detailTarget) return;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const token =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";
      (mapboxgl as any).accessToken = token;
      const container = document.getElementById("detail-map");
      if (!container) return;
      const lat = detailTarget.vi_do ?? 10.762622;
      const lng = detailTarget.kinh_do ?? 106.660172;
      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: 14,
      });
      map.on("load", () => {
        new mapboxgl.Marker({ color: "#10B981" }).setLngLat([lng, lat]).addTo(map);
        requestAnimationFrame(() => {
          try {
            map.resize();
          } catch {}
        });
      });
    })();
  }, [detailOpen, detailTarget]);

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
        return <AlertCircle className="w-4 h-4" />;
      case "dang_xu_ly":
        return <Clock className="w-4 h-4" />;
      case "da_hoan_tat":
        return <CheckCircle className="w-4 h-4" />;
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

  const getSeverityColor = (level: number) => {
    switch (level) {
      case 1:
        return "text-green-600 dark:text-green-400";
      case 2:
        return "text-yellow-600 dark:text-yellow-400";
      case 3:
        return "text-orange-600 dark:text-orange-400";
      case 4:
        return "text-red-600 dark:text-red-400";
      case 5:
        return "text-red-700 dark:text-red-300";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getLoaiSuCoText = (val: string) => {
    const map: Record<string, string> = {
      thoi_tiet: "Thời tiết xấu",
      moi_truong: "Ô nhiễm môi trường",
      thien_tai: "Thảm họa tự nhiên",
      tai_nan: "Tai nạn giao thông",
      khac: "Khác",
    };
    return map[val] || val;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Yêu cầu của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi các yêu cầu cứu trợ của bạn
          </p>
        </div>
        <button onClick={() => router.push("/citizen/new-report")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tạo yêu cầu mới
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
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <FileText className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có yêu cầu nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hãy tạo yêu cầu cứu trợ nếu bạn cần hỗ trợ
            </p>
            <button onClick={() => router.push("/citizen/new-report")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {request.tieu_de}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ID: #{request.id} · Tạo lúc:{" "}
                    {new Date(request.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    request.trang_thai
                  )}`}
                >
                  {getStatusIcon(request.trang_thai)}
                  {getStatusText(request.trang_thai)}
                </span>
              </div>

              {request.mo_ta && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                  {request.mo_ta}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-white/[0.08]">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Loại sự cố:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {getLoaiSuCoText(request.loai_su_co)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Mức độ:</span>
                  <span
                    className={`ml-2 font-medium ${getSeverityColor(
                      request.muc_do_nghiem_trong
                    )}`}
                  >
                    {getSeverityLabel(request.muc_do_nghiem_trong)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setDetailTarget(request);
                  setDetailOpen(true);
                }}
                className="mt-4 flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm"
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detailOpen && detailTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="rounded-2xl border border-gray-200 bg-white w-full max-w-2xl shadow-lg dark:border-white/[0.08] dark:bg-gray-900/60"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Chi tiết yêu cầu #{detailTarget.id}
                </h3>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 text-sm">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-gray-500 dark:text-gray-400">Loại sự cố</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getLoaiSuCoText(detailTarget.loai_su_co)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-gray-500 dark:text-gray-400">Mức độ</div>
                    <div className={`font-medium ${getSeverityColor(detailTarget.muc_do_nghiem_trong)}`}>
                      {getSeverityLabel(detailTarget.muc_do_nghiem_trong)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-gray-500 dark:text-gray-400">Trạng thái</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getStatusText(detailTarget.trang_thai)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-gray-500 dark:text-gray-400">Vị trí</div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {detailTarget.vi_do.toFixed(5)}, {detailTarget.kinh_do.toFixed(5)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-gray-500 dark:text-gray-400">Thời gian tạo</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(detailTarget.created_at)}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">Bản đồ</div>
                  <div
                    id="detail-map"
                    className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  />
                </div>

                {/* Tiêu đề */}
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">Tiêu đề</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {detailTarget.tieu_de}
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">Mô tả</div>
                  <div className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                    {detailTarget.mo_ta}
                  </div>
                </div>

                {/* Hình ảnh */}
                {detailTarget.hinh_anh_url && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-2">Hình ảnh</div>
                    <img
                      src={detailTarget.hinh_anh_url}
                      alt="report"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

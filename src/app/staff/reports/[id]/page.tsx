"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Calendar,
  MessageSquare,
  Loader2,
  Edit3,
  BarChart3,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/modal";

type Report = {
  id: number;
  tieu_de: string;
  mo_ta: string | null;
  loai_su_co: string;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  vi_do: number;
  kinh_do: number;
  dia_chi: string | null;
  hinh_anh_url: string | null;
  ai_nhan_dang: any;
  created_at: string;
  updated_at: string;
  nguoi_dung: {
    id: number;
    ho_ten: string;
    email: string;
    so_dien_thoai: string | null;
    dia_chi: string | null;
  } | null;
  can_bo: {
    id: number;
    ho_ten: string;
    email: string;
  } | null;
  xu_lys: Array<{
    id: number;
    noi_dung: string | null;
    trang_thai_moi: string;
    hinh_anh_minh_chung: string | null;
    thoi_gian: string;
    can_bo: {
      ho_ten: string;
      email: string;
    };
  }>;
  lich_su_danh_gias: Array<{
    id: number;
    diem: number;
    nhan_xet: string | null;
    created_at: string;
    nguoi_dung: {
      ho_ten: string;
    };
  }>;
  blockchain_logs: Array<{
    id: number;
    transaction_hash: string;
    hanh_dong: string;
    thoi_gian: string;
  }>;
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  da_hoan_tat: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    label: "Đã hoàn thành",
  },
  dang_xu_ly: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    label: "Đang xử lý",
  },
  cho_xu_ly: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    label: "Chờ xử lý",
  },
};

const incidentTypeLabels: Record<string, string> = {
  pothole: "Ổ gà",
  flooding: "Ngập lụt",
  traffic_light: "Đèn giao thông",
  waste: "Rác thải",
  traffic_jam: "Ùn tắc",
  other: "Khác",
};

export default function StaffReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { success, error: showError } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    trang_thai: "",
    noi_dung: "",
  });
  const [updating, setUpdating] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Vui lòng đăng nhập lại.");
        return;
      }

      const res = await fetch(`/api/staff/reports/${params.id}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải chi tiết phản ánh.");
      }

      const data = await res.json();
      setReport(data.report);
      setUpdateForm({
        trang_thai: data.report.trang_thai,
        noi_dung: "",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      if (!token) {
        showError("Phiên đăng nhập đã hết hạn.");
        return;
      }

      const res = await fetch(`/api/staff/reports/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể cập nhật trạng thái.");
      }

      const payload = await res.json();
      success(payload.message || "Cập nhật thành công!");
      setUpdateModalOpen(false);
      await fetchReport();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái.";
      showError(message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Không thể tải dữ liệu</h3>
            <p className="mt-1 text-sm">{error || "Phản ánh không tồn tại."}</p>
            <button
              onClick={() => router.back()}
              className="mt-3 text-sm font-semibold underline"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = statusStyles[report.trang_thai] ?? statusStyles.cho_xu_ly;
  const priorityLabel =
    report.muc_do_nghiem_trong >= 4
      ? "Khẩn cấp"
      : report.muc_do_nghiem_trong === 3
      ? "Cao"
      : report.muc_do_nghiem_trong === 2
      ? "Trung bình"
      : "Thấp";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Phản ánh #{report.id}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cập nhật lần cuối: {formatDate(report.updated_at)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setUpdateModalOpen(true)}
          disabled={report.trang_thai === "da_hoan_tat"}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Edit3 className="h-4 w-4" />
          Cập nhật trạng thái
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${statusStyle.bg}`}>
              <CheckCircle className={`h-5 w-5 ${statusStyle.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
              <p className={`font-semibold ${statusStyle.text}`}>
                {statusStyle.label}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                report.muc_do_nghiem_trong >= 4
                  ? "bg-red-50 dark:bg-red-900/20"
                  : "bg-yellow-50 dark:bg-yellow-900/20"
              }`}
            >
              <AlertCircle
                className={`h-5 w-5 ${
                  report.muc_do_nghiem_trong >= 4
                    ? "text-red-600 dark:text-red-300"
                    : "text-yellow-600 dark:text-yellow-300"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Độ ưu tiên</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {priorityLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2 dark:bg-blue-900/20">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loại sự cố</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {incidentTypeLabels[report.loai_su_co] || report.loai_su_co}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-50 p-2 dark:bg-purple-900/20">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ngày báo cáo</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(report.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Report Details */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {report.tieu_de}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mô tả chi tiết
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {report.mo_ta || "Không có mô tả"}
                </p>
              </div>

              {report.dia_chi && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Địa chỉ
                  </h3>
                  <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{report.dia_chi}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tọa độ GPS
                </h3>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                  {report.vi_do.toFixed(6)}, {report.kinh_do.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${report.vi_do},${report.kinh_do}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Xem trên bản đồ →
                </a>
              </div>
            </div>
          </div>

          {/* Images */}
          {report.hinh_anh_url && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <ImageIcon className="h-5 w-5" />
                Hình ảnh
              </h2>
              <img
                src={report.hinh_anh_url}
                alt="Hình ảnh phản ánh"
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Processing History */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Clock className="h-5 w-5" />
              Lịch sử xử lý ({report.xu_lys.length})
            </h2>
            {report.xu_lys.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chưa có bản ghi xử lý nào.
              </p>
            ) : (
              <div className="space-y-4">
                {report.xu_lys.map((xu_ly) => (
                  <div
                    key={xu_ly.id}
                    className="border-l-2 border-brand-200 pl-4 dark:border-brand-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {statusStyles[xu_ly.trang_thai_moi]?.label ||
                            xu_ly.trang_thai_moi}
                        </p>
                        {xu_ly.noi_dung && (
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {xu_ly.noi_dung}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Bởi {xu_ly.can_bo.ho_ten} • {formatDate(xu_ly.thoi_gian)}
                        </p>
                      </div>
                    </div>
                    {xu_ly.hinh_anh_minh_chung && (
                      <img
                        src={xu_ly.hinh_anh_minh_chung}
                        alt="Minh chứng"
                        className="mt-3 w-48 rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ratings */}
          {report.lich_su_danh_gias.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Star className="h-5 w-5" />
                Đánh giá từ người dân
              </h2>
              <div className="space-y-3">
                {report.lich_su_danh_gias.map((rating) => (
                  <div
                    key={rating.id}
                    className="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating.diem
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {rating.nguoi_dung.ho_ten}
                      </span>
                    </div>
                    {rating.nhan_xet && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {rating.nhan_xet}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(rating.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Reporter Info */}
        <div className="space-y-6">
          {/* Reporter Contact */}
          {report.nguoi_dung && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <User className="h-5 w-5" />
                Người báo cáo
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Họ tên</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {report.nguoi_dung.ho_ten}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a
                    href={`mailto:${report.nguoi_dung.email}`}
                    className="flex items-center gap-2 font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Mail className="h-4 w-4" />
                    {report.nguoi_dung.email}
                  </a>
                </div>
                {report.nguoi_dung.so_dien_thoai && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Số điện thoại
                    </p>
                    <a
                      href={`tel:${report.nguoi_dung.so_dien_thoai}`}
                      className="flex items-center gap-2 font-medium text-brand-600 hover:text-brand-700"
                    >
                      <Phone className="h-4 w-4" />
                      {report.nguoi_dung.so_dien_thoai}
                    </a>
                  </div>
                )}
                {report.nguoi_dung.dia_chi && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {report.nguoi_dung.dia_chi}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned Officer */}
          {report.can_bo && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5" />
                Cán bộ phụ trách
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {report.can_bo.ho_ten}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.can_bo.email}
                </p>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {report.ai_nhan_dang && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Phân tích AI
              </h2>
              <pre className="overflow-x-auto text-xs text-gray-700 dark:text-gray-300">
                {JSON.stringify(report.ai_nhan_dang, null, 2)}
              </pre>
            </div>
          )}

          {/* Blockchain Logs */}
          {report.blockchain_logs.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Blockchain Logs
              </h2>
              <div className="space-y-2">
                {report.blockchain_logs.map((log) => (
                  <div
                    key={log.id}
                    className="border-l-2 border-gray-200 pl-3 dark:border-gray-700"
                  >
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {log.hanh_dong}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-gray-500">
                      {log.transaction_hash}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatDate(log.thoi_gian)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        className="max-w-lg"
      >
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Cập nhật trạng thái
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái mới
              </label>
              <select
                value={updateForm.trang_thai}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, trang_thai: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="cho_xu_ly">Chờ xử lý</option>
                <option value="dang_xu_ly">Đang xử lý</option>
                <option value="da_hoan_tat">Đã hoàn thành</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi chú xử lý (tùy chọn)
              </label>
              <textarea
                value={updateForm.noi_dung}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, noi_dung: e.target.value })
                }
                rows={4}
                placeholder="Thêm ghi chú về tiến độ xử lý..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setUpdateModalOpen(false)}
                disabled={updating}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </span>
                ) : (
                  "Cập nhật"
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}


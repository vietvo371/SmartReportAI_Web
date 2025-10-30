"use client";

import { useEffect, useRef, useState } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, Clock, CheckCircle, MapPin, User, Calendar, Filter, Search, Plus, Trash2, Edit3, UserPlus, Eye } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/ToastContext";

interface Report {
  id: number;
  loai_su_co: string;
  mo_ta: string;
  vi_tri: string;
  trang_thai: string;
  muc_do_uu_tien: string;
  nguoi_bao_cao: string;
  thoi_gian_tao: string;
  nguoiDung: {
    ho_ten: string;
    email: string;
    so_dien_thoai: string;
  };
}

export default function ReportsPage() {
  const { success, error: toastError, warning } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<Array<{ id: number; ho_ten: string; email: string; vai_tro: string }>>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editForm, setEditForm] = useState({ trang_thai: 'cho_xu_ly', muc_do_nghiem_trong: '3', assign_can_bo_id: '', ghi_chu: '' });
  const [deletePopoverId, setDeletePopoverId] = useState<number | null>(null); // legacy popover (will be removed)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const [staff, setStaff] = useState<Array<{ id: number; ho_ten: string; email: string }>>([]);
  const [form, setForm] = useState({
    nguoi_dung_id: "",
    tieu_de: "",
    mo_ta: "",
    loai_su_co: "pothole",
    vi_do: "",
    kinh_do: "",
    hinh_anh_url: "",
    muc_do_nghiem_trong: "3",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  // Load users for dropdown when mở modal
  useEffect(() => {
    if (!createOpen) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/users?role=nguoi_dan', { cache: 'no-store' });
        const data = await res.json();
        setUsers(data.users || []);
      } catch (e) {
        console.error('Load users failed', e);
      }
    })();
  }, [createOpen]);

  // Load staff when mở edit modal
  useEffect(() => {
    if (!editOpen) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/users?role=can_bo', { cache: 'no-store' });
        const data = await res.json();
        setStaff(data.users || []);
      } catch (e) {
        console.error('Load staff failed', e);
      }
    })();
  }, [editOpen]);

  // Init detail map when detail modal opens
  useEffect(() => {
    if (!detailOpen || !detailTarget) return;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
      (mapboxgl as any).accessToken = token;
      const container = document.getElementById('detail-map');
      if (!container) return;
      const lat = (detailTarget as any).vi_do ?? 10.762622;
      const lng = (detailTarget as any).kinh_do ?? 106.660172;
      const map = new mapboxgl.Map({ container, style: 'mapbox://styles/mapbox/streets-v12', center: [lng, lat], zoom: 12 });
      map.on('load', () => {
        new mapboxgl.Marker({ color: '#2563eb' }).setLngLat([lng, lat]).addTo(map);
        requestAnimationFrame(() => { try { map.resize(); } catch {} });
      });
    })();
  }, [detailOpen, detailTarget]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      
      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async () => {
    try {
      setCreating(true);
      // Client validations
      if (!form.nguoi_dung_id || isNaN(Number(form.nguoi_dung_id))) {
        warning("Vui lòng nhập Người dùng ID hợp lệ");
        return;
      }
      if (!form.tieu_de.trim()) {
        warning("Vui lòng nhập Tiêu đề");
        return;
      }
      if (!form.loai_su_co.trim()) {
        warning("Vui lòng chọn Loại sự cố");
        return;
      }
      if (!form.vi_do || !form.kinh_do) {
        warning("Vui lòng chọn vị trí trên bản đồ");
        return;
      }
      const payload = {
        nguoi_dung_id: Number(form.nguoi_dung_id),
        tieu_de: form.tieu_de.trim(),
        mo_ta: form.mo_ta.trim() || null,
        loai_su_co: form.loai_su_co.trim(),
        vi_do: Number(form.vi_do),
        kinh_do: Number(form.kinh_do),
        hinh_anh_url: form.hinh_anh_url.trim() || null,
        muc_do_nghiem_trong: Number(form.muc_do_nghiem_trong),
      };
      // If a local file is selected, upload first to get URL
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('folder', 'reports');
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!up.ok) {
          let msg = `HTTP ${up.status}`; try { const j = await up.json(); if (j?.error) msg = j.error; } catch {}
          throw new Error(`Upload thất bại: ${msg}`);
        }
        const upJson = await up.json();
        payload.hinh_anh_url = upJson.url;
      }
      const res = await fetch('/api/admin/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          try { msg = await res.text(); } catch {}
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }
      await fetchReports();
      setCreateOpen(false);
      setForm({ nguoi_dung_id: "", tieu_de: "", mo_ta: "", loai_su_co: "pothole", vi_do: "", kinh_do: "", hinh_anh_url: "", muc_do_nghiem_trong: "3" });
      setSelectedFile(null);
      success("Tạo sự cố thành công");
    } catch (e: any) {
      console.error(e);
      toastError(`Tạo sự cố thất bại: ${e?.message || 'Không rõ lỗi'}`);
    } finally {
      setCreating(false);
    }
  };

  const updateReport = async (id: number, data: any) => {
    try {
      const res = await fetch('/api/admin/reports', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      await fetchReports();
      success("Cập nhật thành công");
    } catch (e: any) {
      console.error(e);
      toastError(`Cập nhật thất bại: ${e?.message || 'Không rõ lỗi'}`);
    }
  };

  const deleteReport = async (id: number) => {
    if (!confirm('Xóa sự cố này?')) return;
    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      await fetchReports();
      success("Đã xóa sự cố");
    } catch (e: any) {
      console.error(e);
      toastError(`Xóa thất bại: ${e?.message || 'Không rõ lỗi'}`);
    }
  };

  // Init mini Mapbox picker when modal opens
  useEffect(() => {
    if (!createOpen) return;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
      (mapboxgl as any).accessToken = token;
      if (!mapContainerRef.current) return;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.660172, 10.762622],
        zoom: 11,
      });
      mapRef.current.on('load', () => {
        // ensure proper rendering inside modal
        requestAnimationFrame(() => {
          try { mapRef.current?.resize(); } catch {}
        });
      });
      mapRef.current.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        setForm((prev) => ({ ...prev, vi_do: String(lat), kinh_do: String(lng) }));
        // Simple colored marker for reliability
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ color: '#10B981' });
        }
        markerRef.current.setLngLat([lng, lat]).addTo(mapRef.current);
      });
    })();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [createOpen]);

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "in-progress":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "pending":
        return "Chờ xử lý";
      case "in-progress":
        return "Đang xử lý";
      case "resolved":
        return "Đã giải quyết";
      default:
        return "Không xác định";
    }
  };

  const normalizeStatus = (status: string) => {
    if (!status) return "unknown";
    if (status === "cho_xu_ly") return "pending";
    if (status === "dang_xu_ly") return "in-progress";
    if (status === "da_hoan_tat") return "resolved";
    return status;
  };

  const getPriorityColor = (priority: string | number) => {
    // Normalize input: support numeric 1-5, English keys, and Vietnamese labels
    const norm = (() => {
      if (typeof priority === 'number') return priority;
      const p = String(priority).toLowerCase();
      if (["critical", "khẩn cấp", "khan cap", "5"].includes(p)) return 5;
      if (["very-high", "rất cao", "rat cao", "4"].includes(p)) return 4;
      if (["high", "cao", "3"].includes(p)) return 3;
      if (["medium", "trung bình", "trung binh", "2"].includes(p)) return 2;
      if (["low", "thấp", "thap", "1"].includes(p)) return 1;
      return 1;
    })();

    switch (norm) {
      case 5: // Khẩn cấp
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case 4: // Rất cao
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case 3: // Cao
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case 2: // Trung bình
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case 1: // Thấp
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
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

  const getLoaiSuCoText = (val: string) => {
    const map: Record<string, string> = {
      pothole: 'Ổ gà',
      flooding: 'Ngập lụt',
      traffic_light: 'Đèn giao thông',
      waste: 'Rác thải',
      traffic_jam: 'Kẹt xe',
      other: 'Khác',
    };
    return map[val] || val;
  };

  const filteredReports = reports.filter(report => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const loai = (report.loai_su_co || "").toLowerCase();
      const moTa = (report.mo_ta || "").toLowerCase();
      const viTri = ((report as any).vi_tri || "").toLowerCase();
      const hoTen = (report as any)?.nguoiDung?.ho_ten
        ? ((report as any).nguoiDung.ho_ten as string).toLowerCase()
        : ((report as any)?.nguoi_dung?.ho_ten as string | undefined)?.toLowerCase() || "";
      return (
        loai.includes(searchTerm) ||
        moTa.includes(searchTerm) ||
        viTri.includes(searchTerm) ||
        hoTen.includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý sự cố hạ tầng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi và quản lý tất cả sự cố được báo cáo
        </p>
      </div>

      {/* Actions & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Tạo sự cố
          </button>
          <div className="flex gap-4 flex-1 justify-end">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm sự cố..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="cho_xu_ly">Chờ xử lý</option>
            <option value="dang_xu_ly">Đang xử lý</option>
            <option value="da_hoan_tat">Đã hoàn tất</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tất cả mức độ</option>
            <option value="1">Thấp</option>
            <option value="2">Trung bình</option>
            <option value="3">Cao (Tính toán AI)</option>
            <option value="4">Rất cao</option>
            <option value="5">Khẩn cấp</option>
          </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Danh sách sự cố ({filteredReports.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Loại sự cố
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mức độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {getLoaiSuCoText((report as any).loai_su_co)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                    <p className="truncate" title={report.mo_ta}>
                      {report.mo_ta}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {(() => {
                        const lat = (report as any).vi_do as number | undefined;
                        const lng = (report as any).kinh_do as number | undefined;
                        if (typeof lat === 'number' && typeof lng === 'number') {
                          return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                        }
                        return (report as any).vi_tri || "—";
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.trang_thai)}
                      <span className="text-sm">{getStatusText(report.trang_thai)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const severity = (report as any).muc_do_uu_tien || ((): string => {
                        const n = (report as any).muc_do_nghiem_trong as number | undefined;
                        if (typeof n !== "number") return "Thấp";
                        if (n >= 5) return "Khẩn cấp";
                        if (n >= 4) return "Rất cao";
                        if (n >= 3) return "Cao";
                        if (n >= 2) return "Trung bình";
                        return "Thấp";
                      })();
                      return (
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(severity)}`}>
                          {severity}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {((report as any)?.nguoiDung?.ho_ten as string) || ((report as any)?.nguoi_dung?.ho_ten as string) || "Không xác định"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate((report as any).thoi_gian_tao || (report as any).created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right relative">
                    <div className="inline-flex items-center gap-2">
                      <button
                        title="Chi tiết"
                        onClick={() => {
                          setDetailTarget(report);
                          setDetailOpen(true);
                        }}
                        className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Chỉnh sửa"
                        onClick={() => {
                          setEditTarget(report);
                          setEditForm({
                            trang_thai: (report as any).trang_thai || 'cho_xu_ly',
                            muc_do_nghiem_trong: String((report as any).muc_do_nghiem_trong ?? '3'),
                            assign_can_bo_id: '',
                            ghi_chu: '',
                          });
                          setEditOpen(true);
                        }}
                        className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        title="Xóa"
                        onClick={() => { setDeleteTarget(report); setDeleteOpen(true); }}
                        className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-700 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Popover removed -> replaced by modal below */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {!isLoading && filteredReports.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Không tìm thấy sự cố nào
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-[900px] p-0">
        <div className="p-6 lg:p-8 max-h-[80vh] overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tạo sự cố mới</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chọn vị trí trên bản đồ, nhập thông tin và đính kèm ảnh</p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Người dùng</label>
                <select
                  value={form.nguoi_dung_id}
                  onChange={(e) => setForm({ ...form, nguoi_dung_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-- Chọn người dùng (nguoi_dan) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id.toString()}>{u.ho_ten} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Loại sự cố</label>
                <select value={form.loai_su_co} onChange={(e) => setForm({ ...form, loai_su_co: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="pothole">Ổ gà</option>
                  <option value="flooding">Ngập lụt</option>
                  <option value="traffic_light">Đèn giao thông</option>
                  <option value="waste">Rác thải</option>
                  <option value="traffic_jam">Kẹt xe</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tiêu đề</label>
                <input value={form.tieu_de} onChange={(e) => setForm({ ...form, tieu_de: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Mô tả</label>
                <textarea value={form.mo_ta} onChange={(e) => setForm({ ...form, mo_ta: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Chọn vị trí trên bản đồ (click để đặt điểm)</label>
                <div ref={mapContainerRef} className="w-full h-64 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden" />
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Vĩ độ</label>
                    <input value={form.vi_do} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kinh độ</label>
                    <input value={form.kinh_do} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Ảnh (URL hoặc chụp/ chọn ảnh)</label>
                <input value={form.hinh_anh_url} onChange={(e) => setForm({ ...form, hinh_anh_url: e.target.value })} placeholder="https://..." className="w-full mb-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <input type="file" accept="image/*" capture="environment" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSelectedFile(file);
                }} className="block w-full text-sm text-gray-600 dark:text-gray-300" />
                {(selectedFile || form.hinh_anh_url) && (
                  <div className="mt-2">
                    <img src={selectedFile ? URL.createObjectURL(selectedFile) : form.hinh_anh_url} alt="preview" className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ảnh sẽ được tải lên thư mục public/uploads/reports và lưu URL.</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Mức độ nghiêm trọng</label>
                <select value={form.muc_do_nghiem_trong} onChange={(e) => setForm({ ...form, muc_do_nghiem_trong: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="1">1 - Thấp</option>
                  <option value="2">2 - Trung bình</option>
                  <option value="3">3 - Cao (Tính toán AI)</option>
                  <option value="4">4 - Rất cao</option>
                  <option value="5">5 - Khẩn cấp</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">Hủy</button>
              <button onClick={createReport} disabled={creating} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60">
                {creating ? 'Đang lưu...' : 'Tạo mới'}
              </button>
            </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} className="max-w-[520px] p-0">
        <div className="p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Xóa sự cố</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Bạn có chắc chắn muốn xóa sự cố #{(deleteTarget as any)?.id}? Hành động này không thể hoàn tác.</p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">Hủy</button>
            <button
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteReport((deleteTarget as any).id);
                setDeleteOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} className="max-w-[900px] p-0">
        <div className="p-6 lg:p-8 max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Chi tiết sự cố #{(detailTarget as any)?.id}</h3>
          {detailTarget && (
            <div className="space-y-6 text-sm">
              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-gray-500">Loại sự cố</div>
                  <div className="font-medium">{getLoaiSuCoText((detailTarget as any).loai_su_co)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-500">Mức độ</div>
                  <div className="font-medium">{(() => { const n=(detailTarget as any).muc_do_nghiem_trong||1; return n>=4?'Khẩn cấp':n===3?'Cao':n===2?'Trung bình':'Thấp'; })()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-500">Trạng thái</div>
                  <div className="font-medium">{getStatusText((detailTarget as any).trang_thai)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-500">Vị trí</div>
                  <div className="font-medium">{(() => { const lat=(detailTarget as any).vi_do; const lng=(detailTarget as any).kinh_do; return (typeof lat==='number'&&typeof lng==='number')?`${lat.toFixed(5)}, ${lng.toFixed(5)}`:'—'; })()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-500">Người báo cáo</div>
                  <div className="font-medium">{((detailTarget as any)?.nguoi_dung?.ho_ten) || 'Không xác định'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-500">Thời gian</div>
                  <div className="font-medium">{formatDate(((detailTarget as any).created_at) || ((detailTarget as any).thoi_gian_tao))}</div>
                </div>
              </div>

              {/* Map */}
              <div>
                <div className="text-gray-500 mb-1">Bản đồ</div>
                <div id="detail-map" className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" />
              </div>

              {/* Assigned staff */}
              <div>
                <div className="text-gray-500">Cán bộ đã gán</div>
                <div className="font-medium">
                  {(() => {
                    const list = (detailTarget as any).xu_lys as any[] | undefined;
                    if (!list || list.length === 0) return 'Chưa gán';
                    const assigned = list.filter(x => x.can_bo).map(x => x.can_bo.ho_ten).filter(Boolean);
                    return assigned.length ? assigned.join(', ') : 'Chưa gán';
                  })()}
                </div>
              </div>

              {/* Title & description */}
              <div>
                <div className="text-gray-500">Tiêu đề</div>
                <div className="font-medium">{(detailTarget as any).tieu_de || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Mô tả</div>
                <div className="font-medium whitespace-pre-wrap">{(detailTarget as any).mo_ta || '—'}</div>
              </div>

              {/* Image */}
              {(() => {
                const img = (detailTarget as any).hinh_anh_url as string | undefined;
                if (!img) return null;
                return (
                  <div>
                    <div className="text-gray-500 mb-1">Hình ảnh</div>
                    <img src={img} alt="report" className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  </div>
                );
              })()}
            </div>
          )}
          <div className="mt-6 flex items-center justify-end">
            <button onClick={() => setDetailOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">Đóng</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} className="max-w-[700px] p-0">
        <div className="p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Chỉnh sửa sự cố #{(editTarget as any)?.id}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Mức độ nghiêm trọng</label>
              <select
                value={editForm.muc_do_nghiem_trong}
                onChange={(e) => setEditForm({ ...editForm, muc_do_nghiem_trong: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value=" ">1 - Thấp</option>
                <option value="2">2 - Trung bình</option>
                <option value="3">3 - Cao (Tính toán AI)</option>
                <option value="4">4 - Rất cao</option>
                <option value="5">5 - Khẩn cấp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Gán cán bộ</label>
              <select
                value={editForm.assign_can_bo_id}
                onChange={(e) => setEditForm({ ...editForm, assign_can_bo_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Chọn cán bộ --</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id.toString()}>{s.ho_ten} ({s.email})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Ghi chú</label>
              <textarea
                value={editForm.ghi_chu}
                onChange={(e) => setEditForm({ ...editForm, ghi_chu: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">Đóng</button>
            <button
              onClick={async () => {
                if (!editTarget) return;
                const payload: any = {};
                if (editForm.assign_can_bo_id) payload.assign_can_bo_id = Number(editForm.assign_can_bo_id);
                if (editForm.ghi_chu) payload.ghi_chu = editForm.ghi_chu;
                if (editForm.muc_do_nghiem_trong) payload.muc_do_nghiem_trong = Number(editForm.muc_do_nghiem_trong);
                await updateReport((editTarget as any).id, payload);
                setEditOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

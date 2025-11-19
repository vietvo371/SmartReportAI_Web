"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  MapPin,
  AlertCircle,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  Phone,
  Mail,
  Upload,
  FileDown,
  Loader2,
  Edit3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/modal";

type StaffReport = {
  id: number;
  tieu_de: string;
  mo_ta: string | null;
  loai_su_co: string;
  trang_thai: string;
  muc_do_nghiem_trong: number;
  dia_chi: string | null;
  created_at: string;
  updated_at: string;
  can_bo_id: number | null;
  nguoi_dan: {
    ho_ten: string;
    email: string;
    so_dien_thoai: string | null;
  } | null;
  latestUpdate: {
    id: number;
    trang_thai_moi: string;
    noi_dung: string | null;
    hinh_anh_minh_chung: string | null;
    thoi_gian: string;
  } | null;
};

type AssignedReportResponse = {
  reports: StaffReport[];
  total?: number;
  page?: number;
  limit?: number;
};

const statusStyles: Record<
  string,
  {
    bg: string;
    text: string;
    label: string;
  }
> = {
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

const priorityLabels = (severity: number) => {
  if (severity >= 4) return "Cao";
  if (severity >= 3) return "Trung bình";
  return "Thấp";
};

type Scope = "mine" | "available";
type SortField = "id" | "tieu_de" | "trang_thai" | "muc_do_nghiem_trong" | "updated_at";
type SortDirection = "asc" | "desc";

export default function StaffAssignedTasksPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { success, error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [activeScope, setActiveScope] = useState<Scope>("mine");
  const [reportsMap, setReportsMap] = useState<Record<Scope, StaffReport[]>>({
    mine: [],
    available: [],
  });
  const [loadingMap, setLoadingMap] = useState<Record<Scope, boolean>>({
    mine: true,
    available: false,
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Update Modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<StaffReport | null>(null);
  const [updateForm, setUpdateForm] = useState({
    trang_thai: "",
    noi_dung: "",
  });
  const [updating, setUpdating] = useState(false);

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<StaffReport | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    trangThai: "",
    noiDung: "",
  });
  const [uploading, setUploading] = useState(false);

  const fetchReports = useCallback(
    async (scope: Scope) => {
      try {
        if (!token) {
          setError("Vui lòng đăng nhập lại để xem danh sách nhiệm vụ.");
          return;
        }
        setLoadingMap((prev) => ({ ...prev, [scope]: true }));
        const res = await fetch(`/api/staff/assigned-reports?scope=${scope}`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Không thể tải danh sách nhiệm vụ.");
        }

        const payload: AssignedReportResponse = await res.json();
        setReportsMap((prev) => ({
          ...prev,
          [scope]: payload.reports,
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.";
        setError(message);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [scope]: false }));
      }
    },
    [token],
  );

  useEffect(() => {
    fetchReports("mine");
  }, [fetchReports]);

  useEffect(() => {
    if (activeScope !== "mine" && reportsMap[activeScope].length === 0) {
      fetchReports(activeScope);
    }
  }, [activeScope, fetchReports, reportsMap]);

  const handleAssignmentAction = useCallback(
    async (reportId: number, action: "claim" | "release") => {
      try {
        if (!token) {
          setError("Phiên đăng nhập đã hết hạn.");
          return;
        }

        const res = await fetch("/api/staff/assigned-reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reportId, action }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Không thể cập nhật nhiệm vụ.");
        }

        const payload = await res.json();
        success(payload.message || "Thao tác thành công");
        await Promise.all([fetchReports("mine"), fetchReports("available")]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể cập nhật nhiệm vụ.";
        showError(message);
      }
    },
    [fetchReports, showError, success, token],
  );

  // Filtered & Sorted Reports
  const processedReports = useMemo(() => {
    let filtered = [...reportsMap[activeScope]];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.tieu_de.toLowerCase().includes(query) ||
          r.mo_ta?.toLowerCase().includes(query) ||
          r.id.toString().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter((r) => r.trang_thai === filterStatus);
    }

    // Apply priority filter
    if (filterPriority) {
      const priorityMap: Record<string, [number, number]> = {
        cao: [4, 5],
        trung_binh: [3, 3],
        thap: [1, 2],
      };
      const [min, max] = priorityMap[filterPriority] || [0, 5];
      filtered = filtered.filter(
        (r) => r.muc_do_nghiem_trong >= min && r.muc_do_nghiem_trong <= max
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "updated_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [reportsMap, activeScope, searchQuery, filterStatus, filterPriority, sortField, sortDirection]);

  // Paginated Reports
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return processedReports.slice(start, end);
  }, [processedReports, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedReports.length / itemsPerPage);

  const derivedStats = useMemo(() => {
    const reports = reportsMap.mine;
    const total = reports.length;
    const inProgress = reports.filter((r) => r.trang_thai === "dang_xu_ly").length;
    const completed = reports.filter((r) => r.trang_thai === "da_hoan_tat").length;
    const pending = reports.filter((r) => r.trang_thai === "cho_xu_ly").length;
    const highPriority = reports.filter((r) => r.muc_do_nghiem_trong >= 4).length;

    return {
      total,
      inProgress,
      completed,
      highPriority,
      pending,
    };
  }, [reportsMap.mine]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedReports.map((r) => r.id)));
    }
  };

  // Handle toggle select
  const handleToggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Bulk complete
  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) {
      showError("Vui lòng chọn ít nhất một nhiệm vụ.");
      return;
    }

    if (!confirm(`Bạn có chắc muốn đánh dấu ${selectedIds.size} nhiệm vụ là hoàn thành?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      for (const id of Array.from(selectedIds)) {
        await fetch(`/api/staff/reports/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trang_thai: "da_hoan_tat",
            noi_dung: "Đánh dấu hoàn thành hàng loạt",
          }),
        });
      }
      success("Đã cập nhật thành công!");
      setSelectedIds(new Set());
      await fetchReports(activeScope);
    } catch (err) {
      showError("Có lỗi xảy ra khi cập nhật.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!updateTarget) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/staff/reports/${updateTarget.id}`, {
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

      success("Cập nhật thành công!");
      setUpdateModalOpen(false);
      setUpdateTarget(null);
      await fetchReports(activeScope);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái.";
      showError(message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle upload evidence
  const handleUploadEvidence = async () => {
    if (!uploadTarget || !uploadFile) {
      showError("Vui lòng chọn file minh chứng.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("reportId", uploadTarget.id.toString());
      formData.append("trangThai", uploadForm.trangThai || uploadTarget.trang_thai);
      if (uploadForm.noiDung) {
        formData.append("noiDung", uploadForm.noiDung);
      }

      const res = await fetch("/api/staff/evidence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể upload minh chứng.");
      }

      success("Upload minh chứng thành công!");
      setUploadModalOpen(false);
      setUploadTarget(null);
      setUploadFile(null);
      await fetchReports(activeScope);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể upload minh chứng.";
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Mã", "Tiêu đề", "Trạng thái", "Độ ưu tiên", "Ngày cập nhật"];
    const rows = processedReports.map((r) => [
      `SR-${r.id.toString().padStart(4, "0")}`,
      r.tieu_de,
      statusStyles[r.trang_thai]?.label || r.trang_thai,
      priorityLabels(r.muc_do_nghiem_trong),
      new Date(r.updated_at).toLocaleDateString("vi-VN"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-nhiem-vu-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterPriority("");
  };

  const taskStats = [
    {
      label: "Tổng nhiệm vụ",
      value: derivedStats.total,
      trend: `${derivedStats.completed} hoàn thành`,
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      label: "Đang xử lý",
      value: derivedStats.inProgress,
      trend: `${derivedStats.pending} chờ cập nhật`,
      icon: Clock,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      label: "Hoàn thành",
      value: derivedStats.completed,
      trend: `${derivedStats.completed > 0 ? "+" : ""}${derivedStats.completed} trong tuần`,
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      label: "Ưu tiên cao",
      value: derivedStats.highPriority,
      trend: "Cần xử lý trước",
      icon: AlertTriangle,
      color:
        "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    },
  ];

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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Nhiệm vụ
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Danh sách nhiệm vụ được giao
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi trạng thái và tiến độ từng nhiệm vụ bạn phụ trách.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              showFilters
                ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Ẩn bộ lọc" : "Lọc nhiệm vụ"}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={processedReports.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <FileDown className="w-4 h-4" />
            Xuất báo cáo
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkComplete}
              disabled={bulkActionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
            >
              {bulkActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành ({selectedIds.size})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mô tả, mã nhiệm vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-12 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="cho_xu_ly">Chờ xử lý</option>
              <option value="dang_xu_ly">Đang xử lý</option>
              <option value="da_hoan_tat">Đã hoàn thành</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tất cả độ ưu tiên</option>
              <option value="cao">Cao</option>
              <option value="trung_binh">Trung bình</option>
              <option value="thap">Thấp</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {taskStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <span
                  className={`rounded-full p-2 ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {stat.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bảng nhiệm vụ
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loadingMap[activeScope]
                ? "Đang tải dữ liệu..."
                : `Tìm thấy ${processedReports.length} nhiệm vụ`}
            </p>
          </div>
          <div className="mb-4 flex gap-2">
            {[
              { key: "mine", label: "Nhiệm vụ của tôi" },
              { key: "available", label: "Hàng chờ nhận" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeScope === tab.key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
                onClick={() => {
                  setActiveScope(tab.key as Scope);
                  setCurrentPage(1);
                  setSelectedIds(new Set());
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingMap[activeScope] ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {activeScope === "mine"
                  ? searchQuery || filterStatus || filterPriority
                    ? "Không tìm thấy nhiệm vụ nào phù hợp."
                    : "Hiện chưa có nhiệm vụ nào được giao cho bạn."
                  : "Không có nhiệm vụ nào đang chờ nhận."}
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50/70 text-left text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
                  <tr>
                    {activeScope === "mine" && (
                      <th className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === paginatedReports.length && paginatedReports.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                      </th>
                    )}
                    <th
                      className="cursor-pointer px-6 py-3 font-medium"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center gap-1">
                        Mã nhiệm vụ
                        {sortField === "id" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-3 font-medium"
                      onClick={() => handleSort("tieu_de")}
                    >
                      <div className="flex items-center gap-1">
                        Mô tả
                        {sortField === "tieu_de" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 font-medium">Người báo cáo</th>
                    <th
                      className="cursor-pointer px-6 py-3 font-medium"
                      onClick={() => handleSort("muc_do_nghiem_trong")}
                    >
                      <div className="flex items-center gap-1">
                        Ưu tiên
                        {sortField === "muc_do_nghiem_trong" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-3 font-medium"
                      onClick={() => handleSort("trang_thai")}
                    >
                      <div className="flex items-center gap-1">
                        Trạng thái
                        {sortField === "trang_thai" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-3 font-medium"
                      onClick={() => handleSort("updated_at")}
                    >
                      <div className="flex items-center gap-1">
                        Cập nhật cuối
                        {sortField === "updated_at" && (
                          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {paginatedReports.map((task) => {
                    const statusStyle = statusStyles[task.trang_thai] ?? statusStyles.cho_xu_ly;
                    const priority = priorityLabels(task.muc_do_nghiem_trong);
                    const isSelected = selectedIds.has(task.id);
                    return (
                      <tr key={task.id} className={`hover:bg-gray-50/70 dark:hover:bg-gray-800/60 ${isSelected ? "bg-brand-50/30 dark:bg-brand-900/10" : ""}`}>
                        {activeScope === "mine" && (
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(task.id)}
                              disabled={task.trang_thai === "da_hoan_tat"}
                              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          SR-{task.id.toString().padStart(4, "0")}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {task.tieu_de}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {task.mo_ta?.slice(0, 50) || "Không có mô tả"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {task.nguoi_dan ? (
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {task.nguoi_dan.ho_ten}
                              </p>
                              <div className="flex gap-2">
                                {task.nguoi_dan.so_dien_thoai && (
                                  <a
                                    href={`tel:${task.nguoi_dan.so_dien_thoai}`}
                                    className="text-brand-600 hover:text-brand-700"
                                    title="Gọi điện"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                )}
                                <a
                                  href={`mailto:${task.nguoi_dan.email}`}
                                  className="text-brand-600 hover:text-brand-700"
                                  title="Gửi email"
                                >
                                  <Mail className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              priority === "Cao"
                                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
                                : priority === "Trung bình"
                                ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {formatDate(task.updated_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/staff/reports/${task.id}`)}
                              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {activeScope === "mine" && (
                              <>
                                <button
                                  onClick={() => {
                                    setUpdateTarget(task);
                                    setUpdateForm({
                                      trang_thai: task.trang_thai,
                                      noi_dung: "",
                                    });
                                    setUpdateModalOpen(true);
                                  }}
                                  disabled={task.trang_thai === "da_hoan_tat"}
                                  className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:hover:bg-brand-900/20"
                                  title="Cập nhật trạng thái"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setUploadTarget(task);
                                    setUploadForm({
                                      trangThai: task.trang_thai,
                                      noiDung: "",
                                    });
                                    setUploadModalOpen(true);
                                  }}
                                  disabled={task.trang_thai === "da_hoan_tat"}
                                  className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50 disabled:opacity-50 dark:hover:bg-purple-900/20"
                                  title="Upload minh chứng"
                                >
                                  <Upload className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleAssignmentAction(task.id, "release")}
                                  disabled={task.trang_thai === "da_hoan_tat"}
                                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
                                  title="Trả nhiệm vụ"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {activeScope === "available" && (
                              <button
                                onClick={() => handleAssignmentAction(task.id, "claim")}
                                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                              >
                                Nhận
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, processedReports.length)} trong{" "}
                    {processedReports.length} nhiệm vụ
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Trước
                    </button>
                    <span className="flex items-center px-3 text-sm text-gray-700 dark:text-gray-300">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
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
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload Evidence Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        className="max-w-lg"
      >
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Upload minh chứng
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chọn file
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cập nhật trạng thái (tùy chọn)
              </label>
              <select
                value={uploadForm.trangThai}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, trangThai: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Giữ nguyên trạng thái</option>
                <option value="dang_xu_ly">Đang xử lý</option>
                <option value="da_hoan_tat">Đã hoàn thành</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={uploadForm.noiDung}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, noiDung: e.target.value })
                }
                rows={3}
                placeholder="Mô tả về minh chứng..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                disabled={uploading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleUploadEvidence}
                disabled={uploading || !uploadFile}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {uploading ? "Đang upload..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}



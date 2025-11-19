"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  FileText,
  MapPin,
  Trash,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";

type ReportOption = {
  id: number;
  label: string;
  dia_chi?: string | null;
};

type EvidenceEntry = {
  id: number;
  report: {
    id: number;
    title: string;
  };
  description: string | null;
  status: string;
  files: string[];
  timestamp: string;
};

const statusColor: Record<string, string> = {
  da_hoan_tat: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200",
  dang_xu_ly: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
  cho_xu_ly: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200",
};

export default function StaffUploadEvidencePage() {
  const { token } = useAuthStore();
  const { success, error } = useToast();
  const [reports, setReports] = useState<ReportOption[]>([]);
  const [recentUploads, setRecentUploads] = useState<EvidenceEntry[]>([]);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingUploads, setLoadingUploads] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/staff/assigned-reports?scope=mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải danh sách nhiệm vụ.");
      }
      const data = await res.json();
      const options: ReportOption[] = data.reports.map((report: any) => ({
        id: report.id,
        label: `SR-${report.id.toString().padStart(4, "0")} · ${report.tieu_de}`,
        dia_chi: report.dia_chi,
      }));
      setReports(options);
      if (options.length > 0) {
        setSelectedReport(options[0].id);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể tải nhiệm vụ.");
    }
  }, [error, token]);

  const fetchUploads = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingUploads(true);
      const res = await fetch("/api/staff/evidence", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể tải nhật ký minh chứng.");
      }
      const data = await res.json();
      setRecentUploads(data.uploads ?? []);
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể tải nhật ký minh chứng.");
    } finally {
      setLoadingUploads(false);
    }
  }, [error, token]);

  useEffect(() => {
    fetchReports();
    fetchUploads();
  }, [fetchReports, fetchUploads]);

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    setUploading(true);
    try {
      const uploads: { name: string; url: string }[] = [];
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "reports");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Không thể tải tệp lên.");
        }
        const data = await res.json();
        uploads.push({ name: file.name, url: data.url });
      }
      setFiles((prev) => [...prev, ...uploads]);
      success("Đã tải tệp lên thành công");
      event.target.value = "";
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể tải tệp lên.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedReport) {
      error("Vui lòng chọn nhiệm vụ cần cập nhật.");
      return;
    }
    if (files.length === 0) {
      error("Vui lòng tải lên ít nhất một minh chứng.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/staff/evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportId: selectedReport,
          description,
          files: files.map((file) => file.url),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Không thể gửi minh chứng.");
      }

      success("Đã gửi minh chứng thành công");
      setDescription("");
      setFiles([]);
      await fetchUploads();
    } catch (err) {
      error(err instanceof Error ? err.message : "Không thể gửi minh chứng.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAddress = useMemo(
    () => reports.find((item) => item.id === selectedReport)?.dia_chi ?? "Chưa cập nhật",
    [reports, selectedReport],
  );

  const statusLabel = (status: string) =>
    status === "da_hoan_tat"
      ? "Đã hoàn thành"
      : status === "cho_xu_ly"
      ? "Chờ xử lý"
      : "Đang xử lý";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Minh chứng hiện trường
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tải lên ảnh/video minh chứng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gắn minh chứng trực tiếp vào từng nhiệm vụ để cập nhật tiến độ minh bạch.
          </p>
        </div>
        <button className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
          Hướng dẫn kiểm duyệt
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Biểu mẫu tải lên nhanh
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hỗ trợ ảnh, video và ghi chú hiện trường.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Chọn nhiệm vụ
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    value={selectedReport ?? ""}
                    onChange={(event) => setSelectedReport(Number(event.target.value))}
                  >
                    {reports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Địa điểm thực tế
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <MapPin className="h-4 w-4 text-brand-500" />
                    {selectedAddress}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Mô tả hiện trạng
                </label>
                <textarea
                  className="mt-2 block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  rows={3}
                  placeholder="Ghi chú chi tiết về hiện trạng, vật cản, mức độ nguy hiểm..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <Upload className="mx-auto h-8 w-8 text-brand-500" />
                  <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Kéo & thả hoặc bấm để chọn tệp
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hỗ trợ JPG, PNG, MP4 (tối đa 50MB)
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                    accept="image/*,video/*"
                  />
                  <span className="mt-3 inline-flex items-center justify-center rounded-full bg-brand-50 px-4 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200">
                    {uploading ? "Đang tải..." : "Chọn từ máy"}
                  </span>
                </label>
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  <ImageIcon className="h-8 w-8 text-brand-500" />
                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    Tệp đã chọn
                  </p>
                  {files.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Chưa có minh chứng nào được tải lên.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {files.map((file, index) => (
                        <li
                          key={`${file.url}-${index}`}
                          className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-gray-700 dark:border-gray-800 dark:text-gray-200"
                        >
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() =>
                              setFiles((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => {
                    setDescription("");
                    setFiles([]);
                  }}
                >
                  Xóa nội dung
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Gửi báo cáo minh chứng"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nhật ký gửi lên
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  10 bản ghi gần nhất
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {loadingUploads ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
              ) : recentUploads.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chưa có minh chứng nào được tải lên.
                </p>
              ) : (
                recentUploads.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.report.title}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColor[item.status] ??
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <p className="text-xs uppercase text-gray-400">
                      SR-{item.report.id.toString().padStart(4, "0")}
                    </p>
                    {item.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.files.map((file, index) => (
                        <a
                          key={`${file}-${index}`}
                          href={file}
                          className="text-xs text-brand-600 hover:underline dark:text-brand-300"
                          target="_blank"
                          rel="noreferrer"
                        >
                          File {index + 1}
                        </a>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {new Intl.DateTimeFormat("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(item.timestamp))}
                      </span>
                      <span>{item.files.length} tệp</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">Lưu ý kiểm duyệt</h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-50">
              <li>• Chụp rõ mặt đường, vật cản và biển báo xung quanh.</li>
              <li>• Ghi nhận tọa độ GPS chính xác trước khi gửi.</li>
              <li>• Video không quá 60 giây để tối ưu lưu trữ.</li>
              <li>• Đảm bảo đồng phục/ID trong khung hình nếu có.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


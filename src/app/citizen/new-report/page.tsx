"use client";

import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import { useState, useRef, useEffect } from "react";
import { MapPin, Upload, AlertCircle, CheckCircle } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface ReportForm {
  tieu_de: string;
  mo_ta: string;
  loai_su_co: string;
  vi_do: number;
  kinh_do: number;
  muc_do_nghiem_trong: number;
  hinh_anh_url: string | null;
  dia_chi: string;
}

const ISSUE_TYPES = [
  { value: "thoi_tiet", label: "Thời tiết xấu" },
  { value: "moi_truong", label: "Ô nhiễm môi trường" },
  { value: "thien_tai", label: "Thảm họa tự nhiên" },
  { value: "tai_nan", label: "Tai nạn giao thông" },
  { value: "khac", label: "Khác" },
];

export default function NewReportPage() {
  const { user } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);

  const [form, setForm] = useState<ReportForm>({
    tieu_de: "",
    mo_ta: "",
    loai_su_co: "",
    vi_do: 0,
    kinh_do: 0,
    muc_do_nghiem_trong: 3,
    hinh_anh_url: null,
    dia_chi: "",
  });

  // Initialize Mapbox with current location
  useEffect(() => {
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const token =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";
      (mapboxgl as any).accessToken = token;
      if (!mapContainerRef.current) return;

      let initialLng = 106.660172; // Default HCM
      let initialLat = 10.762622;

      // Get user's current location
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );
          initialLat = position.coords.latitude;
          initialLng = position.coords.longitude;
        } catch (err) {
          console.warn("Geolocation failed, using default HCM location", err);
        }
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialLng, initialLat],
        zoom: 14,
      });

      mapRef.current.on("load", () => {
        requestAnimationFrame(() => {
          try {
            mapRef.current?.resize();
          } catch {}
        });

        // Set initial marker at current location
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = new mapboxgl.Marker({ color: "#10B981" });
        markerRef.current.setLngLat([initialLng, initialLat]).addTo(mapRef.current);

        // Set form with initial location
        setForm((prev) => ({
          ...prev,
          vi_do: initialLat,
          kinh_do: initialLng,
        }));

        // Reverse geocoding for initial location
        (async () => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${initialLat}&lon=${initialLng}`,
              {
                headers: {
                  "Accept-Language": "vi",
                },
              }
            );
            if (response.ok) {
              const data = await response.json();
              const dia_chi =
                data.address?.name || data.display_name || "";
              setForm((prev) => ({
                ...prev,
                dia_chi,
              }));
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
          }
        })();
      });

      // Click to select location
      mapRef.current.on("click", async (e: any) => {
        const { lng, lat } = e.lngLat;
        setForm((prev) => ({
          ...prev,
          vi_do: lat,
          kinh_do: lng,
        }));

        // Add marker
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ color: "#10B981" });
        }
        markerRef.current.setLngLat([lng, lat]).addTo(mapRef.current);

        // Reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                "Accept-Language": "vi",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            const dia_chi =
              data.address?.name || data.display_name || "";
            setForm((prev) => ({
              ...prev,
              dia_chi,
            }));
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        }
      });
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "vi_do" || name === "kinh_do" || name === "muc_do_nghiem_trong"
          ? parseFloat(value)
          : value,
    }));
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setForm((prev) => ({ ...prev, hinh_anh_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = async () => {
    if ("geolocation" in navigator) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Gọi OpenStreetMap Nominatim API để lấy tên địa chỉ
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: {
                  "Accept-Language": "vi",
                },
              }
            );

            let dia_chi = "";
            if (response.ok) {
              const data = await response.json();
              dia_chi = data.address?.name || data.display_name || "";
            }

            setForm((prev) => ({
              ...prev,
              vi_do: lat,
              kinh_do: lng,
              dia_chi,
            }));
            showSuccess("Đã lấy vị trí hiện tại: " + (dia_chi || ""));
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            // Vẫn lưu tọa độ ngay cả khi lấy địa chỉ thất bại
            setForm((prev) => ({
              ...prev,
              vi_do: lat,
              kinh_do: lng,
            }));
            showSuccess("Đã lấy tọa độ hiện tại");
          } finally {
            setIsGettingLocation(false);
          }
        },
        () => {
          setIsGettingLocation(false);
          showError("Không thể lấy vị trí. Vui lòng nhập thủ công.");
        }
      );
    } else {
      showError("Trình duyệt của bạn không hỗ trợ định vị");
    }
  };

  const validateForm = (): boolean => {
    if (!form.tieu_de.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return false;
    }

    if (form.tieu_de.trim().length < 5) {
      setError("Tiêu đề phải có ít nhất 5 ký tự");
      return false;
    }

    if (!form.mo_ta.trim()) {
      setError("Vui lòng nhập mô tả chi tiết");
      return false;
    }

    if (form.mo_ta.trim().length < 10) {
      setError("Mô tả phải có ít nhất 10 ký tự");
      return false;
    }

    if (!form.loai_su_co) {
      setError("Vui lòng chọn loại sự cố");
      return false;
    }

    if (form.vi_do === 0 || form.kinh_do === 0) {
      setError("Vui lòng cung cấp vị trí");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(error || "Dữ liệu không hợp lệ");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/citizen/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          nguoi_dung_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Phản ánh đã được gửi thành công!");
        // Reset form
        setForm({
          tieu_de: "",
          mo_ta: "",
          loai_su_co: "",
          vi_do: 0,
          kinh_do: 0,
          muc_do_nghiem_trong: 3,
          hinh_anh_url: null,
          dia_chi: "",
        });
        setImagePreview(null);
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "/citizen/my-requests";
        }, 2000);
      } else {
        setError(data.error || "Không thể gửi phản ánh");
        showError(data.error || "Không thể gửi phản ánh");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi gửi phản ánh";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gửi phản ánh
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Báo cáo sự cố hoặc vấn đề tại khu vực của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <div className="space-y-4">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                name="tieu_de"
                value={form.tieu_de}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề phản ánh (tối thiểu 5 ký tự)"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                name="mo_ta"
                value={form.mo_ta}
                onChange={handleInputChange}
                placeholder="Mô tả vấn đề một cách chi tiết (tối thiểu 10 ký tự)"
                disabled={isLoading}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Loại sự cố */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại sự cố *
              </label>
              <select
                name="loai_su_co"
                value={form.loai_su_co}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
              >
                <option value="">Chọn loại sự cố...</option>
                {ISSUE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mức độ nghiêm trọng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mức độ nghiêm trọng
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="muc_do_nghiem_trong"
                  min="1"
                  max="5"
                  value={form.muc_do_nghiem_trong}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {form.muc_do_nghiem_trong}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    /5
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                1: Thấp | 5: Khẩn cấp
              </p>
            </div>
          </div>
        </div>

        {/* Vị trí */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vị trí sự cố
          </h3>

          <div className="space-y-4">
            {/* Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn vị trí trên bản đồ (click để đặt điểm)
              </label>
              <div
                ref={mapContainerRef}
                className="w-full h-72 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoading || isGettingLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 font-medium transition-colors disabled:opacity-50"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
                  Đang lấy vị trí...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Lấy vị trí hiện tại
                </>
              )}
            </button>

            {/* Hiển thị địa chỉ */}
            {form.dia_chi && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Địa chỉ:</p>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 line-clamp-2">
                  {form.dia_chi}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vĩ độ *
                </label>
                <input
                  type="number"
                  name="vi_do"
                  value={form.vi_do || ""}
                  onChange={handleInputChange}
                  placeholder="Vĩ độ"
                  disabled={isLoading || isGettingLocation}
                  step="0.00001"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kinh độ *
                </label>
                <input
                  type="number"
                  name="kinh_do"
                  value={form.kinh_do || ""}
                  onChange={handleInputChange}
                  placeholder="Kinh độ"
                  disabled={isLoading || isGettingLocation}
                  step="0.00001"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hình ảnh minh chứng
          </h3>

          <div className="space-y-4">
            <div
              onClick={() => imageInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-green-500 dark:border-white/[0.12] dark:hover:border-green-500 transition-colors"
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nhấp để thay đổi ảnh
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nhấp để chọn ảnh
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tối đa 5MB
                  </p>
                </div>
              )}
            </div>

            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setForm((prev) => ({ ...prev, hinh_anh_url: null }));
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-900/20 font-medium transition-colors disabled:opacity-50"
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <a
            href="/citizen/my-requests"
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-white dark:hover:bg-gray-800 font-semibold transition-colors text-center"
          >
            Hủy
          </a>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Gửi phản ánh
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


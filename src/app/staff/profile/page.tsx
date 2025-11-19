 "use client";

import { useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Calendar,
  Edit,
  Lock,
  Save,
  X,
} from "lucide-react";

type ProfileForm = {
  ho_ten: string;
  so_dien_thoai: string;
};

const securitySettings = [
  {
    title: "Xác thực hai lớp",
    description: "Bảo vệ tài khoản bằng mã OTP khi đăng nhập.",
    enabled: true,
  },
  {
    title: "Thiết bị tin cậy",
    description: "Theo dõi danh sách thiết bị đã đăng nhập.",
    enabled: true,
  },
  {
    title: "Cảnh báo bảo mật",
    description: "Nhận email khi phát hiện đăng nhập bất thường.",
    enabled: false,
  },
];

const roleLabels: Record<string, string> = {
  can_bo: "Cán bộ xử lý",
  quan_tri: "Quản trị viên",
  nguoi_dan: "Người dân",
};

export default function StaffProfilePage() {
  const { user, setUser } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    ho_ten: user?.ho_ten || "",
    so_dien_thoai: user?.so_dien_thoai || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const handleInputChange = (key: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    setProfileError(null);
  };

  const handlePasswordChange = (
    key: keyof typeof passwordForm,
    value: string,
  ) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    setPasswordError(null);
  };

  const validateProfile = () => {
    if (!profileForm.ho_ten.trim()) {
      const msg = "Vui lòng nhập họ và tên.";
      setProfileError(msg);
      showError(msg);
      return false;
    }
    if (profileForm.ho_ten.trim().length < 2) {
      const msg = "Họ và tên phải có ít nhất 2 ký tự.";
      setProfileError(msg);
      showError(msg);
      return false;
    }

    if (profileForm.so_dien_thoai.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(profileForm.so_dien_thoai.trim())) {
        const msg = "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.";
        setProfileError(msg);
        showError(msg);
        return false;
      }
    }

    return true;
  };

  const validatePassword = () => {
    if (!passwordForm.currentPassword.trim()) {
      const msg = "Vui lòng nhập mật khẩu hiện tại.";
      setPasswordError(msg);
      showError(msg);
      return false;
    }
    if (!passwordForm.newPassword.trim()) {
      const msg = "Vui lòng nhập mật khẩu mới.";
      setPasswordError(msg);
      showError(msg);
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      const msg = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      setPasswordError(msg);
      showError(msg);
      return false;
    }
    if (passwordForm.newPassword.length > 50) {
      const msg = "Mật khẩu mới không được vượt quá 50 ký tự.";
      setPasswordError(msg);
      showError(msg);
      return false;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      const msg = "Mật khẩu mới phải khác mật khẩu hiện tại.";
      setPasswordError(msg);
      showError(msg);
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const msg = "Mật khẩu mới và xác nhận không khớp.";
      setPasswordError(msg);
      showError(msg);
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: profileForm.ho_ten.trim(),
          so_dien_thoai: profileForm.so_dien_thoai.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Không thể cập nhật thông tin.";
        setProfileError(msg);
        showError(msg);
        return;
      }

      setUser({
        ...user,
        ho_ten: profileForm.ho_ten.trim(),
        so_dien_thoai: profileForm.so_dien_thoai.trim() || null,
      });
      showSuccess("Cập nhật thông tin thành công!");
      setIsEditModalOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Lỗi khi cập nhật thông tin.";
      setProfileError(msg);
      showError(msg);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoadingPassword(true);
    setPasswordError(null);
    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Không thể đổi mật khẩu.";
        setPasswordError(msg);
        showError(msg);
        return;
      }
      showSuccess("Đổi mật khẩu thành công!");
      setIsPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Lỗi khi đổi mật khẩu.";
      setPasswordError(msg);
      showError(msg);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Hồ sơ cán bộ
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thông tin cá nhân & thiết lập bảo mật
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Quản lý dữ liệu cán bộ, quyền truy cập và lịch sử hoạt động.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setProfileForm({
                ho_ten: user.ho_ten || "",
                so_dien_thoai: user.so_dien_thoai || "",
              });
              setProfileError(null);
              setIsEditModalOpen(true);
            }}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Cập nhật thông tin
          </button>
          <button
            onClick={() => {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordError(null);
              setIsPasswordModalOpen(true);
            }}
            className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-semibold text-white">
                {user.ho_ten ? user.ho_ten.charAt(0).toUpperCase() : "C"}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user.ho_ten || "Chưa cập nhật"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID cán bộ: CB-{user.id?.toString().padStart(4, "0")}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vai trò
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {roleLabels[user.vai_tro] || "Cán bộ"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Trạng thái
                </p>
                <p className="text-base font-semibold text-green-600">
                  Đang hoạt động
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email công vụ
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white break-all">
                  {user.email || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Liên hệ trực tiếp
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {user.so_dien_thoai || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Liên hệ & địa bàn
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user.email || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{user.so_dien_thoai || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{(user as any).don_vi || "Đơn vị: Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{(user as any).dia_ban || user.dia_chi || "Địa bàn: Chưa cập nhật"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thiết lập bảo mật
                </h3>
              </div>
              <div className="mt-4 space-y-4">
                {securitySettings.map((setting) => (
                  <div
                    key={setting.title}
                    className="rounded-2xl border border-gray-100 p-4 dark:border-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {setting.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {setting.description}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          defaultChecked={setting.enabled}
                        />
                        <div className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-brand-600 dark:bg-gray-700" />
                        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin tài khoản
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  ID người dùng
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  #{user.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Ngày tham gia
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(user as any).created_at
                    ? format(new Date((user as any).created_at), "dd/MM/yyyy")
                    : "Chưa có"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Trạng thái
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-200">
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-lg dark:border-white/10">
            <h3 className="text-lg font-semibold">Phiên đăng nhập gần nhất</h3>
            <p className="mt-1 text-sm text-gray-300">
              {(user as any).last_login
                ? format(new Date((user as any).last_login), "dd/MM/yyyy · HH:mm")
                : "Chưa có dữ liệu"}
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-200">
              <p>Thiết bị: {(user as any).last_device || "Đang cập nhật"}</p>
              <p>Địa chỉ IP: {(user as any).last_ip || "Đang cập nhật"}</p>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cập nhật thông tin cán bộ
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Điều chỉnh thông tin mà hệ thống hiển thị
              </p>

              {profileError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                  {profileError}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={profileForm.ho_ten}
                    onChange={(e) => handleInputChange("ho_ten", e.target.value)}
                    placeholder="Nhập họ và tên"
                    disabled={isLoadingProfile}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={profileForm.so_dien_thoai}
                    onChange={(e) =>
                      handleInputChange("so_dien_thoai", e.target.value)
                    }
                    placeholder="Nhập số điện thoại (10-11 chữ số)"
                    disabled={isLoadingProfile}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Để trống nếu không muốn cập nhật số điện thoại
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-500/30 dark:bg-blue-900/20 dark:text-blue-200">
                  Email và vai trò được quản lý bởi hệ thống. Vui lòng liên hệ
                  quản trị viên nếu cần thay đổi.
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setProfileError(null);
                  }}
                  disabled={isLoadingProfile}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoadingProfile}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isLoadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Đổi mật khẩu
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Nhập mật khẩu hiện tại và mật khẩu mới
              </p>

              {passwordError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                  {passwordError}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={isLoadingPassword}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    disabled={isLoadingPassword}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={isLoadingPassword}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200">
                  Mật khẩu phải có 6-50 ký tự. Sau khi đổi mật khẩu thành công,
                  bạn có thể được yêu cầu đăng nhập lại.
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError(null);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={isLoadingPassword}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isLoadingPassword}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {isLoadingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



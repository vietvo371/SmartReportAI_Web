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
  Edit,
  Lock,
  Calendar,
  Save,
  X,
  Users,
} from "lucide-react";

type ProfileForm = {
  ho_ten: string;
  so_dien_thoai: string;
};

export default function CitizenProfilePage() {
  const { user, setUser } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProfileForm>({
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleInputChange = (key: keyof ProfileForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setProfileError(null);
  };

  const handlePasswordChange = (key: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    setPasswordError(null);
  };

  const validateProfile = (): boolean => {
    if (!editForm.ho_ten.trim()) {
      const errorMsg = "Vui lòng nhập họ và tên.";
      setProfileError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (editForm.ho_ten.trim().length < 2) {
      const errorMsg = "Họ và tên phải có ít nhất 2 ký tự.";
      setProfileError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (editForm.so_dien_thoai && editForm.so_dien_thoai.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(editForm.so_dien_thoai.trim())) {
        const errorMsg = "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.";
        setProfileError(errorMsg);
        showError(errorMsg);
        return false;
      }
    }

    return true;
  };

  const validatePassword = (): boolean => {
    if (!passwordForm.currentPassword.trim()) {
      const errorMsg = "Vui lòng nhập mật khẩu hiện tại.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (!passwordForm.newPassword.trim()) {
      const errorMsg = "Vui lòng nhập mật khẩu mới.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword.length < 6) {
      const errorMsg = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword.length > 50) {
      const errorMsg = "Mật khẩu mới không được vượt quá 50 ký tự.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      const errorMsg = "Mật khẩu mới phải khác mật khẩu hiện tại.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const errorMsg = "Mật khẩu mới và xác nhận mật khẩu không khớp.";
      setPasswordError(errorMsg);
      showError(errorMsg);
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setProfileError(null);
    setIsLoadingProfile(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ho_ten: editForm.ho_ten.trim(),
          so_dien_thoai: editForm.so_dien_thoai.trim() || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess("Cập nhật thông tin thành công!");
      } else {
        const errorMsg = data.error || "Không thể cập nhật thông tin.";
        setProfileError(errorMsg);
        showError(errorMsg);
        return;
      }
      setUser({
        ...user,
        ho_ten: editForm.ho_ten.trim(),
        so_dien_thoai: editForm.so_dien_thoai.trim() || null,
      });

      setIsEditModalOpen(false);
      setEditForm({
        ho_ten: editForm.ho_ten.trim(),
        so_dien_thoai: editForm.so_dien_thoai.trim() || "",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật thông tin.";
      setProfileError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setPasswordError(null);
    setIsLoadingPassword(true);

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Không thể đổi mật khẩu.";
        setPasswordError(errorMsg);
        showError(errorMsg);
        return;
      }

      showSuccess("Đổi mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordModalOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi đổi mật khẩu.";
      setPasswordError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Thông tin cá nhân */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.ho_ten ? user.ho_ten.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.ho_ten || "Chưa cập nhật"}
                </h2>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Người dân
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {user.email || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.so_dien_thoai || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.08] dark:bg-gray-800/50">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Ngày tham gia
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(user as any).created_at
                      ? format(new Date((user as any).created_at), "dd/MM/yyyy HH:mm")
                      : "Chưa có thông tin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin tài khoản
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID người dùng</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  #{user.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trạng thái</span>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-gray-900/60">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hành động
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setEditForm({
                    ho_ten: user.ho_ten || "",
                    so_dien_thoai: user.so_dien_thoai || "",
                  });
                  setProfileError(null);
                  setIsEditModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:border-white/[0.12] dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa thông tin
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
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:border-white/[0.12] dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition-colors"
              >
                <Lock className="w-4 h-4" />
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl border border-gray-200 bg-white w-full max-w-md shadow-lg dark:border-white/[0.08] dark:bg-gray-900/60">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Chỉnh sửa thông tin cá nhân
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Cập nhật thông tin của bạn
              </p>

              <div className="space-y-4">
                {profileError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                    {profileError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={editForm.ho_ten}
                    onChange={(e) => handleInputChange("ho_ten", e.target.value)}
                    placeholder="Nhập họ và tên"
                    disabled={isLoadingProfile}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editForm.so_dien_thoai}
                    onChange={(e) => handleInputChange("so_dien_thoai", e.target.value)}
                    placeholder="Nhập số điện thoại (10-11 chữ số)"
                    disabled={isLoadingProfile}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Để trống nếu không muốn cập nhật số điện thoại
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    <strong>Lưu ý:</strong> Email không thể thay đổi. Vui lòng
                    liên hệ quản trị viên nếu cần thay đổi.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-6 border-t border-gray-200 dark:border-white/[0.08]">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setProfileError(null);
                  }}
                  disabled={isLoadingProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoadingProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl border border-gray-200 bg-white w-full max-w-md shadow-lg dark:border-white/[0.08] dark:bg-gray-900/60">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Đổi mật khẩu
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Nhập mật khẩu hiện tại và mật khẩu mới
              </p>

              <div className="space-y-4">
                {passwordError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    disabled={isLoadingPassword}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mật khẩu phải có từ 6-50 ký tự và khác mật khẩu hiện tại
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Lưu ý:</strong> Mật khẩu phải có ít nhất 6 ký tự. Sau khi
                    đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-6 border-t border-gray-200 dark:border-white/[0.08]">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 dark:border-white/[0.12] dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isLoadingPassword}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
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

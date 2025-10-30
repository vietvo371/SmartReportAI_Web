"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, Briefcase, Mail, Phone } from "lucide-react";

type Report = {
  id: number;
  xu_lys: Array<{
    can_bo: { ho_ten: string; email: string | null };
  }>;
};

type StaffAgg = {
  ho_ten: string;
  email: string | null;
  so_dien_thoai?: string | null;
  assignedReports: number;
};

export default function TeamsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/admin/reports", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setReports(data.reports || []);
      } catch (e: any) {
        setError(e?.message || "Không thể tải dữ liệu đội xử lý");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const staffList: StaffAgg[] = useMemo(() => {
    const map = new Map<string, StaffAgg>();
    for (const r of reports) {
      for (const x of r.xu_lys || []) {
        const key = x.can_bo.email || x.can_bo.ho_ten;
        if (!map.has(key)) {
          map.set(key, {
            ho_ten: x.can_bo.ho_ten,
            email: x.can_bo.email,
            assignedReports: 0,
          });
        }
        const cur = map.get(key)!;
        cur.assignedReports += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.assignedReports - a.assignedReports);
  }, [reports]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đội xử lý</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đội xử lý</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tổng hợp cán bộ theo số lượng phản ánh đã/đang xử lý</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{staffList.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cán bộ tham gia xử lý</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng phản ánh có xử lý</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{staffList.reduce((s, x) => s + x.assignedReports, 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng lượt xử lý</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh sách cán bộ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cán bộ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lượt xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {staffList.map((s) => (
                <tr key={`${s.email}-${s.ho_ten}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                      {s.ho_ten.charAt(0)}
                    </div>
                    {s.ho_ten}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {s.email || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    {s.assignedReports}
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Chưa có dữ liệu cán bộ xử lý
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



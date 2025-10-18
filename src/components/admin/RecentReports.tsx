"use client";

import { Clock, AlertTriangle, CheckCircle, MapPin, User, Calendar } from "lucide-react";
import { Report } from "@/types/report";

interface RecentReportsProps {
  reports: Report[];
}

export default function RecentReports({ reports }: RecentReportsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "dang_xu_ly":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "da_hoan_tat":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return "Chờ xử lý";
      case "dang_xu_ly":
        return "Đang xử lý";
      case "da_hoan_tat":
        return "Đã giải quyết";
      default:
        return "Không xác định";
    }
  };

  const getPriorityFromLevel = (level: number): string => {
    if (level >= 4) return 'critical';
    if (level >= 3) return 'high';
    if (level >= 2) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "low":
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Sự cố gần đây
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {reports.length} sự cố
        </span>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {reports.slice(0, 5).map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(report.trang_thai)}
                <span className="font-medium text-gray-900 dark:text-white">
                  {report.tieu_de}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(getPriorityFromLevel(report.muc_do_nghiem_trong))}`}>
                  {getPriorityFromLevel(report.muc_do_nghiem_trong)}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{report.id}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {report.mo_ta || 'Không có mô tả'}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{report.loai_su_co}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{report.nguoi_dung?.ho_ten || 'Không xác định'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có sự cố nào được báo cáo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

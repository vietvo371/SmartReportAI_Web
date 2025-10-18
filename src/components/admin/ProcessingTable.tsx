"use client";

import { Clock, CheckCircle, AlertTriangle, User, Calendar, ExternalLink } from "lucide-react";
import { Process } from "@/types/report";

interface ProcessingTableProps {
  processes: Process[];
}

export default function ProcessingTable({ processes }: ProcessingTableProps) {
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
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cho_xu_ly":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "dang_xu_ly":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "da_hoan_tat":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quá trình xử lý
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Theo dõi tiến độ xử lý sự cố
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Người xử lý
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cập nhật
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phản hồi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {processes.map((process) => (
              <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  #{process.phan_anh_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {process.can_bo.ho_ten}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(process.trang_thai_moi)}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(process.trang_thai_moi)}`}>
                      {getStatusText(process.trang_thai_moi)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(process.thoi_gian)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(process.thoi_gian)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                  <p className="truncate" title={process.noi_dung}>
                    {process.noi_dung || "Chưa có phản hồi"}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    {process.hinh_anh_minh_chung && (
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                      Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {processes.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có quá trình xử lý nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

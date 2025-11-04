"use client";

import MapboxMap from "@/components/ui/map/MapboxMap";
import { MapPin, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Report } from "@/types/report";

interface InfrastructureMapProps {
  reports: Report[];
}

export default function InfrastructureMap({ reports }: InfrastructureMapProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "in-progress":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "low":
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Bản đồ sự cố hạ tầng
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{reports.length} sự cố</span>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapboxMap 
          className="w-full h-full" 
          reports={reports}
        />
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Khẩn cấp (4-5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Ưu tiên cao (3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Ưu tiên trung bình (2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Ưu tiên thấp (1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Đã xử lý</span>
        </div>
      </div>
    </div>
  );
}

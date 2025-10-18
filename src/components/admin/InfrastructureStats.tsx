"use client";

import { AlertTriangle, MapPin, Clock, CheckCircle, XCircle, Wrench } from "lucide-react";

interface InfrastructureStatsProps {
  stats: {
    total_reports: number;
    pending_reports: number;
    in_progress_reports: number;
    resolved_reports: number;
    critical_issues: number;
    processing_teams: number;
  };
}

export default function InfrastructureStats({ stats }: InfrastructureStatsProps) {
  const cards = [
    {
      title: "Tổng sự cố",
      value: stats.total_reports,
      icon: AlertTriangle,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "Tất cả sự cố được báo cáo",
    },
    {
      title: "Chờ xử lý",
      value: stats.pending_reports,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Sự cố đang chờ xử lý",
    },
    {
      title: "Đang xử lý",
      value: stats.in_progress_reports,
      icon: Wrench,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      description: "Sự cố đang được xử lý",
    },
    {
      title: "Đã giải quyết",
      value: stats.resolved_reports,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Sự cố đã được giải quyết",
    },
    {
      title: "Khẩn cấp",
      value: stats.critical_issues,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      description: "Sự cố cần xử lý ngay",
    },
    {
      title: "Đội xử lý",
      value: stats.processing_teams,
      icon: MapPin,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      description: "Đội xử lý đang hoạt động",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.bgColor} p-2 rounded-lg`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {card.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

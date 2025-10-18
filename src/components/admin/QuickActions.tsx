"use client";

import { Plus, MapPin, Users, Settings, BarChart3, Brain, AlertTriangle, Activity } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Tạo sự cố mới",
      description: "Thêm sự cố hạ tầng mới",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
      href: "/admin/reports/new",
    },
    {
      title: "Xem bản đồ",
      description: "Bản đồ sự cố trực quan",
      icon: MapPin,
      color: "bg-green-500 hover:bg-green-600",
      href: "/admin/map",
    },
    {
      title: "Quản lý đội xử lý",
      description: "Quản lý nhân viên xử lý",
      icon: Users,
      color: "bg-purple-500 hover:bg-purple-600",
      href: "/admin/teams",
    },
    {
      title: "Thống kê",
      description: "Báo cáo và phân tích",
      icon: BarChart3,
      color: "bg-orange-500 hover:bg-orange-600",
      href: "/admin/statistics",
    },
    {
      title: "AI Phân tích",
      description: "Quản lý hệ thống AI",
      icon: Brain,
      color: "bg-indigo-500 hover:bg-indigo-600",
      href: "/admin/ai",
    },
    {
      title: "Cài đặt hệ thống",
      description: "Cấu hình và tùy chỉnh",
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Thao tác nhanh
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <a
              key={index}
              href={action.href}
              className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-primary/50"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

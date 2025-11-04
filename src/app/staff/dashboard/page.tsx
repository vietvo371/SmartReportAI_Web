"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ListIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CameraIcon,
  UserGroupIcon,
  ChartBarIcon
} from "@/icons";
import Link from "next/link";

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
  });

  useEffect(() => {
    // Fetch staff stats
    setStats({
      assignedTasks: 8,
      completedTasks: 5,
      inProgressTasks: 2,
      pendingTasks: 1,
    });
  }, []);

  const quickActions = [
    {
      title: "Nhiệm vụ được giao",
      description: "Xem danh sách nhiệm vụ",
      icon: ListIcon,
      href: "/staff/assigned-tasks",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Đang xử lý",
      description: "Các phản ánh đang xử lý",
      icon: ClockIcon,
      href: "/staff/in-progress",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      title: "Upload minh chứng",
      description: "Tải lên ảnh minh chứng",
      icon: CameraIcon,
      href: "/staff/upload-evidence",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Thống kê cá nhân",
      description: "Xem hiệu suất làm việc",
      icon: ChartBarIcon,
      href: "/staff/statistics",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bảng điều khiển Cán Bộ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý và xử lý các phản ánh được giao. Cập nhật tiến trình và tải lên minh chứng.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <ListIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nhiệm vụ được giao
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.assignedTasks}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đang xử lý
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.inProgressTasks}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đã hoàn thành
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.completedTasks}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <UserGroupIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Chờ xử lý
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.pendingTasks}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link href={action.href}>
                <div className={`${action.color} text-white rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg`}>
                  <action.icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nhiệm vụ gần đây
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Đường bị sụt lún - Quận 1
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Đã hoàn thành - 2 giờ trước
                </p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              Hoàn thành
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Rác thải không được thu gom - Quận 3
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Đang xử lý - 1 ngày trước
                </p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
              Đang xử lý
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <ListIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Cây xanh bị đổ - Quận 5
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Chờ xử lý - 2 ngày trước
                </p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
              Chờ xử lý
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

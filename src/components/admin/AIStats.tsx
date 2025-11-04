"use client";

import { Brain, Target, Zap, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface AIStatsProps {
  stats: {
    total_analyses: number;
    accuracy_rate: number;
    processing_time_avg: number;
    predictions_today: number;
    model_version: string;
    last_updated: string;
  };
}

export default function AIStats({ stats }: AIStatsProps) {
  const cards = [
    {
      title: "Tổng phân tích",
      value: stats.total_analyses,
      icon: Brain,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "Lần phân tích AI",
    },
    {
      title: "Độ chính xác",
      value: `${stats.accuracy_rate}%`,
      icon: Target,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Tỷ lệ dự đoán đúng",
    },
    {
      title: "Thời gian xử lý",
      value: `${stats.processing_time_avg}ms`,
      icon: Zap,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Trung bình mỗi ảnh",
    },
    {
      title: "Dự đoán hôm nay",
      value: stats.predictions_today,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      description: "Phân tích trong ngày",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Thống kê AI
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Brain className="w-4 h-4" />
          <span>v{stats.model_version}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {card.title}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Cập nhật lần cuối: {new Date(stats.last_updated).toLocaleString("vi-VN")}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>AI đang hoạt động</span>
        </div>
      </div>
    </div>
  );
}

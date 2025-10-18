"use client";

import { useState, useEffect } from "react";
import { Brain, Target, Zap, TrendingUp, Clock, CheckCircle, Upload, BarChart3, Activity } from "lucide-react";

interface AIAnalysis {
  id: number;
  predicted_label: string;
  confidence_score: number;
  description: string;
  severity: string;
  suggested_priority: string;
  model_version: string;
  processing_time_ms: number;
  created_at: string;
  nguoiDung: {
    ho_ten: string;
    email: string;
  };
}

export default function AIPage() {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_analyses: 0,
    accuracy_rate: 0,
    processing_time_avg: 0,
    predictions_today: 0,
    model_version: "1.0.0",
    last_updated: new Date().toISOString(),
  });

  useEffect(() => {
    fetchAnalyses();
    fetchStats();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/ai-analyses');
      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock data for now
      setStats({
        total_analyses: 1250,
        accuracy_rate: 94.5,
        processing_time_avg: 150,
        predictions_today: 45,
        model_version: "1.0.0",
        last_updated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "pothole":
        return "🕳️";
      case "flooding":
        return "🌊";
      case "traffic_light":
        return "🚦";
      case "waste":
        return "🗑️";
      case "traffic_jam":
        return "🚗";
      default:
        return "❓";
    }
  };

  const getLabelText = (label: string) => {
    switch (label) {
      case "pothole":
        return "Ổ gà";
      case "flooding":
        return "Ngập lụt";
      case "traffic_light":
        return "Đèn giao thông";
      case "waste":
        return "Rác thải";
      case "traffic_jam":
        return "Kẹt xe";
      default:
        return "Không xác định";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý AI Phân tích
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi và quản lý hệ thống AI phân tích sự cố
        </p>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_analyses}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tổng phân tích
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.accuracy_rate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Độ chính xác
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.processing_time_avg}ms
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thời gian xử lý TB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.predictions_today}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dự đoán hôm nay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quản lý Model
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Brain className="w-4 h-4" />
            <span>v{stats.model_version}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Upload className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Tải lên Model mới</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật AI model</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Đánh giá Model</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kiểm tra hiệu suất</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Activity className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Huấn luyện lại</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cải thiện độ chính xác</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Phân tích gần đây
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Loại sự cố
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Độ tin cậy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mức độ nghiêm trọng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian xử lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analyses.slice(0, 10).map((analysis) => (
                <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{analysis.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getLabelIcon(analysis.predicted_label)}</span>
                      <span>{getLabelText(analysis.predicted_label)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${analysis.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span>{(analysis.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(analysis.severity)}`}>
                      {analysis.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {analysis.processing_time_ms}ms
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {analysis.nguoiDung.ho_ten}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(analysis.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {analyses.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có phân tích nào
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
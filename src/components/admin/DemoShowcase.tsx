"use client";

import { useState } from "react";
import { ChevronRight, Play, CheckCircle, AlertCircle, Info } from "lucide-react";

const DemoShowcase = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const demoSteps = [
    {
      id: "ai-analysis",
      title: "🤖 Demo AI Phân Tích Hình Ảnh",
      description: "Tải lên hình ảnh sự cố để AI nhận dạng tự động",
      difficulty: "Dễ",
      duration: "2-3 phút",
      instructions: [
        "Cuộn xuống tìm 'Bảng Kiểm Tra AI Phân Tích Hình Ảnh'",
        "Nhấn 'Chọn File' và tải lên hình ảnh (ổ gà, ngập lụt, rác thải)",
        "Nhấn 'Bắt đầu phân tích AI'",
        "Xem kết quả: loại sự cố, độ tin cậy, mức độ nghiêm trọng"
      ],
      tips: "💡 Thử với các loại hình ảnh khác nhau để xem AI phân loại như thế nào"
    },
    {
      id: "theme-toggle",
      title: "🎨 Demo Chuyển Đổi Theme",
      description: "Trải nghiệm Dark/Light mode responsive",
      difficulty: "Rất dễ",
      duration: "30 giây",
      instructions: [
        "Tìm biểu tượng 🌙/☀️ ở góc trên bên phải",
        "Nhấn để chuyển đổi Dark/Light mode",
        "Quan sát tất cả components thay đổi màu sắc",
        "Thử chuyển đổi nhiều lần để thấy hiệu ứng mượt mà"
      ],
      tips: "💡 Dark mode giúp giảm mỏi mắt khi sử dụng ban đêm"
    },
    {
      id: "responsive-design",
      title: "📱 Demo Responsive Design",
      description: "Xem giao diện thích ứng trên mọi thiết bị",
      difficulty: "Dễ",
      duration: "1-2 phút",
      instructions: [
        "Nhấn F12 để mở Developer Tools",
        "Nhấn biểu tượng device toggle (Ctrl+Shift+M)",
        "Chọn các kích thước khác nhau: Mobile, Tablet, Desktop",
        "Quan sát sidebar, charts, tables thay đổi layout"
      ],
      tips: "💡 Thử xoay ngang/dọc trên mobile để thấy adaptive layout"
    },
    {
      id: "dashboard-analytics",
      title: "📊 Demo Dashboard Analytics",
      description: "Khám phá các biểu đồ và thống kê thông minh",
      difficulty: "Trung bình",
      duration: "3-5 phút",
      instructions: [
        "Quan sát các thẻ thống kê ở đầu trang",
        "Tương tác với biểu đồ (hover, click)",
        "Xem bảng xử lý sự cố gần đây",
        "Thử refresh trang để thấy dữ liệu cập nhật"
      ],
      tips: "💡 Hover lên các phần tử để thấy tooltip chi tiết"
    },
    {
      id: "role-navigation",
      title: "👥 Demo Phân Quyền Vai Trò",
      description: "Trải nghiệm giao diện khác nhau cho từng vai trò",
      difficulty: "Trung bình",
      duration: "5-7 phút",
      instructions: [
        "Truy cập /admin/dashboard (Quản trị viên)",
        "Truy cập /staff (Cán bộ xử lý)",
        "Truy cập /citizen (Người dân)",
        "So sánh sidebar, menu và tính năng khác nhau"
      ],
      tips: "💡 Mỗi vai trò có giao diện và quyền hạn phù hợp với công việc"
    },
    {
      id: "ai-service-status",
      title: "⚡ Demo AI Service Monitoring",
      description: "Kiểm tra trạng thái và hiệu năng AI service",
      difficulty: "Nâng cao",
      duration: "2-3 phút",
      instructions: [
        "Quan sát trạng thái AI service (Đang hoạt động/Không khả dụng)",
        "Thử tắt AI service (Ctrl+C trong terminal Python)",
        "Reload trang và xem fallback mode hoạt động",
        "Khởi động lại AI service để thấy sự khác biệt"
      ],
      tips: "💡 Hệ thống có fallback thông minh khi AI service không khả dụng"
    }
  ];

  const toggleStep = (stepId: string) => {
    if (activeDemo === stepId) {
      setActiveDemo(null);
    } else {
      setActiveDemo(stepId);
    }
  };

  const markCompleted = (stepId: string) => {
    setCompletedSteps(new Set([...completedSteps, stepId]));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Rất dễ": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Dễ": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Trung bình": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Nâng cao": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          🎯 Hướng Dẫn Demo Tương Tác
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Khám phá các tính năng của SmartReportAI thông qua hướng dẫn từng bước chi tiết
        </p>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">
              Đã hoàn thành: {completedSteps.size}/{demoSteps.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">
              Thời gian demo ước tính: 15-20 phút
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {demoSteps.map((step, index) => (
          <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div
              className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                activeDemo === step.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => toggleStep(step.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completedSteps.has(step.id) 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {completedSteps.has(step.id) ? '✓' : index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                    {step.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {step.duration}
                  </span>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      activeDemo === step.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </div>
            </div>

            {activeDemo === step.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    📝 Hướng dẫn từng bước:
                  </h4>
                  <ol className="space-y-2">
                    {step.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {step.tips}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => markCompleted(step.id)}
                    disabled={completedSteps.has(step.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      completedSteps.has(step.id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {completedSteps.has(step.id) ? '✅ Đã hoàn thành' : '📍 Đánh dấu hoàn thành'}
                  </button>

                  {!completedSteps.has(step.id) && (
                    <button
                      onClick={() => markCompleted(step.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Bắt đầu demo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {completedSteps.size === demoSteps.length && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            <h4 className="font-semibold">🎉 Chúc mừng! Bạn đã hoàn thành tất cả demo!</h4>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            Bạn đã trải nghiệm đầy đủ các tính năng của SmartReportAI. Hãy khám phá thêm các tính năng nâng cao khác!
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-yellow-800 dark:text-yellow-300">
              Lưu ý quan trọng:
            </h5>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 space-y-1">
              <li>• Đảm bảo AI Service đang chạy (python main.py) để demo tính năng AI</li>
              <li>• Sử dụng hình ảnh rõ nét, kích thước nhỏ hơn 10MB cho kết quả tốt nhất</li>
              <li>• Thử nghiệm trên nhiều thiết bị khác nhau để thấy responsive design</li>
              <li>• Kiểm tra console (F12) để xem các API calls và debug info</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoShowcase;
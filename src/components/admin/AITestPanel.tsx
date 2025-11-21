"use client";

import { useState } from "react";
import { useAnalyzeImageFile, useAIServiceHealth } from "@/hooks/useAI";

const AITestPanel = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const analyzeImage = useAnalyzeImageFile();
  const { data: healthData, isLoading: healthLoading } = useAIServiceHealth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analyzeImage.mutate(selectedFile);
    }
  };

  // Mapping severity to Vietnamese
  const getSeverityText = (severity: string) => {
    const mapping = {
      'critical': 'Nghiêm trọng',
      'high': 'Cao',
      'medium': 'Trung bình', 
      'low': 'Thấp'
    };
    return mapping[severity as keyof typeof mapping] || severity;
  };

  // Mapping incident types to Vietnamese
  const getIncidentTypeText = (type: string) => {
    const mapping = {
      'pothole': 'Ổ gà đường',
      'flooding': 'Ngập lụt',
      'traffic_light': 'Đèn giao thông',
      'waste': 'Rác thải',
      'traffic_jam': 'Kẹt xe'
    };
    return mapping[type as keyof typeof mapping] || type;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          🤖 Bảng Kiểm Tra AI Phân Tích Hình Ảnh
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tải lên hình ảnh sự cố để AI phân tích và nhận dạng tự động
        </p>
        
        {/* Trạng thái dịch vụ */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trạng thái dịch vụ AI:
            </span>
            {healthLoading ? (
              <span className="text-yellow-600 flex items-center gap-1">
                ⏳ Đang kiểm tra...
              </span>
            ) : healthData?.status === "healthy" ? (
              <span className="text-green-600 flex items-center gap-1 font-medium">
                ✅ Đang hoạt động
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1 font-medium">
                ❌ Không khả dụng
              </span>
            )}
          </div>
          {healthData && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Trạng thái models: {healthData.models_loaded ? "✅ Đã tải" : "❌ Chưa tải"}
              {healthData.version && ` • Phiên bản: ${healthData.version}`}
            </div>
          )}
        </div>
      </div>

      {/* Tải lên hình ảnh */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          📸 Tải lên hình ảnh sự cố
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
              file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
              hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)
          </p>
        </div>
      </div>

      {/* Xem trước hình ảnh */}
      {previewUrl && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            🖼️ Xem trước hình ảnh
          </h4>
          <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
            <img
              src={previewUrl}
              alt="Xem trước"
              className="w-full max-w-md mx-auto rounded-lg shadow-sm"
            />
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Tên file: {selectedFile?.name}
            </p>
          </div>
        </div>
      )}

      {/* Nút phân tích */}
      <div className="mb-6">
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || analyzeImage.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg 
                   hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 font-semibold flex items-center justify-center gap-2"
        >
          {analyzeImage.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang phân tích...
            </>
          ) : (
            <>
              🔍 Bắt đầu phân tích AI
            </>
          )}
        </button>
      </div>

      {/* Kết quả phân tích */}
      {analyzeImage.data && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 
                      rounded-lg p-5 border border-green-200 dark:border-gray-600">
          <h4 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            📊 Kết quả phân tích AI
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <strong className="text-gray-700 dark:text-gray-300">Loại sự cố:</strong>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 
                              rounded-full text-sm font-medium">
                  {getIncidentTypeText(analyzeImage.data.analysis.label)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <strong className="text-gray-700 dark:text-gray-300">Độ tin cậy:</strong>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{width: `${analyzeImage.data.analysis.confidence * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {(analyzeImage.data.analysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <strong className="text-gray-700 dark:text-gray-300">Mức độ nghiêm trọng:</strong>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analyzeImage.data.analysis.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  analyzeImage.data.analysis.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                  analyzeImage.data.analysis.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {getSeverityText(analyzeImage.data.analysis.severity)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Mô tả chi tiết:</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-800 rounded">
                  {analyzeImage.data.analysis.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-gray-800 p-2 rounded">
                  <strong>Thời gian xử lý:</strong><br/>
                  <span className="text-blue-600 dark:text-blue-400">
                    {analyzeImage.data.analysis.processing_time_ms}ms
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded">
                  <strong>Phiên bản model:</strong><br/>
                  <span className="text-green-600 dark:text-green-400">
                    {analyzeImage.data.analysis.model_version}
                  </span>
                </div>
              </div>

              {analyzeImage.data.analysis.detected_objects?.length > 0 && (
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Đối tượng phát hiện:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analyzeImage.data.analysis.detected_objects.map((obj: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 
                                                   rounded text-xs">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lỗi */}
      {analyzeImage.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                      text-red-700 dark:text-red-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <strong>❌ Có lỗi xảy ra:</strong>
          </div>
          <p className="text-sm mt-1">{analyzeImage.error.message}</p>
          <p className="text-xs mt-2 text-red-600 dark:text-red-400">
            Vui lòng thử lại hoặc kiểm tra kết nối AI service
          </p>
        </div>
      )}

      {/* Hướng dẫn sử dụng */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
          💡 Hướng dẫn sử dụng:
        </h5>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Chọn hình ảnh sự cố từ thiết bị của bạn</li>
          <li>• Nhấn "Bắt đầu phân tích AI" để AI nhận dạng</li>
          <li>• Xem kết quả phân loại và đánh giá độ tin cậy</li>
          <li>• AI có thể nhận dạng: ổ gà, ngập lụt, đèn giao thông, rác thải, kẹt xe</li>
        </ul>
      </div>
    </div>
  );
};

export default AITestPanel;
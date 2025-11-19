import { Clock, CheckCircle, AlertCircle, ClipboardCheck } from "lucide-react";

const stages = [
  {
    title: "Chờ xác minh",
    icon: AlertCircle,
    color:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
    items: [
      {
        id: "SR-2041",
        description: "Ngập nước đường Trường Chinh - Quận 12",
        reporter: "Nguyễn Văn A",
        updatedAt: "10 phút trước",
        severity: "Cao",
      },
      {
        id: "SR-2038",
        description: "Sụt lún vỉa hè đường Điện Biên Phủ",
        reporter: "Lê Minh",
        updatedAt: "35 phút trước",
        severity: "Trung bình",
      },
    ],
  },
  {
    title: "Đang triển khai",
    icon: Clock,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    items: [
      {
        id: "SR-2032",
        description: "Cây xanh ngã đường Lê Văn Sỹ",
        reporter: "Trần Quang",
        updatedAt: "1 giờ trước",
        severity: "Cao",
      },
      {
        id: "SR-2030",
        description: "Đèn tín hiệu hư Nguyễn Tri Phương",
        reporter: "Phạm Tùng",
        updatedAt: "2 giờ trước",
        severity: "Trung bình",
      },
      {
        id: "SR-2027",
        description: "Thu gom rác khu dân cư KDC Q.8",
        reporter: "Nguyễn Hoa",
        updatedAt: "3 giờ trước",
        severity: "Thấp",
      },
    ],
  },
  {
    title: "Chờ xác nhận",
    icon: ClipboardCheck,
    color:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    items: [
      {
        id: "SR-2024",
        description: "Ổ gà đường Võ Văn Tần",
        reporter: "Mai Hạnh",
        updatedAt: "30 phút trước",
        severity: "Trung bình",
      },
      {
        id: "SR-2019",
        description: "Cống thoát nước nghẹt - Q.4",
        reporter: "Đặng Thiện",
        updatedAt: "4 giờ trước",
        severity: "Cao",
      },
    ],
  },
];

const severityStyles: Record<string, string> = {
  Cao: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  "Trung bình":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Thấp: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function StaffInProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">
            Vòng đời xử lý
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Theo dõi tiến trình các phản ánh
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cập nhật trạng thái theo thời gian thực để phối hợp hiệu quả.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
            Cập nhật hàng loạt
          </button>
          <button className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
            + Tạo ghi chú hiện trường
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.title}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stage.title}
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stage.items.length} nhiệm vụ
                  </h3>
                </div>
                <span className={`rounded-full p-2 ${stage.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {stage.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-100 p-4 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-gray-400">
                        {item.id}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityStyles[item.severity]}`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                      {item.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Người báo cáo:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {item.reporter}
                      </span>
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Cập nhật {item.updatedAt}</span>
                      <button className="font-semibold text-brand-600 hover:underline">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tổng quan SLA
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cam kết xử lý theo từng cấp độ ưu tiên
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              92% hoàn thành đúng hạn
            </span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
              6 cảnh báo trễ
            </span>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { label: "Thời gian phản hồi TB", value: "1h 25m" },
            { label: "Thời gian hoàn thành TB", value: "14h 10m" },
            { label: "Tỷ lệ cập nhật nhật ký", value: "86%" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-dashed border-gray-200 p-4 text-center dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



# SmartReportAI

Hệ thống phản ánh và xử lý sự cố thông minh được xây dựng với Next.js, TypeScript và Tailwind CSS.

## 🚀 Tính năng

SmartReportAI cung cấp hai giao diện người dùng riêng biệt:

### Bảng điều khiển Quản trị viên
- **Kiểm soát hệ thống đầy đủ**: Tổng quan và quản lý toàn bộ nền tảng
- **Quản lý người dùng**: Quản lý tất cả người dùng và quyền hạn của họ
- **Phân tích & Báo cáo**: Thống kê toàn diện và thông tin nhân khẩu học
- **Phân bổ tài nguyên**: Theo dõi và quản lý tài nguyên xử lý sự cố
- **Quản lý lịch**: Lên lịch và phối hợp các hoạt động xử lý
- **Biểu đồ nâng cao**: Biểu đồ đường, biểu đồ cột và trực quan hóa dữ liệu
- **Thành phần UI**: Bộ đầy đủ cảnh báo, avatar, huy hiệu, nút, hình ảnh và video

### Cổng thông tin Người dùng
- **Bảng điều khiển cá nhân**: Xem các yêu cầu phản ánh và đánh giá cá nhân
- **Quản lý phản ánh**: Gửi và theo dõi các phản ánh sự cố
- **Theo dõi xử lý**: Giám sát tiến độ xử lý và tác động
- **Quản lý hồ sơ**: Cập nhật thông tin cá nhân và tùy chọn
- **Bảng tin hoạt động**: Xem các hoạt động và cập nhật gần đây
- **Điểm tác động**: Theo dõi xếp hạng cộng đồng và đóng góp
- **Tài nguyên**: Truy cập tài nguyên xử lý sự cố và thông tin

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 15.2.3
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Thành phần UI**: Thành phần tùy chỉnh với mẫu shadcn/ui
- **Biểu đồ**: ApexCharts & React-ApexCharts
- **Lịch**: FullCalendar
- **Bản đồ**: React JVectorMap
- **Form**: React Dropzone, Flatpickr
- **Kéo & Thả**: React DnD
- **Carousel**: Swiper
- **Cơ sở dữ liệu**: PostgreSQL với Prisma ORM
- **Blockchain**: Tích hợp blockchain để minh bạch

## 📦 Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd smartreportai
```

2. Cài đặt dependencies:
```bash
npm install
# hoặc
yarn install
```

3. Thiết lập cơ sở dữ liệu:
```bash
# Tạo file .env.local với DATABASE_URL
cp .env.example .env.local

# Chạy migration
npm run prisma:migrate

# Seed dữ liệu mẫu
npm run prisma:seed
```

4. Chạy development server:
```bash
npm run dev
# hoặc
yarn dev
```

5. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 🌐 Routes

### Routes Quản trị viên
- `/admin` - Bảng điều khiển Quản trị viên
- `/admin/calendar` - Quản lý Lịch
- `/admin/users` - Quản lý Người dùng
- `/admin/form-elements` - Thành phần Form
- `/admin/basic-tables` - Bảng
- `/admin/line-chart` - Biểu đồ Đường
- `/admin/bar-chart` - Biểu đồ Cột
- `/admin/alerts` - Thành phần Cảnh báo
- `/admin/avatars` - Thành phần Avatar
- `/admin/badge` - Thành phần Huy hiệu
- `/admin/buttons` - Thành phần Nút
- `/admin/images` - Thư viện Hình ảnh
- `/admin/videos` - Thành phần Video

### Routes Cán bộ
- `/citizen` - Bảng điều khiển Cán bộ
- `/citizen/requests` - Phản ánh Sự cố
- `/citizen/profile` - Hồ sơ Cán bộ
- `/citizen/resources` - Trung tâm Tài nguyên

### Routes Người dân
- `/volunteer` - Bảng điều khiển Người dân
- `/volunteer/requests` - Yêu cầu Phản ánh
- `/volunteer/profile` - Hồ sơ Người dân
- `/volunteer/resources` - Trung tâm Tài nguyên

## 🎨 Hỗ trợ Theme

SmartReportAI hỗ trợ cả theme sáng và tối:
- Chuyển đổi theme bằng công tắc theme trong header
- Tùy chọn theme được lưu tự động
- Chế độ tối được tối ưu hóa để đọc tốt hơn

## 📱 Thiết kế Responsive

Nền tảng hoàn toàn responsive và hoạt động mượt mà trên:
- Desktop (1920px trở lên)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Cấu hình

### Biến môi trường

Tạo file `.env.local` trong thư mục gốc:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/smartreportai"
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

### Cấu hình Tailwind

Dự án sử dụng Tailwind CSS v4 với cấu hình theme tùy chỉnh trong `src/app/globals.css`.

## 📂 Cấu trúc dự án

```
smartreportai/
├── public/
│   └── images/          # Hình ảnh và tài sản tĩnh
├── prisma/
│   ├── schema.prisma    # Schema cơ sở dữ liệu
│   └── seed.ts         # Dữ liệu mẫu
├── src/
│   ├── app/
│   │   ├── admin/        # Routes quản trị viên
│   │   ├── citizen/      # Routes cán bộ
│   │   ├── volunteer/    # Routes người dân
│   │   ├── layout.tsx    # Layout gốc
│   │   ├── page.tsx      # Trang chủ (chuyển hướng)
│   │   ├── not-found.tsx # Trang 404
│   │   └── globals.css   # Styles toàn cục
│   ├── components/
│   │   ├── auth/         # Thành phần xác thực
│   │   ├── calendar/     # Thành phần lịch
│   │   ├── charts/       # Thành phần biểu đồ
│   │   ├── common/       # Thành phần chung/chia sẻ
│   │   ├── ecommerce/    # Thành phần bảng điều khiển
│   │   ├── form/         # Thành phần form
│   │   ├── header/       # Thành phần header
│   │   ├── tables/       # Thành phần bảng
│   │   ├── ui/           # Thành phần UI
│   │   └── videos/       # Thành phần video
│   ├── context/
│   │   ├── SidebarContext.tsx  # Quản lý trạng thái sidebar
│   │   └── ThemeContext.tsx    # Quản lý trạng thái theme
│   ├── hooks/            # React hooks tùy chỉnh
│   ├── icons/            # SVG icons
│   └── layout/
│       ├── AppHeader.tsx # Header ứng dụng
│       ├── AppSidebar.tsx # Sidebar ứng dụng
│       ├── Backdrop.tsx  # Overlay mobile
│       └── SidebarWidget.tsx  # Widget sidebar
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🚦 Scripts có sẵn

- `npm run dev` - Khởi động development server
- `npm run build` - Build cho production
- `npm run start` - Khởi động production server
- `npm run lint` - Chạy ESLint
- `npm run prisma:generate` - Tạo Prisma client
- `npm run prisma:migrate` - Chạy migration
- `npm run prisma:seed` - Seed dữ liệu mẫu

## 🎯 Tính năng chính

### Kiểm soát truy cập dựa trên vai trò
Nền tảng triển khai định tuyến dựa trên vai trò:
- Người dùng Quản trị viên truy cập routes `/admin/*`
- Cán bộ truy cập routes `/citizen/*`
- Người dân truy cập routes `/volunteer/*`
- Mỗi vai trò có điều hướng sidebar và bảng điều khiển tùy chỉnh

### Sidebar Responsive
- Sidebar có thể mở rộng/thu gọn
- Tính năng mở rộng khi hover trên desktop
- Drawer thân thiện với mobile
- Điều chỉnh chiều rộng động
- Quản lý trạng thái liên tục

### Chế độ tối
- Hỗ trợ chế độ tối toàn hệ thống
- Chuyển đổi mượt mà giữa các theme
- Màu sắc được tối ưu hóa cho cả hai chế độ
- Thích ứng icon cho theme

## 🔐 Xác thực

Nền tảng bao gồm các trang xác thực:
- Đăng nhập: `/signin`
- Đăng ký: `/signup`

## 📊 Thành phần Bảng điều khiển

### Bảng điều khiển Quản trị viên
- Thẻ số liệu ecommerce
- Biểu đồ doanh thu hàng tháng
- Trực quan hóa thống kê
- Bảng đơn hàng gần đây
- Bản đồ phân bố nhân khẩu học

### Bảng điều khiển Người dùng
- Bộ đếm yêu cầu phản ánh
- Theo dõi xử lý
- Hiển thị điểm tác động
- Timeline hoạt động gần đây

## 🗄️ Cơ sở dữ liệu

### Schema chính
- **NguoiDung**: Thông tin người dùng (người dân, cán bộ, quản trị)
- **PhanAnh**: Phản ánh sự cố với AI nhận dạng
- **XuLy**: Lịch sử xử lý sự cố
- **BlockchainLog**: Nhật ký blockchain cho minh bạch
- **ThongBao**: Thông báo hệ thống
- **LichSuDanhGia**: Lịch sử đánh giá
- **Token**: Token xác thực

### Dữ liệu mẫu
Seeder tạo ra:
- 5 người dùng (3 người dân, 2 cán bộ, 1 quản trị)
- 3 phản ánh sự cố
- 2 bản ghi xử lý
- 2 nhật ký blockchain
- 3 thông báo
- 2 đánh giá
- 2 token

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT.

## 👥 Hỗ trợ

Để được hỗ trợ và câu hỏi:
- Tạo issue trong repository
- Liên hệ nhóm phát triển

## 🙏 Lời cảm ơn

- Được xây dựng trên template bảng điều khiển Next.js
- Icons và tài sản từ các dự án mã nguồn mở
- Tailwind CSS cho framework styling

---

**SmartReportAI** - Kết nối cộng đồng với hệ thống phản ánh và xử lý sự cố hiệu quả và minh bạch.
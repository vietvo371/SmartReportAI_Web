import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Create admin user
  const admin = await prisma.nguoiDung.upsert({
    where: { email: "admin@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Quản trị viên hệ thống",
      email: "admin@smartreport.ai", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0901234567",
      vai_tro: "quan_tri",
      dia_chi: "Trung tâm hành chính Đà Nẵng",
      avatar_url: "/images/user/user-01.jpg",
      ai_performance_score: 95.0,
    },
  });

  // Create diverse staff users with different specializations and locations across Da Nang
  const staff1 = await prisma.nguoiDung.upsert({
    where: { email: "staff1@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Nguyễn Văn Tuấn",
      email: "staff1@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0912345678", 
      vai_tro: "can_bo",
      dia_chi: "Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-02.jpg",
      skills: ["road_repair", "asphalt_work", "drainage"],
      current_workload: 0,
      location_lat: 16.0544,
      location_lng: 108.2022,
      ai_performance_score: 88.5,
    },
  });

  const staff2 = await prisma.nguoiDung.upsert({
    where: { email: "staff2@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Trần Thị Hoa",
      email: "staff2@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0923456789",
      vai_tro: "can_bo", 
      dia_chi: "Quận Thanh Khê, Đà Nẵng",
      avatar_url: "/images/user/user-03.jpg",
      skills: ["electrical", "traffic_systems", "emergency_response"],
      current_workload: 0,
      location_lat: 16.0735,
      location_lng: 108.1583,
      ai_performance_score: 92.3,
    },
  });

  const staff3 = await prisma.nguoiDung.upsert({
    where: { email: "staff3@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Lê Minh Khôi",
      email: "staff3@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0934567890",
      vai_tro: "can_bo",
      dia_chi: "Quận Sơn Trà, Đà Nẵng", 
      avatar_url: "/images/user/user-04.jpg",
      skills: ["waste_management", "cleaning", "traffic_control"],
      current_workload: 0,
      location_lat: 16.0717,
      location_lng: 108.2386,
      ai_performance_score: 85.7,
    },
  });

  const staff4 = await prisma.nguoiDung.upsert({
    where: { email: "staff4@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Phạm Thị Mai",
      email: "staff4@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0945678901",
      vai_tro: "can_bo",
      dia_chi: "Quận Ngũ Hành Sơn, Đà Nẵng", 
      avatar_url: "/images/user/user-05.jpg",
      skills: ["tree_maintenance", "park_management", "landscaping"],
      current_workload: 0,
      location_lat: 16.0408,
      location_lng: 108.2504,
      ai_performance_score: 90.2,
    },
  });

  const staff5 = await prisma.nguoiDung.upsert({
    where: { email: "staff5@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Đỗ Văn Nam",
      email: "staff5@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0956789012",
      vai_tro: "can_bo",
      dia_chi: "Quận Liên Chiểu, Đà Nẵng", 
      avatar_url: "/images/user/user-06.jpg",
      skills: ["security", "patrol", "emergency_response", "traffic_control"],
      current_workload: 0,
      location_lat: 16.0693,
      location_lng: 108.1506,
      ai_performance_score: 87.8,
    },
  });

  const staff6 = await prisma.nguoiDung.upsert({
    where: { email: "staff6@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Võ Thị Ngọc",
      email: "staff6@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0967890123",
      vai_tro: "can_bo",
      dia_chi: "Quận Cẩm Lệ, Đà Nẵng", 
      avatar_url: "/images/user/user-13.jpg",
      skills: ["road_repair", "traffic_systems", "drainage"],
      current_workload: 0,
      location_lat: 16.0285,
      location_lng: 108.1935,
      ai_performance_score: 89.5,
    },
  });

  const staff7 = await prisma.nguoiDung.upsert({
    where: { email: "staff7@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Huỳnh Văn Hải",
      email: "staff7@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0978901234",
      vai_tro: "can_bo",
      dia_chi: "Quận Hải Châu, Đà Nẵng", 
      avatar_url: "/images/user/user-14.jpg",
      skills: ["waste_management", "environmental", "cleaning"],
      current_workload: 0,
      location_lat: 16.0478,
      location_lng: 108.2088,
      ai_performance_score: 86.2,
    },
  });

  // Create diverse citizens from different districts in Da Nang
  const citizen1 = await prisma.nguoiDung.upsert({
    where: { email: "citizen1@gmail.com" },
    update: {},
    create: {
      ho_ten: "Phạm Văn Dũng",
      email: "citizen1@gmail.com",
      mat_khau: hashedPassword,
      so_dien_thoai: "0945678901",
      vai_tro: "nguoi_dan",
      dia_chi: "123 Trần Phú, Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-07.jpg",
    },
  });

  const citizen2 = await prisma.nguoiDung.upsert({
    where: { email: "citizen2@gmail.com" },
    update: {},
    create: {
      ho_ten: "Võ Thị Lan",
      email: "citizen2@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0956789012",
      vai_tro: "nguoi_dan",
      dia_chi: "456 Lê Duẩn, Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-08.jpg",
    },
  });

  const citizen3 = await prisma.nguoiDung.upsert({
    where: { email: "citizen3@gmail.com" },
    update: {},
    create: {
      ho_ten: "Nguyễn Thị Hồng",
      email: "citizen3@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0967890123",
      vai_tro: "nguoi_dan",
      dia_chi: "789 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng",
      avatar_url: "/images/user/user-09.jpg",
    },
  });

  const citizen4 = await prisma.nguoiDung.upsert({
    where: { email: "citizen4@gmail.com" },
    update: {},
    create: {
      ho_ten: "Trần Văn Minh",
      email: "citizen4@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0978901234",
      vai_tro: "nguoi_dan",
      dia_chi: "321 Điện Biên Phủ, Quận Thanh Khê, Đà Nẵng",
      avatar_url: "/images/user/user-10.jpg",
    },
  });

  const citizen5 = await prisma.nguoiDung.upsert({
    where: { email: "citizen5@gmail.com" },
    update: {},
    create: {
      ho_ten: "Huỳnh Văn Tài",
      email: "citizen5@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0989012345",
      vai_tro: "nguoi_dan",
      dia_chi: "654 Ngô Quyền, Quận Sơn Trà, Đà Nẵng",
      avatar_url: "/images/user/user-11.jpg",
    },
  });

  const citizen6 = await prisma.nguoiDung.upsert({
    where: { email: "citizen6@gmail.com" },
    update: {},
    create: {
      ho_ten: "Lê Thị Thu",
      email: "citizen6@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0990123456",
      vai_tro: "nguoi_dan",
      dia_chi: "987 Võ Nguyên Giáp, Quận Ngũ Hành Sơn, Đà Nẵng",
      avatar_url: "/images/user/user-12.jpg",
    },
  });

  const citizen7 = await prisma.nguoiDung.upsert({
    where: { email: "citizen7@gmail.com" },
    update: {},
    create: {
      ho_ten: "Đặng Thị Mỹ",
      email: "citizen7@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0901234568",
      vai_tro: "nguoi_dan",
      dia_chi: "222 Ông Ích Khiêm, Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-15.jpg",
    },
  });

  const citizen8 = await prisma.nguoiDung.upsert({
    where: { email: "citizen8@gmail.com" },
    update: {},
    create: {
      ho_ten: "Phan Văn Long",
      email: "citizen8@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0912345679",
      vai_tro: "nguoi_dan",
      dia_chi: "555 Hùng Vương, Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-16.jpg",
    },
  });

  const citizen9 = await prisma.nguoiDung.upsert({
    where: { email: "citizen9@gmail.com" },
    update: {},
    create: {
      ho_ten: "Bùi Thị Xuân",
      email: "citizen9@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0923456790",
      vai_tro: "nguoi_dan",
      dia_chi: "888 Hoàng Diệu, Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-17.jpg",
    },
  });

  const citizen10 = await prisma.nguoiDung.upsert({
    where: { email: "citizen10@gmail.com" },
    update: {},
    create: {
      ho_ten: "Ngô Văn Phúc",
      email: "citizen10@gmail.com", 
      mat_khau: hashedPassword,
      so_dien_thoai: "0934567891",
      vai_tro: "nguoi_dan",
      dia_chi: "111 Phan Châu Trinh, Quận Hải Châu, Đà Nẵng",
      avatar_url: "/images/user/user-18.jpg",
    },
  });

  console.log("👥 Users created successfully");

  // Lấy danh sách ảnh thực tế từ thư mục uploads/reports (nếu có)
  const existingImages = [
    "/uploads/reports/1763558716443_716fh9.webp",
    "/uploads/reports/1763558927960_rbwa8e.jpeg", 
    "/uploads/reports/1763558928009_ar60s9.jpeg",
    "/uploads/reports/1763558928021_8irgjk.webp",
    "/uploads/reports/1763558928052_8fz1dw.jpeg",
    "/uploads/reports/1763558928062_yfls5n.png",
    "/uploads/reports/1763558967869_8cbkz1.webp",
    "/uploads/reports/1763622997665_xkmaup.jpeg",
    "/uploads/reports/1763715606032_0kvqjg.webp",
    "/uploads/reports/1763724493260_uk1ihn.png"
  ];

  // Create diverse sample reports across Da Nang with different types and statuses
  const report1 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen1.id,
      tieu_de: "Ổ gà lớn trên đường Trần Phú",
      mo_ta: "Có một ổ gà rất lớn trên đường Trần Phú gần cầu Rồng gây nguy hiểm cho người tham gia giao thông. Kích thước khoảng 1m x 0.5m, sâu khoảng 15cm.",
      loai_su_co: "pothole",
      vi_do: 16.0544,
      kinh_do: 108.2022,
      dia_chi: "123 Trần Phú, Quận Hải Châu, Đà Nẵng",
      hinh_anh_url: existingImages[0] || null,
      muc_do_nghiem_trong: 4,
      trang_thai: "cho_xu_ly",
      ai_classification: "pothole",
      ai_confidence: 0.89,
      ai_description: "Ổ gà đường được phát hiện trong hình ảnh", 
      user_original_choice: "pothole",
      ai_severity: "medium",
      ai_processing_time_ms: 1850,
      ai_priority_score: 75,
      ai_estimated_hours: 4.0,
    },
  });

  const report2 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen2.id,
      tieu_de: "Ngập nước sau mưa lớn khu vực Hàn Thuyên",
      mo_ta: "Khu vực đường Hàn Thuyên - Lê Duẩn bị ngập nước sâu sau mưa. Nước ngập cao khoảng 40cm, gây ảnh hưởng nghiêm trọng đến giao thông.",
      loai_su_co: "flooding", 
      vi_do: 16.0478,
      kinh_do: 108.2088,
      dia_chi: "Đường Hàn Thuyên, Quận Hải Châu, Đà Nẵng",
      hinh_anh_url: existingImages[1] || null,
      muc_do_nghiem_trong: 5,
      trang_thai: "da_phan_cong",
      can_bo_id: staff2.id,
      ai_classification: "flooding",
      ai_confidence: 0.94,
      ai_description: "Ngập lụt được phát hiện trong hình ảnh",
      user_original_choice: "other",
      ai_severity: "high", 
      ai_processing_time_ms: 2100,
      ai_priority_score: 95,
      ai_estimated_hours: 6.0,
      auto_assigned: true,
    },
  });

  const report3 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen3.id,
      tieu_de: "Đèn giao thông hỏng tại ngã tư Nguyễn Văn Linh",
      mo_ta: "Đèn giao thông tại ngã tư Nguyễn Văn Linh - Tôn Đức Thắng bị hỏng, chỉ còn đèn vàng nhấp nháy. Gây kẹt xe nghiêm trọng vào giờ cao điểm.",
      loai_su_co: "traffic_light",
      vi_do: 16.0735,
      kinh_do: 108.1583,
      dia_chi: "Ngã tư Nguyễn Văn Linh - Tôn Đức Thắng, Quận Thanh Khê",
      hinh_anh_url: existingImages[2] || null,
      muc_do_nghiem_trong: 4,
      trang_thai: "da_hoan_tat",
      can_bo_id: staff2.id,
      ai_classification: "traffic_light",
      ai_confidence: 0.87,
      ai_description: "Đèn giao thông được phát hiện trong hình ảnh",
      user_original_choice: "traffic_light", 
      ai_severity: "high",
      ai_processing_time_ms: 1650,
      ai_priority_score: 82,
      ai_estimated_hours: 3.0,
    },
  });

  const report4 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen4.id,
      tieu_de: "Rác thải tràn lan trên đường Điện Biên Phủ",
      mo_ta: "Khu vực gần chợ Thanh Khê có rác thải tràn ra vỉa hè, gây mùi hôi và ảnh hưởng đến môi trường. Tình trạng kéo dài 3 ngày.",
      loai_su_co: "waste",
      vi_do: 16.0698,
      kinh_do: 108.1612,
      dia_chi: "Đường Điện Biên Phủ, gần chợ Thanh Khê",
      hinh_anh_url: existingImages[3] || null,
      muc_do_nghiem_trong: 3,
      trang_thai: "dang_xu_ly",
      can_bo_id: staff3.id,
      ai_classification: "waste",
      ai_confidence: 0.91,
      ai_description: "Rác thải được phát hiện trong hình ảnh",
      user_original_choice: "waste", 
      ai_severity: "medium",
      ai_processing_time_ms: 1420,
      ai_priority_score: 60,
      ai_estimated_hours: 2.5,
    },
  });

  const report5 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen5.id,
      tieu_de: "Cây xanh gãy đổ chắn đường Võ Nguyên Giáp",
      mo_ta: "Cây phượng lớn bị gãy đổ sau cơn bão, chắn ngang đường Võ Nguyên Giáp gần bãi biển Mỹ Khê. Gây ách tắc giao thông và nguy hiểm.",
      loai_su_co: "other",
      vi_do: 16.0408,
      kinh_do: 108.2504,
      dia_chi: "Đường Võ Nguyên Giáp, Quận Ngũ Hành Sơn",
      hinh_anh_url: existingImages[4] || null,
      muc_do_nghiem_trong: 5,
      trang_thai: "da_hoan_tat",
      can_bo_id: staff4.id,
      ai_classification: "other",
      ai_confidence: 0.76,
      ai_description: "Cây đổ được phát hiện trong hình ảnh",
      user_original_choice: "other", 
      ai_severity: "high",
      ai_processing_time_ms: 2340,
      ai_priority_score: 90,
      ai_estimated_hours: 5.0,
    },
  });

  const report6 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen6.id,
      tieu_de: "Kẹt xe nghiêm trọng do tai nạn trên cầu Thuận Phước",
      mo_ta: "Hai xe ô tô va chạm tại cầu Thuận Phước gây kẹt xe kéo dài. Cần có lực lượng điều tiết giao thông khẩn cấp.",
      loai_su_co: "traffic_jam",
      vi_do: 16.0882,
      kinh_do: 108.2065,
      dia_chi: "Cầu Thuận Phước, Đà Nẵng",
      hinh_anh_url: existingImages[5] || null,
      muc_do_nghiem_trong: 4,
      trang_thai: "da_hoan_tat",
      can_bo_id: staff5.id,
      ai_classification: "traffic_jam",
      ai_confidence: 0.83,
      ai_description: "Kẹt xe được phát hiện trong hình ảnh",
      user_original_choice: "traffic_jam", 
      ai_severity: "medium",
      ai_processing_time_ms: 1580,
      ai_priority_score: 72,
      ai_estimated_hours: 1.5,
    },
  });

  const report7 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen7.id,
      tieu_de: "Vỉa hè bị hư hỏng nặng trên đường Ông Ích Khiêm",
      mo_ta: "Vỉa hè đường Ông Ích Khiêm bị nứt vỡ, nhiều gạch bị bong tróc. Khó khăn cho người đi bộ, đặc biệt là người già và trẻ em.",
      loai_su_co: "other",
      vi_do: 16.0512,
      kinh_do: 108.2156,
      dia_chi: "222 Ông Ích Khiêm, Quận Hải Châu",
      hinh_anh_url: existingImages[6] || null,
      muc_do_nghiem_trong: 2,
      trang_thai: "cho_xu_ly",
      ai_classification: "other",
      ai_confidence: 0.72,
      ai_description: "Hư hỏng vỉa hè được phát hiện trong hình ảnh",
      user_original_choice: "other", 
      ai_severity: "low",
      ai_processing_time_ms: 1290,
      ai_priority_score: 45,
      ai_estimated_hours: 8.0,
    },
  });

  const report8 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen8.id,
      tieu_de: "Nắp cống bị mất gây nguy hiểm trên Hùng Vương",
      mo_ta: "Nắp cống thoát nước trên đường Hùng Vương bị mất, tạo thành hố sâu nguy hiểm cho xe máy và người đi bộ. Đặc biệt nguy hiểm vào ban đêm.",
      loai_su_co: "other",
      vi_do: 16.0589,
      kinh_do: 108.2142,
      dia_chi: "555 Hùng Vương, Quận Hải Châu",
      hinh_anh_url: existingImages[7] || null,
      muc_do_nghiem_trong: 5,
      trang_thai: "dang_xu_ly",
      can_bo_id: staff1.id,
      ai_classification: "pothole",
      ai_confidence: 0.65,
      ai_description: "Hố cống được phát hiện trong hình ảnh",
      user_original_choice: "other", 
      ai_severity: "high",
      ai_processing_time_ms: 1760,
      ai_priority_score: 92,
      ai_estimated_hours: 3.0,
    },
  });

  const report9 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen9.id,
      tieu_de: "Đèn đường bị hỏng khu vực Hoàng Diệu",
      mo_ta: "Đoạn đường Hoàng Diệu gần bệnh viện C có nhiều đèn đường bị hỏng, gây tối đen và mất an toàn vào ban đêm. Nhiều người sợ đi qua khu vực này.",
      loai_su_co: "other",
      vi_do: 16.0623,
      kinh_do: 108.2211,
      dia_chi: "888 Hoàng Diệu, Quận Hải Châu",
      hinh_anh_url: existingImages[8] || null,
      muc_do_nghiem_trong: 3,
      trang_thai: "cho_xu_ly",
      ai_classification: "other",
      ai_confidence: 0.68,
      ai_description: "Đèn đường hỏng được phát hiện",
      user_original_choice: "other", 
      ai_severity: "medium",
      ai_processing_time_ms: 1320,
      ai_priority_score: 58,
      ai_estimated_hours: 4.0,
    },
  });

  const report10 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen10.id,
      tieu_de: "Ổ gà nhiều điểm trên đường Phan Châu Trinh",
      mo_ta: "Đường Phan Châu Trinh có nhiều ổ gà nhỏ và vừa xuất hiện sau mưa lớn. Gây khó khăn cho xe máy lưu thông, có nguy cơ té ngã.",
      loai_su_co: "pothole",
      vi_do: 16.0467,
      kinh_do: 108.2198,
      dia_chi: "111 Phan Châu Trinh, Quận Hải Châu",
      hinh_anh_url: existingImages[9] || null,
      muc_do_nghiem_trong: 3,
      trang_thai: "cho_xu_ly",
      ai_classification: "pothole",
      ai_confidence: 0.85,
      ai_description: "Nhiều ổ gà được phát hiện trong hình ảnh",
      user_original_choice: "pothole", 
      ai_severity: "medium",
      ai_processing_time_ms: 1590,
      ai_priority_score: 65,
      ai_estimated_hours: 5.0,
    },
  });

  const report11 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen1.id,
      tieu_de: "Biển báo giao thông bị che khuất bởi cây",
      mo_ta: "Biển báo giới hạn tốc độ trên đường Lý Thái Tổ bị cây che khuất hoàn toàn, tài xế không thể nhìn thấy. Cần tỉa cây hoặc di chuyển biển báo.",
      loai_su_co: "other",
      vi_do: 16.0556,
      kinh_do: 108.2034,
      dia_chi: "Đường Lý Thái Tổ, Quận Hải Châu",
      hinh_anh_url: null,
      muc_do_nghiem_trong: 2,
      trang_thai: "cho_xu_ly",
      ai_classification: "other",
      ai_confidence: 0.71,
      ai_description: "Biển báo bị che khuất được phát hiện",
      user_original_choice: "other", 
      ai_severity: "low",
      ai_processing_time_ms: 1180,
      ai_priority_score: 40,
      ai_estimated_hours: 2.0,
    },
  });

  const report12 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen3.id,
      tieu_de: "Rò rỉ nước máy trên đường Hai Bà Trưng",
      mo_ta: "Đường ống nước máy bị rò rỉ nghiêm trọng trên đường Hai Bà Trưng, nước chảy tràn ra đường gây lãng phí và nguy cơ sụt lún đường.",
      loai_su_co: "other",
      vi_do: 16.0721,
      kinh_do: 108.1598,
      dia_chi: "Đường Hai Bà Trưng, Quận Thanh Khê",
      hinh_anh_url: null,
      muc_do_nghiem_trong: 4,
      trang_thai: "da_phan_cong",
      can_bo_id: staff6.id,
      ai_classification: "flooding",
      ai_confidence: 0.73,
      ai_description: "Rò rỉ nước được phát hiện trong hình ảnh",
      user_original_choice: "other", 
      ai_severity: "high",
      ai_processing_time_ms: 1890,
      ai_priority_score: 78,
      ai_estimated_hours: 6.0,
      auto_assigned: true,
    },
  });

  const report13 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen5.id,
      tieu_de: "Bãi rác tự phát gần cầu Thuận Phước",
      mo_ta: "Khu vực đất trống gần cầu Thuận Phước bị người dân đổ rác tự phát, tạo thành bãi rác lớn, gây ô nhiễm môi trường nghiêm trọng.",
      loai_su_co: "waste",
      vi_do: 16.0795411,
      kinh_do: 108.2399877,
      dia_chi: "Khu vực gần cầu Thuận Phước, Quận Liên Chiểu",
      hinh_anh_url: null,
      muc_do_nghiem_trong: 4,
      trang_thai: "dang_xu_ly",
      can_bo_id: staff7.id,
      ai_classification: "waste",
      ai_confidence: 0.88,
      ai_description: "Bãi rác lớn được phát hiện trong hình ảnh",
      user_original_choice: "waste", 
      ai_severity: "high",
      ai_processing_time_ms: 1670,
      ai_priority_score: 80,
      ai_estimated_hours: 8.0,
    },
  });

  const report14 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen7.id,
      tieu_de: "Cây phượng cổ thụ có nguy cơ đổ",
      mo_ta: "Cây phượng cổ thụ trên đường Phan Đăng Lưu bị nghiêng sau mưa bão, có nguy cơ đổ cao. Gần khu dân cư đông đúc, rất nguy hiểm.",
      loai_su_co: "other",
      vi_do: 16.0689,
      kinh_do: 108.1621,
      dia_chi: "Đường Phan Đăng Lưu, Quận Thanh Khê",
      hinh_anh_url: null,
      muc_do_nghiem_trong: 5,
      trang_thai: "da_phan_cong",
      can_bo_id: staff4.id,
      ai_classification: "other",
      ai_confidence: 0.79,
      ai_description: "Cây có nguy cơ đổ được phát hiện",
      user_original_choice: "other", 
      ai_severity: "critical",
      ai_processing_time_ms: 2050,
      ai_priority_score: 98,
      ai_estimated_hours: 4.0,
      auto_assigned: true,
    },
  });

  const report15 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen9.id,
      tieu_de: "Va chạm giao thông nhỏ tại ngã tư Trưng Nữ Vương",
      mo_ta: "Hai xe máy va chạm nhỏ tại ngã tư Trưng Nữ Vương - Nguyễn Chí Thanh, gây ùn tắc nhẹ. Các bên đang tranh cãi.",
      loai_su_co: "traffic_jam",
      vi_do: 16.0634,
      kinh_do: 108.1689,
      dia_chi: "Ngã tư Trưng Nữ Vương - Nguyễn Chí Thanh",
      hinh_anh_url: null,
      muc_do_nghiem_trong: 2,
      trang_thai: "da_hoan_tat",
      can_bo_id: staff5.id,
      ai_classification: "traffic_jam",
      ai_confidence: 0.81,
      ai_description: "Va chạm giao thông được phát hiện",
      user_original_choice: "traffic_jam", 
      ai_severity: "low",
      ai_processing_time_ms: 980,
      ai_priority_score: 35,
      ai_estimated_hours: 0.5,
    },
  });

  console.log("📋 Reports created successfully");

  // Create diverse AI analyses for different report types
  const aiAnalyses = await Promise.all([
    prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen1.id,
        phan_anh_id: report1.id,
        image_url: existingImages[0] || null,
        predicted_label: "pothole",
        confidence_score: 0.89,
        description: "Ổ gà đường được phát hiện trong hình ảnh",
        severity: "medium",
        suggested_priority: "high",
        location_hints: ["đường phố", "khu vực đô thị", "giao thông đông đúc"],
        detected_objects: ["road", "damage", "asphalt", "vehicle"],
        model_version: "smart-v1.2",
        processing_time_ms: 1850,
        debug_info: {
          vehicle_count: 2,
          analysis_breakdown: {
            vehicles: ["car", "motorbike"],
            damage_indicators: ["road damage", "pothole"],
            infrastructure: ["road", "traffic"]
          }
        }
      },
    }),
    prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen2.id,
        phan_anh_id: report2.id,
        image_url: existingImages[1] || null,
        predicted_label: "flooding",
        confidence_score: 0.94,
        description: "Ngập lụt được phát hiện trong hình ảnh",
        severity: "high",
        suggested_priority: "critical",
        location_hints: ["đường phố", "khu vực đô thị", "hệ thống thoát nước"],
        detected_objects: ["water", "street", "flooding", "building"],
        model_version: "smart-v1.2",
        processing_time_ms: 2100,
        debug_info: {
          vehicle_count: 3,
          analysis_breakdown: {
            vehicles: ["car", "motorbike", "truck"],
            water_related: ["water", "flooding", "drainage"],
            infrastructure: ["street", "building"]
          }
        }
      },
    }),
    prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen4.id,
        phan_anh_id: report4.id,
        image_url: existingImages[3] || null,
        predicted_label: "waste",
        confidence_score: 0.91,
        description: "Rác thải được phát hiện trong hình ảnh",
        severity: "medium",
        suggested_priority: "medium",
        location_hints: ["vỉa hè", "khu vực thương mại", "chợ"],
        detected_objects: ["garbage", "plastic", "street", "sidewalk"],
        model_version: "smart-v1.2",
        processing_time_ms: 1420,
        debug_info: {
          vehicle_count: 0,
          analysis_breakdown: {
            vehicles: [],
            waste_related: ["garbage", "plastic", "organic_waste"],
            infrastructure: ["sidewalk", "street"]
          }
        }
      },
    }),
    prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen3.id,
        phan_anh_id: report3.id,
        image_url: existingImages[2] || null,
        predicted_label: "traffic_light",
        confidence_score: 0.87,
        description: "Đèn giao thông hỏng được phát hiện trong hình ảnh",
        severity: "high",
        suggested_priority: "high",
        location_hints: ["ngã tư", "giao lộ", "trung tâm thành phố"],
        detected_objects: ["traffic_light", "intersection", "vehicles", "street"],
        model_version: "smart-v1.2",
        processing_time_ms: 1650,
        debug_info: {
          vehicle_count: 5,
          analysis_breakdown: {
            vehicles: ["car", "motorbike", "bus"],
            traffic_systems: ["traffic_light", "road_marking"],
            infrastructure: ["intersection", "street"]
          }
        }
      },
    }),
    prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen10.id,
        phan_anh_id: report10.id,
        image_url: existingImages[9] || null,
        predicted_label: "pothole",
        confidence_score: 0.85,
        description: "Nhiều ổ gà được phát hiện trong hình ảnh",
        severity: "medium",
        suggested_priority: "medium",
        location_hints: ["đường phố", "khu vực nội thành"],
        detected_objects: ["road", "multiple_potholes", "pavement_damage"],
        model_version: "smart-v1.2",
        processing_time_ms: 1590,
        debug_info: {
          vehicle_count: 1,
          analysis_breakdown: {
            vehicles: ["motorbike"],
            damage_indicators: ["multiple potholes", "road damage"],
            infrastructure: ["road", "pavement"]
          }
        }
      },
    }),
    prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen5.id,
        phan_anh_id: report13.id,
        image_url: null,
        predicted_label: "waste",
        confidence_score: 0.88,
        description: "Bãi rác lớn được phát hiện trong hình ảnh",
        severity: "high",
        suggested_priority: "high",
        location_hints: ["khu vực đất trống", "gần khu dân cư"],
        detected_objects: ["garbage_pile", "plastic", "organic_waste", "land"],
        model_version: "smart-v1.2",
        processing_time_ms: 1670,
        debug_info: {
          vehicle_count: 0,
          analysis_breakdown: {
            vehicles: [],
            waste_related: ["large_garbage_pile", "mixed_waste", "environmental_hazard"],
            infrastructure: ["vacant_land"]
          }
        }
      },
    })
  ]);

  console.log("🤖 AI Analyses created successfully");

  // Create diverse processing records with different statuses and progress
  const xuLyRecords = await Promise.all([
    prisma.xuLy.create({
      data: {
        phan_anh_id: report2.id,
        can_bo_id: staff2.id,
        noi_dung: "Đang kiểm tra hệ thống thoát nước trong khu vực",
        trang_thai: "dang_xu_ly",
        completion_percentage: 60,
        ghi_chu: "Đã xác định nguyên nhân là cống thoát nước bị tắc. Đang tiến hành thông tắc.",
        ai_priority_score: 95,
        ai_estimated_hours: 6.0,
        ai_suggested_skills: "drainage,emergency_response",
        ai_assignment_reasoning: "AI assigned based on flooding classification with 92% match score",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report3.id,
        can_bo_id: staff2.id,
        noi_dung: "Đã thay thế bóng đèn và kiểm tra hệ thống điện",
        trang_thai: "hoan_thanh",
        completion_percentage: 100,
        completion_image_url: existingImages[8] || null,
        ghi_chu: "Đèn giao thông đã hoạt động bình thường. Kiểm tra toàn bộ hệ thống và thay thế linh kiện hỏng.",
        ai_priority_score: 82,
        ai_estimated_hours: 3.0,
        ai_suggested_skills: "electrical,traffic_systems",
        ai_assignment_reasoning: "AI assigned based on traffic_light classification with 89% match score",
        ai_quality_score: 95,
        ai_completion_verification: "Đèn giao thông đã được sửa chữa thành công",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report4.id,
        can_bo_id: staff3.id,
        noi_dung: "Đang thu gom rác thải và vệ sinh khu vực",
        trang_thai: "dang_xu_ly",
        completion_percentage: 80,
        ghi_chu: "Đã thu gom 70% rác thải. Cần tiếp tục vệ sinh và khử trùng khu vực.",
        ai_priority_score: 60,
        ai_estimated_hours: 2.5,
        ai_suggested_skills: "waste_management,cleaning",
        ai_assignment_reasoning: "AI assigned based on waste classification with 85% match score",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report5.id,
        can_bo_id: staff4.id,
        noi_dung: "Đã cắt tỉa và di chuyển cây đổ",
        trang_thai: "hoan_thanh",
        completion_percentage: 100,
        completion_image_url: existingImages[9] || null,
        ghi_chu: "Cây đã được cắt và di chuyển hoàn toàn. Đường thông thoáng trở lại.",
        ai_priority_score: 90,
        ai_estimated_hours: 5.0,
        ai_suggested_skills: "tree_maintenance,emergency_response",
        ai_assignment_reasoning: "AI assigned based on emergency tree removal with 94% match score",
        ai_quality_score: 92,
        ai_completion_verification: "Cây đổ đã được xử lý hoàn toàn, đường thông thoáng",
        timeline_status: "completed_early",
        started_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report6.id,
        can_bo_id: staff5.id,
        noi_dung: "Đã điều tiết giao thông và xử lý tai nạn",
        trang_thai: "hoan_thanh",
        completion_percentage: 100,
        completion_image_url: null,
        ghi_chu: "Tai nạn đã được xử lý, giao thông trở lại bình thường.",
        ai_priority_score: 72,
        ai_estimated_hours: 1.5,
        ai_suggested_skills: "traffic_control,emergency_response",
        ai_assignment_reasoning: "AI assigned based on traffic_jam classification with 88% match score",
        ai_quality_score: 90,
        ai_completion_verification: "Giao thông đã được khôi phục bình thường",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        completed_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report8.id,
        can_bo_id: staff1.id,
        noi_dung: "Đang thay thế nắp cống mới",
        trang_thai: "dang_xu_ly",
        completion_percentage: 40,
        ghi_chu: "Đã đặt rào chắn tạm thời để đảm bảo an toàn. Đang chờ nắp cống mới từ kho.",
        ai_priority_score: 92,
        ai_estimated_hours: 3.0,
        ai_suggested_skills: "road_repair,drainage",
        ai_assignment_reasoning: "AI assigned based on infrastructure repair with 90% match score",
        timeline_status: "at_risk",
        started_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report12.id,
        can_bo_id: staff6.id,
        noi_dung: "Đang sửa chữa đường ống nước bị rò rỉ",
        trang_thai: "dang_xu_ly",
        completion_percentage: 50,
        ghi_chu: "Đã tắt van nước chính. Đang tiến hành thay thế đoạn ống hỏng.",
        ai_priority_score: 78,
        ai_estimated_hours: 6.0,
        ai_suggested_skills: "road_repair,drainage",
        ai_assignment_reasoning: "AI assigned based on water leak detection with 87% match score",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report13.id,
        can_bo_id: staff7.id,
        noi_dung: "Đang tổ chức thu gom bãi rác tự phát",
        trang_thai: "dang_xu_ly",
        completion_percentage: 30,
        ghi_chu: "Đã triển khai xe và nhân công. Ước tính cần 2 ngày để dọn dẹp hoàn toàn.",
        ai_priority_score: 80,
        ai_estimated_hours: 8.0,
        ai_suggested_skills: "waste_management,environmental,cleaning",
        ai_assignment_reasoning: "AI assigned based on large waste pile with 91% match score",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report14.id,
        can_bo_id: staff4.id,
        noi_dung: "Đang kiểm tra và gia cố cây cổ thụ",
        trang_thai: "dang_xu_ly",
        completion_percentage: 70,
        ghi_chu: "Đã lắp dựng hệ thống chống đỡ tạm thời. Đang liên hệ chuyên gia đánh giá cây.",
        ai_priority_score: 98,
        ai_estimated_hours: 4.0,
        ai_suggested_skills: "tree_maintenance,emergency_response",
        ai_assignment_reasoning: "AI assigned based on critical tree hazard with 96% match score",
        timeline_status: "on_time",
        started_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      },
    }),
    prisma.xuLy.create({
      data: {
        phan_anh_id: report15.id,
        can_bo_id: staff5.id,
        noi_dung: "Đã xử lý va chạm và điều tiết giao thông",
        trang_thai: "hoan_thanh",
        completion_percentage: 100,
        completion_image_url: null,
        ghi_chu: "Va chạm nhỏ, không có thương tích. Đã lập biên bản và giải tỏa giao thông.",
        ai_priority_score: 35,
        ai_estimated_hours: 0.5,
        ai_suggested_skills: "traffic_control",
        ai_assignment_reasoning: "AI assigned based on minor traffic incident with 82% match score",
        ai_quality_score: 88,
        ai_completion_verification: "Va chạm đã được xử lý nhanh chóng",
        timeline_status: "completed_early",
        started_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    })
  ]);

  console.log("🔧 Processing records created successfully");

  // Create diverse notifications for different scenarios
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        recipient_id: admin.id,
        type: "quality_alert",
        title: "Cảnh báo chất lượng xử lý",
        message: "Phát hiện vấn đề trong xử lý #8: Vượt thời gian dự kiến, có nguy cơ trễ hạn",
        priority: "high",
        ai_generated: true,
        related_id: xuLyRecords[5].id,
        related_type: "xu_ly",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: staff1.id,
        type: "assignment_notification", 
        title: "Nhiệm vụ mới được phân công",
        message: "Bạn được phân công xử lý báo cáo #8: Nắp cống bị mất gây nguy hiểm",
        priority: "high",
        ai_generated: true,
        related_id: report8.id,
        related_type: "phan_anh",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: staff4.id,
        type: "deadline_warning", 
        title: "Cảnh báo khẩn cấp",
        message: "Nhiệm vụ #14 (cây cổ thụ có nguy cơ đổ) cần xử lý ưu tiên ngay",
        priority: "critical",
        ai_generated: true,
        related_id: report14.id,
        related_type: "phan_anh",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: admin.id,
        type: "quality_alert", 
        title: "Báo cáo hoàn thành xuất sắc",
        message: "Cán bộ Trần Thị Hoa đã hoàn thành xuất sắc nhiệm vụ #3 với điểm chất lượng 95/100",
        priority: "low",
        ai_generated: true,
        related_id: xuLyRecords[1].id,
        related_type: "xu_ly",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: citizen1.id,
        type: "assignment_notification", 
        title: "Báo cáo của bạn đã được tiếp nhận",
        message: "Báo cáo #1: Ổ gà lớn trên đường Trần Phú đã được hệ thống tiếp nhận và đang chờ xử lý",
        priority: "low",
        ai_generated: false,
        related_id: report1.id,
        related_type: "phan_anh",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: staff6.id,
        type: "assignment_notification", 
        title: "Nhiệm vụ mới: Rò rỉ nước máy",
        message: "Bạn được phân công xử lý #12: Rò rỉ nước máy nghiêm trọng trên đường Hai Bà Trưng",
        priority: "high",
        ai_generated: true,
        related_id: report12.id,
        related_type: "phan_anh",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: staff7.id,
        type: "assignment_notification", 
        title: "Nhiệm vụ mới: Bãi rác tự phát",
        message: "Bạn được phân công xử lý #13: Bãi rác tự phát gần cầu Thuận Phước",
        priority: "medium",
        ai_generated: true,
        related_id: report13.id,
        related_type: "phan_anh",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: admin.id,
        type: "system_alert", 
        title: "Báo cáo khẩn cấp mới",
        message: "Báo cáo #14 (cây cổ thụ có nguy cơ đổ) được đánh giá mức độ nghiêm trọng 5/5, cần xử lý ngay",
        priority: "critical",
        ai_generated: true,
        related_id: report14.id,
        related_type: "phan_anh",
      },
    })
  ]);

  console.log("🔔 Notifications created successfully");

  // Update workloads for staff based on their assignments
  await Promise.all([
    prisma.nguoiDung.update({
      where: { id: staff1.id },
      data: { current_workload: 1 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff2.id },
      data: { current_workload: 2 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff3.id },
      data: { current_workload: 1 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff4.id },
      data: { current_workload: 2 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff5.id },
      data: { current_workload: 2 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff6.id },
      data: { current_workload: 1 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff7.id },
      data: { current_workload: 1 }
    })
  ]);

  console.log("📊 Staff workloads updated");

  console.log("✅ Seed completed successfully!");
  
  console.log("\n🎯 Sample data created:");
  console.log(`👑 Admin: admin@smartreport.ai (password: 123456)`);
  console.log(`👮 Staff: staff1-7@smartreport.ai (password: 123456)`);
  console.log(`🙋 Citizens: citizen1-10@gmail.com (password: 123456)`);
  console.log(`📋 Reports: 15 diverse reports with different types and statuses`);
  console.log(`🤖 AI Features: Auto-classification, Smart assignment, Quality assessment`);
  console.log(`🔔 Notifications: AI-generated alerts and assignments`);
  console.log(`🏙️ Coverage: All districts in Da Nang city`);
  console.log(`📸 Images: Using existing user avatars and report images`);
  console.log(`\n📍 Districts covered:`);
  console.log(`   - Quận Hải Châu (city center)`);
  console.log(`   - Quận Thanh Khê`);
  console.log(`   - Quận Sơn Trà`);
  console.log(`   - Quận Ngũ Hành Sơn`);
  console.log(`   - Quận Liên Chiểu`);
  console.log(`   - Quận Cẩm Lệ`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

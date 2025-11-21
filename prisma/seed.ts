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
      dia_chi: "Trung tâm hành chính TP.HCM",
      avatar_url: "/images/user/user-01.jpg",
      ai_performance_score: 95.0,
    },
  });

  // Create more diverse staff users with different specializations
  const staff1 = await prisma.nguoiDung.upsert({
    where: { email: "staff1@smartreport.ai" },
    update: {},
    create: {
      ho_ten: "Nguyễn Văn Tuấn",
      email: "staff1@smartreport.ai",
      mat_khau: hashedPassword,
      so_dien_thoai: "0912345678", 
      vai_tro: "can_bo",
      dia_chi: "Quận 1, TP.HCM",
      avatar_url: "/images/user/user-02.jpg",
      skills: ["road_repair", "asphalt_work", "drainage"],
      current_workload: 0,
      location_lat: 10.7769,
      location_lng: 106.7009,
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
      dia_chi: "Quận 3, TP.HCM",
      avatar_url: "/images/user/user-03.jpg",
      skills: ["electrical", "traffic_systems", "emergency_response"],
      current_workload: 0,
      location_lat: 10.7829,
      location_lng: 106.6953,
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
      dia_chi: "Quận 7, TP.HCM", 
      avatar_url: "/images/user/user-04.jpg",
      skills: ["waste_management", "cleaning", "traffic_control"],
      current_workload: 0,
      location_lat: 10.7356,
      location_lng: 106.7183,
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
      dia_chi: "Quận Bình Thạnh, TP.HCM", 
      avatar_url: "/images/user/user-05.jpg",
      skills: ["tree_maintenance", "park_management", "landscaping"],
      current_workload: 0,
      location_lat: 10.8012,
      location_lng: 106.7195,
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
      dia_chi: "Quận Tân Bình, TP.HCM", 
      avatar_url: "/images/user/user-06.jpg",
      skills: ["security", "patrol", "emergency_response", "traffic_control"],
      current_workload: 0,
      location_lat: 10.8142,
      location_lng: 106.6438,
      ai_performance_score: 87.8,
    },
  });

  // Create more diverse citizens from different districts
  const citizen1 = await prisma.nguoiDung.upsert({
    where: { email: "citizen1@gmail.com" },
    update: {},
    create: {
      ho_ten: "Phạm Văn Dũng",
      email: "citizen1@gmail.com",
      mat_khau: hashedPassword,
      so_dien_thoai: "0945678901",
      vai_tro: "nguoi_dan",
      dia_chi: "123 Lê Lợi, Quận 1, TP.HCM",
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
      dia_chi: "456 Nguyễn Huệ, Quận 1, TP.HCM",
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
      dia_chi: "789 Võ Văn Tần, Quận 3, TP.HCM",
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
      dia_chi: "321 Nguyễn Đình Chiểu, Quận 3, TP.HCM",
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
      dia_chi: "654 Nguyễn Văn Trỗi, Quận Phú Nhuận, TP.HCM",
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
      dia_chi: "987 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
      avatar_url: "/images/user/user-12.jpg",
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

  // Create diverse sample reports with different types and statuses using existing images
  const report1 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen1.id,
      tieu_de: "Ổ gà lớn trên đường Lê Lợi",
      mo_ta: "Có một ổ gà rất lớn trên đường Lê Lợi gây nguy hiểm cho người tham gia giao thông. Kích thước khoảng 1m x 0.5m, sâu khoảng 15cm.",
      loai_su_co: "pothole",
      vi_do: 10.7769,
      kinh_do: 106.7009,
      dia_chi: "123 Lê Lợi, Quận 1, TP.HCM",
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
      tieu_de: "Ngập nước sau mưa lớn",
      mo_ta: "Khu vực ngã tư Nguyễn Huệ - Lê Thánh Tôn bị ngập nước sâu sau mưa. Nước ngập cao khoảng 30cm, kéo dài từ 6h sáng đến 10h sáng.",
      loai_su_co: "flooding", 
      vi_do: 10.7740,
      kinh_do: 106.7034,
      dia_chi: "Ngã tư Nguyễn Huệ - Lê Thánh Tôn, Quận 1",
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
      tieu_de: "Đèn giao thông hỏng",
      mo_ta: "Đèn giao thông tại ngã tư Pasteur - Lê Duẩn bị hỏng, chỉ còn đèn vàng nhấp nháy. Gây kẹt xe nghiêm trọng vào giờ cao điểm.",
      loai_su_co: "traffic_light",
      vi_do: 10.7831,
      kinh_do: 106.6968,
      dia_chi: "Ngã tư Pasteur - Lê Duẩn, Quận 3",
      hinh_anh_url: existingImages[2] || null,
      muc_do_nghiem_trong: 3,
      trang_thai: "da_hoan_tat",
      can_bo_id: staff2.id,
      ai_classification: "traffic_light",
      ai_confidence: 0.87,
      ai_description: "Đèn giao thông được phát hiện trong hình ảnh",
      user_original_choice: "traffic_light", 
      ai_severity: "medium",
      ai_processing_time_ms: 1650,
      ai_priority_score: 68,
      ai_estimated_hours: 3.0,
    },
  });

  const report4 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen4.id,
      tieu_de: "Rác thải tràn lan trên vỉa hè",
      mo_ta: "Khu vực gần chợ Bến Thành có rác thải tràn ra vỉa hè, gây mùi hôi và ảnh hưởng đến môi trường. Tình trạng kéo dài 3 ngày.",
      loai_su_co: "waste",
      vi_do: 10.7722,
      kinh_do: 106.6980,
      dia_chi: "Đường Lê Lợi, gần chợ Bến Thành, Quận 1",
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
      tieu_de: "Cây xanh gãy đổ chắn đường",
      mo_ta: "Cây phượng lớn bị gãy đổ sau cơn mưa to, chắn ngang đường Nguyễn Văn Trỗi. Gây ách tắc giao thông và nguy hiểm cho người đi đường.",
      loai_su_co: "other",
      vi_do: 10.7980,
      kinh_do: 106.6757,
      dia_chi: "987 Nguyễn Văn Trỗi, Quận Phú Nhuận",
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
      tieu_de: "Kẹt xe nghiêm trọng do tai nạn",
      mo_ta: "Hai xe máy va chạm tại ngã tư Điện Biên Phủ - Xô Viết Nghệ Tĩnh gây kẹt xe kéo dài. Cần có lực lượng điều tiết giao thông.",
      loai_su_co: "traffic_jam",
      vi_do: 10.8012,
      kinh_do: 106.7195,
      dia_chi: "Ngã tư Điện Biên Phủ - Xô Viết Nghệ Tĩnh, Quận Bình Thạnh",
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
      nguoi_dung_id: citizen1.id,
      tieu_de: "Vỉa hè bị hư hỏng nặng",
      mo_ta: "Vỉa hè đường Trần Hưng Đạo bị nứt vỡ, nhiều gạch bị bong tróc tạo thành ổ gà nhỏ. Khó khăn cho người đi bộ, đặc biệt là người già và trẻ em.",
      loai_su_co: "other",
      vi_do: 10.7571,
      kinh_do: 106.6847,
      dia_chi: "278 Trần Hưng Đạo, Quận 1",
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
      nguoi_dung_id: citizen3.id,
      tieu_de: "Nắp cống bị mất gây nguy hiểm",
      mo_ta: "Nắp cống thoát nước trên đường Võ Văn Tần bị mất, tạo thành hố sâu nguy hiểm cho xe máy và người đi bộ. Đặc biệt nguy hiểm vào ban đêm.",
      loai_su_co: "other",
      vi_do: 10.7887,
      kinh_do: 106.6917,
      dia_chi: "789 Võ Văn Tần, Quận 3",
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

  console.log("📋 Reports created successfully");

  // Create diverse AI analyses for different report types using existing images
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
        ai_priority_score: 68,
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
        completion_image_url: null, // Không có ảnh completion cho case này
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
        message: "Bạn được phân công xử lý báo cáo #1: Ổ gà lớn trên đường Lê Lợi",
        priority: "medium",
        ai_generated: true,
        related_id: report1.id,
        related_type: "phan_anh",
      },
    }),
    prisma.notification.create({
      data: {
        recipient_id: staff4.id,
        type: "deadline_warning", 
        title: "Cảnh báo deadline",
        message: "Nhiệm vụ #7 sắp đến hạn hoàn thành (còn 2 giờ)",
        priority: "medium",
        ai_generated: true,
        related_id: report7.id,
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
        message: "Báo cáo #1: Ổ gà lớn trên đường Lê Lợi đã được hệ thống tiếp nhận và đang chờ xử lý",
        priority: "low",
        ai_generated: false,
        related_id: report1.id,
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
      data: { current_workload: 1 }
    }),
    prisma.nguoiDung.update({
      where: { id: staff5.id },
      data: { current_workload: 1 }
    })
  ]);

  console.log("📊 Staff workloads updated");

  console.log("✅ Seed completed successfully!");
  
  console.log("\n🎯 Sample data created:");
  console.log(`👑 Admin: admin@smartreport.ai (password: 123456)`);
  console.log(`👮 Staff: staff1-5@smartreport.ai (password: 123456)`);
  console.log(`🙋 Citizens: citizen1-6@gmail.com (password: 123456)`);
  console.log(`📋 Reports: 8 diverse reports with different types and statuses`);
  console.log(`🤖 AI Features: Auto-classification, Smart assignment, Quality assessment`);
  console.log(`🔔 Notifications: AI-generated alerts and assignments`);
  console.log(`🏙️ Coverage: Multiple districts in Ho Chi Minh City`);
  console.log(`📸 Images: Using existing user avatars and report images`);
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
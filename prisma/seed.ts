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
      avatar_url: "/images/user/admin-avatar.png",
      ai_performance_score: 95.0,
    },
  });

  // Create staff users with AI-related fields
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
      avatar_url: "/images/user/staff1-avatar.png",
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
      avatar_url: "/images/user/staff2-avatar.png",
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
      avatar_url: "/images/user/staff3-avatar.png",
      skills: ["waste_management", "cleaning", "traffic_control"],
      current_workload: 0,
      location_lat: 10.7356,
      location_lng: 106.7183,
      ai_performance_score: 85.7,
    },
  });

  // Create citizen users
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
      avatar_url: "/images/user/citizen1-avatar.png",
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
      avatar_url: "/images/user/citizen2-avatar.png",
    },
  });

  console.log("👥 Users created successfully");

  // Create sample reports with AI data
  const report1 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: citizen1.id,
      tieu_de: "Ổ gà lớn trên đường Lê Lợi",
      mo_ta: "Có một ổ gà rất lớn trên đường Lê Lợi gây nguy hiểm cho người tham gia giao thông",
      loai_su_co: "pothole",
      vi_do: 10.7769,
      kinh_do: 106.7009,
      dia_chi: "123 Lê Lợi, Quận 1, TP.HCM",
      hinh_anh_url: "/uploads/reports/pothole-sample.jpg",
      muc_do_nghiem_trong: 4,
      trang_thai: "cho_xu_ly",
      // AI fields
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
      mo_ta: "Khu vực ngã tư Nguyễn Huệ - Lê Thánh Tôn bị ngập nước sâu sau mưa",
      loai_su_co: "flooding", 
      vi_do: 10.7740,
      kinh_do: 106.7034,
      dia_chi: "Ngã tư Nguyễn Huệ - Lê Thánh Tôn, Quận 1",
      hinh_anh_url: "/uploads/reports/flooding-sample.jpg",
      muc_do_nghiem_trong: 5,
      trang_thai: "da_phan_cong",
      can_bo_id: staff2.id,
      // AI fields
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
      nguoi_dung_id: citizen1.id,
      tieu_de: "Đèn giao thông hỏng",
      mo_ta: "Đèn giao thông tại ngã tư Pasteur - Lê Duẩn bị hỏng, gây kẹt xe",
      loai_su_co: "traffic_light",
      vi_do: 10.7831,
      kinh_do: 106.6968,
      dia_chi: "Ngã tư Pasteur - Lê Duẩn, Quận 3",
      hinh_anh_url: "/uploads/reports/traffic-light-sample.jpg", 
      muc_do_nghiem_trong: 3,
      trang_thai: "dang_xu_ly",
      can_bo_id: staff2.id,
      // AI fields
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

  console.log("📋 Reports created successfully");

  // Create AI analyses
  const aiAnalysis1 = await prisma.aiAnalysis.create({
    data: {
      nguoi_dung_id: citizen1.id,
      phan_anh_id: report1.id,
      image_url: "/uploads/reports/pothole-sample.jpg",
      predicted_label: "pothole",
      confidence_score: 0.89,
      description: "Ổ gà đường được phát hiện trong hình ảnh",
      severity: "medium",
      suggested_priority: "high",
      location_hints: ["đường phố", "khu vực đô thị"],
      detected_objects: ["road", "damage", "asphalt"],
      model_version: "smart-v1.2",
      processing_time_ms: 1850,
      debug_info: {
        vehicle_count: 0,
        analysis_breakdown: {
          vehicles: [],
          damage_indicators: ["road damage"],
          infrastructure: ["road"]
        }
      }
    },
  });

  const aiAnalysis2 = await prisma.aiAnalysis.create({
    data: {
      nguoi_dung_id: citizen2.id,
      phan_anh_id: report2.id,
      image_url: "/uploads/reports/flooding-sample.jpg", 
      predicted_label: "flooding",
      confidence_score: 0.94,
      description: "Ngập lụt được phát hiện trong hình ảnh",
      severity: "high",
      suggested_priority: "critical",
      location_hints: ["đường phố", "khu vực đô thị"],
      detected_objects: ["water", "street", "flooding"],
      model_version: "smart-v1.2",
      processing_time_ms: 2100,
      debug_info: {
        vehicle_count: 1,
        analysis_breakdown: {
          vehicles: ["car"],
          water_related: ["water", "flooding"],
          infrastructure: ["street"]
        }
      }
    },
  });

  console.log("🤖 AI Analyses created successfully");

  // Create processing records with AI fields
  const xuLy1 = await prisma.xuLy.create({
    data: {
      phan_anh_id: report2.id,
      can_bo_id: staff2.id,
      noi_dung: "Đang kiểm tra hệ thống thoát nước trong khu vực",
      trang_thai: "dang_xu_ly",
      completion_percentage: 60,
      ghi_chu: "Đã xác định nguyên nhân là cống thoát nước bị tắc",
      // AI assignment fields
      ai_priority_score: 95,
      ai_estimated_hours: 6.0,
      ai_suggested_skills: "drainage,emergency_response",
      ai_assignment_reasoning: "AI assigned based on flooding classification with 92% match score",
      timeline_status: "on_time",
      started_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  const xuLy2 = await prisma.xuLy.create({
    data: {
      phan_anh_id: report3.id,
      can_bo_id: staff2.id,
      noi_dung: "Đã thay thế bóng đèn và kiểm tra hệ thống điện",
      trang_thai: "hoan_thanh",
      completion_percentage: 100,
      completion_image_url: "/uploads/completions/traffic-light-fixed.jpg",
      ghi_chu: "Đèn giao thông đã hoạt động bình thường",
      // AI fields
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
  });

  console.log("🔧 Processing records created successfully");

  // Create notifications
  const notification1 = await prisma.notification.create({
    data: {
      recipient_id: admin.id,
      type: "quality_alert",
      title: "Cảnh báo chất lượng xử lý",
      message: "Phát hiện vấn đề trong xử lý #1: Vượt thời gian dự kiến 6h, đã mất 8h",
      priority: "high",
      ai_generated: true,
      related_id: xuLy1.id,
      related_type: "xu_ly",
    },
  });

  const notification2 = await prisma.notification.create({
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
  });

  console.log("🔔 Notifications created successfully");

  // Update workload for staff
  await prisma.nguoiDung.update({
    where: { id: staff2.id },
    data: { current_workload: 2 }
  });

  console.log("📊 Staff workloads updated");

  console.log("✅ Seed completed successfully!");
  
  console.log("\n🎯 Sample data created:");
  console.log(`👑 Admin: admin@smartreport.ai (password: 123456)`);
  console.log(`👮 Staff: staff1@smartreport.ai, staff2@smartreport.ai, staff3@smartreport.ai`);
  console.log(`🙋 Citizens: citizen1@gmail.com, citizen2@gmail.com`);
  console.log(`📋 Reports: 3 sample reports with AI analysis`);
  console.log(`🤖 AI Features: Auto-classification, Smart assignment, Quality assessment`);
  console.log(`🔔 Notifications: AI-generated alerts and assignments`);
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
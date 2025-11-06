import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Dữ liệu địa lý Đà Nẵng - các quận khác nhau
const locations = [
  { name: 'Hải Châu', district_name: 'Trần Phú', lat: 16.0544, lng: 108.2022 },
  { name: 'Hải Châu', district_name: 'Tạ Quang Bửu', lat: 16.0625, lng: 108.2115 },
  { name: 'Thanh Khê', district_name: 'Tên Lửa', lat: 16.0708, lng: 108.1878 },
  { name: 'Thanh Khê', district_name: 'Lê Lợi', lat: 16.0452, lng: 108.1756 },
  { name: 'Sơn Trà', district_name: 'Phạm Văn Đồng', lat: 16.1089, lng: 108.2312 },
  { name: 'Ngũ Hành Sơn', district_name: 'Mỹ Khê', lat: 15.9799, lng: 108.2341 },
  { name: 'Liên Chiều', district_name: 'Hoàng Diệu', lat: 16.0254, lng: 108.1678 },
  { name: 'Cẩm Lệ', district_name: 'Ngôi Sao', lat: 15.9909, lng: 108.1534 },
];

// Các loại sự cố
const issueTypes = [
  'pothole',
  'flooding',
  'traffic_light',
  'waste',
  'traffic_jam',
];

// Mô tả phản ánh
const reportDescriptions = [
  {
    title: 'Hố ga lớn trên đường',
    description: 'Có một hố ga lớn trên con đường này, rất nguy hiểm cho người đi bộ và xe máy.',
    type: 'pothole',
    severity: 3,
  },
  {
    title: 'Khu vực ngập nước sau mưa',
    description: 'Mỗi khi mưa, khu vực này bị ngập nước, gây khó khăn cho giao thông.',
    type: 'flooding',
    severity: 4,
  },
  {
    title: 'Đèn giao thông hỏng',
    description: 'Đèn giao thông tại ngã tư này không hoạt động, gây nhầm lẫn và nguy hiểm.',
    type: 'traffic_light',
    severity: 4,
  },
  {
    title: 'Rác thải xung quanh công viên',
    description: 'Rác thải được vứt khắp nơi xung quanh công viên, ô nhiễm môi trường.',
    type: 'waste',
    severity: 2,
  },
  {
    title: 'Kẹt xe nghiêm trọng',
    description: 'Thường xuyên xảy ra kẹt xe tại khu vực này vào giờ cao điểm.',
    type: 'traffic_jam',
    severity: 2,
  },
  {
    title: 'Lỗ hổng lớn trên mặt đường',
    description: 'Mặt đường bị sụt lún, tạo lỗ hổng lớn nguy hiểm cho phương tiện.',
    type: 'pothole',
    severity: 5,
  },
  {
    title: 'Rác thải tích tụ',
    description: 'Rác thải tích tụ khắp nơi, ô nhiễm môi trường và gây mùi hôi.',
    type: 'waste',
    severity: 3,
  },
  {
    title: 'Kẹt xe tại nút giao',
    description: 'Tình trạng kẹt xe thường xuyên xảy ra tại nút giao thông chính.',
    type: 'traffic_jam',
    severity: 3,
  },
];

const userAvatars = [
  '/images/user/user-01.jpg',
  '/images/user/user-02.jpg',
  '/images/user/user-03.jpg',
  '/images/user/user-04.jpg',
  '/images/user/user-05.jpg',
  '/images/user/user-06.jpg',
];

const cardImages = [
  '/images/cards/card-01.jpg',
  '/images/cards/card-02.jpg',
  '/images/cards/card-03.jpg',
];

async function main() {
  console.log('🌱 Starting SmartReportAI database seeding...');

  // Clear existing data
  await prisma.lichSuDanhGia.deleteMany();
  await prisma.aiAnalysis.deleteMany();
  await prisma.blockchainLog.deleteMany();
  await prisma.xuLy.deleteMany();
  await prisma.thongBao.deleteMany();
  await prisma.token.deleteMany();
  await prisma.phanAnh.deleteMany();
  await prisma.nguoiDung.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create hashed password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create citizens (Người dân)
  const citizens = [];
  const citizenNames = [
    { ho_ten: 'Nguyễn Văn An', email: 'nguyenvanan@email.com', phone: '0901234567' },
    { ho_ten: 'Trần Thị Bình', email: 'tranthibinh@email.com', phone: '0901234568' },
    { ho_ten: 'Lê Văn Cường', email: 'levancuong@email.com', phone: '0901234569' },
    { ho_ten: 'Phạm Thị Dung', email: 'phamthidung@email.com', phone: '0901234570' },
    { ho_ten: 'Hoàng Minh Tuấn', email: 'hoangminhuan@email.com', phone: '0901234571' },
    { ho_ten: 'Võ Thị Hương', email: 'vothinuong@email.com', phone: '0901234572' },
    { ho_ten: 'Đặng Văn Hòa', email: 'dangvanhoa@email.com', phone: '0901234573' },
    { ho_ten: 'Bùi Thị Thu', email: 'buithithu@email.com', phone: '0901234574' },
  ];

  for (let i = 0; i < citizenNames.length; i++) {
    const citizen = await prisma.nguoiDung.create({
      data: {
        ho_ten: citizenNames[i].ho_ten,
        email: citizenNames[i].email,
        mat_khau: hashedPassword,
        so_dien_thoai: citizenNames[i].phone,
        vai_tro: 'nguoi_dan',
        dia_chi: `${100 + i * 50} ${locations[i % locations.length].name}, Đà Nẵng`,
        avatar_url: userAvatars[i % userAvatars.length],
      },
    });
    citizens.push(citizen);
  }

  // Create staff/officers (Cán bộ)
  const officers: typeof prisma.nguoiDung.create extends (...args: any[]) => Promise<infer T> ? T[] : any[] = [];
  const officerNames = [
    { ho_ten: 'Trương Văn Phúc', email: 'truongvanphuc@email.com', phone: '0912345001' },
    { ho_ten: 'Hà Thị Minh Huỳnh', email: 'hathiminhhuong@email.com', phone: '0912345002' },
    { ho_ten: 'Cao Văn Tuấn', email: 'caovantuan@email.com', phone: '0912345003' },
    { ho_ten: 'Ngô Thị Thu Hương', email: 'ngothithuhuong@email.com', phone: '0912345004' },
  ];

  for (let i = 0; i < officerNames.length; i++) {
    const officer = officerNames[i];
    const canBo = await prisma.nguoiDung.create({
      data: {
        ho_ten: officer.ho_ten,
        email: officer.email,
        mat_khau: hashedPassword,
        so_dien_thoai: officer.phone,
        vai_tro: 'can_bo',
        dia_chi: `Sở Xây dựng, ${locations[0].name}, Đà Nẵng`,
        avatar_url: userAvatars[i % userAvatars.length],
      },
    });
    officers.push(canBo);
  }

  // Create admin
  const admin = await prisma.nguoiDung.create({
    data: {
      ho_ten: 'Lê Quốc Cương',
      email: 'lequoccuong@email.com',
      mat_khau: hashedPassword,
      so_dien_thoai: '0912345099',
      vai_tro: 'quan_tri',
      dia_chi: 'Thành phố Đà Nẵng',
      avatar_url: userAvatars[0],
    },
  });

  console.log(`👥 Created ${citizens.length + officers.length + 1} users`);

  // Create complaint reports (PhanAnh) - diverse data
  const reports = [];
  for (let i = 0; i < 20; i++) {
    const location = locations[i % locations.length];
    const report = reportDescriptions[i % reportDescriptions.length];
    const citizen = citizens[i % citizens.length];
    const statuses = ['cho_xu_ly', 'dang_xu_ly', 'da_hoan_tat'];
    const status = statuses[Math.floor(i / 3) % statuses.length];

    const phanAnh = await prisma.phanAnh.create({
      data: {
        nguoi_dung_id: citizen.id,
        tieu_de: report.title,
        mo_ta: report.description,
        loai_su_co: report.type,
        vi_do: location.lat + (Math.random() - 0.5) * 0.01,
        kinh_do: location.lng + (Math.random() - 0.5) * 0.01,
        hinh_anh_url: cardImages[i % cardImages.length],
        muc_do_nghiem_trong: report.severity,
        trang_thai: status,
        ai_nhan_dang: {
          loai_su_co: report.type,
          muc_do_tin_cay: 0.75 + Math.random() * 0.25,
          thoi_gian_du_doan: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        },
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
    reports.push(phanAnh);
  }

  console.log(`📝 Created ${reports.length} complaint reports`);

  // Create processing records (XuLy)
  let xulyCount = 0;
  for (let i = 0; i < reports.length; i++) {
    if (i % 3 !== 0) continue; // Chỉ một số báo cáo được xử lý

    const officer = officers[i % officers.length];
    const statuses = ['dang_xu_ly', 'da_hoan_tat'];
    const status = statuses[Math.floor(i / 5) % statuses.length];

    await prisma.xuLy.create({
      data: {
        phan_anh_id: reports[i].id,
        can_bo_id: officer.id,
        noi_dung: [
          'Đã tiếp nhận phản ánh và đang xử lý.',
          'Đang kiểm tra hiện trường, sẽ có kế hoạch sửa chữa.',
          'Đã hoàn thành xử lý vấn đề.',
          'Chờ phê duyệt từ cơ quan chuyên môn.',
          'Đã liên hệ với các bên liên quan để giải quyết.',
        ][xulyCount % 5],
        trang_thai_moi: status,
        hinh_anh_minh_chung: cardImages[(xulyCount * 2) % cardImages.length],
        thoi_gian: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
      },
    });
    xulyCount++;
  }

  console.log(`⚙️ Created ${xulyCount} processing records`);

  // Create blockchain logs
  let blockchainCount = 0;
  for (let i = 0; i < reports.length; i++) {
    const actions = ['tao_phan_anh', 'cap_nhat_trang_thai', 'hoan_tat'];
    const action = actions[i % actions.length];

    await prisma.blockchainLog.create({
      data: {
        phan_anh_id: reports[i].id,
        transaction_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        trang_thai_giao_dich: i % 5 === 0 ? 'pending' : 'confirmed',
        block_number: 12345678 + i,
        vi_dua: `0x${Math.random().toString(16).slice(2).slice(0, 40)}`,
        hanh_dong: action,
        thoi_gian: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
    blockchainCount++;
  }

  console.log(`⛓️ Created ${blockchainCount} blockchain logs`);

  // Create notifications
  let notificationCount = 0;
  for (let i = 0; i < citizens.length; i++) {
    const citizen = citizens[i];
    const notifications = [
      {
        title: 'Phản ánh đã được tiếp nhận',
        content: `Phản ánh của bạn đã được tiếp nhận và đang chờ xử lý.`,
        read: Math.random() > 0.3,
      },
      {
        title: 'Phản ánh đang được xử lý',
        content: `Phản ánh của bạn đang được cán bộ xử lý.`,
        read: Math.random() > 0.2,
      },
      {
        title: 'Yêu cầu đánh giá xử lý',
        content: `Vui lòng đánh giá chất lượng xử lý của chúng tôi.`,
        read: Math.random() > 0.5,
      },
    ];

    for (const notification of notifications) {
      await prisma.thongBao.create({
        data: {
          nguoi_dung_id: citizen.id,
          tieu_de: notification.title,
          noi_dung: notification.content,
          da_doc: notification.read,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
      notificationCount++;
    }
  }

  console.log(`🔔 Created ${notificationCount} notifications`);

  // Create ratings/reviews (LichSuDanhGia)
  let ratingCount = 0;
  for (let i = 0; i < reports.length; i++) {
    if (reports[i].trang_thai !== 'da_hoan_tat' || Math.random() > 0.5) continue;

    const ratings = [5, 5, 4, 4, 3, 5, 4];
    const comments = [
      'Xử lý rất nhanh chóng và hiệu quả.',
      'Cảm ơn các cán bộ đã làm việc tận tình.',
      'Xử lý tốt, nhưng thời gian hơi lâu.',
      'Sẽ còn có thể cải thiện hơn.',
      'Kết quả xử lý rất tốt, hài lòng.',
      'Cán bộ rất chuyên nghiệp.',
      'Phục vụ tốt, nhưng cần nhanh hơn.',
    ];

    await prisma.lichSuDanhGia.create({
      data: {
        phan_anh_id: reports[i].id,
        nguoi_dung_id: reports[i].nguoi_dung_id,
        diem: ratings[ratingCount % ratings.length],
        nhan_xet: comments[ratingCount % comments.length],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    ratingCount++;
  }

  console.log(`⭐ Created ${ratingCount} ratings`);

  // Create tokens for users
  let tokenCount = 0;
  for (const citizen of citizens.slice(0, 4)) {
    await prisma.token.create({
      data: {
        nguoi_dung_id: citizen.id,
        token: `token_${citizen.id}_${Date.now()}`,
        loai_token: 'access_token',
        het_han: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    tokenCount++;
  }

  for (const officer of officers.slice(0, 2)) {
    await prisma.token.create({
      data: {
        nguoi_dung_id: officer.id,
        token: `token_${officer.id}_${Date.now()}`,
        loai_token: 'access_token',
        het_han: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    tokenCount++;
  }

  console.log(`🔑 Created ${tokenCount} tokens`);

  // Create AI analysis records
  let aiCount = 0;
  for (let i = 0; i < 8; i++) {
    const citizen = citizens[i % citizens.length];
    const report = reportDescriptions[i % reportDescriptions.length];

    const severityIndex = Math.max(0, Math.min(report.severity - 1, 3));
    await prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: citizen.id,
        image_url: cardImages[i % cardImages.length],
        predicted_label: report.type,
        confidence_score: 0.75 + Math.random() * 0.25,
        description: report.description,
        severity: ['low', 'medium', 'high', 'critical'][severityIndex],
        suggested_priority: ['low', 'medium', 'high', 'critical'][severityIndex],
        location_hints: [`${locations[i % locations.length].name}`, 'Đà Nẵng'],
        model_version: 'v1.2.0',
        processing_time_ms: Math.floor(500 + Math.random() * 1500),
      },
    });
    aiCount++;
  }

  console.log(`🤖 Created ${aiCount} AI analysis records`);

  console.log('\n✅ SmartReportAI database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${citizens.length + officers.length + 1} (${citizens.length} citizens, ${officers.length} officers, 1 admin)`);
  console.log(`- Complaint reports: ${reports.length}`);
  console.log(`- Processing records: ${xulyCount}`);
  console.log(`- Blockchain logs: ${blockchainCount}`);
  console.log(`- Notifications: ${notificationCount}`);
  console.log(`- Ratings: ${ratingCount}`);
  console.log(`- Tokens: ${tokenCount}`);
  console.log(`- AI analysis records: ${aiCount}`);
  console.log('\n🔐 Default password for all users: 123456');
  console.log('\n📍 Đà Nẵng Locations:');
  locations.forEach((loc) => console.log(`   - ${loc.district_name}, ${loc.name}`));
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
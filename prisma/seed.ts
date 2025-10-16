import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartReportAI database seeding...');

  // Clear existing data
  await prisma.lichSuDanhGia.deleteMany();
  await prisma.blockchainLog.deleteMany();
  await prisma.xuLy.deleteMany();
  await prisma.thongBao.deleteMany();
  await prisma.token.deleteMany();
  await prisma.phanAnh.deleteMany();
  await prisma.nguoiDung.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('123456', 10);

  const nguoiDan1 = await prisma.nguoiDung.create({
    data: {
      ho_ten: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      mat_khau: hashedPassword,
      so_dien_thoai: '0901234567',
      vai_tro: 'nguoi_dan',
      dia_chi: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      avatar_url: '/images/user/user-01.jpg',
    },
  });

  const nguoiDan2 = await prisma.nguoiDung.create({
    data: {
      ho_ten: 'Trần Thị Bình',
      email: 'tranthibinh@email.com',
      mat_khau: hashedPassword,
      so_dien_thoai: '0901234568',
      vai_tro: 'nguoi_dan',
      dia_chi: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      avatar_url: '/images/user/user-02.jpg',
    },
  });

  const canBo1 = await prisma.nguoiDung.create({
    data: {
      ho_ten: 'Lê Văn Cường',
      email: 'levancuong@email.com',
      mat_khau: hashedPassword,
      so_dien_thoai: '0901234569',
      vai_tro: 'can_bo',
      dia_chi: '789 Đường Đồng Khởi, Quận 1, TP.HCM',
      avatar_url: '/images/user/user-03.jpg',
    },
  });

  const canBo2 = await prisma.nguoiDung.create({
    data: {
      ho_ten: 'Phạm Thị Dung',
      email: 'phamthidung@email.com',
      mat_khau: hashedPassword,
      so_dien_thoai: '0901234570',
      vai_tro: 'can_bo',
      dia_chi: '321 Đường Pasteur, Quận 3, TP.HCM',
      avatar_url: '/images/user/user-04.jpg',
    },
  });

  const quanTri = await prisma.nguoiDung.create({
    data: {
      ho_ten: 'Hoàng Văn Em',
      email: 'hoangvanem@email.com',
      mat_khau: hashedPassword,
      so_dien_thoai: '0901234571',
      vai_tro: 'quan_tri',
      dia_chi: '654 Đường Võ Văn Tần, Quận 3, TP.HCM',
      avatar_url: '/images/user/user-05.jpg',
    },
  });

  console.log('👥 Created users');

  // Create complaint reports (PhanAnh)
  const phanAnh1 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: nguoiDan1.id,
      tieu_de: 'Đường bị sụt lún nghiêm trọng',
      mo_ta: 'Đường Lê Lợi đoạn từ số 100-150 bị sụt lún, tạo ra nhiều ổ gà lớn gây nguy hiểm cho người tham gia giao thông.',
      loai_su_co: 'cơ_sở_hạ_tầng',
      vi_do: 10.7769,
      kinh_do: 106.7009,
      hinh_anh_url: '/images/cards/card-01.jpg',
      muc_do_nghiem_trong: 4,
      trang_thai: 'cho_xu_ly',
      ai_nhan_dang: {
        loai_su_co: 'cơ_sở_hạ_tầng',
        muc_do_tin_cay: 0.95,
        thoi_gian_du_doan: '2024-01-15T10:30:00Z'
      },
    },
  });

  const phanAnh2 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: nguoiDan2.id,
      tieu_de: 'Rác thải không được thu gom',
      mo_ta: 'Khu vực chợ Bến Thành có rất nhiều rác thải không được thu gom, gây ô nhiễm môi trường và ảnh hưởng đến sức khỏe người dân.',
      loai_su_co: 'moi_truong',
      vi_do: 10.7719,
      kinh_do: 106.6984,
      hinh_anh_url: '/images/cards/card-02.jpg',
      muc_do_nghiem_trong: 3,
      trang_thai: 'dang_xu_ly',
      ai_nhan_dang: {
        loai_su_co: 'moi_truong',
        muc_do_tin_cay: 0.88,
        thoi_gian_du_doan: '2024-01-14T14:20:00Z'
      },
    },
  });

  const phanAnh3 = await prisma.phanAnh.create({
    data: {
      nguoi_dung_id: nguoiDan1.id,
      tieu_de: 'Cây xanh bị đổ do bão',
      mo_ta: 'Sau cơn bão, nhiều cây xanh trên đường Nguyễn Huệ bị đổ, chặn lối đi và có thể gây nguy hiểm.',
      loai_su_co: 'thien_tai',
      vi_do: 10.7756,
      kinh_do: 106.7019,
      hinh_anh_url: '/images/cards/card-03.jpg',
      muc_do_nghiem_trong: 5,
      trang_thai: 'da_hoan_tat',
      ai_nhan_dang: {
        loai_su_co: 'thien_tai',
        muc_do_tin_cay: 0.92,
        thoi_gian_du_doan: '2024-01-13T08:15:00Z'
      },
    },
  });

  console.log('📝 Created complaint reports');

  // Create processing records (XuLy)
  await prisma.xuLy.create({
    data: {
      phan_anh_id: phanAnh2.id,
      can_bo_id: canBo1.id,
      noi_dung: 'Đã tiếp nhận và đang tiến hành thu gom rác thải. Dự kiến hoàn thành trong 2 ngày.',
      trang_thai_moi: 'dang_xu_ly',
      hinh_anh_minh_chung: '/images/cards/card-02.jpg',
      thoi_gian: new Date('2024-01-14T15:30:00Z'),
    },
  });

  await prisma.xuLy.create({
    data: {
      phan_anh_id: phanAnh3.id,
      can_bo_id: canBo2.id,
      noi_dung: 'Đã hoàn thành việc dọn dẹp cây đổ và khôi phục giao thông.',
      trang_thai_moi: 'da_hoan_tat',
      hinh_anh_minh_chung: '/images/cards/card-03.jpg',
      thoi_gian: new Date('2024-01-13T16:45:00Z'),
    },
  });

  console.log('⚙️ Created processing records');

  // Create blockchain logs
  await prisma.blockchainLog.create({
    data: {
      phan_anh_id: phanAnh1.id,
      transaction_hash: '0x1234567890abcdef1234567890abcdef12345678',
      trang_thai_giao_dich: 'confirmed',
      block_number: 12345678,
      vi_dua: '0xabcdef1234567890abcdef1234567890abcdef12',
      hanh_dong: 'tao_phan_anh',
      thoi_gian: new Date('2024-01-15T10:30:00Z'),
    },
  });

  await prisma.blockchainLog.create({
    data: {
      phan_anh_id: phanAnh2.id,
      transaction_hash: '0x2345678901bcdef12345678901bcdef123456789',
      trang_thai_giao_dich: 'confirmed',
      block_number: 12345679,
      vi_dua: '0xbcdef12345678901bcdef12345678901bcdef123',
      hanh_dong: 'cap_nhat_trang_thai',
      thoi_gian: new Date('2024-01-14T15:30:00Z'),
    },
  });

  console.log('⛓️ Created blockchain logs');

  // Create notifications
  await prisma.thongBao.create({
    data: {
      nguoi_dung_id: nguoiDan1.id,
      tieu_de: 'Phản ánh đã được tiếp nhận',
      noi_dung: 'Phản ánh "Đường bị sụt lún nghiêm trọng" của bạn đã được tiếp nhận và đang chờ xử lý.',
      da_doc: false,
    },
  });

  await prisma.thongBao.create({
    data: {
      nguoi_dung_id: nguoiDan2.id,
      tieu_de: 'Phản ánh đang được xử lý',
      noi_dung: 'Phản ánh "Rác thải không được thu gom" của bạn đang được xử lý bởi cán bộ Lê Văn Cường.',
      da_doc: true,
    },
  });

  await prisma.thongBao.create({
    data: {
      nguoi_dung_id: nguoiDan1.id,
      tieu_de: 'Phản ánh đã hoàn thành',
      noi_dung: 'Phản ánh "Cây xanh bị đổ do bão" của bạn đã được xử lý hoàn tất.',
      da_doc: false,
    },
  });

  console.log('🔔 Created notifications');

  // Create rating history
  await prisma.lichSuDanhGia.create({
    data: {
      phan_anh_id: phanAnh3.id,
      nguoi_dung_id: nguoiDan1.id,
      diem: 5,
      nhan_xet: 'Xử lý rất nhanh chóng và hiệu quả. Cảm ơn các cán bộ đã làm việc tận tình.',
    },
  });

  await prisma.lichSuDanhGia.create({
    data: {
      phan_anh_id: phanAnh2.id,
      nguoi_dung_id: nguoiDan2.id,
      diem: 4,
      nhan_xet: 'Xử lý tốt, nhưng thời gian hơi lâu một chút.',
    },
  });

  console.log('⭐ Created rating history');

  // Create tokens
  await prisma.token.create({
    data: {
      nguoi_dung_id: nguoiDan1.id,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      loai_token: 'access_token',
      het_han: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  await prisma.token.create({
    data: {
      nguoi_dung_id: canBo1.id,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      loai_token: 'access_token',
      het_han: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log('🔑 Created tokens');

  console.log('✅ SmartReportAI database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: 5 (3 citizens, 2 officers, 1 admin)`);
  console.log(`- Complaint reports: 3`);
  console.log(`- Processing records: 2`);
  console.log(`- Blockchain logs: 2`);
  console.log(`- Notifications: 3`);
  console.log(`- Ratings: 2`);
  console.log(`- Tokens: 2`);
  console.log('\n🔐 Default password for all users: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
-- CreateTable
CREATE TABLE "NguoiDung" (
    "id" SERIAL NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mat_khau" TEXT NOT NULL,
    "so_dien_thoai" TEXT,
    "vai_tro" TEXT NOT NULL,
    "dia_chi" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhanAnh" (
    "id" SERIAL NOT NULL,
    "nguoi_dung_id" INTEGER NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "mo_ta" TEXT,
    "loai_su_co" TEXT NOT NULL,
    "vi_do" DOUBLE PRECISION NOT NULL,
    "kinh_do" DOUBLE PRECISION NOT NULL,
    "dia_chi" TEXT,
    "hinh_anh_url" TEXT,
    "muc_do_nghiem_trong" INTEGER NOT NULL,
    "trang_thai" TEXT NOT NULL,
    "ai_nhan_dang" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhanAnh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XuLy" (
    "id" SERIAL NOT NULL,
    "phan_anh_id" INTEGER NOT NULL,
    "can_bo_id" INTEGER NOT NULL,
    "noi_dung" TEXT,
    "trang_thai_moi" TEXT NOT NULL,
    "hinh_anh_minh_chung" TEXT,
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XuLy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainLog" (
    "id" SERIAL NOT NULL,
    "phan_anh_id" INTEGER NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "trang_thai_giao_dich" TEXT,
    "block_number" INTEGER,
    "vi_dua" TEXT,
    "hanh_dong" TEXT NOT NULL,
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThongBao" (
    "id" SERIAL NOT NULL,
    "nguoi_dung_id" INTEGER NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "da_doc" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThongBao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LichSuDanhGia" (
    "id" SERIAL NOT NULL,
    "phan_anh_id" INTEGER NOT NULL,
    "nguoi_dung_id" INTEGER NOT NULL,
    "diem" INTEGER NOT NULL,
    "nhan_xet" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LichSuDanhGia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "nguoi_dung_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "loai_token" TEXT NOT NULL,
    "het_han" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAnalysis" (
    "id" SERIAL NOT NULL,
    "nguoi_dung_id" INTEGER NOT NULL,
    "image_url" TEXT,
    "image_base64" TEXT,
    "predicted_label" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "suggested_priority" TEXT NOT NULL,
    "location_hints" TEXT[],
    "model_version" TEXT NOT NULL,
    "processing_time_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- AddForeignKey
ALTER TABLE "PhanAnh" ADD CONSTRAINT "PhanAnh_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XuLy" ADD CONSTRAINT "XuLy_phan_anh_id_fkey" FOREIGN KEY ("phan_anh_id") REFERENCES "PhanAnh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XuLy" ADD CONSTRAINT "XuLy_can_bo_id_fkey" FOREIGN KEY ("can_bo_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainLog" ADD CONSTRAINT "BlockchainLog_phan_anh_id_fkey" FOREIGN KEY ("phan_anh_id") REFERENCES "PhanAnh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThongBao" ADD CONSTRAINT "ThongBao_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDanhGia" ADD CONSTRAINT "LichSuDanhGia_phan_anh_id_fkey" FOREIGN KEY ("phan_anh_id") REFERENCES "PhanAnh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDanhGia" ADD CONSTRAINT "LichSuDanhGia_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysis" ADD CONSTRAINT "AiAnalysis_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

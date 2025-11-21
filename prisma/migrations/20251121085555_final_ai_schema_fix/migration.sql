/*
  Warnings:

  - Added the required column `trang_thai` to the `XuLy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `XuLy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiAnalysis" ADD COLUMN     "debug_info" JSONB,
ADD COLUMN     "detected_objects" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phan_anh_id" INTEGER,
ALTER COLUMN "location_hints" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "NguoiDung" ADD COLUMN     "ai_performance_score" DOUBLE PRECISION NOT NULL DEFAULT 75.0,
ADD COLUMN     "current_workload" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "PhanAnh" ADD COLUMN     "ai_classification" TEXT,
ADD COLUMN     "ai_confidence" DOUBLE PRECISION,
ADD COLUMN     "ai_description" TEXT,
ADD COLUMN     "ai_estimated_hours" DOUBLE PRECISION,
ADD COLUMN     "ai_priority_score" INTEGER,
ADD COLUMN     "ai_processing_time_ms" INTEGER,
ADD COLUMN     "ai_severity" TEXT,
ADD COLUMN     "auto_assigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_original_choice" TEXT;

-- AlterTable
ALTER TABLE "XuLy" ADD COLUMN     "ai_assignment_reasoning" TEXT,
ADD COLUMN     "ai_completion_verification" TEXT,
ADD COLUMN     "ai_estimated_hours" DOUBLE PRECISION,
ADD COLUMN     "ai_priority_score" INTEGER,
ADD COLUMN     "ai_quality_score" INTEGER,
ADD COLUMN     "ai_suggested_skills" TEXT,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "completion_image_url" TEXT,
ADD COLUMN     "completion_percentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ghi_chu" TEXT,
ADD COLUMN     "quality_issues" TEXT,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "timeline_status" TEXT NOT NULL DEFAULT 'on_time',
ADD COLUMN     "trang_thai" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "trang_thai_moi" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" INTEGER,
    "related_type" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiAnalysis" ADD CONSTRAINT "AiAnalysis_phan_anh_id_fkey" FOREIGN KEY ("phan_anh_id") REFERENCES "PhanAnh"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add optional officer assignment reference to PhanAnh
ALTER TABLE "PhanAnh"
ADD COLUMN "can_bo_id" INTEGER;

ALTER TABLE "PhanAnh"
ADD CONSTRAINT "PhanAnh_can_bo_id_fkey"
FOREIGN KEY ("can_bo_id") REFERENCES "NguoiDung"("id")
ON DELETE SET NULL ON UPDATE CASCADE;



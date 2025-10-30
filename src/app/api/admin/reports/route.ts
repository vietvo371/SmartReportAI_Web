import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/admin/reports - Lấy tất cả phản ánh cho admin
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priorityRaw = searchParams.get("priority");

    const whereClause: any = {};
    if (status) whereClause.trang_thai = status;
    if (priorityRaw) {
      const priority = parseInt(priorityRaw);
      if (!isNaN(priority)) {
        whereClause.muc_do_nghiem_trong = priority;
      }
    }

    const reports = await prisma.phanAnh.findMany({
      where: whereClause,
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
            so_dien_thoai: true,
          },
        },
        xu_lys: {
          include: {
            can_bo: {
              select: {
                ho_ten: true,
                email: true,
              },
            },
          },
        },
        blockchain_logs: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.phanAnh.count({ where: whereClause });

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/reports - Tạo phản ánh mới (admin tạo hộ hoặc nhập liệu)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const contentType = req.headers.get('content-type') || '';
    let nguoi_dung_id: number; let tieu_de: string; let mo_ta: string | null | undefined; let loai_su_co: string; let vi_do: number; let kinh_do: number; let hinh_anh_url: string | null | undefined; let muc_do_nghiem_trong: number = 1; const trang_thai = "cho_xu_ly";

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      nguoi_dung_id = Number(form.get('nguoi_dung_id'));
      tieu_de = String(form.get('tieu_de') || '');
      mo_ta = (form.get('mo_ta') as string) || null;
      loai_su_co = String(form.get('loai_su_co') || '');
      vi_do = Number(form.get('vi_do'));
      kinh_do = Number(form.get('kinh_do'));
      muc_do_nghiem_trong = Number(form.get('muc_do_nghiem_trong') || 1);
      const file = form.get('file') as File | null;
      const urlInput = (form.get('hinh_anh_url') as string) || '';

      if (file) {
        const { writeFile, mkdir } = await import('fs/promises');
        const path = (await import('path')).default;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = (file.type && file.type.split('/') [1]) || 'jpg';
        const base = `${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, base);
        await writeFile(filePath, buffer);
        hinh_anh_url = `/uploads/reports/${base}`;
      } else if (urlInput) {
        hinh_anh_url = urlInput;
      } else {
        hinh_anh_url = null;
      }
    } else {
      const body = await req.json();
      nguoi_dung_id = body.nguoi_dung_id;
      tieu_de = body.tieu_de;
      mo_ta = body.mo_ta;
      loai_su_co = body.loai_su_co;
      vi_do = body.vi_do;
      kinh_do = body.kinh_do;
      hinh_anh_url = body.hinh_anh_url;
      muc_do_nghiem_trong = body.muc_do_nghiem_trong ?? 1;
    }

    if (
      typeof nguoi_dung_id !== 'number' || !tieu_de || !loai_su_co || typeof vi_do !== 'number' || typeof kinh_do !== 'number'
    ) {
      return NextResponse.json({ error: 'Thiếu dữ liệu bắt buộc' }, { status: 400 });
    }

    const user = await prisma.nguoiDung.findUnique({ where: { id: nguoi_dung_id } });
    if (!user) return NextResponse.json({ error: 'nguoi_dung_id không tồn tại' }, { status: 400 });

    const created = await prisma.phanAnh.create({
      data: { nguoi_dung_id, tieu_de, mo_ta, loai_su_co, vi_do, kinh_do, hinh_anh_url, muc_do_nghiem_trong, trang_thai },
    });

    return NextResponse.json({ report: created }, { status: 201 });
  } catch (error) {
    console.error("Create admin report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/reports - Cập nhật phản ánh: trạng thái/độ nghiêm trọng/ghi nhận xử lý/assign cán bộ
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, trang_thai, muc_do_nghiem_trong, assign_can_bo_id, ghi_chu } = body || {};
    if (typeof id !== "number") {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    const inferred_trang_thai = trang_thai ?? (assign_can_bo_id ? "dang_xu_ly" : undefined);

    const updated = await prisma.phanAnh.update({
      where: { id },
      data: {
        ...(inferred_trang_thai ? { trang_thai: inferred_trang_thai } : {}),
        ...(typeof muc_do_nghiem_trong === "number" ? { muc_do_nghiem_trong } : {}),
      },
    });

    // Nếu có assign cán bộ hoặc cập nhật trạng thái, ghi vào bảng XuLy như một log
    if (assign_can_bo_id || trang_thai || ghi_chu) {
      await prisma.xuLy.create({
        data: {
          phan_anh_id: id,
          can_bo_id: assign_can_bo_id || payload.userId, // nếu không chỉ định thì ghi nhận bởi admin
          noi_dung: ghi_chu || null,
          trang_thai_moi: inferred_trang_thai || updated.trang_thai,
        },
      });
    }

    return NextResponse.json({ report: updated });
  } catch (error) {
    console.error("Patch admin report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/reports?id=123 - Xóa phản ánh
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    await prisma.blockchainLog.deleteMany({ where: { phan_anh_id: id } });
    await prisma.xuLy.deleteMany({ where: { phan_anh_id: id } });
    await prisma.lichSuDanhGia.deleteMany({ where: { phan_anh_id: id } });
    await prisma.phanAnh.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete admin report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

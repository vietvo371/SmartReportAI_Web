import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/citizen/status - Lấy trạng thái xử lý các phản ánh của người dùng
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "userId không hợp lệ" },
        { status: 400 }
      );
    }

    // Người dùng chỉ có thể xem trạng thái của phản ánh của chính mình
    if (payload.userId !== parseInt(userId) && !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Lấy tất cả phản ánh của user
    const reports = await prisma.phanAnh.findMany({
      where: {
        nguoi_dung_id: parseInt(userId),
      },
      select: {
        id: true,
        tieu_de: true,
        loai_su_co: true,
        trang_thai: true,
      },
    });

    if (reports.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    const reportIds = reports.map((r) => r.id);

    // Lấy tất cả các xử lý (XuLy) của các phản ánh này
    const xuLys = await prisma.xuLy.findMany({
      where: {
        phan_anh_id: {
          in: reportIds,
        },
      },
      include: {
        phan_anh: {
          select: {
            tieu_de: true,
            loai_su_co: true,
          },
        },
        can_bo: {
          select: {
            ho_ten: true,
            email: true,
          },
        },
      },
      orderBy: {
        thoi_gian: "desc",
      },
    });

    // Transform để hiển thị
    const statuses = xuLys.map((xu_ly) => ({
      id: xu_ly.id,
      phan_anh_id: xu_ly.phan_anh_id,
      tieu_de: xu_ly.phan_anh.tieu_de,
      loai_su_co: xu_ly.phan_anh.loai_su_co,
      trang_thai: xu_ly.trang_thai_moi,
      noi_dung: xu_ly.noi_dung,
      hinh_anh_minh_chung: xu_ly.hinh_anh_minh_chung,
      can_bo_ho_ten: xu_ly.can_bo?.ho_ten || "Không xác định",
      can_bo_email: xu_ly.can_bo?.email || null,
      thoi_gian: xu_ly.thoi_gian,
    }));

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Get citizen status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


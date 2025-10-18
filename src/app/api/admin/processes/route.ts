import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/admin/processes - Lấy tất cả quá trình xử lý cho admin
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== "quan_tri") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status) whereClause.trang_thai_moi = status;

    const processes = await prisma.xuLy.findMany({
      where: whereClause,
      include: {
        can_bo: {
          select: {
            ho_ten: true,
            email: true,
            so_dien_thoai: true,
          },
        },
        phan_anh: {
          select: {
            id: true,
            loai_su_co: true,
            vi_do: true,
            kinh_do: true,
            muc_do_nghiem_trong: true,
          },
        },
      },
      orderBy: {
        thoi_gian: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.xuLy.count({ where: whereClause });

    return NextResponse.json({
      processes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin processes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

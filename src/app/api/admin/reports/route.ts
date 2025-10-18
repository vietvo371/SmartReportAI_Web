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
    if (!payload || payload.vai_tro !== "quan_tri") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const whereClause: any = {};
    if (status) whereClause.trang_thai = status;
    if (priority) whereClause.muc_do_nghiem_trong = priority;

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

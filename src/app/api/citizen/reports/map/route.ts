import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/citizen/reports/map - Lấy tất cả phản ánh cho hiển thị trên bản đồ
export async function GET(req: NextRequest) {
  try {
    // Get token from header or cookies
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader?.replace('bearer ', '') || req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const loai_su_co = searchParams.get("loai_su_co"); // Filter by issue type

    const whereClause: any = {};

    // Filter theo trạng thái
    if (filter === "pending") {
      whereClause.trang_thai = "cho_xu_ly";
    } else if (filter === "processing") {
      whereClause.trang_thai = "dang_xu_ly";
    } else if (filter === "completed") {
      whereClause.trang_thai = "da_hoan_tat";
    }

    // Filter theo loại sự cố
    if (loai_su_co && loai_su_co !== "all") {
      whereClause.loai_su_co = loai_su_co;
    }

    const reports = await prisma.phanAnh.findMany({
      where: whereClause,
      select: {
        id: true,
        tieu_de: true,
        loai_su_co: true,
        trang_thai: true,
        muc_do_nghiem_trong: true,
        vi_do: true,
        kinh_do: true,
        created_at: true,
        mo_ta: true,
        nguoi_dung_id: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 100, // Limit to 100 reports for performance
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get map reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


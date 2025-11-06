import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/citizen/reports/map - Lấy tất cả phản ánh cho hiển thị trên bản đồ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    const whereClause: any = {};

    // Filter theo trạng thái
    if (filter === "pending") {
      whereClause.trang_thai = "cho_xu_ly";
    } else if (filter === "processing") {
      whereClause.trang_thai = "dang_xu_ly";
    } else if (filter === "completed") {
      whereClause.trang_thai = "da_hoan_tat";
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
      },
      orderBy: {
        created_at: "desc",
      },
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


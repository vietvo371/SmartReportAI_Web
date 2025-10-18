import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/admin/ai-analyses - Lấy tất cả phân tích AI cho admin
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
    const label = searchParams.get("label");
    const severity = searchParams.get("severity");

    const whereClause: any = {};
    if (label) whereClause.predicted_label = label;
    if (severity) whereClause.severity = severity;

    const analyses = await prisma.aiAnalysis.findMany({
      where: whereClause,
      include: {
        nguoiDung: {
          select: {
            ho_ten: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.aiAnalysis.count({ where: whereClause });

    return NextResponse.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin AI analyses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

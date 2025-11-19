import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyToken } from "@/lib/jwt";

const STAFF_ROLE = "can_bo";

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return req.cookies.get("token")?.value ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== STAFF_ROLE) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assignedFilter: Prisma.PhanAnhWhereInput = {};
    (assignedFilter as any).can_bo = {
      is: {
        id: payload.userId,
      },
    };

    const [assignedTasks, inProgressTasks, completedTasks, pendingTasks, recentTasks, recentActivities] =
      await Promise.all([
        prisma.phanAnh.count({
          where: assignedFilter,
        }),
        prisma.phanAnh.count({
          where: {
            ...assignedFilter,
            trang_thai: "dang_xu_ly",
          },
        }),
        prisma.phanAnh.count({
          where: {
            ...assignedFilter,
            trang_thai: "da_hoan_tat",
          },
        }),
        prisma.phanAnh.count({
          where: {
            ...assignedFilter,
            trang_thai: "cho_xu_ly",
          },
        }),
        prisma.phanAnh.findMany({
          where: assignedFilter,
          select: {
            id: true,
            tieu_de: true,
            trang_thai: true,
            loai_su_co: true,
            muc_do_nghiem_trong: true,
            dia_chi: true,
            updated_at: true,
          },
          orderBy: {
            updated_at: "desc",
          },
          take: 5,
        }),
        prisma.xuLy.findMany({
          where: {
            can_bo_id: payload.userId,
          },
          include: {
            phan_anh: {
              select: {
                id: true,
                tieu_de: true,
              },
            },
          },
          orderBy: {
            thoi_gian: "desc",
          },
          take: 5,
        }),
      ]);

    return NextResponse.json({
      stats: {
        assignedTasks,
        inProgressTasks,
        completedTasks,
        pendingTasks,
      },
      recentTasks,
      recentActivities: recentActivities.map((activity) => ({
        id: activity.id,
        phan_anh_id: activity.phan_anh_id,
        noi_dung: activity.noi_dung,
        trang_thai_moi: activity.trang_thai_moi,
        thoi_gian: activity.thoi_gian,
        phan_anh: activity.phan_anh,
      })),
    });
  } catch (error) {
    console.error("Staff dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}



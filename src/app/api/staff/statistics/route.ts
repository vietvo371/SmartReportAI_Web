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

    const userId = payload.userId;

    const officerFilter: Prisma.PhanAnhWhereInput = {};
    (officerFilter as any).can_bo = {
      is: {
        id: userId,
      },
    };

    const [totalAssigned, inProgress, completed, pending] = await Promise.all([
      prisma.phanAnh.count({
        where: officerFilter,
      }),
      prisma.phanAnh.count({
        where: {
          ...officerFilter,
          trang_thai: "dang_xu_ly",
        },
      }),
      prisma.phanAnh.count({
        where: {
          ...officerFilter,
          trang_thai: "da_hoan_tat",
        },
      }),
      prisma.phanAnh.count({
        where: {
          ...officerFilter,
          trang_thai: "cho_xu_ly",
        },
      }),
    ]);

    const closureSamples = await prisma.phanAnh.findMany({
      where: {
        ...officerFilter,
        trang_thai: "da_hoan_tat",
      },
      select: {
        created_at: true,
        updated_at: true,
      },
    });

    const avgHandleHours =
      closureSamples.length > 0
        ? Math.round(
            (closureSamples.reduce((acc, report) => {
              const diff =
                report.updated_at.getTime() - report.created_at.getTime();
              return acc + diff;
            }, 0) /
              closureSamples.length /
              (1000 * 60 * 60)) *
              10,
          ) / 10
        : null;

    const responseLogs = await prisma.xuLy.findMany({
      where: {
        can_bo_id: userId,
      },
      select: {
        phan_anh_id: true,
        thoi_gian: true,
        phan_anh: {
          select: {
            created_at: true,
          },
        },
      },
      orderBy: {
        thoi_gian: "asc",
      },
    });

    const seenReports = new Set<number>();
    const responseDurations: number[] = [];
    for (const log of responseLogs) {
      if (seenReports.has(log.phan_anh_id)) continue;
      seenReports.add(log.phan_anh_id);
      if (!log.phan_anh) continue;
      responseDurations.push(
        log.thoi_gian.getTime() - log.phan_anh.created_at.getTime(),
      );
    }

    const avgResponseMinutes =
      responseDurations.length > 0
        ? Math.round(
            (responseDurations.reduce((acc, curr) => acc + curr, 0) /
              responseDurations.length /
              (1000 * 60)) *
              10,
          ) / 10
        : null;

    const ratingAggregate = await prisma.lichSuDanhGia.aggregate({
      _avg: { diem: true },
      where: {
        phan_anh: {
          is: officerFilter,
        },
      },
    });

    const recentRatings = await prisma.lichSuDanhGia.findMany({
      where: {
        phan_anh: {
          is: officerFilter,
        },
      },
      select: {
        id: true,
        diem: true,
        nhan_xet: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 5,
    });

    const last30DaysReports = await prisma.phanAnh.findMany({
      where: {
        ...officerFilter,
        updated_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        trang_thai: true,
        updated_at: true,
      },
    });

    const weeklyBuckets: Record<string, { completed: number; inProgress: number }> = {};
    for (const report of last30DaysReports) {
      const weekKey = new Date(
        report.updated_at.getFullYear(),
        report.updated_at.getMonth(),
        report.updated_at.getDate() - report.updated_at.getDay(),
      )
        .toISOString()
        .slice(0, 10);

      if (!weeklyBuckets[weekKey]) {
        weeklyBuckets[weekKey] = { completed: 0, inProgress: 0 };
      }

      if (report.trang_thai === "da_hoan_tat") {
        weeklyBuckets[weekKey].completed += 1;
      } else if (report.trang_thai === "dang_xu_ly") {
        weeklyBuckets[weekKey].inProgress += 1;
      }
    }

    const trend = Object.entries(weeklyBuckets)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([label, value]) => ({
        label,
        ...value,
      }));

    return NextResponse.json({
      summary: {
        totalAssigned,
        inProgress,
        completed,
        pending,
        avgHandleHours,
        avgResponseMinutes,
        averageRating: ratingAggregate._avg?.diem ?? null,
      },
      trend,
      recentRatings,
    });
  } catch (error) {
    console.error("Staff statistics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}



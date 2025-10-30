import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/admin/statistics - Thống kê tổng quan
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
    const loaiSuCo = searchParams.get("loai_su_co");
    const thoiGianBatDau = searchParams.get("thoi_gian_bat_dau");
    const thoiGianKetThuc = searchParams.get("thoi_gian_ket_thuc");
    const windowDaysRaw = searchParams.get("window_days");
    const windowDays = Math.min(Math.max(parseInt(windowDaysRaw || "30"), 1), 180);

    // Xây dựng filter
    const whereClause: any = {};
    
    if (loaiSuCo) {
      whereClause.loai_su_co = loaiSuCo;
    }
    
    if (thoiGianBatDau && thoiGianKetThuc) {
      whereClause.created_at = {
        gte: new Date(thoiGianBatDau),
        lte: new Date(thoiGianKetThuc),
      };
    }

    // Thống kê theo trạng thái
    const statusStats = await prisma.phanAnh.groupBy({
      by: ["trang_thai"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Thống kê theo loại sự cố
    const typeStats = await prisma.phanAnh.groupBy({
      by: ["loai_su_co"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Thống kê theo khu vực (xấp xỉ theo lưới tọa độ 0.02 độ)
    const recentForLocation = await prisma.phanAnh.findMany({
      where: whereClause,
      select: { vi_do: true, kinh_do: true },
      orderBy: { created_at: "desc" },
      take: 500,
    });
    const bucket = new Map<string, number>();
    for (const r of recentForLocation) {
      if (typeof r.vi_do !== "number" || typeof r.kinh_do !== "number") continue;
      const lat = Math.round(r.vi_do / 0.02) * 0.02;
      const lng = Math.round(r.kinh_do / 0.02) * 0.02;
      const key = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
      bucket.set(key, (bucket.get(key) || 0) + 1);
    }
    const locationStats = Array.from(bucket.entries())
      .map(([vi_tri, count]) => ({ vi_tri, _count: { id: count } }))
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10);

    // Thời gian xử lý trung bình (ms) từ created_at -> bản ghi XuLy có trang_thai_moi = 'da_hoan_tat'
    const completedReports = await prisma.phanAnh.findMany({
      where: {
        ...whereClause,
        trang_thai: "da_hoan_tat",
      },
      select: {
        created_at: true,
        xu_lys: {
          where: { trang_thai_moi: "da_hoan_tat" },
          select: { thoi_gian: true },
          orderBy: { thoi_gian: "asc" },
          take: 1,
        },
      },
      take: 200,
    });
    let avgProcessingTimeMs: number | null = null;
    if (completedReports.length > 0) {
      const diffs = completedReports
        .map(r => r.xu_lys[0]?.thoi_gian ? (new Date(r.xu_lys[0].thoi_gian).getTime() - new Date(r.created_at).getTime()) : null)
        .filter((x): x is number => typeof x === "number" && isFinite(x));
      if (diffs.length > 0) {
        avgProcessingTimeMs = Math.round(diffs.reduce((s, x) => s + x, 0) / diffs.length);
      }
    }

    // Tổng số phản ánh
    const totalReports = await prisma.phanAnh.count({
      where: whereClause,
    });

    // Time series theo ngày (đếm số phản ánh tạo mới)
    const toDate = thoiGianKetThuc ? new Date(thoiGianKetThuc) : new Date();
    const fromDate = thoiGianBatDau ? new Date(thoiGianBatDau) : new Date(toDate.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const recent = await prisma.phanAnh.findMany({
      where: {
        ...whereClause,
        created_at: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: { created_at: true },
      orderBy: { created_at: "asc" },
      take: 5000,
    });
    const seriesMap = new Map<string, number>();
    // Khởi tạo đủ ngày trong khoảng
    for (let d = new Date(fromDate); d <= toDate; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
      const key = d.toISOString().slice(0, 10);
      seriesMap.set(key, 0);
    }
    for (const r of recent) {
      const key = new Date(r.created_at).toISOString().slice(0, 10);
      seriesMap.set(key, (seriesMap.get(key) || 0) + 1);
    }
    const timeSeries = Array.from(seriesMap.entries()).map(([date, count]) => ({ date, count }));

    // Tổng số người dùng
    const totalUsers = await prisma.nguoiDung.count();

    // Tổng số cán bộ
    const totalStaff = await prisma.nguoiDung.count({
      where: {
        vai_tro: "can_bo",
      },
    });

    return NextResponse.json({
      statistics: {
        totalReports,
        totalUsers,
        totalStaff,
        statusStats,
        typeStats,
        locationStats,
        avgProcessingTime: avgProcessingTimeMs,
        timeSeries,
      },
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const khuVuc = searchParams.get("khu_vuc");
    const loaiSuCo = searchParams.get("loai_su_co");
    const thoiGianBatDau = searchParams.get("thoi_gian_bat_dau");
    const thoiGianKetThuc = searchParams.get("thoi_gian_ket_thuc");

    // Xây dựng filter
    const whereClause: any = {};
    
    if (khuVuc) {
      whereClause.vi_tri = {
        contains: khuVuc,
        mode: "insensitive",
      };
    }
    
    if (loaiSuCo) {
      whereClause.loai_su_co = loaiSuCo;
    }
    
    if (thoiGianBatDau && thoiGianKetThuc) {
      whereClause.thoi_gian_tao = {
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

    // Thống kê theo khu vực
    const locationStats = await prisma.phanAnh.groupBy({
      by: ["vi_tri"],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Thống kê thời gian xử lý trung bình
    const avgProcessingTime = await prisma.xuLy.aggregate({
      where: {
        phanAnh: whereClause,
        trang_thai: "completed",
      },
      _avg: {
        thoi_gian_hoan_thanh: true,
      },
    });

    // Tổng số phản ánh
    const totalReports = await prisma.phanAnh.count({
      where: whereClause,
    });

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
        avgProcessingTime: avgProcessingTime._avg.thoi_gian_hoan_thanh,
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

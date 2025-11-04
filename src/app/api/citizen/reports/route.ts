import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/citizen/reports - Lấy danh sách phản ánh của người dân
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== "nguoi_dan") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await prisma.phanAnh.findMany({
      where: {
        nguoi_dung_id: payload.userId,
      },
      include: {
        xuLy: {
          include: {
            nguoiDung: {
              select: {
                ho_ten: true,
                email: true,
              },
            },
          },
        },
        blockchainLog: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get citizen reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/citizen/reports - Tạo phản ánh mới
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== "nguoi_dan") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      loai_su_co,
      mo_ta,
      vi_tri,
      toa_do_lat,
      toa_do_lng,
      hinh_anh_url,
      muc_do_uu_tien = "medium",
    } = body;

    // Tạo phản ánh mới
    const report = await prisma.phanAnh.create({
      data: {
        nguoi_dung_id: payload.userId,
        loai_su_co,
        mo_ta,
        vi_tri,
        toa_do_lat: parseFloat(toa_do_lat),
        toa_do_lng: parseFloat(toa_do_lng),
        hinh_anh_url,
        muc_do_uu_tien,
        trang_thai: "pending",
      },
    });

    // TODO: Gọi AI Service để phân loại sự cố
    // TODO: Ghi log lên blockchain

    return NextResponse.json({
      message: "Phản ánh đã được gửi thành công",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

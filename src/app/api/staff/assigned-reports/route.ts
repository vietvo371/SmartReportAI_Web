import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/staff/assigned-reports - Lấy danh sách phản ánh được giao
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== "can_bo") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await prisma.phanAnh.findMany({
      where: {
        xuLy: {
          some: {
            nguoi_dung_id: payload.userId,
          },
        },
      },
      include: {
        nguoiDung: {
          select: {
            ho_ten: true,
            email: true,
            so_dien_thoai: true,
          },
        },
        xuLy: {
          where: {
            nguoi_dung_id: payload.userId,
          },
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
        thoi_gian_tao: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get assigned reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/staff/assigned-reports/[id] - Cập nhật trạng thái xử lý
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== "can_bo") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      reportId,
      trang_thai,
      hinh_anh_minh_chung,
      phan_hoi,
    } = body;

    // Cập nhật trạng thái phản ánh
    const updatedReport = await prisma.phanAnh.update({
      where: {
        id: reportId,
      },
      data: {
        trang_thai,
      },
    });

    // Cập nhật hoặc tạo bản ghi xử lý
    const processing = await prisma.xuLy.upsert({
      where: {
        phan_anh_id_nguoi_dung_id: {
          phan_anh_id: reportId,
          nguoi_dung_id: payload.userId,
        },
      },
      update: {
        trang_thai,
        hinh_anh_minh_chung,
        phan_hoi,
        thoi_gian_cap_nhat: new Date(),
      },
      create: {
        phan_anh_id: reportId,
        nguoi_dung_id: payload.userId,
        trang_thai,
        hinh_anh_minh_chung,
        phan_hoi,
        thoi_gian_bat_dau: new Date(),
        thoi_gian_cap_nhat: new Date(),
      },
    });

    // TODO: Ghi log lên blockchain
    // TODO: Gửi thông báo cho người dân

    return NextResponse.json({
      message: "Cập nhật trạng thái thành công",
      report: updatedReport,
      processing,
    });
  } catch (error) {
    console.error("Update report status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

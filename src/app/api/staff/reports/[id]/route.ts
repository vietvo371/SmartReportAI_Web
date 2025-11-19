import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const STAFF_ROLE = "can_bo";

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// GET /api/staff/reports/[id] - Lấy chi tiết phản ánh
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== STAFF_ROLE) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
    }

    const report = await prisma.phanAnh.findUnique({
      where: { id: reportId },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true,
            email: true,
            so_dien_thoai: true,
            dia_chi: true,
          },
        },
        can_bo: {
          select: {
            id: true,
            ho_ten: true,
            email: true,
          },
        },
        xu_lys: {
          orderBy: { thoi_gian: "desc" },
          include: {
            can_bo: {
              select: {
                ho_ten: true,
                email: true,
              },
            },
          },
        },
        lich_su_danh_gias: {
          orderBy: { created_at: "desc" },
          include: {
            nguoi_dung: {
              select: {
                ho_ten: true,
              },
            },
          },
        },
        blockchain_logs: {
          orderBy: { thoi_gian: "desc" },
          take: 5,
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Kiểm tra xem staff có quyền xem report này không
    // Staff chỉ có thể xem report được giao cho mình hoặc report chưa được giao
    if (report.can_bo_id && report.can_bo_id !== payload.userId) {
      return NextResponse.json(
        { error: "You don't have permission to view this report" },
        { status: 403 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Get report detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/staff/reports/[id] - Cập nhật trạng thái + thêm ghi chú xử lý
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== STAFF_ROLE) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
    }

    const body = await req.json();
    const { trang_thai, noi_dung, hinh_anh_minh_chung } = body;

    if (!trang_thai) {
      return NextResponse.json(
        { error: "Trạng thái là bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra quyền sở hữu
    const existingReport = await prisma.phanAnh.findUnique({
      where: { id: reportId },
      select: { can_bo_id: true, trang_thai: true },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (existingReport.can_bo_id !== payload.userId) {
      return NextResponse.json(
        { error: "Bạn không có quyền cập nhật nhiệm vụ này" },
        { status: 403 }
      );
    }

    // Cập nhật trạng thái phản ánh
    const updatedReport = await prisma.phanAnh.update({
      where: { id: reportId },
      data: {
        trang_thai,
        updated_at: new Date(),
      },
    });

    // Tạo bản ghi xử lý
    const xuLy = await prisma.xuLy.create({
      data: {
        phan_anh_id: reportId,
        can_bo_id: payload.userId,
        trang_thai_moi: trang_thai,
        noi_dung,
        hinh_anh_minh_chung,
      },
    });

    // Tạo thông báo cho người dân
    if (existingReport.trang_thai !== trang_thai) {
      const report = await prisma.phanAnh.findUnique({
        where: { id: reportId },
        select: { nguoi_dung_id: true, tieu_de: true },
      });

      if (report) {
        const statusText =
          trang_thai === "dang_xu_ly"
            ? "đang được xử lý"
            : trang_thai === "da_hoan_tat"
            ? "đã hoàn thành"
            : "chờ xử lý";

        await prisma.thongBao.create({
          data: {
            nguoi_dung_id: report.nguoi_dung_id,
            tieu_de: `Cập nhật trạng thái: ${report.tieu_de}`,
            noi_dung: `Phản ánh của bạn ${statusText}${noi_dung ? `: ${noi_dung}` : "."}`,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Cập nhật thành công",
      report: updatedReport,
      xuLy,
    });
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


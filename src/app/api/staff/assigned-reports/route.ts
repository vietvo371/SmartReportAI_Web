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

// GET /api/staff/assigned-reports - Lấy danh sách phản ánh theo phạm vi
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

    const scope = req.nextUrl.searchParams.get("scope") ?? "mine";

    const whereClause: Prisma.PhanAnhWhereInput = {};
    if (scope === "available") {
      (whereClause as any).can_bo_id = null;
      whereClause.trang_thai = {
        not: "da_hoan_tat",
      };
    } else if (scope === "mine") {
      (whereClause as any).can_bo_id = payload.userId;
    }

    const reports = await prisma.phanAnh.findMany({
      where: whereClause,
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
            so_dien_thoai: true,
          },
        },
        xu_lys: {
          where: {
            can_bo_id: payload.userId,
          },
          include: {
            can_bo: {
              select: {
                ho_ten: true,
                email: true,
              },
            },
          },
          orderBy: {
            thoi_gian: "desc",
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    const normalized = reports.map((report) => {
      const latestUpdate = report.xu_lys[0] ?? null;

      return {
        id: report.id,
        tieu_de: report.tieu_de,
        mo_ta: report.mo_ta,
        loai_su_co: report.loai_su_co,
        trang_thai: report.trang_thai,
        muc_do_nghiem_trong: report.muc_do_nghiem_trong,
        dia_chi: report.dia_chi,
        created_at: report.created_at,
        updated_at: report.updated_at,
        nguoi_dan: report.nguoi_dung
          ? {
              ho_ten: report.nguoi_dung.ho_ten,
              email: report.nguoi_dung.email,
              so_dien_thoai: report.nguoi_dung.so_dien_thoai,
            }
          : null,
        latestUpdate: latestUpdate
          ? {
              id: latestUpdate.id,
              trang_thai_moi: latestUpdate.trang_thai_moi,
              noi_dung: latestUpdate.noi_dung,
              hinh_anh_minh_chung: latestUpdate.hinh_anh_minh_chung,
              thoi_gian: latestUpdate.thoi_gian,
              can_bo: latestUpdate.can_bo
                ? {
                    ho_ten: latestUpdate.can_bo.ho_ten,
                    email: latestUpdate.can_bo.email,
                  }
                : null,
            }
          : null,
      };
    });

    return NextResponse.json({ reports: normalized });
  } catch (error) {
    console.error("Get assigned reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/staff/assigned-reports/[id] - Cập nhật trạng thái xử lý
export async function PUT(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== STAFF_ROLE) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      reportId,
      trang_thai,
      hinh_anh_minh_chung,
      noi_dung,
    } = body;

    const updatedReport = await prisma.phanAnh.update({
      where: {
        id: reportId,
      },
      data: {
        trang_thai,
      },
    });

    const processing = await prisma.xuLy.create({
      data: {
        phan_anh_id: reportId,
        can_bo_id: payload.userId,
        trang_thai: trang_thai,
        trang_thai_moi: trang_thai,
        noi_dung,
        hinh_anh_minh_chung,
      },
      include: {
        can_bo: {
          select: {
            ho_ten: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Cập nhật trạng thái thành công",
      report: updatedReport,
      processing,
    });
  } catch (error) {
    console.error("Update report status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/staff/assigned-reports - Claim/Release nhiệm vụ
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== STAFF_ROLE) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, action } = body;

    if (!reportId || !["claim", "release"].includes(action)) {
      return NextResponse.json(
        { error: "Thiếu thông tin hoặc hành động không hợp lệ" },
        { status: 400 },
      );
    }

    const report = await prisma.phanAnh.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Không tìm thấy nhiệm vụ" }, { status: 404 });
    }

    if (action === "claim") {
      const currentOfficerId = (report as any).can_bo_id as number | null;
      if (currentOfficerId && currentOfficerId !== payload.userId) {
        return NextResponse.json(
          { error: "Nhiệm vụ đã được gán cho cán bộ khác" },
          { status: 409 },
        );
      }

      const updated = await prisma.phanAnh.update({
        where: { id: reportId },
        data: {
          can_bo_id: payload.userId,
          trang_thai: report.trang_thai === "cho_xu_ly" ? "dang_xu_ly" : report.trang_thai,
        } as any,
      });

      await prisma.xuLy.create({
        data: {
          phan_anh_id: reportId,
          can_bo_id: payload.userId,
          trang_thai: updated.trang_thai,
          trang_thai_moi: updated.trang_thai,
          noi_dung: "Cán bộ đã nhận nhiệm vụ",
        },
      });

      return NextResponse.json({ message: "Nhận nhiệm vụ thành công" });
    }

    if (((report as any).can_bo_id ?? null) !== payload.userId) {
      return NextResponse.json(
        { error: "Bạn không được phép trả nhiệm vụ này" },
        { status: 403 },
      );
    }

    if (report.trang_thai === "da_hoan_tat") {
      return NextResponse.json(
        { error: "Không thể trả nhiệm vụ đã hoàn tất" },
        { status: 400 },
      );
    }

    await prisma.phanAnh.update({
      where: { id: reportId },
      data: {
        can_bo_id: null,
        trang_thai: "cho_xu_ly",
      } as any,
    });

    await prisma.xuLy.create({
      data: {
        phan_anh_id: reportId,
        can_bo_id: payload.userId,
        trang_thai: "cho_xu_ly",
        trang_thai_moi: "cho_xu_ly",
        noi_dung: "Cán bộ đã bàn giao nhiệm vụ",
      },
    });

    return NextResponse.json({ message: "Đã trả nhiệm vụ về hàng chờ" });
  } catch (error) {
    console.error("Assignment action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

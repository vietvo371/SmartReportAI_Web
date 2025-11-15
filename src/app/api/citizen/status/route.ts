import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/citizen/status - Lấy trạng thái xử lý các phản ánh của người dùng
export async function GET(req: NextRequest) {
  try {
    // Get token from header or cookies
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader?.replace('bearer ', '') || req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use userId from token
    const userId = payload.userId;

    // Lấy tất cả phản ánh của user
    const reports = await prisma.phanAnh.findMany({
      where: {
        nguoi_dung_id: userId,
      },
      select: {
        id: true,
        tieu_de: true,
        loai_su_co: true,
        trang_thai: true,
        muc_do_nghiem_trong: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (reports.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    const reportIds = reports.map((r) => r.id);

    // Lấy tất cả các xử lý (XuLy) của các phản ánh này
    const xuLys = await prisma.xuLy.findMany({
      where: {
        phan_anh_id: {
          in: reportIds,
        },
      },
      include: {
        phan_anh: {
          select: {
            tieu_de: true,
            loai_su_co: true,
            trang_thai: true,
            muc_do_nghiem_trong: true,
            created_at: true,
          },
        },
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
    });

    // Nếu có xử lý, lấy xử lý mới nhất của mỗi phản ánh
    // Nếu không có xử lý, hiển thị phản ánh với trạng thái hiện tại
    const statusMap = new Map();
    
    // Thêm các phản ánh có xử lý
    xuLys.forEach((xu_ly) => {
      if (!statusMap.has(xu_ly.phan_anh_id)) {
        statusMap.set(xu_ly.phan_anh_id, {
          id: xu_ly.id,
          phan_anh_id: xu_ly.phan_anh_id,
          tieu_de: xu_ly.phan_anh.tieu_de,
          loai_su_co: xu_ly.phan_anh.loai_su_co,
          trang_thai: xu_ly.trang_thai_moi,
          noi_dung: xu_ly.noi_dung || "Đã tiếp nhận phản ánh",
          hinh_anh_minh_chung: xu_ly.hinh_anh_minh_chung,
          can_bo_ho_ten: xu_ly.can_bo?.ho_ten || "Chưa phân công",
          can_bo_email: xu_ly.can_bo?.email || null,
          thoi_gian: xu_ly.thoi_gian,
          muc_do_nghiem_trong: xu_ly.phan_anh.muc_do_nghiem_trong,
          created_at: xu_ly.phan_anh.created_at,
        });
      }
    });

    // Thêm các phản ánh chưa có xử lý
    reports.forEach((report) => {
      if (!statusMap.has(report.id)) {
        statusMap.set(report.id, {
          id: report.id,
          phan_anh_id: report.id,
          tieu_de: report.tieu_de,
          loai_su_co: report.loai_su_co,
          trang_thai: report.trang_thai,
          noi_dung: "Phản ánh đã được tiếp nhận và đang chờ xử lý",
          hinh_anh_minh_chung: null,
          can_bo_ho_ten: "Chưa phân công",
          can_bo_email: null,
          thoi_gian: report.created_at,
          muc_do_nghiem_trong: report.muc_do_nghiem_trong,
          created_at: report.created_at,
        });
      }
    });

    const statuses = Array.from(statusMap.values()).sort((a, b) => {
      return new Date(b.thoi_gian).getTime() - new Date(a.thoi_gian).getTime();
    });

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Get citizen status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/citizen/notifications - Lấy thông báo của người dùng
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const filter = searchParams.get("filter") || "all";

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "userId không hợp lệ" },
        { status: 400 }
      );
    }

    // Người dùng chỉ có thể xem thông báo của chính mình
    if (payload.userId !== parseInt(userId) && !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const whereClause: any = {
      nguoi_dung_id: parseInt(userId),
    };

    if (filter === "unread") {
      whereClause.da_doc = false;
    } else if (filter === "read") {
      whereClause.da_doc = true;
    }

    const notifications = await prisma.thongBao.findMany({
      where: whereClause,
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Get citizen notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/citizen/notifications/{id} - Đánh dấu thông báo là đã đọc
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const notificationId = parseInt(pathParts[pathParts.length - 1]);

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID không hợp lệ" },
        { status: 400 }
      );
    }

    // Verify ownership
    const notification = await prisma.thongBao.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Thông báo không tồn tại" },
        { status: 404 }
      );
    }

    if (
      payload.userId !== notification.nguoi_dung_id &&
      !["quan_tri", "admin"].includes(payload.vai_tro)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { da_doc } = body;

    const updated = await prisma.thongBao.update({
      where: { id: notificationId },
      data: { da_doc },
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error("Patch notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/citizen/notifications/mark-all-read - Đánh dấu tất cả là đã đọc
export async function PATCH_ALL(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "userId không hợp lệ" },
        { status: 400 }
      );
    }

    // Chỉ được cập nhật thông báo của chính mình
    if (payload.userId !== userId && !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.thongBao.updateMany({
      where: {
        nguoi_dung_id: userId,
        da_doc: false,
      },
      data: {
        da_doc: true,
      },
    });

    return NextResponse.json({
      message: "Đánh dấu tất cả là đã đọc",
      count: updated.count,
    });
  } catch (error) {
    console.error("Patch all notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


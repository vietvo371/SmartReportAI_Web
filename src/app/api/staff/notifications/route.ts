import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;

    const notifications = await prisma.thongBao.findMany({
      where: {
        nguoi_dung_id: payload.userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Staff notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const ids: number[] = body.ids;
    const read: boolean = body.read ?? true;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu danh sách thông báo cần cập nhật" },
        { status: 400 },
      );
    }

    await prisma.thongBao.updateMany({
      where: {
        id: { in: ids },
        nguoi_dung_id: payload.userId,
      },
      data: {
        da_doc: read,
      },
    });

    return NextResponse.json({ message: "Đã cập nhật trạng thái thông báo" });
  } catch (error) {
    console.error("Update staff notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}



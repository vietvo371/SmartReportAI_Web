import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/admin/users?role=nguoi_dan|can_bo|quan_tri
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;

    const users = await prisma.nguoiDung.findMany({
      where: role ? { vai_tro: role } : undefined,
      select: {
        id: true,
        ho_ten: true,
        email: true,
        vai_tro: true,
        so_dien_thoai: true,
        dia_chi: true,
        avatar_url: true,
        skills: true,
        current_workload: true,
        ai_performance_score: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 500,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { ho_ten, email, mat_khau, so_dien_thoai, dia_chi, vai_tro } = body;

    // Validate required fields
    if (!ho_ten || !email || !mat_khau || !vai_tro) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only allow creating can_bo or nguoi_dan
    if (!["can_bo", "nguoi_dan"].includes(vai_tro)) {
      return NextResponse.json(
        { error: "Invalid role. Only can_bo and nguoi_dan are allowed" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.nguoiDung.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const { hashPassword } = await import("@/lib/auth");
    const hashedPassword = await hashPassword(mat_khau);

    // Create user
    const newUser = await prisma.nguoiDung.create({
      data: {
        ho_ten,
        email,
        mat_khau: hashedPassword,
        so_dien_thoai: so_dien_thoai || null,
        dia_chi: dia_chi || null,
        vai_tro,
      },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        vai_tro: true,
        so_dien_thoai: true,
        dia_chi: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



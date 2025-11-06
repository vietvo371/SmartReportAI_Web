import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

// PUT /api/users/{id} - Update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    
    // Users can only update their own profile
    if (payload.id !== userId && payload.vai_tro !== "quan_tri") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ho_ten, so_dien_thoai } = await req.json();

    // Validation
    if (!ho_ten || ho_ten.trim().length < 2) {
      return NextResponse.json(
        { error: "Họ và tên phải có ít nhất 2 ký tự" },
        { status: 400 }
      );
    }

    if (so_dien_thoai && so_dien_thoai.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(so_dien_thoai.trim())) {
        return NextResponse.json(
          { error: "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        ho_ten: ho_ten.trim(),
        so_dien_thoai: so_dien_thoai ? so_dien_thoai.trim() : null,
      },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        so_dien_thoai: true,
        vai_tro: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


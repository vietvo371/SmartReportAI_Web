import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token không được cung cấp" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    
    // Delete token from database
    await prisma.token.deleteMany({
      where: {
        nguoi_dung_id: decoded.userId,
        token: token,
      },
    });

    return NextResponse.json({
      message: "Đăng xuất thành công",
    });

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

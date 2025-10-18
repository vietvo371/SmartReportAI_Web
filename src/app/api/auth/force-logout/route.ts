import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Clear all tokens from database
    await prisma.token.deleteMany();
    
    console.log("🗑️ Force logout - cleared all tokens");
    
    // Create response with cleared cookie
    const response = NextResponse.json({
      message: "Đã đăng xuất tất cả phiên",
      success: true
    });
    
    // Clear the token cookie
    response.cookies.set('token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;

  } catch (error) {
    console.error("Force logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Clear all tokens from database
    await prisma.token.deleteMany();
    
    console.log("🗑️ Cleared all tokens from database");
    
    return NextResponse.json({
      message: "Đã xóa tất cả token cũ",
      success: true
    });

  } catch (error) {
    console.error("Clear tokens error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

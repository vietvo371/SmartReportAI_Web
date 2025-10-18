import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, mat_khau, ho_ten, so_dien_thoai, vai_tro, dia_chi } = body;

    if (action === "login") {
      // Login logic
      const user = await prisma.nguoiDung.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không đúng" },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(mat_khau, user.mat_khau);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Email hoặc mật khẩu không đúng" },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = await signToken({
        userId: user.id,
        email: user.email,
        vai_tro: user.vai_tro,
      });

      // Save token to database
      await prisma.token.create({
        data: {
          nguoi_dung_id: user.id,
          token: token,
          loai_token: "access_token",
          het_han: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      const response = NextResponse.json({
        message: "Đăng nhập thành công",
        user: {
          id: user.id,
          email: user.email,
          ho_ten: user.ho_ten,
          so_dien_thoai: user.so_dien_thoai,
          vai_tro: user.vai_tro,
          dia_chi: user.dia_chi,
          avatar_url: user.avatar_url,
        },
        token,
      });

      // Set token cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;

    } else if (action === "register") {
      // Check if user exists
      const existingUser = await prisma.nguoiDung.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(mat_khau, 10);

      // Create user
      const user = await prisma.nguoiDung.create({
        data: {
          email,
          mat_khau: hashedPassword,
          ho_ten,
          so_dien_thoai,
          vai_tro: vai_tro || "nguoi_dan", // Default role
          dia_chi,
        },
      });

      // Generate JWT token
      const token = await signToken({
        userId: user.id,
        email: user.email,
        vai_tro: user.vai_tro,
      });

      // Save token to database
      await prisma.token.create({
        data: {
          nguoi_dung_id: user.id,
          token: token,
          loai_token: "access_token",
          het_han: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      const response = NextResponse.json({
        message: "Đăng ký thành công",
        user: {
          id: user.id,
          email: user.email,
          ho_ten: user.ho_ten,
          so_dien_thoai: user.so_dien_thoai,
          vai_tro: user.vai_tro,
          dia_chi: user.dia_chi,
          avatar_url: user.avatar_url,
        },
        token,
      });

      // Set token cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
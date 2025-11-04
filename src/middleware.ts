import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const isPublicRoute = pathname === "/" || pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if token exists and is valid
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Clear invalid token cookie
    const response = pathname.startsWith("/api/") 
      ? NextResponse.json({ error: "Invalid token" }, { status: 401 })
      : NextResponse.redirect(new URL("/", request.url));
    
    response.cookies.set('token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }

  // Role-based access control based on SmartReportAI actors
  const userRole = payload.vai_tro;

  // Quản Trị Viên (quan_tri) - Full admin access
  if (pathname.startsWith("/admin")) {
    console.log("Admin route accessed by role:", userRole);
    if (userRole !== "quan_tri") {
      console.log("Redirecting non-admin user away from admin route");
      return NextResponse.redirect(
        new URL(
          userRole === "can_bo"
            ? "/staff/dashboard"
            : "/citizen/dashboard",
          request.url,
        ),
      );
    }
    console.log("Admin access granted");
  }

  // Cán Bộ Xử Lý (can_bo) - Staff processing access
  if (pathname.startsWith("/staff")) {
    if (userRole !== "can_bo") {
      return NextResponse.redirect(
        new URL(
          userRole === "quan_tri" 
            ? "/admin/dashboard" 
            : "/citizen/dashboard",
          request.url,
        ),
      );
    }
  }

  // Người Dân (nguoi_dan) - Citizen access
  if (pathname.startsWith("/citizen")) {
    if (userRole !== "nguoi_dan") {
      return NextResponse.redirect(
        new URL(
          userRole === "quan_tri"
            ? "/admin/dashboard"
            : "/staff/dashboard",
          request.url,
        ),
      );
    }
  }

  // API routes access control
  if (pathname.startsWith("/api/")) {
    // AI Service API - accessible by all authenticated users
    if (pathname.startsWith("/api/ai")) {
      // Allow all authenticated users to use AI service
      return NextResponse.next();
    }
    
    // Blockchain API - accessible by all authenticated users
    if (pathname.startsWith("/api/blockchain")) {
      // Allow all authenticated users to interact with blockchain
      return NextResponse.next();
    }
    
    // Admin-only APIs
    if (pathname.startsWith("/api/admin") && userRole !== "quan_tri") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Staff-only APIs
    if (pathname.startsWith("/api/staff") && userRole !== "can_bo") {
      return NextResponse.json({ error: "Staff access required" }, { status: 403 });
    }
    
    // Citizen-only APIs
    if (pathname.startsWith("/api/citizen") && userRole !== "nguoi_dan") {
      return NextResponse.json({ error: "Citizen access required" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/staff/:path*",
    "/citizen/:path*",
  ],
};


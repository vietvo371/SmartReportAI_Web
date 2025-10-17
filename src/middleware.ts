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
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role-based access control
  const userRole = payload.role;

  // Admin routes - only for quan_tri
  if (pathname.startsWith("/admin") && userRole !== "quan_tri") {
    return NextResponse.redirect(
      new URL(
        userRole === "can_bo"
          ? "/staff/dashboard"
          : "/citizen/dashboard",
        request.url,
      ),
    );
  }

  // Staff routes - only for can_bo
  if (pathname.startsWith("/staff") && userRole !== "can_bo") {
    return NextResponse.redirect(
      new URL(
        userRole === "quan_tri" ? "/admin/dashboard" : "/citizen/dashboard",
        request.url,
      ),
    );
  }

  // Citizen routes - only for nguoi_dan
  if (pathname.startsWith("/citizen") && userRole !== "nguoi_dan") {
    return NextResponse.redirect(
      new URL(
        userRole === "quan_tri"
          ? "/admin/dashboard"
          : "/staff/dashboard",
        request.url,
      ),
    );
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


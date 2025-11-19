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

    const uploads = await prisma.xuLy.findMany({
      where: {
        can_bo_id: payload.userId,
        NOT: {
          hinh_anh_minh_chung: null,
        },
      },
      select: {
        id: true,
        phan_anh_id: true,
        noi_dung: true,
        trang_thai_moi: true,
        hinh_anh_minh_chung: true,
        thoi_gian: true,
        phan_anh: {
          select: {
            tieu_de: true,
          },
        },
      },
      orderBy: {
        thoi_gian: "desc",
      },
      take: 10,
    });

    const normalized = uploads.map((entry) => ({
      id: entry.id,
      report: {
        id: entry.phan_anh_id,
        title: entry.phan_anh?.tieu_de ?? `Phản ánh #${entry.phan_anh_id}`,
      },
      description: entry.noi_dung,
      status: entry.trang_thai_moi,
      files: entry.hinh_anh_minh_chung
        ? (() => {
            try {
              const parsed = JSON.parse(entry.hinh_anh_minh_chung);
              return Array.isArray(parsed) ? parsed : [entry.hinh_anh_minh_chung];
            } catch {
              return [entry.hinh_anh_minh_chung];
            }
          })()
        : [],
      timestamp: entry.thoi_gian,
    }));

    return NextResponse.json({ uploads: normalized });
  } catch (error) {
    console.error("Staff evidence GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== STAFF_ROLE) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Handle FormData (from inline modal)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      const reportId = parseInt(form.get("reportId") as string);
      const noiDung = form.get("noiDung") as string | null;
      const trangThai = form.get("trangThai") as string | null;

      if (!file || !reportId || isNaN(reportId)) {
        return NextResponse.json(
          { error: "Thiếu file hoặc thông tin nhiệm vụ" },
          { status: 400 },
        );
      }

      // Check report ownership
      const report = await prisma.phanAnh.findUnique({
        where: { id: reportId },
        select: { can_bo_id: true, trang_thai: true },
      });

      if (!report) {
        return NextResponse.json({ error: "Không tìm thấy nhiệm vụ" }, { status: 404 });
      }
      if (report.can_bo_id !== payload.userId) {
        return NextResponse.json(
          { error: "Bạn không được phép cập nhật minh chứng cho nhiệm vụ này" },
          { status: 403 },
        );
      }

      // Upload file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = (file.type && file.type.split("/")[1]) || "jpg";
      const base = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, base);
      await writeFile(filePath, buffer);

      const urlPath = `/uploads/reports/${base}`;

      // Determine final status
      const finalStatus = trangThai || report.trang_thai;

      // Create XuLy record
      const created = await prisma.xuLy.create({
        data: {
          phan_anh_id: reportId,
          can_bo_id: payload.userId,
          trang_thai_moi: finalStatus,
          noi_dung: noiDung,
          hinh_anh_minh_chung: urlPath,
        },
      });

      // Update report status if changed
      if (trangThai && trangThai !== report.trang_thai) {
        await prisma.phanAnh.update({
          where: { id: reportId },
          data: {
            trang_thai: finalStatus,
            updated_at: new Date(),
          },
        });
      } else {
        await prisma.phanAnh.update({
          where: { id: reportId },
          data: {
            updated_at: new Date(),
          },
        });
      }

      return NextResponse.json({
        message: "Đã lưu minh chứng thành công",
        upload: {
          id: created.id,
          reportId,
          description: noiDung,
          file: urlPath,
          timestamp: created.thoi_gian,
        },
        url: urlPath,
      });
    }

    // Handle JSON (from upload-evidence page with pre-uploaded URLs)
    const body = await req.json();
    const { reportId, description, files } = body;

    if (!reportId || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Thiếu thông tin nhiệm vụ hoặc tệp đã tải lên" },
        { status: 400 },
      );
    }

    const report = await prisma.phanAnh.findUnique({
      where: { id: reportId },
      select: { can_bo_id: true, trang_thai: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Không tìm thấy nhiệm vụ" }, { status: 404 });
    }
    if (report.can_bo_id !== payload.userId) {
      return NextResponse.json(
        { error: "Bạn không được phép cập nhật minh chứng cho nhiệm vụ này" },
        { status: 403 },
      );
    }

    const created = await prisma.xuLy.create({
      data: {
        phan_anh_id: reportId,
        can_bo_id: payload.userId,
        trang_thai_moi: report.trang_thai,
        noi_dung: description,
        hinh_anh_minh_chung: JSON.stringify(files),
      },
    });

    await prisma.phanAnh.update({
      where: { id: reportId },
      data: {
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Đã lưu minh chứng",
      upload: {
        id: created.id,
        reportId,
        description,
        files,
        timestamp: created.thoi_gian,
      },
    });
  } catch (error) {
    console.error("Staff evidence POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}



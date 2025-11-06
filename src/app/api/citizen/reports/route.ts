import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/citizen/reports - Lấy phản ánh của người dùng
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "userId không hợp lệ" },
        { status: 400 }
      );
    }

    // Người dùng chỉ có thể xem phản ánh của chính mình
    if (payload.userId !== parseInt(userId) && !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await prisma.phanAnh.findMany({
      where: {
        nguoi_dung_id: parseInt(userId),
      },
      include: {
        xu_lys: {
          include: {
            can_bo: {
              select: {
                ho_ten: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get citizen reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/citizen/reports - Người dân submit phản ánh
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Người dùng chỉ có thể submit phản ánh cho chính mình
    const contentType = req.headers.get("content-type") || "";
    let nguoi_dung_id: number;
    let tieu_de: string;
    let mo_ta: string | null | undefined;
    let loai_su_co: string;
    let vi_do: number;
    let kinh_do: number;
    let dia_chi: string | null | undefined;
    let hinh_anh_url: string | null | undefined;
    let muc_do_nghiem_trong: number = 3;
    const trang_thai = "cho_xu_ly";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      nguoi_dung_id = Number(form.get("nguoi_dung_id"));
      tieu_de = String(form.get("tieu_de") || "");
      mo_ta = (form.get("mo_ta") as string) || null;
      loai_su_co = String(form.get("loai_su_co") || "");
      vi_do = Number(form.get("vi_do"));
      kinh_do = Number(form.get("kinh_do"));
      dia_chi = (form.get("dia_chi") as string) || null;
      muc_do_nghiem_trong = Number(form.get("muc_do_nghiem_trong") || 3);
      const file = form.get("file") as File | null;
      const urlInput = (form.get("hinh_anh_url") as string) || "";

      if (file) {
        const { writeFile, mkdir } = await import("fs/promises");
        const path = (await import("path")).default;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = (file.type && file.type.split("/")[1]) || "jpg";
        const base = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, base);
        await writeFile(filePath, buffer);
        hinh_anh_url = `/uploads/reports/${base}`;
      } else if (urlInput) {
        hinh_anh_url = urlInput;
      } else {
        hinh_anh_url = null;
      }
    } else {
      const body = await req.json();
      nguoi_dung_id = body.nguoi_dung_id;
      tieu_de = body.tieu_de;
      mo_ta = body.mo_ta;
      loai_su_co = body.loai_su_co;
      vi_do = body.vi_do;
      kinh_do = body.kinh_do;
      dia_chi = body.dia_chi;
      hinh_anh_url = body.hinh_anh_url;
      muc_do_nghiem_trong = body.muc_do_nghiem_trong ?? 3;
    }

    // Validate: người dùng chỉ có thể submit cho chính mình
    if (payload.userId !== nguoi_dung_id) {
      return NextResponse.json(
        { error: "Bạn chỉ có thể submit phản ánh cho chính mình" },
        { status: 403 }
      );
    }

    // Validation
    if (!tieu_de || !tieu_de.trim()) {
      return NextResponse.json(
        { error: "Tiêu đề không được để trống" },
        { status: 400 }
      );
    }

    if (tieu_de.trim().length < 5) {
      return NextResponse.json(
        { error: "Tiêu đề phải có ít nhất 5 ký tự" },
        { status: 400 }
      );
    }

    if (!mo_ta || !mo_ta.trim()) {
      return NextResponse.json(
        { error: "Mô tả không được để trống" },
        { status: 400 }
      );
    }

    if (mo_ta.trim().length < 10) {
      return NextResponse.json(
        { error: "Mô tả phải có ít nhất 10 ký tự" },
        { status: 400 }
      );
    }

    if (!loai_su_co) {
      return NextResponse.json(
        { error: "Loại sự cố không được để trống" },
        { status: 400 }
      );
    }

    if (typeof vi_do !== "number" || typeof kinh_do !== "number") {
      return NextResponse.json(
        { error: "Vị trí không hợp lệ" },
        { status: 400 }
      );
    }

    if (vi_do === 0 || kinh_do === 0) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp vị trí" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.nguoiDung.findUnique({
      where: { id: nguoi_dung_id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Create report
    const created = await prisma.phanAnh.create({
      data: {
        nguoi_dung_id,
        tieu_de: tieu_de.trim(),
        mo_ta: mo_ta.trim(),
        loai_su_co: loai_su_co.trim(),
        vi_do,
        kinh_do,
        // dia_chi will be added after migration
        // dia_chi,
        hinh_anh_url,
        muc_do_nghiem_trong,
        trang_thai,
      },
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ report: created }, { status: 201 });
  } catch (error) {
    console.error("Create citizen report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

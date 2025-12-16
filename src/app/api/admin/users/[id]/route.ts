import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { hashPassword } from "@/lib/auth";

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const userId = parseInt(id);
        const body = await req.json();
        const { ho_ten, email, mat_khau, so_dien_thoai, dia_chi, vai_tro } = body;

        // Prevent editing admin accounts
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (existingUser.vai_tro === "quan_tri" || existingUser.vai_tro === "admin") {
            return NextResponse.json(
                { error: "Cannot edit admin accounts" },
                { status: 403 }
            );
        }

        // Build update data
        const updateData: any = {};
        if (ho_ten) updateData.ho_ten = ho_ten;
        if (email) updateData.email = email;
        if (so_dien_thoai !== undefined) updateData.so_dien_thoai = so_dien_thoai;
        if (dia_chi !== undefined) updateData.dia_chi = dia_chi;
        if (vai_tro && ["can_bo", "nguoi_dan"].includes(vai_tro)) {
            updateData.vai_tro = vai_tro;
        }

        // Only update password if provided
        if (mat_khau && mat_khau.trim() !== "") {
            updateData.mat_khau = await hashPassword(mat_khau);
        }

        const updatedUser = await prisma.nguoiDung.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                ho_ten: true,
                email: true,
                vai_tro: true,
                so_dien_thoai: true,
                dia_chi: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const userId = parseInt(id);

        // Prevent deleting admin accounts
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (existingUser.vai_tro === "quan_tri" || existingUser.vai_tro === "admin") {
            return NextResponse.json(
                { error: "Cannot delete admin accounts" },
                { status: 403 }
            );
        }

        // Delete user
        await prisma.nguoiDung.delete({
            where: { id: userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

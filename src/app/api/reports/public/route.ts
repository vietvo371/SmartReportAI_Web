import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports/public - Get public reports for landing page (no auth required)
export async function GET() {
    try {
        // Fetch recent reports with limited data for public display
        const reports = await prisma.phanAnh.findMany({
            select: {
                id: true,
                tieu_de: true,
                loai_su_co: true,
                vi_do: true,
                kinh_do: true,
                dia_chi: true,
                muc_do_nghiem_trong: true,
                trang_thai: true,
                created_at: true,
            },
            orderBy: {
                created_at: "desc",
            },
            take: 50, // Limit to 50 most recent reports
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Get public reports error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

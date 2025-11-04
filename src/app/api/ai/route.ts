import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// POST /api/ai - AI Service nhận ảnh và phân loại sự cố
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { image_url, image_base64 } = body;

    if (!image_url && !image_base64) {
      return NextResponse.json(
        { error: "Image URL or base64 data required" },
        { status: 400 }
      );
    }

    // TODO: Gọi AI model thực tế để phân tích ảnh
    // Hiện tại trả về mock data
    const mockAnalysis = {
      label: "pothole", // pothole, flooding, traffic_light, waste, traffic_jam
      confidence: 0.85,
      description: "Ổ gà trên đường",
      severity: "medium", // low, medium, high, critical
      suggested_priority: "high",
      location_hints: ["đường phố", "giao thông"],
    };

    // Lưu kết quả AI analysis vào database
    const aiAnalysis = await prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: payload.userId,
        image_url: image_url || null,
        image_base64: image_base64 || null,
        predicted_label: mockAnalysis.label,
        confidence_score: mockAnalysis.confidence,
        description: mockAnalysis.description,
        severity: mockAnalysis.severity,
        suggested_priority: mockAnalysis.suggested_priority,
        location_hints: mockAnalysis.location_hints,
        model_version: "v1.0.0",
        processing_time_ms: 150,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        label: mockAnalysis.label,
        confidence: mockAnalysis.confidence,
        description: mockAnalysis.description,
        severity: mockAnalysis.severity,
        suggested_priority: mockAnalysis.suggested_priority,
        location_hints: mockAnalysis.location_hints,
        analysis_id: aiAnalysis.id,
      },
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}



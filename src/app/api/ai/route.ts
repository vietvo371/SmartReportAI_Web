import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Temporary mock data khi AI service chưa chạy
const TEMPORARY_MOCK_ANALYSIS = {
  label: "pothole",
  confidence: 0.85,
  description: "Ổ gà được phát hiện trong hình ảnh (Temporary Mock - AI Service đang được khởi động)",
  severity: "medium",
  suggested_priority: "high",
  location_hints: ["đường phố", "giao thông"],
  detected_objects: ["road", "damage"],
  model_version: "temporary-mock-v1.0",
  processing_time_ms: 100,
};

// Hàm gọi Python AI service với fallback
async function callAIService(image_url?: string, image_base64?: string) {
  try {
    // Kiểm tra AI service có chạy không
    const healthCheck = await fetch(`${AI_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!healthCheck.ok) {
      throw new Error("AI Service not available");
    }

    let response;
    
    if (image_base64) {
      response = await fetch(`${AI_SERVICE_URL}/analyze-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64 }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
    } else if (image_url) {
      // Download image từ URL và convert to base64
      const imageResponse = await fetch(image_url);
      if (!imageResponse.ok) {
        throw new Error("Cannot download image from URL");
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      response = await fetch(`${AI_SERVICE_URL}/analyze-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Image }),
        signal: AbortSignal.timeout(30000),
      });
    } else {
      throw new Error("No image provided");
    }

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.analysis;
    
  } catch (error : any) {
    // console.warn("AI Service unavailable, using fallback:", error.message);
    
    // // Enhanced fallback với random variations để demo realistic
    // const variations = [
    //   { label: "pothole", confidence: 0.82, severity: "medium" },
    //   { label: "flooding", confidence: 0.75, severity: "high" }, 
    //   { label: "traffic_light", confidence: 0.68, severity: "medium" },
    //   { label: "waste", confidence: 0.73, severity: "low" },
    // ];
    
    // const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    
    // return {
    //   ...TEMPORARY_MOCK_ANALYSIS,
    //   ...randomVariation,
    //   description: `${randomVariation.label === 'pothole' ? 'Ổ gà' : 
    //                 randomVariation.label === 'flooding' ? 'Ngập lụt' :
    //                 randomVariation.label === 'traffic_light' ? 'Đèn tín hiệu' : 'Rác thải'} được phát hiện (AI Service đang khởi động - sử dụng fallback)`,
    //   processing_time_ms: Math.floor(Math.random() * 200) + 50,
    // };
  }
}

// GET /api/ai - Lấy danh sách AI predictions
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Lấy danh sách AI analyses từ database
    const analyses = await prisma.aiAnalysis.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error("Get AI predictions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

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

    // Gọi Python AI service với enhanced fallback
    const aiAnalysis = await callAIService(image_url, image_base64);

    // Lưu kết quả AI analysis vào database
    const savedAnalysis = await prisma.aiAnalysis.create({
      data: {
        nguoi_dung_id: payload.userId,
        image_url: image_url || null,
        image_base64: image_base64 || null,
        predicted_label: aiAnalysis.label,
        confidence_score: aiAnalysis.confidence,
        description: aiAnalysis.description,
        severity: aiAnalysis.severity,
        suggested_priority: aiAnalysis.suggested_priority,
        location_hints: aiAnalysis.location_hints,
        model_version: aiAnalysis.model_version,
        processing_time_ms: aiAnalysis.processing_time_ms,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        label: aiAnalysis.label,
        confidence: aiAnalysis.confidence,
        description: aiAnalysis.description,
        severity: aiAnalysis.severity,
        suggested_priority: aiAnalysis.suggested_priority,
        location_hints: aiAnalysis.location_hints,
        detected_objects: aiAnalysis.detected_objects || [],
        model_version: aiAnalysis.model_version,
        processing_time_ms: aiAnalysis.processing_time_ms,
        analysis_id: savedAnalysis.id,
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



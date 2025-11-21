import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// PUT /api/staff/progress - Staff cập nhật tiến độ với AI quality check
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.vai_tro !== 'can_bo') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { 
      xu_ly_id, 
      trang_thai, 
      ghi_chu,
      completion_image, // Ảnh minh chứng hoàn thành
      completion_percentage 
    } = await req.json();

    // Lấy thông tin xử lý hiện tại
    const xuLy = await prisma.xuLy.findUnique({
      where: { id: xu_ly_id },
      include: {
        phan_anh: {
          include: {
            ai_analyses: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!xuLy || xuLy.can_bo_id !== payload.userId) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    // **🤖 AI QUALITY ASSESSMENT**
    let ai_quality_score = null;
    let ai_completion_verification = null;
    let quality_issues = [];

    // Nếu có ảnh hoàn thành, dùng AI để verify
    if (completion_image && trang_thai === 'hoan_thanh') {
      try {
        const aiResponse = await fetch('http://localhost:8000/analyze-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: completion_image }),
          signal: AbortSignal.timeout(30000)
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const completionAnalysis = aiResult.analysis;
          const originalAnalysis = xuLy.phan_anh.ai_analyses[0];

          // **So sánh before/after để đánh giá quality**
          if (originalAnalysis) {
            // Nếu original là pothole, completion image không còn pothole = good
            if (originalAnalysis.predicted_label === 'pothole' && 
                completionAnalysis.label !== 'pothole') {
              ai_quality_score = 95;
              ai_completion_verification = 'Ổ gà đã được sửa chữa thành công';
            }
            // Nếu original là waste, completion image clean = good  
            else if (originalAnalysis.predicted_label === 'waste' && 
                     completionAnalysis.label !== 'waste') {
              ai_quality_score = 90;
              ai_completion_verification = 'Khu vực đã được dọn dẹp sạch sẽ';
            }
            // Nếu original là flooding, completion image không còn nước = good
            else if (originalAnalysis.predicted_label === 'flooding' && 
                     completionAnalysis.label !== 'flooding') {
              ai_quality_score = 85;
              ai_completion_verification = 'Tình trạng ngập đã được khắc phục';
            }
            // Nếu vẫn detect cùng issue = potential problem
            else if (originalAnalysis.predicted_label === completionAnalysis.label) {
              ai_quality_score = 40;
              ai_completion_verification = `Vẫn phát hiện ${completionAnalysis.description}`;
              quality_issues.push('Sự cố có thể chưa được xử lý hoàn toàn');
            }
            // Khác loại sự cố = neutral
            else {
              ai_quality_score = 70;
              ai_completion_verification = 'Đã có thay đổi trong hình ảnh';
            }

          } else {
            // Không có original analysis, chỉ đánh giá completion
            ai_quality_score = 75;
            ai_completion_verification = `Khu vực hiện trạng: ${completionAnalysis.description}`;
          }

          // **Consistency check**
          if (completion_percentage < 50 && ai_quality_score > 80) {
            quality_issues.push('Mâu thuẫn: % hoàn thành thấp nhưng AI đánh giá chất lượng cao');
          }
          if (completion_percentage > 90 && ai_quality_score < 60) {
            quality_issues.push('Mâu thuẫn: % hoàn thành cao nhưng AI phát hiện vấn đề');
          }
        }
      } catch (aiError) {
        console.warn('AI quality assessment failed:', aiError);
      }
    }

    // **Timeline analysis**
    const startTime = new Date(xuLy.created_at);
    const currentTime = new Date();
    const hoursElapsed = (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const estimatedHours = xuLy.ai_estimated_hours || 8;

    let timeline_status = 'on_time';
    if (hoursElapsed > estimatedHours * 1.5) {
      timeline_status = 'delayed';
      quality_issues.push(`Vượt thời gian dự kiến ${estimatedHours}h, đã mất ${Math.round(hoursElapsed)}h`);
    } else if (hoursElapsed > estimatedHours * 1.2) {
      timeline_status = 'at_risk';
    }

    // Cập nhật progress với AI assessment
    const updated = await prisma.xuLy.update({
      where: { id: xu_ly_id },
      data: {
        trang_thai,
        ghi_chu,
        completion_percentage,
        completion_image_url: completion_image ? `/uploads/completions/${Date.now()}.jpg` : null,
        ai_quality_score,
        ai_completion_verification,
        timeline_status,
        quality_issues: quality_issues.length > 0 ? quality_issues.join('; ') : null,
        updated_at: new Date()
      }
    });

    // **Trigger alerts nếu có vấn đề**
    if (quality_issues.length > 0 || ai_quality_score < 60) {
      // Tạo notification cho admin
      await prisma.notification.create({
        data: {
          recipient_id: 1, // Admin user ID
          type: 'quality_alert',
          title: 'Cảnh báo chất lượng xử lý',
          message: `Phát hiện vấn đề trong xử lý #${xu_ly_id}: ${quality_issues.join(', ')}`,
          related_id: xu_ly_id,
          related_type: 'xu_ly'
        }
      });
    }

    return NextResponse.json({
      success: true,
      xu_ly: updated,
      ai_assessment: {
        quality_score: ai_quality_score,
        verification: ai_completion_verification,
        timeline_status,
        issues: quality_issues,
        hours_elapsed: Math.round(hoursElapsed * 10) / 10
      }
    });

  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
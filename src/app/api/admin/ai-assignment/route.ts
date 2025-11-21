import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// POST /api/admin/ai-assignment - AI phân công tự động
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !["quan_tri", "admin"].includes(payload.vai_tro)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { report_ids } = await req.json();

    const assignments = [];

    for (const reportId of report_ids) {
      // Lấy thông tin báo cáo và AI analysis
      const report = await prisma.phanAnh.findUnique({
        where: { id: reportId },
        include: {
          ai_analyses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });

      if (!report) continue;

      // **🤖 AI-POWERED ASSIGNMENT LOGIC**
      const aiAnalysis = report.ai_analyses[0];
      let priority_score = 0;
      let suggested_staff_skills = [];
      let estimated_completion_hours = 8;

      if (aiAnalysis) {
        // Tính priority dựa trên AI analysis
        if (aiAnalysis.severity === 'critical') priority_score = 100;
        else if (aiAnalysis.severity === 'high') priority_score = 80;
        else if (aiAnalysis.severity === 'medium') priority_score = 60;
        else priority_score = 40;

        // Boost priority nếu AI confidence cao
        if (aiAnalysis.confidence_score > 0.9) priority_score += 10;

        // Đề xuất skills cần thiết
        switch (aiAnalysis.predicted_label) {
          case 'pothole':
            suggested_staff_skills = ['road_repair', 'asphalt_work'];
            estimated_completion_hours = 4;
            break;
          case 'flooding':
            suggested_staff_skills = ['drainage', 'emergency_response'];
            estimated_completion_hours = 6;
            priority_score += 20; // Flooding là urgent
            break;
          case 'traffic_light':
            suggested_staff_skills = ['electrical', 'traffic_systems'];
            estimated_completion_hours = 3;
            break;
          case 'waste':
            suggested_staff_skills = ['waste_management', 'cleaning'];
            estimated_completion_hours = 2;
            break;
          case 'traffic_jam':
            suggested_staff_skills = ['traffic_control', 'coordination'];
            estimated_completion_hours = 1;
            priority_score += 15; // Traffic jam ảnh hưởng nhiều người
            break;
        }
      }

      // Tìm staff phù hợp nhất
      const availableStaff = await prisma.nguoiDung.findMany({
        where: {
          vai_tro: 'can_bo',
          // Add more filters: location, workload, skills, etc.
        },
        include: {
          xu_ly_assigned: {
            where: {
              trang_thai: 'dang_xu_ly'
            }
          }
        }
      });

      // AI scoring cho staff assignment
      let bestStaff = null;
      let bestScore = 0;

      for (const staff of availableStaff) {
        let staffScore = 100;
        
        // Penalty cho workload hiện tại
        const currentWorkload = staff.xu_ly_assigned.length;
        staffScore -= currentWorkload * 10;

        // Bonus cho skills match (giả định có skills trong profile)
        // staffScore += calculateSkillsMatch(staff.skills, suggested_staff_skills);

        // Bonus cho proximity (giả định có location data)
        // staffScore += calculateLocationProximity(staff.location, report.vi_do, report.kinh_do);

        if (staffScore > bestScore) {
          bestScore = staffScore;
          bestStaff = staff;
        }
      }

      if (bestStaff) {
        // Tạo assignment với AI metadata
        const assignment = await prisma.xuLy.create({
          data: {
            phan_anh_id: reportId,
            can_bo_id: bestStaff.id,
            trang_thai: 'cho_xu_ly',
            ai_priority_score: priority_score,
            ai_estimated_hours: estimated_completion_hours,
            ai_suggested_skills: suggested_staff_skills.join(','),
            ai_assignment_reasoning: `AI assigned based on ${aiAnalysis?.predicted_label || 'manual'} classification with ${Math.round(bestScore)}% match score`
          }
        });

        assignments.push({
          report_id: reportId,
          staff_id: bestStaff.id,
          staff_name: bestStaff.ho_ten,
          priority_score,
          estimated_hours: estimated_completion_hours,
          ai_reasoning: assignment.ai_assignment_reasoning
        });

        // Cập nhật trạng thái báo cáo
        await prisma.phanAnh.update({
          where: { id: reportId },
          data: { trang_thai: 'da_phan_cong' }
        });
      }
    }

    return NextResponse.json({
      success: true,
      assignments,
      total_assigned: assignments.length
    });

  } catch (error) {
    console.error("AI assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
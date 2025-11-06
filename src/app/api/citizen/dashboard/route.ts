import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader?.replace('bearer ', '');
    
    if (!token) {
      console.error('No token provided');
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 });
    }

    if (!decoded || !decoded.userId) {
      console.error('No userId in token:', decoded);
      return NextResponse.json({ error: 'Unauthorized - no userId' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get total reports
    const total = await prisma.phanAnh.count({
      where: { nguoi_dung_id: userId },
    });

    // Get reports by status
    const dang_xu_ly = await prisma.phanAnh.count({
      where: {
        nguoi_dung_id: userId,
        trang_thai: 'dang_xu_ly',
      },
    });

    const da_hoan_tat = await prisma.phanAnh.count({
      where: {
        nguoi_dung_id: userId,
        trang_thai: 'da_hoan_tat',
      },
    });

    // Get recent reports (last 5)
    const recent = await prisma.phanAnh.findMany({
      where: { nguoi_dung_id: userId },
      select: {
        id: true,
        tieu_de: true,
        loai_su_co: true,
        trang_thai: true,
        muc_do_nghiem_trong: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      total,
      dang_xu_ly,
      da_hoan_tat,
      recent,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


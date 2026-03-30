import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
   try {
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json({ user: null });
      }

      // 포인트 히스토리 조회
      const pointHistory = await prisma.pointHistory.findMany({
         where: { userId: user.id },
         orderBy: { date: 'desc' },
         take: 20,
      });

      return NextResponse.json({
         user: {
            id: user.id,
            studentId: user.studentId,
            name: user.name,
            department: user.department,
            phone: user.phone,
            points: user.points,
            isAdmin: user.isAdmin,
            joinedAt: user.joinedAt,
            pointHistory,
         },
      });
   } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
         { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

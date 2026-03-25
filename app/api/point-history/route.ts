import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/point-history - 포인트 내역 조회 (관리자만)
export async function GET() {
   try {
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!user.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 전체 포인트 내역을 조회할 수 있습니다.' },
            { status: 403 }
         );
      }

      // 전체 포인트 내역 조회
      const pointHistory = await prisma.pointHistory.findMany({
         orderBy: { date: 'desc' },
         select: {
            id: true,
            userId: true,
            points: true,
            reason: true,
            date: true,
         },
      });

      return NextResponse.json({ pointHistory });
   } catch (error) {
      console.error('Get point history error:', error);
      return NextResponse.json(
         { error: '포인트 내역 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

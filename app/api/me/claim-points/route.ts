import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// POST /api/me/claim-points - 로그인 포인트 받기 (본인만)
export async function POST(request: NextRequest) {
   try {
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      const body = await request.json();
      const { points = 2, reason = '웹 로그인 포인트' } = body;

      // 포인트는 양수만 허용 (악용 방지)
      if (points < 0 || points > 10) {
         return NextResponse.json(
            { error: '올바르지 않은 포인트 값입니다.' },
            { status: 400 }
         );
      }

      // 오늘 이미 받았는지 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingClaim = await prisma.pointHistory.findFirst({
         where: {
            userId: user.id,
            reason,
            date: {
               gte: today,
               lt: tomorrow,
            },
         },
      });

      if (existingClaim) {
         return NextResponse.json(
            { error: '오늘 이미 로그인 포인트를 받았습니다.' },
            { status: 400 }
         );
      }

      // 트랜잭션으로 포인트 지급 및 내역 생성
      const [updatedUser, history] = await prisma.$transaction([
         prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: points } },
         }),
         prisma.pointHistory.create({
            data: {
               userId: user.id,
               points,
               reason,
            },
         }),
      ]);

      return NextResponse.json({
         message: '포인트가 지급되었습니다.',
         user: {
            id: updatedUser.id,
            studentId: updatedUser.studentId,
            name: updatedUser.name,
            points: updatedUser.points,
         },
         history,
      });
   } catch (error) {
      console.error('Claim points error:', error);
      return NextResponse.json(
         { error: '포인트 지급 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

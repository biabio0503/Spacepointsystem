import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { addPointsSchema } from '@/lib/validations';
import { z } from 'zod';

// POST /api/users/[id]/points - 포인트 지급/차감 (관리자만)
export async function POST(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!currentUser.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 포인트를 지급할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = addPointsSchema.parse(body);
      const { points, reason } = validatedData;

      const pointsNum = typeof points === 'number' ? points : parseInt(points);

      // 트랜잭션으로 포인트 지급 및 내역 생성
      const [user, history] = await prisma.$transaction([
         prisma.user.update({
            where: { id },
            data: { points: { increment: pointsNum } },
         }),
         prisma.pointHistory.create({
            data: {
               userId: id,
               points: pointsNum,
               reason,
            },
         }),
      ]);

      return NextResponse.json({
         message: '포인트가 지급되었습니다.',
         user: {
            id: user.id,
            studentId: user.studentId,
            name: user.name,
            points: user.points,
         },
         history,
      });
   } catch (error) {
      console.error('Add points error:', error);

      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '포인트 지급 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

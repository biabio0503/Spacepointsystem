import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { addPointsSchema } from '@/lib/validations';
import { z } from 'zod';

// POST /api/users/[id]/points - 포인트 지급/차감 (관리자만)
export async function POST(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 관리자 권한 확인
      const admin = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (!admin?.isAdmin) {
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
      const result = await prisma.$transaction(async (tx) => {
         // 포인트 지급/차감
         const user = await tx.user.update({
            where: { id },
            data: {
               points: { increment: pointsNum },
            },
         });

         // 포인트 내역 생성
         const history = await tx.pointHistory.create({
            data: {
               userId: id,
               points: pointsNum,
               reason,
            },
         });

         return { user, history };
      });

      return NextResponse.json({
         message: '포인트가 지급되었습니다.',
         user: result.user,
         history: result.history,
      });
   } catch (error) {
      console.error('Add points error:', error);

      // Zod 유효성 검사 에러
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

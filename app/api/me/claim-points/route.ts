import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// POST /api/me/claim-points - 로그인 포인트 받기 (본인만)
export async function POST(request: NextRequest) {
   try {
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
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

      // 오늘 이미 받았는지 확인 (선택사항)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingClaim = await prisma.pointHistory.findFirst({
         where: {
            userId: authUser.id,
            reason: '웹 로그인 포인트',
            createdAt: {
               gte: today,
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
      const result = await prisma.$transaction(async (tx) => {
         // 포인트 지급
         const user = await tx.user.update({
            where: { id: authUser.id },
            data: {
               points: { increment: points },
            },
         });

         // 포인트 내역 생성
         const history = await tx.pointHistory.create({
            data: {
               userId: authUser.id,
               points: points,
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
      console.error('Claim points error:', error);

      return NextResponse.json(
         { error: '포인트 지급 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

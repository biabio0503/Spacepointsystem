import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/me/point-history - 현재 사용자의 포인트 내역 조회
export async function GET(request: NextRequest) {
   try {
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 현재 사용자의 포인트 내역 조회
      const pointHistory = await prisma.pointHistory.findMany({
         where: {
            userId: authUser.id,
         },
         orderBy: {
            date: 'desc',
         },
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

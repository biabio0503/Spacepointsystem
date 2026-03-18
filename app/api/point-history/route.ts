import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/point-history - 포인트 내역 조회 (관리자만)
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

      // 관리자 권한 확인
      const user = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (!user?.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 전체 포인트 내역을 조회할 수 있습니다.' },
            { status: 403 }
         );
      }

      // 전체 포인트 내역 조회
      const pointHistory = await prisma.pointHistory.findMany({
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

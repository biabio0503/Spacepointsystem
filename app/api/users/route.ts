import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/users - 사용자 목록 조회 (관리자만)
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
            { error: '관리자만 사용자 목록을 조회할 수 있습니다.' },
            { status: 403 }
         );
      }

      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');

      const where: any = {};
      if (search) {
         where.OR = [
            { name: { contains: search } },
            { studentId: { contains: search } },
            { department: { contains: search } },
         ];
      }

      const users = await prisma.user.findMany({
         where,
         select: {
            id: true,
            studentId: true,
            name: true,
            department: true,
            phone: true,
            points: true,
            isAdmin: true,
            joinedAt: true,
            _count: {
               select: {
                  pointHistory: true,
                  rentals: true,
               },
            },
         },
         orderBy: { joinedAt: 'desc' },
      });

      return NextResponse.json({ users });
   } catch (error) {
      console.error('Get users error:', error);
      return NextResponse.json(
         { error: '사용자 목록 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

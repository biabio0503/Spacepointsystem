import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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

      // DB에서 사용자 정보 조회
      const user = await prisma.user.findUnique({
         where: { id: authUser.id },
         include: {
            pointHistory: {
               orderBy: { date: 'desc' },
               take: 20,
            },
            rentals: {
               include: {
                  item: true,
               },
               orderBy: { rentalDate: 'desc' },
            },
         },
      });

      if (!user) {
         return NextResponse.json(
            { error: '사용자 정보를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

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
            pointHistory: user.pointHistory,
            rentals: user.rentals,
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

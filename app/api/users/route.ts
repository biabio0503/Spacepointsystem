import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/users - 사용자 목록 조회 (관리자만)
export async function GET(request: NextRequest) {
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
            { error: '관리자만 사용자 목록을 조회할 수 있습니다.' },
            { status: 403 }
         );
      }

      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');

      const users = await prisma.user.findMany({
         where: search
            ? {
               OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { studentId: { contains: search, mode: 'insensitive' } },
                  { department: { contains: search, mode: 'insensitive' } },
               ],
            }
            : undefined,
         orderBy: { joinedAt: 'desc' },
         include: {
            _count: {
               select: {
                  pointHistory: true,
                  rentals: true,
               },
            },
         },
      });

      const usersResponse = users.map((u) => ({
         id: u.id,
         studentId: u.studentId,
         name: u.name,
         department: u.department,
         phone: u.phone,
         points: u.points,
         isAdmin: u.isAdmin,
         joinedAt: u.joinedAt,
         _count: u._count,
      }));

      return NextResponse.json({ users: usersResponse });
   } catch (error) {
      console.error('Get users error:', error);
      return NextResponse.json(
         { error: '사용자 목록 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

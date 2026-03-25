import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth-utils';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = loginSchema.parse(body);
      const { studentId, password } = validatedData;

      // 사용자 조회
      const user = await prisma.user.findUnique({
         where: { studentId },
         include: {
            pointHistory: {
               orderBy: { date: 'desc' },
               take: 10,
            },
         },
      });

      if (!user) {
         return NextResponse.json(
            { error: '학번 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
         );
      }

      // 비밀번호 검증
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
         return NextResponse.json(
            { error: '학번 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
         );
      }

      // JWT 토큰 생성 및 쿠키 설정
      const token = await createToken({
         userId: user.id,
         studentId: user.studentId,
         isAdmin: user.isAdmin,
      });
      await setAuthCookie(token);

      return NextResponse.json({
         message: '로그인 성공',
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
         },
      });
   } catch (error) {
      console.error('Login error:', error);

      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '로그인 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

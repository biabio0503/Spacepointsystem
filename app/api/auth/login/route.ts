import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = loginSchema.parse(body);
      const { studentId, password } = validatedData;

      // Supabase Auth로 로그인
      const supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
         email: `${studentId}@student.local`,
         password,
      });

      if (authError) {
         return NextResponse.json(
            { error: '학번 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
         );
      }

      // DB에서 사용자 정보 조회
      const user = await prisma.user.findUnique({
         where: { id: authData.user.id },
         include: {
            pointHistory: {
               orderBy: { date: 'desc' },
               take: 10,
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

      // Zod 유효성 검사 에러
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

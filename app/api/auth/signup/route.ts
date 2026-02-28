import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = signUpSchema.parse(body);
      const { studentId, name, department, phone, password, referralCode } = validatedData;

      // 학번 중복 체크
      const existingUser = await prisma.user.findUnique({
         where: { studentId },
      });

      if (existingUser) {
         return NextResponse.json(
            { error: '이미 등록된 학번입니다.' },
            { status: 409 }
         );
      }

      // Supabase Auth에 사용자 생성
      const supabase = await createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
         email: `${studentId}@student.local`,
         password: password,
         options: {
            data: {
               student_id: studentId,
               name,
               department,
            },
         },
      });

      if (authError) {
         return NextResponse.json(
            { error: authError.message },
            { status: 400 }
         );
      }

      if (!authData.user) {
         return NextResponse.json(
            { error: '사용자 생성에 실패했습니다.' },
            { status: 500 }
         );
      }

      // 추천인 코드로 포인트 부여
      let initialPoints = 0;
      if (referralCode) {
         const referrer = await prisma.user.findFirst({
            where: { studentId: referralCode },
         });

         if (referrer) {
            // 추천인에게 포인트 부여
            await prisma.user.update({
               where: { id: referrer.id },
               data: { points: { increment: 100 } },
            });

            await prisma.pointHistory.create({
               data: {
                  userId: referrer.id,
                  points: 100,
                  reason: `${name}님 추천`,
               },
            });

            // 신규 가입자에게도 포인트 부여
            initialPoints = 50;
         }
      }

      // Prisma DB에 사용자 정보 저장
      const user = await prisma.user.create({
         data: {
            id: authData.user.id,
            studentId,
            name,
            department,
            phone,
            referralCode: referralCode || null,
            points: initialPoints,
         },
      });

      // 가입 포인트 내역 추가
      if (initialPoints > 0) {
         await prisma.pointHistory.create({
            data: {
               userId: user.id,
               points: initialPoints,
               reason: '추천인 코드 사용 보너스',
            },
         });
      }

      return NextResponse.json({
         message: '회원가입이 완료되었습니다.',
         user: {
            id: user.id,
            studentId: user.studentId,
            name: user.name,
            department: user.department,
            points: user.points,
         },
      });
   } catch (error) {
      console.error('Signup error:', error);

      // Zod 유효성 검사 에러
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '회원가입 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

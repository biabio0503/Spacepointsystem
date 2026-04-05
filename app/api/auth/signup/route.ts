import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth-utils';
import { signUpSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = signUpSchema.parse(body);
      const { studentId, name, department, phone, password, referralCode, membershipFeeStatus } = validatedData;

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

      // 비밀번호 해싱
      const passwordHash = await hashPassword(password);

      // 추천인 코드로 포인트 부여
      let initialPoints = 0;
      if (referralCode) {
         const referrer = await prisma.user.findUnique({
            where: { studentId: referralCode },
         });

         if (referrer) {
            // 추천인에게 포인트 부여 (트랜잭션)
            await prisma.$transaction([
               prisma.user.update({
                  where: { id: referrer.id },
                  data: { points: { increment: 100 } },
               }),
               prisma.pointHistory.create({
                  data: {
                     userId: referrer.id,
                     points: 100,
                     reason: `${name}님 추천`,
                  },
               }),
            ]);

            // 신규 가입자에게도 포인트 부여
            initialPoints = 50;
         }
      }

      // 사용자 생성
      const user = await prisma.user.create({
         data: {
            studentId,
            passwordHash,
            name,
            department,
            phone,
            points: initialPoints,
            membershipFeeStatus: membershipFeeStatus || 'unknown',
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

      // JWT 토큰 생성 및 쿠키 설정
      const token = await createToken({
         userId: user.id,
         studentId: user.studentId,
         isAdmin: user.isAdmin,
      });
      await setAuthCookie(token);

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

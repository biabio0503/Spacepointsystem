import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// 카카오 사용자의 일관된 패스워드 생성 (callback과 동일하게 사용)
function generateKakaoPassword(kakaoId: string): string {
   return `kakao_${kakaoId}_${process.env.KAKAO_CLIENT_SECRET}`;
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { kakaoId, studentId, name, department, phone, referralCode } = body;

      // 필수 필드 검증
      if (!kakaoId || !studentId || !name || !department || !phone) {
         return NextResponse.json(
            { error: '모든 필수 정보를 입력해주세요.' },
            { status: 400 }
         );
      }

      // 학번 형식 검증
      if (studentId.length !== 8 || !/^\d+$/.test(studentId)) {
         return NextResponse.json(
            { error: '학번은 8자리 숫자여야 합니다.' },
            { status: 400 }
         );
      }

      // 휴대폰 번호 형식 검증
      if (!phone.startsWith('010') || phone.length < 10) {
         return NextResponse.json(
            { error: '올바른 휴대폰 번호를 입력해주세요.' },
            { status: 400 }
         );
      }

      // 이미 존재하는 학번인지 확인
      const existingStudent = await prisma.user.findUnique({
         where: { studentId },
      });

      if (existingStudent) {
         return NextResponse.json(
            { error: '이미 등록된 학번입니다.' },
            { status: 400 }
         );
      }

      // 이미 존재하는 카카오 ID인지 확인
      const existingKakaoUser = await prisma.user.findUnique({
         where: { kakaoId },
      });

      if (existingKakaoUser) {
         return NextResponse.json(
            { error: '이미 연동된 카카오 계정입니다.' },
            { status: 400 }
         );
      }

      // Supabase Auth에 사용자 생성 (카카오 연동 사용자는 일관된 패스워드 사용)
      const supabase = await createClient();
      const kakaoPassword = generateKakaoPassword(kakaoId);

      const { data: authData, error: authError } = await supabase.auth.signUp({
         email: `${studentId}@student.local`,
         password: kakaoPassword,
         options: {
            data: {
               student_id: studentId,
               name,
               department,
               kakao_id: kakaoId,
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

      // 추천인 코드 처리
      let initialPoints = 0;
      if (referralCode) {
         const referrer = await prisma.user.findFirst({
            where: { studentId: referralCode },
         });

         if (referrer) {
            // 추천인에게 포인트 지급
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
      const newUser = await prisma.user.create({
         data: {
            id: authData.user.id,
            kakaoId,
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
               userId: newUser.id,
               points: initialPoints,
               reason: '추천인 가입 보너스',
            },
         });
      }

      // 세션 쿠키 설정
      const response = NextResponse.json(
         {
            success: true,
            user: {
               id: newUser.id,
               studentId: newUser.studentId,
               name: newUser.name,
               isAdmin: newUser.isAdmin,
            },
         },
         { status: 201 }
      );

      response.cookies.set('user', JSON.stringify({
         id: newUser.id,
         studentId: newUser.studentId,
         name: newUser.name,
         isAdmin: newUser.isAdmin,
      }), {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 60 * 60 * 24 * 7, // 7일
      });

      return response;
   } catch (error) {
      console.error('카카오 회원가입 오류:', error);
      return NextResponse.json(
         { error: '회원가입 처리 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

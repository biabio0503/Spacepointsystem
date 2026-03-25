import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth-utils';

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
      const existingKakaoUser = await prisma.user.findFirst({
         where: { kakaoId },
      });

      if (existingKakaoUser) {
         return NextResponse.json(
            { error: '이미 연동된 카카오 계정입니다.' },
            { status: 400 }
         );
      }

      // 카카오 사용자의 패스워드 해시 생성 (카카오 ID 기반)
      const passwordHash = await hashPassword(`kakao_${kakaoId}_${process.env.KAKAO_CLIENT_SECRET || 'secret'}`);

      // 추천인 코드 처리
      let initialPoints = 0;
      if (referralCode) {
         const referrer = await prisma.user.findUnique({
            where: { studentId: referralCode },
         });

         if (referrer) {
            // 추천인에게 포인트 지급
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

      // DB에 사용자 정보 저장
      const newUser = await prisma.user.create({
         data: {
            kakaoId,
            studentId,
            passwordHash,
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

      // JWT 토큰 생성 및 쿠키 설정
      const token = await createToken({
         userId: newUser.id,
         studentId: newUser.studentId,
         isAdmin: newUser.isAdmin,
      });
      await setAuthCookie(token);

      return NextResponse.json(
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
   } catch (error) {
      console.error('카카오 회원가입 오류:', error);
      return NextResponse.json(
         { error: '회원가입 처리 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

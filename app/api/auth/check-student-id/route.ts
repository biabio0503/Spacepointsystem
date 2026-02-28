import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { studentId } = body;

      if (!studentId) {
         return NextResponse.json(
            { error: '학번을 입력해주세요.' },
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

      // 학번 중복 확인
      const existingUser = await prisma.user.findUnique({
         where: { studentId },
      });

      if (existingUser) {
         return NextResponse.json(
            { available: false, message: '이미 등록된 학번입니다.' },
            { status: 200 }
         );
      }

      return NextResponse.json(
         { available: true, message: '사용 가능한 학번입니다.' },
         { status: 200 }
      );
   } catch (error) {
      console.error('학번 중복 확인 오류:', error);
      return NextResponse.json(
         { error: '학번 확인 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

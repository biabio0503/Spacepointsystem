// ============================================================
// 📚 예시: TODO API 라우트
// ============================================================
// 파일 위치: app/api/todos/route.ts
// URL: GET /api/todos, POST /api/todos
//
// 패턴:
// 1. getCurrentUser()로 인증 확인
// 2. Zod로 입력 데이터 유효성 검사
// 3. Prisma로 DB 작업
// 4. NextResponse.json()으로 응답
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { createTodoSchema } from '@/lib/validations';
import { z } from 'zod';

// ============================================================
// GET /api/todos - 내 TODO 목록 조회
// ============================================================
export async function GET() {
   try {
      // 1️⃣ 인증 확인
      const user = await getCurrentUser();
      if (!user) {
         return NextResponse.json(
            { error: '로그인이 필요합니다.' },
            { status: 401 }
         );
      }

      // 2️⃣ Prisma로 데이터 조회
      const todos = await prisma.todo.findMany({
         where: { userId: user.id },
         orderBy: { createdAt: 'desc' },
      });

      // 3️⃣ 응답
      return NextResponse.json({ todos });

   } catch (error) {
      console.error('Get todos error:', error);
      return NextResponse.json(
         { error: 'TODO 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// ============================================================
// POST /api/todos - TODO 생성
// ============================================================
export async function POST(request: NextRequest) {
   try {
      // 1️⃣ 인증 확인
      const user = await getCurrentUser();
      if (!user) {
         return NextResponse.json(
            { error: '로그인이 필요합니다.' },
            { status: 401 }
         );
      }

      // 2️⃣ 요청 데이터 파싱
      const body = await request.json();

      // 3️⃣ Zod로 유효성 검사 (핵심!)
      const validatedData = createTodoSchema.parse(body);

      // 4️⃣ Prisma로 데이터 생성
      const todo = await prisma.todo.create({
         data: {
            title: validatedData.title,
            userId: user.id,
         },
      });

      // 5️⃣ 응답
      return NextResponse.json({
         message: 'TODO가 생성되었습니다.',
         todo,
      });

   } catch (error) {
      console.error('Create todo error:', error);

      // Zod 유효성 검사 에러 처리
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: 'TODO 생성 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

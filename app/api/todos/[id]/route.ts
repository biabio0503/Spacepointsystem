// ============================================================
// 📚 예시: TODO 개별 API 라우트
// ============================================================
// 파일 위치: app/api/todos/[id]/route.ts
// URL: PATCH /api/todos/:id, DELETE /api/todos/:id
//
// [id]는 동적 라우트 파라미터
// params.id로 접근
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { updateTodoSchema } from '@/lib/validations';
import { z } from 'zod';

// ============================================================
// PATCH /api/todos/[id] - TODO 수정
// ============================================================
export async function PATCH(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;

      // 1️⃣ 인증 확인
      const user = await getCurrentUser();
      if (!user) {
         return NextResponse.json(
            { error: '로그인이 필요합니다.' },
            { status: 401 }
         );
      }

      // 2️⃣ 해당 TODO가 내 것인지 확인
      const existingTodo = await prisma.todo.findUnique({
         where: { id },
      });

      if (!existingTodo) {
         return NextResponse.json(
            { error: 'TODO를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      if (existingTodo.userId !== user.id) {
         return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
         );
      }

      // 3️⃣ Zod로 유효성 검사
      const body = await request.json();
      const validatedData = updateTodoSchema.parse(body);

      // 4️⃣ Prisma로 업데이트
      const todo = await prisma.todo.update({
         where: { id },
         data: validatedData,
      });

      // 5️⃣ 응답
      return NextResponse.json({
         message: 'TODO가 수정되었습니다.',
         todo,
      });

   } catch (error) {
      console.error('Update todo error:', error);

      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: 'TODO 수정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// ============================================================
// DELETE /api/todos/[id] - TODO 삭제
// ============================================================
export async function DELETE(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;

      // 1️⃣ 인증 확인
      const user = await getCurrentUser();
      if (!user) {
         return NextResponse.json(
            { error: '로그인이 필요합니다.' },
            { status: 401 }
         );
      }

      // 2️⃣ 해당 TODO가 내 것인지 확인
      const existingTodo = await prisma.todo.findUnique({
         where: { id },
      });

      if (!existingTodo) {
         return NextResponse.json(
            { error: 'TODO를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      if (existingTodo.userId !== user.id) {
         return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
         );
      }

      // 3️⃣ Prisma로 삭제
      await prisma.todo.delete({
         where: { id },
      });

      // 4️⃣ 응답
      return NextResponse.json({
         message: 'TODO가 삭제되었습니다.',
      });

   } catch (error) {
      console.error('Delete todo error:', error);
      return NextResponse.json(
         { error: 'TODO 삭제 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

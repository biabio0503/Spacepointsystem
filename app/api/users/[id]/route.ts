import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { updateUserSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/users/[id] - 사용자 상세 정보 조회
export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 본인이거나 관리자만 조회 가능
      const requestingUser = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (authUser.id !== id && !requestingUser?.isAdmin) {
         return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
         );
      }

      const user = await prisma.user.findUnique({
         where: { id },
         include: {
            pointHistory: {
               orderBy: { date: 'desc' },
               take: 50,
            },
            rentals: {
               include: {
                  item: true,
               },
               orderBy: { rentalDate: 'desc' },
            },
         },
      });

      if (!user) {
         return NextResponse.json(
            { error: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      return NextResponse.json({ user });
   } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
         { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// PATCH /api/users/[id] - 사용자 정보 수정
export async function PATCH(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 본인이거나 관리자만 수정 가능
      const requestingUser = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (authUser.id !== id && !requestingUser?.isAdmin) {
         return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = updateUserSchema.parse(body);
      const { name, department, phone, isAdmin } = validatedData;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;
      if (phone !== undefined) updateData.phone = phone;

      // 관리자 권한 변경은 관리자만 가능
      if (isAdmin !== undefined && requestingUser?.isAdmin) {
         updateData.isAdmin = isAdmin;
      }

      const user = await prisma.user.update({
         where: { id },
         data: updateData,
      });

      return NextResponse.json({
         message: '사용자 정보가 수정되었습니다.',
         user,
      });
   } catch (error) {
      console.error('Update user error:', error);

      // Zod 유효성 검사 에러
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '사용자 정보 수정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// DELETE /api/users/[id] - 사용자 삭제 (관리자만)
export async function DELETE(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 관리자 권한 확인
      const admin = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (!admin?.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 사용자를 삭제할 수 있습니다.' },
            { status: 403 }
         );
      }

      // 자기 자신은 삭제 불가
      if (authUser.id === id) {
         return NextResponse.json(
            { error: '자기 자신은 삭제할 수 없습니다.' },
            { status: 400 }
         );
      }

      const userToDelete = await prisma.user.findUnique({
         where: { id },
      });

      if (!userToDelete) {
         return NextResponse.json(
            { error: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      // 트랜잭션으로 관련 데이터 모두 삭제
      await prisma.$transaction(async (tx) => {
         // 포인트 히스토리 삭제
         await tx.pointHistory.deleteMany({
            where: { userId: id },
         });

         // 대여 내역 삭제
         await tx.rental.deleteMany({
            where: { userId: id },
         });

         // 사용자 삭제
         await tx.user.delete({
            where: { id },
         });
      });

      // Supabase Auth에서도 사용자 삭제 (관리자 권한 필요)
      try {
         const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);
         if (deleteAuthError) {
            console.error('Supabase auth delete error:', deleteAuthError);
         }
      } catch (authDeleteError) {
         console.error('Failed to delete from auth:', authDeleteError);
         // Auth 삭제가 실패해도 계속 진행 (DB에서는 이미 삭제됨)
      }

      return NextResponse.json({
         message: '사용자가 삭제되었습니다.',
      });
   } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json(
         { error: '사용자 삭제 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

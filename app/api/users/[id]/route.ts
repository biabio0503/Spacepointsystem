import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { updateUserSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/users/[id] - 사용자 상세 정보 조회
export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 본인이거나 관리자만 조회 가능
      if (currentUser.id !== id && !currentUser.isAdmin) {
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
         },
      });

      if (!user) {
         return NextResponse.json(
            { error: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      return NextResponse.json({
         user: {
            id: user.id,
            studentId: user.studentId,
            name: user.name,
            department: user.department,
            phone: user.phone,
            points: user.points,
            isAdmin: user.isAdmin,
            joinedAt: user.joinedAt,
            membershipFeeStatus: user.membershipFeeStatus,
            pointHistory: user.pointHistory,
         },
      });
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
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 본인이거나 관리자만 수정 가능
      if (currentUser.id !== id && !currentUser.isAdmin) {
         return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = updateUserSchema.parse(body);
      const { name, department, phone, isAdmin, membershipFeeStatus } = validatedData;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;
      if (phone !== undefined) updateData.phone = phone;

      // 관리자 권한 변경은 관리자만 가능
      if (isAdmin !== undefined && currentUser.isAdmin) {
         updateData.isAdmin = isAdmin;
      }

      // 자치회비 납부 여부 변경은 관리자만 가능
      if (membershipFeeStatus !== undefined && currentUser.isAdmin) {
         updateData.membershipFeeStatus = membershipFeeStatus;
      }

      const user = await prisma.user.update({
         where: { id },
         data: updateData,
      });

      return NextResponse.json({
         message: '사용자 정보가 수정되었습니다.',
         user: {
            id: user.id,
            studentId: user.studentId,
            name: user.name,
            department: user.department,
            phone: user.phone,
            points: user.points,
            isAdmin: user.isAdmin,
            membershipFeeStatus: user.membershipFeeStatus,
         },
      });
   } catch (error) {
      console.error('Update user error:', error);

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
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!currentUser.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 사용자를 삭제할 수 있습니다.' },
            { status: 403 }
         );
      }

      // 자기 자신은 삭제 불가
      if (currentUser.id === id) {
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

      // Prisma의 onDelete: Cascade로 관련 데이터 자동 삭제
      await prisma.user.delete({
         where: { id },
      });

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

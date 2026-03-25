import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// PATCH /api/grade-configs/[id] - 등급 설정 수정 (관리자만)
export async function PATCH(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!user.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 등급 설정을 수정할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();
      const { name, type, minPoints, maxPoints, percentileMin, percentileMax, emoji, badgeImage, color, bgColor, orderIndex, benefit } = body;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (minPoints !== undefined) updateData.minPoints = minPoints;
      if (maxPoints !== undefined) updateData.maxPoints = maxPoints;
      if (percentileMin !== undefined) updateData.percentileMin = percentileMin;
      if (percentileMax !== undefined) updateData.percentileMax = percentileMax;
      if (emoji !== undefined) updateData.emoji = emoji;
      if (badgeImage !== undefined) updateData.badgeImage = badgeImage;
      if (color !== undefined) updateData.color = color;
      if (bgColor !== undefined) updateData.bgColor = bgColor;
      if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
      if (benefit !== undefined) updateData.benefit = benefit;

      const gradeConfig = await prisma.gradeConfig.update({
         where: { id },
         data: updateData,
      });

      return NextResponse.json({
         message: '등급 설정이 수정되었습니다.',
         gradeConfig,
      });
   } catch (error) {
      console.error('Update grade config error:', error);
      return NextResponse.json(
         { error: '등급 설정 수정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// DELETE /api/grade-configs/[id] - 등급 설정 삭제 (관리자만)
export async function DELETE(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!user.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 등급 설정을 삭제할 수 있습니다.' },
            { status: 403 }
         );
      }

      await prisma.gradeConfig.delete({
         where: { id },
      });

      return NextResponse.json({
         message: '등급 설정이 삭제되었습니다.',
      });
   } catch (error) {
      console.error('Delete grade config error:', error);
      return NextResponse.json(
         { error: '등급 설정 삭제 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { updateRentalItemSchema } from '@/lib/validations';
import { z } from 'zod';

// PATCH /api/rental-items/[id] - 대여 물품 수정 (관리자만)
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

      // 관리자 권한 확인
      const user = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (!user?.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 대여 물품을 수정할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = updateRentalItemSchema.parse(body);
      const { name, category, totalStock, emoji, description, isActive } = validatedData;

      // 현재 물품 정보 조회
      const currentItem = await prisma.rentalItem.findUnique({
         where: { id },
      });

      if (!currentItem) {
         return NextResponse.json(
            { error: '대여 물품을 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (category !== undefined) updateData.category = category;
      if (emoji !== undefined) updateData.emoji = emoji || null;
      if (description !== undefined) updateData.description = description || null;
      if (isActive !== undefined) updateData.isActive = isActive;

      // 재고 수량 변경 시 available도 조정
      if (totalStock !== undefined) {
         const stockNum = typeof totalStock === 'number' ? totalStock : parseInt(totalStock);
         const stockDiff = stockNum - currentItem.totalStock;
         updateData.totalStock = stockNum;
         updateData.available = currentItem.available + stockDiff;
      }

      const item = await prisma.rentalItem.update({
         where: { id },
         data: updateData,
      });

      return NextResponse.json({
         message: '대여 물품이 수정되었습니다.',
         item,
      });
   } catch (error) {
      console.error('Update rental item error:', error);

      // Zod 유효성 검사 에러
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '대여 물품 수정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// DELETE /api/rental-items/[id] - 대여 물품 삭제 (관리자만)
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
      const user = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      if (!user?.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 대여 물품을 삭제할 수 있습니다.' },
            { status: 403 }
         );
      }

      // 활성 대여 건수 확인
      const activeRentals = await prisma.rental.count({
         where: {
            itemId: id,
            status: 'active',
         },
      });

      if (activeRentals > 0) {
         return NextResponse.json(
            { error: '현재 대여 중인 물품은 삭제할 수 없습니다.' },
            { status: 400 }
         );
      }

      await prisma.rentalItem.delete({
         where: { id },
      });

      return NextResponse.json({
         message: '대여 물품이 삭제되었습니다.',
      });
   } catch (error) {
      console.error('Delete rental item error:', error);
      return NextResponse.json(
         { error: '대여 물품 삭제 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

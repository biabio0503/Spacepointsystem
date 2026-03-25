import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { updateRentalItemSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/rental-items/[id] - 대여 물품 상세 조회
export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;

      const item = await prisma.rentalItem.findUnique({
         where: { id },
         include: {
            rentals: {
               orderBy: { rentalDate: 'desc' },
               include: {
                  user: {
                     select: { studentId: true, name: true, department: true },
                  },
               },
            },
         },
      });

      if (!item) {
         return NextResponse.json(
            { error: '대여 물품을 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      // available 동적 계산
      const rentedQuantity = await prisma.rental.aggregate({
         where: {
            itemId: id,
            status: 'active',
         },
         _sum: { quantity: true },
      });
      const available = item.totalStock - (rentedQuantity._sum.quantity || 0);

      return NextResponse.json({
         rentalItem: { ...item, available },
      });
   } catch (error) {
      console.error('Get rental item error:', error);
      return NextResponse.json(
         { error: '대여 물품 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// PATCH /api/rental-items/[id] - 대여 물품 수정 (관리자만)
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
            { error: '관리자만 대여 물품을 수정할 수 있습니다.' },
            { status: 403 }
         );
      }

      const currentItem = await prisma.rentalItem.findUnique({
         where: { id },
      });

      if (!currentItem) {
         return NextResponse.json(
            { error: '대여 물품을 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = updateRentalItemSchema.parse(body);
      const { name, category, totalStock, emoji, description, isActive } = validatedData;

      // 현재 대여중인 수량 계산
      const rentedQuantity = await prisma.rental.aggregate({
         where: {
            itemId: id,
            status: 'active',
         },
         _sum: { quantity: true },
      });
      const rented = rentedQuantity._sum.quantity || 0;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (category !== undefined) updateData.category = category;
      if (emoji !== undefined) updateData.emoji = emoji || null;
      if (description !== undefined) updateData.description = description || null;
      if (isActive !== undefined) updateData.isActive = isActive;

      if (totalStock !== undefined) {
         const stockNum = typeof totalStock === 'number' ? totalStock : parseInt(totalStock);
         updateData.totalStock = stockNum;
         updateData.available = stockNum - rented;
      }

      const rentalItem = await prisma.rentalItem.update({
         where: { id },
         data: updateData,
      });

      const available = rentalItem.totalStock - rented;

      return NextResponse.json({
         message: '대여 물품이 수정되었습니다.',
         rentalItem: { ...rentalItem, available },
      });
   } catch (error) {
      console.error('Update rental item error:', error);

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

// PUT /api/rental-items/[id] - PATCH와 동일
export const PUT = PATCH;

// DELETE /api/rental-items/[id] - 대여 물품 삭제 (관리자만)
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

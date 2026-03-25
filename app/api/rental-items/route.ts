import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { createRentalItemSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/rental-items - 대여 물품 목록 조회
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const onlyActive = searchParams.get('active') === 'true';

      const items = await prisma.rentalItem.findMany({
         where: {
            ...(category ? { category } : {}),
            ...(onlyActive ? { isActive: true } : {}),
         },
         orderBy: { name: 'asc' },
      });

      // 각 아이템의 실제 available 계산
      const rentalItems = await Promise.all(
         items.map(async (item) => {
            const rentedQuantity = await prisma.rental.aggregate({
               where: {
                  itemId: item.id,
                  status: 'active',
               },
               _sum: { quantity: true },
            });
            const available = item.totalStock - (rentedQuantity._sum.quantity || 0);
            return { ...item, available };
         })
      );

      return NextResponse.json({ rentalItems });
   } catch (error) {
      console.error('Get rental items error:', error);
      return NextResponse.json(
         { error: '대여 물품 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// POST /api/rental-items - 대여 물품 생성 (관리자만)
export async function POST(request: NextRequest) {
   try {
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!user.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 대여 물품을 생성할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = createRentalItemSchema.parse(body);
      const { name, category, totalStock, emoji, description } = validatedData;

      const stockNum = typeof totalStock === 'number' ? totalStock : parseInt(totalStock);

      const rentalItem = await prisma.rentalItem.create({
         data: {
            name,
            category,
            totalStock: stockNum,
            available: stockNum,
            emoji: emoji || null,
            description: description || null,
            isActive: true,
         },
      });

      return NextResponse.json({
         message: '대여 물품이 생성되었습니다.',
         rentalItem: { ...rentalItem, available: stockNum },
      });
   } catch (error) {
      console.error('Create rental item error:', error);

      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '대여 물품 생성 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

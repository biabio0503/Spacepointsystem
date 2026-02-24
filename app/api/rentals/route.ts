import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createRentalSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/rentals - 대여 내역 조회
export async function GET(request: NextRequest) {
   try {
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const isAdmin = searchParams.get('admin') === 'true';

      // 관리자인지 확인
      const user = await prisma.user.findUnique({
         where: { id: authUser.id },
      });

      const where: any = {};

      // 관리자가 아니면 본인 대여 내역만 조회
      if (!isAdmin || !user?.isAdmin) {
         where.userId = authUser.id;
      }

      if (status) {
         where.status = status;
      }

      const rentals = await prisma.rental.findMany({
         where,
         include: {
            user: {
               select: {
                  studentId: true,
                  name: true,
                  department: true,
                  phone: true,
               },
            },
            item: true,
         },
         orderBy: { rentalDate: 'desc' },
      });

      return NextResponse.json({ rentals });
   } catch (error) {
      console.error('Get rentals error:', error);
      return NextResponse.json(
         { error: '대여 내역 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// POST /api/rentals - 대여 신청
export async function POST(request: NextRequest) {
   try {
      const supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = createRentalSchema.parse(body);
      const { itemId, quantity, expectedReturnDate, notes } = validatedData;

      // 물품 재고 확인
      const item = await prisma.rentalItem.findUnique({
         where: { id: itemId },
      });

      if (!item) {
         return NextResponse.json(
            { error: '대여 물품을 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      if (!item.isActive) {
         return NextResponse.json(
            { error: '현재 대여 불가능한 물품입니다.' },
            { status: 400 }
         );
      }

      const quantityNum = typeof quantity === 'number' ? quantity : parseInt(quantity);

      if (item.available < quantityNum) {
         return NextResponse.json(
            { error: `재고가 부족합니다. (현재 재고: ${item.available}개)` },
            { status: 400 }
         );
      }

      // 트랜잭션으로 대여 생성 및 재고 차감
      const rental = await prisma.$transaction(async (tx) => {
         // 대여 생성
         const newRental = await tx.rental.create({
            data: {
               userId: authUser.id,
               itemId,
               quantity: quantityNum,
               rentalDate: new Date(),
               expectedReturnDate: new Date(expectedReturnDate),
               status: 'active',
               notes: notes || null,
            },
            include: {
               item: true,
               user: {
                  select: {
                     studentId: true,
                     name: true,
                     department: true,
                  },
               },
            },
         });

         // 재고 차감
         await tx.rentalItem.update({
            where: { id: itemId },
            data: {
               available: { decrement: quantityNum },
            },
         });

         return newRental;
      });

      return NextResponse.json({
         message: '대여 신청이 완료되었습니다.',
         rental,
      });
   } catch (error) {
      console.error('Create rental error:', error);

      // Zod 유효성 검사 에러
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '대여 신청 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/rentals/[id]/return - 대여 반납 처리
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
            { error: '관리자만 반납 처리를 할 수 있습니다.' },
            { status: 403 }
         );
      }

      // 대여 정보 조회
      const rental = await prisma.rental.findUnique({
         where: { id },
         include: { item: true },
      });

      if (!rental) {
         return NextResponse.json(
            { error: '대여 내역을 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      if (rental.status !== 'active') {
         return NextResponse.json(
            { error: '이미 반납 처리된 대여입니다.' },
            { status: 400 }
         );
      }

      // 트랜잭션으로 반납 처리 및 재고 복구
      const updatedRental = await prisma.$transaction(async (tx) => {
         // 반납 처리
         const updated = await tx.rental.update({
            where: { id },
            data: {
               status: 'returned',
               returnDate: new Date(),
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

         // 재고 복구
         await tx.rentalItem.update({
            where: { id: rental.itemId },
            data: {
               available: { increment: rental.quantity },
            },
         });

         return updated;
      });

      return NextResponse.json({
         message: '반납 처리가 완료되었습니다.',
         rental: updatedRental,
      });
   } catch (error) {
      console.error('Return rental error:', error);
      return NextResponse.json(
         { error: '반납 처리 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

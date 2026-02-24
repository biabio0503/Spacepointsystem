import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createRentalItemSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/rental-items - 대여 물품 목록 조회
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const onlyActive = searchParams.get('active') === 'true';

      const where: any = {};
      if (category) where.category = category;
      if (onlyActive) where.isActive = true;

      const items = await prisma.rentalItem.findMany({
         where,
         orderBy: { name: 'asc' },
      });

      return NextResponse.json({ items });
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
            { error: '관리자만 대여 물품을 생성할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = createRentalItemSchema.parse(body);
      const { name, category, totalStock, emoji, description } = validatedData;

      const item = await prisma.rentalItem.create({
         data: {
            name,
            category,
            totalStock: typeof totalStock === 'number' ? totalStock : parseInt(totalStock),
            available: typeof totalStock === 'number' ? totalStock : parseInt(totalStock),
            emoji: emoji || null,
            description: description || null,
            isActive: true,
         },
      });

      return NextResponse.json({
         message: '대여 물품이 생성되었습니다.',
         item,
      });
   } catch (error) {
      console.error('Create rental item error:', error);

      // Zod 유효성 검사 에러
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

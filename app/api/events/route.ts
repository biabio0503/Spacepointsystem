import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createEventSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/events - 이벤트 목록 조회
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const onlyActive = searchParams.get('active') === 'true';

      const now = new Date();
      const events = await prisma.event.findMany({
         where: onlyActive
            ? {
               isActive: true,
               postDate: { lte: now },
               postEndDate: { gte: now },
            }
            : undefined,
         orderBy: { date: 'desc' },
      });

      return NextResponse.json({ events });
   } catch (error) {
      console.error('Get events error:', error);
      return NextResponse.json(
         { error: '이벤트 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// POST /api/events - 이벤트 생성 (관리자만)
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
            { error: '관리자만 이벤트를 생성할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = createEventSchema.parse(body);
      const {
         title,
         location,
         date,
         endDate,
         content,
         imageUrl,
         instagramUrl,
         points,
         postDate,
         postEndDate,
      } = validatedData;

      const event = await prisma.event.create({
         data: {
            title,
            location,
            date: new Date(date),
            endDate: endDate ? new Date(endDate) : null,
            content,
            imageUrl: imageUrl || null,
            instagramUrl: instagramUrl || null,
            points: typeof points === 'number' ? points : parseInt(points),
            postDate: new Date(postDate),
            postEndDate: new Date(postEndDate),
            isActive: true,
         },
      });

      return NextResponse.json({
         message: '이벤트가 생성되었습니다.',
         event,
      });
   } catch (error) {
      console.error('Create event error:', error);

      // Zod 유효성 검사 에러
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '이벤트 생성 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

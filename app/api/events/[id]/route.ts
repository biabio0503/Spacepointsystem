import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { updateEventSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/events/[id] - 이벤트 상세 조회
export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const event = await prisma.event.findUnique({
         where: { id },
      });

      if (!event) {
         return NextResponse.json(
            { error: '이벤트를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      return NextResponse.json({ event });
   } catch (error) {
      console.error('Get event error:', error);
      return NextResponse.json(
         { error: '이벤트 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// PATCH /api/events/[id] - 이벤트 수정 (관리자만)
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
            { error: '관리자만 이벤트를 수정할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();

      // Zod 유효성 검사
      const validatedData = updateEventSchema.parse(body);
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
         isActive,
      } = validatedData;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (location !== undefined) updateData.location = location;
      if (date !== undefined) updateData.date = new Date(date);
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (content !== undefined) updateData.content = content;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
      if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl || null;
      if (points !== undefined) updateData.points = typeof points === 'number' ? points : parseInt(points);
      if (postDate !== undefined) updateData.postDate = new Date(postDate);
      if (postEndDate !== undefined) updateData.postEndDate = new Date(postEndDate);
      if (isActive !== undefined) updateData.isActive = isActive;

      const event = await prisma.event.update({
         where: { id },
         data: updateData,
      });

      return NextResponse.json({
         message: '이벤트가 수정되었습니다.',
         event,
      });
   } catch (error) {
      console.error('Update event error:', error);

      // Zod 유효성 검사 에러
      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '이벤트 수정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// DELETE /api/events/[id] - 이벤트 삭제 (관리자만)
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
            { error: '관리자만 이벤트를 삭제할 수 있습니다.' },
            { status: 403 }
         );
      }

      await prisma.event.delete({
         where: { id },
      });

      return NextResponse.json({
         message: '이벤트가 삭제되었습니다.',
      });
   } catch (error) {
      console.error('Delete event error:', error);
      return NextResponse.json(
         { error: '이벤트 삭제 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

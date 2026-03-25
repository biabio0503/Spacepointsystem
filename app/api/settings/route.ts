import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/settings - 설정 조회 (누구나 가능)
export async function GET() {
   try {
      // 설정이 하나만 존재하도록, 첫 번째 설정을 가져옴
      let settings = await prisma.settings.findFirst();

      // 설정이 없으면 기본 설정 생성
      if (!settings) {
         settings = await prisma.settings.create({
            data: {
               organizationName: '학생복지위원회',
               primaryColor: '#1B2A5C',
               secondaryColor: '#7DC443',
               contactPhone: '010-0000-0000',
               contactPerson: '담당자',
            },
         });
      }

      return NextResponse.json({ settings });
   } catch (error) {
      console.error('Get settings error:', error);
      return NextResponse.json(
         { error: '설정 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// PATCH /api/settings - 설정 수정 (관리자만)
export async function PATCH(request: NextRequest) {
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
            { error: '관리자만 설정을 수정할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();
      const { organizationName, logoMain, primaryColor, secondaryColor, contactPhone, contactPerson } = body;

      // 기존 설정 찾기
      let settings = await prisma.settings.findFirst();

      if (!settings) {
         // 설정이 없으면 생성
         settings = await prisma.settings.create({
            data: {
               organizationName: organizationName || '학생복지위원회',
               logoMain: logoMain || null,
               primaryColor: primaryColor || '#1B2A5C',
               secondaryColor: secondaryColor || '#7DC443',
               contactPhone: contactPhone || '010-0000-0000',
               contactPerson: contactPerson || '담당자',
            },
         });
      } else {
         // 설정이 있으면 업데이트
         const updateData: Record<string, unknown> = {};
         if (organizationName !== undefined) updateData.organizationName = organizationName;
         if (logoMain !== undefined) updateData.logoMain = logoMain;
         if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
         if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
         if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
         if (contactPerson !== undefined) updateData.contactPerson = contactPerson;

         settings = await prisma.settings.update({
            where: { id: settings.id },
            data: updateData,
         });
      }

      return NextResponse.json({
         message: '설정이 수정되었습니다.',
         settings,
      });
   } catch (error) {
      console.error('Update settings error:', error);
      return NextResponse.json(
         { error: '설정 수정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

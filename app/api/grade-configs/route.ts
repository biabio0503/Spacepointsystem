import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/grade-configs - 등급 설정 조회 (누구나 가능)
export async function GET() {
   try {
      const gradeConfigs = await prisma.gradeConfig.findMany({
         orderBy: { orderIndex: 'asc' },
      });

      return NextResponse.json({ gradeConfigs });
   } catch (error) {
      console.error('Get grade configs error:', error);
      return NextResponse.json(
         { error: '등급 설정 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// POST /api/grade-configs - 등급 설정 추가 (관리자만)
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
            { error: '관리자만 등급 설정을 추가할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();
      const { name, type, minPoints, maxPoints, percentileMin, percentileMax, emoji, badgeImage, color, bgColor, orderIndex, benefit } = body;

      if (!name || !type || minPoints === undefined || !emoji || !color || !bgColor || orderIndex === undefined) {
         return NextResponse.json(
            { error: '필수 필드를 모두 입력해주세요.' },
            { status: 400 }
         );
      }

      const gradeConfig = await prisma.gradeConfig.create({
         data: {
            name,
            type,
            minPoints,
            maxPoints,
            percentileMin,
            percentileMax,
            emoji,
            badgeImage,
            color,
            bgColor,
            benefit: benefit || '',
            orderIndex,
         },
      });

      return NextResponse.json({
         message: '등급 설정이 추가되었습니다.',
         gradeConfig,
      });
   } catch (error) {
      console.error('Create grade config error:', error);
      return NextResponse.json(
         { error: '등급 설정 추가 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

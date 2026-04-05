import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

// POST /api/users/[id]/reset-password - 비밀번호 재설정 (관리자만)
export async function POST(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      if (!currentUser.isAdmin) {
         return NextResponse.json(
            { error: '관리자만 비밀번호를 재설정할 수 있습니다.' },
            { status: 403 }
         );
      }

      const body = await request.json();
      const { newPassword } = body;

      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
         return NextResponse.json(
            { error: '비밀번호는 4자 이상이어야 합니다.' },
            { status: 400 }
         );
      }

      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
         return NextResponse.json(
            { error: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
         where: { id },
         data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({ message: '비밀번호가 재설정되었습니다.' });
   } catch (error) {
      console.error('Reset password error:', error);
      return NextResponse.json(
         { error: '비밀번호 재설정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

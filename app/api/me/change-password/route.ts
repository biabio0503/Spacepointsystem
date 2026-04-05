import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

// POST /api/me/change-password - 본인 비밀번호 변경
export async function POST(request: NextRequest) {
   try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
         return NextResponse.json(
            { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
            { status: 400 }
         );
      }

      if (newPassword.length < 4) {
         return NextResponse.json(
            { error: '새 비밀번호는 4자 이상이어야 합니다.' },
            { status: 400 }
         );
      }

      const user = await prisma.user.findUnique({
         where: { id: currentUser.id },
      });

      if (!user) {
         return NextResponse.json(
            { error: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
         return NextResponse.json(
            { error: '현재 비밀번호가 올바르지 않습니다.' },
            { status: 400 }
         );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
         where: { id: currentUser.id },
         data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({ message: '비밀번호가 변경되었습니다.' });
   } catch (error) {
      console.error('Change password error:', error);
      return NextResponse.json(
         { error: '비밀번호 변경 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// DELETE /api/me/delete-account - 본인 계정 탈퇴
export async function DELETE(request: NextRequest) {
   try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 관리자는 자기 자신 탈퇴 불가
      if (currentUser.isAdmin) {
         return NextResponse.json(
            { error: '관리자 계정은 탈퇴할 수 없습니다. 다른 관리자에게 문의하세요.' },
            { status: 400 }
         );
      }

      const body = await request.json().catch(() => ({}));
      const { password } = body;

      if (!password) {
         return NextResponse.json(
            { error: '비밀번호를 입력해주세요.' },
            { status: 400 }
         );
      }

      // 비밀번호 확인
      const user = await prisma.user.findUnique({
         where: { id: currentUser.id },
      });

      if (!user) {
         return NextResponse.json(
            { error: '사용자를 찾을 수 없습니다.' },
            { status: 404 }
         );
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
         return NextResponse.json(
            { error: '비밀번호가 올바르지 않습니다.' },
            { status: 400 }
         );
      }

      // 사용자 삭제 (Cascade로 관련 데이터 자동 삭제)
      await prisma.user.delete({
         where: { id: currentUser.id },
      });

      // 쿠키 삭제 (로그아웃)
      const cookieStore = await cookies();
      cookieStore.delete('token');
      cookieStore.delete('refreshToken');

      return NextResponse.json({ message: '회원 탈퇴가 완료되었습니다.' });
   } catch (error) {
      console.error('Delete account error:', error);
      return NextResponse.json(
         { error: '회원 탈퇴 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

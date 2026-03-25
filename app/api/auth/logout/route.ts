import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth-utils';

export async function POST() {
   try {
      await removeAuthCookie();
      return NextResponse.json({ message: '로그아웃 되었습니다.' });
   } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
         { error: '로그아웃 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
   try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
         return NextResponse.json(
            { error: error.message },
            { status: 400 }
         );
      }

      return NextResponse.json({ message: '로그아웃 되었습니다.' });
   } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
         { error: '로그아웃 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

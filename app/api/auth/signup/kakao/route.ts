import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
   return NextResponse.json(
      { error: '카카오 회원가입은 아직 지원하지 않습니다.' },
      { status: 403 }
   );
}

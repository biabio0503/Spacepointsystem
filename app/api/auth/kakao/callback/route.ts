import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
   try {
      const searchParams = request.nextUrl.searchParams;
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
         return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
      }

      if (!code) {
         return NextResponse.redirect(new URL('/login?error=no_code', request.url));
      }

      // 카카오 토큰 요청
      const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
            redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
            code,
         }),
      });

      if (!tokenResponse.ok) {
         const errorData = await tokenResponse.json();
         console.error('Kakao token error:', errorData);
         return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 카카오 사용자 정보 요청
      const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
         headers: {
            Authorization: `Bearer ${accessToken}`,
         },
      });

      if (!userResponse.ok) {
         return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url));
      }

      const kakaoUser = await userResponse.json();
      const kakaoId = kakaoUser.id.toString();

      // DB에서 카카오 ID로 사용자 찾기
      const existingUser = await prisma.user.findFirst({
         where: { kakaoId },
      });

      if (existingUser) {
         // 기존 사용자 - Supabase 로그인
         const supabase = await createClient();
         const { error: signInError } = await supabase.auth.signInWithPassword({
            email: `${existingUser.studentId}@student.local`,
            password: existingUser.studentId, // 카카오 로그인 사용자는 학번을 비밀번호로 사용
         });

         if (signInError) {
            console.error('Supabase sign in error:', signInError);
            return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
         }

         // 로그인 성공
         const redirectUrl = existingUser.isAdmin ? '/admin' : '/home';
         return NextResponse.redirect(new URL(redirectUrl, request.url));
      } else {
         // 신규 사용자 - 학번 연동 페이지로 이동
         const redirectUrl = new URL('/signup', request.url);
         redirectUrl.searchParams.set('kakao_id', kakaoId);
         redirectUrl.searchParams.set('kakao_name', kakaoUser.properties?.nickname || '');
         return NextResponse.redirect(redirectUrl);
      }
   } catch (error) {
      console.error('Kakao callback error:', error);
      return NextResponse.redirect(new URL('/login?error=unknown', request.url));
   }
}

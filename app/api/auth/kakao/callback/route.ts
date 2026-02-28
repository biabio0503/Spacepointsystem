import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// 카카오 사용자의 일관된 패스워드 생성 (회원가입과 로그인에서 동일하게 사용)
function generateKakaoPassword(kakaoId: string): string {
   return `kakao_${kakaoId}_${process.env.KAKAO_CLIENT_SECRET}`;
}

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
         return NextResponse.redirect(
            new URL(`/login?error=kakao_auth_failed&message=${encodeURIComponent('카카오 로그인이 취소되었습니다.')}`, request.url)
         );
      }

      if (!code) {
         return NextResponse.redirect(
            new URL('/login?error=no_code&message=' + encodeURIComponent('인증 코드가 없습니다.'), request.url)
         );
      }

      // 1. Access Token 요청
      const tokenParams: Record<string, string> = {
         grant_type: 'authorization_code',
         client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
         redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
         code,
      };

      // Client Secret이 있으면 추가 (보안 강화 설정 시 필수)
      if (process.env.KAKAO_CLIENT_SECRET) {
         tokenParams.client_secret = process.env.KAKAO_CLIENT_SECRET;
      }

      const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams(tokenParams),
      });

      if (!tokenResponse.ok) {
         const errorData = await tokenResponse.json();
         console.error('카카오 토큰 요청 실패:', errorData);
         return NextResponse.redirect(
            new URL('/login?error=token_failed&message=' + encodeURIComponent('카카오 인증에 실패했습니다.'), request.url)
         );
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. 사용자 정보 요청
      const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
         headers: {
            Authorization: `Bearer ${accessToken}`,
         },
      });

      if (!userInfoResponse.ok) {
         console.error('카카오 사용자 정보 요청 실패');
         return NextResponse.redirect(
            new URL('/login?error=userinfo_failed&message=' + encodeURIComponent('사용자 정보를 가져올 수 없습니다.'), request.url)
         );
      }

      const userInfo = await userInfoResponse.json();
      const kakaoId = String(userInfo.id);

      // 3. DB에서 카카오 ID로 사용자 조회
      const existingUser = await prisma.user.findUnique({
         where: { kakaoId },
      });

      if (existingUser) {
         // 기존 사용자 - Supabase Auth 세션 생성
         const supabase = await createClient();
         const kakaoPassword = generateKakaoPassword(kakaoId);

         // Supabase Auth로 로그인하여 세션 생성
         const { error: signInError } = await supabase.auth.signInWithPassword({
            email: `${existingUser.studentId}@student.local`,
            password: kakaoPassword,
         });

         if (signInError) {
            console.error('Supabase 로그인 실패:', signInError);
            return NextResponse.redirect(
               new URL('/login?error=session_failed&message=' + encodeURIComponent('세션 생성에 실패했습니다.'), request.url)
            );
         }

         // 로그인 성공 - /home으로 리다이렉트
         const redirectUrl = new URL('/home', request.url);
         return NextResponse.redirect(redirectUrl);
      } else {
         // 신규 사용자 - 회원가입 페이지로 리다이렉트
         const signupUrl = new URL('/signup/kakao', request.url);
         signupUrl.searchParams.set('kakaoId', kakaoId);

         // 카카오 프로필 정보가 있으면 전달
         if (userInfo.kakao_account?.profile?.nickname) {
            signupUrl.searchParams.set('nickname', userInfo.kakao_account.profile.nickname);
         }

         return NextResponse.redirect(signupUrl);
      }
   } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error);
      return NextResponse.redirect(
         new URL('/login?error=unknown&message=' + encodeURIComponent('로그인 처리 중 오류가 발생했습니다.'), request.url)
      );
   }
}
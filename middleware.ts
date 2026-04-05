import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_VALUE = process.env.JWT_SECRET;


const TOKEN_NAME = 'auth-token';

// 보호된 경로 목록
const protectedRoutes = ['/admin', '/mypage', '/settings'];

// 관리자 전용 경로
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;

   // 정적 파일과 API 라우트는 패스
   if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.')
   ) {
      return NextResponse.next();
   }

   // 보호된 경로인지 확인
   const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
   );

   if (!isProtectedRoute) {
      return NextResponse.next();
   }

   // 토큰 확인
   const token = request.cookies.get(TOKEN_NAME)?.value;

   if (!token) {
      // 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
   }

   try {
      // JWT_SECRET 미설정 시 안전하게 처리
      if (!JWT_SECRET_VALUE) {
         return NextResponse.redirect(new URL('/login', request.url));
      }
      const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE);
      // JWT 검증
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // 관리자 전용 경로 확인
      const isAdminRoute = adminRoutes.some((route) =>
         pathname.startsWith(route)
      );

      if (isAdminRoute && !payload.isAdmin) {
         // 권한 없음 - 홈으로 리다이렉트
         return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
   } catch {
      // 토큰이 유효하지 않음 - 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // 유효하지 않은 토큰 삭제
      response.cookies.delete(TOKEN_NAME);
      return response;
   }
}

export const config = {
   matcher: [
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
   ],
};

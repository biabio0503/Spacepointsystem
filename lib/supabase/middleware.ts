import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
   let supabaseResponse = NextResponse.next({
      request,
   });

   // 환경 변수가 없으면 미들웨어 스킵
   if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not found, skipping auth middleware');
      return supabaseResponse;
   }

   const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
         cookies: {
            get(name: string) {
               return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
               request.cookies.set({
                  name,
                  value,
                  ...options,
               });
               supabaseResponse = NextResponse.next({
                  request,
               });
               supabaseResponse.cookies.set({
                  name,
                  value,
                  ...options,
               });
            },
            remove(name: string, options: CookieOptions) {
               request.cookies.set({
                  name,
                  value: '',
                  ...options,
               });
               supabaseResponse = NextResponse.next({
                  request,
               });
               supabaseResponse.cookies.set({
                  name,
                  value: '',
                  ...options,
               });
            },
         },
      }
   );

   // 사용자 세션 새로고침
   await supabase.auth.getUser();

   return supabaseResponse;
}

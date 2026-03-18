import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
   return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
         auth: {
            persistSession: true, // 세션을 localStorage에 저장
            autoRefreshToken: true, // 자동으로 토큰 갱신
            detectSessionInUrl: true, // URL에서 세션 감지
            flowType: 'pkce', // PKCE 플로우 사용 (보안 강화)
         },
         global: {
            headers: {
               'X-Client-Info': 'supabase-js-web',
            },
         },
      }
   );
}

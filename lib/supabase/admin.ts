import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client
 * Service Role Key를 사용하여 admin 권한으로 인증 작업 수행
 * 주의: 서버 사이드에서만 사용해야 합니다!
 */
export const createAdminClient = () => {
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

   if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
   }

   return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
         autoRefreshToken: false,
         persistSession: false,
      },
   });
};

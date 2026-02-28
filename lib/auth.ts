import { createClient } from '@/lib/supabase/client';

export interface User {
   id: string;
   studentId: string;
   name: string;
   department: string;
   phone: string;
   points: number;
   isAdmin: boolean;
   referralCode?: string | null;
   joinedAt: Date;
}

export interface AuthState {
   user: User | null;
   loading: boolean;
   error: string | null;
}

class AuthService {
   private supabase = createClient();

   // 현재 사용자 정보 가져오기
   async getCurrentUser(): Promise<User | null> {
      try {
         const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser();

         if (authError || !authUser) {
            return null;
         }

         // API에서 사용자 상세 정보 가져오기
         const response = await fetch('/api/auth/me');

         if (!response.ok) {
            return null;
         }

         const data = await response.json();
         return data.user;
      } catch (error) {
         console.error('Get current user error:', error);
         return null;
      }
   }

   // 로그인
   async login(studentId: string, password: string): Promise<{ user: User | null; error: string | null }> {
      try {
         const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, password }),
         });

         const data = await response.json();

         if (!response.ok) {
            return { user: null, error: data.error || '로그인에 실패했습니다.' };
         }

         return { user: data.user, error: null };
      } catch (error) {
         console.error('Login error:', error);
         return { user: null, error: '로그인 중 오류가 발생했습니다.' };
      }
   }

   // 회원가입
   async signup(userData: {
      studentId: string;
      name: string;
      department: string;
      phone: string;
      password: string;
      referralCode?: string;
   }): Promise<{ user: User | null; error: string | null }> {
      try {
         const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
         });

         const data = await response.json();

         if (!response.ok) {
            return { user: null, error: data.error || '회원가입에 실패했습니다.' };
         }

         return { user: data.user, error: null };
      } catch (error) {
         console.error('Signup error:', error);
         return { user: null, error: '회원가입 중 오류가 발생했습니다.' };
      }
   }

   // 로그아웃
   async logout(): Promise<{ error: string | null }> {
      try {
         const response = await fetch('/api/auth/logout', {
            method: 'POST',
         });

         if (!response.ok) {
            const data = await response.json();
            return { error: data.error || '로그아웃에 실패했습니다.' };
         }

         return { error: null };
      } catch (error) {
         console.error('Logout error:', error);
         return { error: '로그아웃 중 오류가 발생했습니다.' };
      }
   }

   // 인증 상태 변경 리스너
   onAuthStateChange(callback: (user: User | null) => void) {
      const { data: { subscription } } = this.supabase.auth.onAuthStateChange(async (event, session) => {
         if (session?.user) {
            const user = await this.getCurrentUser();
            callback(user);
         } else {
            callback(null);
         }
      });

      return subscription;
   }
}

export const authService = new AuthService();

export interface User {
   id: string;
   studentId: string;
   name: string;
   department: string;
   phone: string;
   points: number;
   isAdmin: boolean;
   joinedAt: Date;
}

export interface AuthState {
   user: User | null;
   loading: boolean;
   error: string | null;
}

class AuthService {
   // 현재 사용자 정보 가져오기
   async getCurrentUser(): Promise<User | null> {
      try {
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
      membershipFeeStatus?: string;
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
   // 초기 로딩은 loadInitialData()가 전담하므로 여기서 즉시 실행하지 않음
   onAuthStateChange(_callback: (user: User | null) => void) {
      return {
         unsubscribe: () => { },
      };
   }
}

export const authService = new AuthService();

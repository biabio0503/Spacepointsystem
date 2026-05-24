'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import { authService } from '@/lib/auth';
import { eventsAPI, usersAPI, meAPI, pointHistoryAPI, settingsAPI, gradeConfigsAPI } from '@/lib/api-client';

export type Grade = string; // 동적 등급 이름 지원

export interface User {
   id: string;
   studentId: string;
   name: string;
   department: string;
   phone: string;
   referralCode?: string | null;
   points: number;
   joinedAt: Date | string;
   isAdmin?: boolean;
}

export interface Event {
   id: string;
   title: string;
   location: string;
   date: string;
   endDate?: string;
   content: string;
   imageUrls: string[];
   instagramUrl?: string;
   points: number;
   postDate: string;
   postEndDate: string;
   isActive: boolean;
}

export interface PointHistory {
   id: string;
   userId: string;
   points: number;
   reason: string;
   date: string;
}


export interface Settings {
   id: string;
   organizationName: string;
   organizationSlogun: string | null;
   logoMain: string | null;
   instagram: string | null;
   primaryColor: string;
   secondaryColor: string;
   contactPhone: string;
   contactPerson: string;
}

export interface GradeConfig {
   id: string;
   name: string;
   type: string; // 'ABSOLUTE_POINTS' | 'PERCENTILE'
   minPoints: number;
   maxPoints: number | null;
   percentileMin: number | null; // PERCENTILE 모드용
   percentileMax: number | null; // PERCENTILE 모드용
   emoji: string;
   badgeImage: string | null;
   color: string;
   bgColor: string;
   benefit: string; // 등급별 혼입 설명
   orderIndex: number;
}

export const DEPARTMENTS = [
   // 공과대학
   '기계공학과', '기계시스템공학부 지능형로봇전공', '기계시스템공학부 미래자동차전공', '안전공학과', '신소재공학과', '건설시스템공학과', '건축학부 건축학전공', '건축학부 건축공학전공', '건축기계설비공학과', '자유전공학부 공과대학',

   // 정보통신대학
   '전기정보공학과', '전자공학과', '스마트ICT융합공학과', '컴퓨터공학과', '자유전공학부 정보통신대학',

   // 에너지바이오대학
   '화공생명공학과', '정밀화학과', '환경공학과', '식품생명공학과', '안경광학과', '스포츠과학과', '바이오메디컬화학과', '자유전공학부 에너지바이오대학',

   // 조형대학
   '디자인학과 산업디자인전공', '디자인학과 시각디자인전공', '도예학과', '금속공예디자인학과', '조형예술학과',

   // 인문사회대학
   '행정학과', '영어영문학과', '국어국문학과', '자유전공학부 인문사회대학',

   // 기술경영융합대학
   '산업공학과 산업정보시스템전공', '산업공학과 ITM전공', 'MSDE학과', '경영학과 경영학전공', '경영학과 GTM전공', '자유전공학부 기술경영융합대학',

   // 창의융합대학
   '인공지능응용학과', '지능형반도체공학과', '미래에너지융합학과', '에너지신기술융합학과', '자유전공학부 창의융합대학',

   // 미래융합대학 - 평생교육 단과대학
   '융합기계공학과', '건설환경융합공학과', '정보통신융합공학과', '헬스피트니스학과', '문화예술학과', '영어과', '벤처경영학과', '자유전공학부 미래융합대학',

   // 국제대학
   '글로벌기초교육학부', '글로벌한국어문화학과', '글로벌IT컨버전스학과', 'AI·미디어학과', '글로벌자유전공학부',

   // 교양대학
   '인문사회교양학부', '자연과학부', '융합교양학부', 'ST자유전공학부'
];

interface StoreState {
   // State
   currentUser: User | null;
   users: User[];
   events: Event[];
   pointHistory: PointHistory[];
   settings: Settings | null;
   gradeConfigs: GradeConfig[];
   isLoading: boolean;

   // Actions
   setCurrentUser: (user: User | null) => void;
   setUsers: (users: User[]) => void;
   setEvents: (events: Event[]) => void;
   setPointHistory: (history: PointHistory[]) => void;
   setSettings: (settings: Settings | null) => void;
   setGradeConfigs: (configs: GradeConfig[]) => void;
   setIsLoading: (loading: boolean) => void;

   // Refresh functions
   refreshUsers: () => Promise<void>;
   refreshEvents: () => Promise<void>;
   refreshPointHistory: () => Promise<void>;
   refreshSettings: () => Promise<void>;
   refreshGradeConfigs: () => Promise<void>;

   // Auth
   login: (studentId: string, password: string) => Promise<User | null>;
   logout: () => Promise<void>;
   register: (info: Omit<User, 'id' | 'points' | 'joinedAt'> & { password: string }) => Promise<User | null>;

   // Users
   updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
   deleteUser: (userId: string) => Promise<void>;

   // Events
   addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
   updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
   deleteEvent: (eventId: string) => Promise<void>;

   // Points
   addPoints: (userId: string, points: number, reason: string) => Promise<void>;

   // Utilities
   getGrade: (userId: string) => Grade;
   getGradeByPoints: (points: number, allUsers: User[]) => Grade;
   getGradeInfo: (grade: Grade) => { color: string; bg: string; emoji: string; label: string };
   finishLoading: () => void;
   loadInitialData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
   // Initial state
   currentUser: null,
   users: [],
   events: [],
   pointHistory: [],
   settings: null,
   gradeConfigs: [],
   isLoading: true,

   // Setters
   setCurrentUser: (user) => set({ currentUser: user }),
   setUsers: (users) => set({ users }),
   setEvents: (events) => set({ events }),
   setPointHistory: (history) => set({ pointHistory: history }),
   setSettings: (settings) => set({ settings }),
   setGradeConfigs: (configs) => set({ gradeConfigs: configs }),
   setIsLoading: (loading) => set({ isLoading: loading }),

   // Refresh functions
   refreshUsers: async () => {
      try {
         const { users: usersData } = await usersAPI.getAll();
         set({ users: usersData });
      } catch (error) {
         console.error('Failed to refresh users:', error);
      }
   },

   refreshEvents: async () => {
      try {
         const { events: eventsData } = await eventsAPI.getAll();
         set({ events: eventsData });
      } catch (error) {
         console.error('Failed to refresh events:', error);
      }
   },

   refreshPointHistory: async () => {
      try {
         const { pointHistory: historyData } = await pointHistoryAPI.getAll();
         set({ pointHistory: historyData });
      } catch (error) {
         console.error('Failed to refresh point history:', error);
      }
   },


   refreshSettings: async () => {
      try {
         const { settings: settingsData } = await settingsAPI.get();
         set({ settings: settingsData });
      } catch (error) {
         console.error('Failed to refresh settings:', error);
      }
   },

   refreshGradeConfigs: async () => {
      try {
         const { gradeConfigs: configsData } = await gradeConfigsAPI.getAll();
         set({ gradeConfigs: configsData });
      } catch (error) {
         console.error('Failed to refresh grade configs:', error);
      }
   },

   // Auth
   login: async (studentId, password) => {
      const { user, error } = await authService.login(studentId, password);
      if (error || !user) {
         console.error('Login failed:', error);
         return null;
      }
      set({ currentUser: user });
      return user;
   },

   logout: async () => {
      await authService.logout();
      set({
         currentUser: null,
         users: [],
         pointHistory: [],
      });
   },

   register: async (info) => {
      const { user, error } = await authService.signup({
         studentId: info.studentId,
         name: info.name,
         department: info.department,
         phone: info.phone,
         password: info.password,
         referralCode: info.referralCode || undefined,
      });

      if (error || !user) {
         console.error('Registration failed:', error);
         return null;
      }

      set({ currentUser: user });
      return user;
   },

   // Users
   updateUser: async (userId, updates) => {
      try {
         const { user } = await usersAPI.update(userId, updates);
         set((state) => ({
            users: state.users.map((u) => (u.id === userId ? user : u)),
            currentUser: state.currentUser?.id === userId ? user : state.currentUser,
         }));
      } catch (error) {
         console.error('Failed to update user:', error);
         throw error;
      }
   },

   deleteUser: async (userId) => {
      try {
         await usersAPI.delete(userId);
         set((state) => ({
            users: state.users.filter((u) => u.id !== userId),
         }));

         const { currentUser } = get();
         if (currentUser?.id === userId) {
            await get().logout();
         }
      } catch (error) {
         console.error('Failed to delete user:', error);
         throw error;
      }
   },

   // Events
   addEvent: async (event) => {
      try {
         const { event: newEvent } = await eventsAPI.create(event);
         set((state) => ({
            events: [...state.events, newEvent],
         }));
      } catch (error) {
         console.error('Failed to create event:', error);
         throw error;
      }
   },

   updateEvent: async (eventId, updates) => {
      try {
         const { event } = await eventsAPI.update(eventId, updates);
         set((state) => ({
            events: state.events.map((e) => (e.id === eventId ? event : e)),
         }));
      } catch (error) {
         console.error('Failed to update event:', error);
         throw error;
      }
   },

   deleteEvent: async (eventId) => {
      try {
         await eventsAPI.delete(eventId);
         set((state) => ({
            events: state.events.filter((e) => e.id !== eventId),
         }));
      } catch (error) {
         console.error('Failed to delete event:', error);
         throw error;
      }
   },

   // Points
   addPoints: async (userId, points, reason) => {
      try {
         const { currentUser } = get();

         if (currentUser?.id === userId && !currentUser?.isAdmin) {
            const { user } = await meAPI.claimPoints(points, reason);
            set({ currentUser: user });

            set((state) => ({
               pointHistory: [
                  ...state.pointHistory,
                  {
                     id: `h${Date.now()}`,
                     userId,
                     points,
                     reason,
                     date: new Date().toISOString().split('T')[0],
                  },
               ],
            }));
         } else {
            const { user } = await usersAPI.addPoints(userId, points, reason);
            set((state) => ({
               users: state.users.map((u) => (u.id === userId ? user : u)),
               currentUser: state.currentUser?.id === userId ? user : state.currentUser,
               pointHistory: [
                  ...state.pointHistory,
                  {
                     id: `h${Date.now()}`,
                     userId,
                     points,
                     reason,
                     date: new Date().toISOString().split('T')[0],
                  },
               ],
            }));
         }
      } catch (error) {
         console.error('Failed to add points:', error);
         throw error;
      }
   },

   // Utilities
   getGradeByPoints: (points, allUsers) => {
      const { gradeConfigs } = get();

      if (!gradeConfigs || gradeConfigs.length === 0) {
         // gradeConfigs가 없으면 기본 등급 반환
         if (points < 10) return '별';

         const eligibleUsers = allUsers.filter((u) => u.points >= 10 && !u.isAdmin);
         if (eligibleUsers.length === 0) return '행성';

         const sorted = [...eligibleUsers].sort((a, b) => b.points - a.points);
         const higherCount = sorted.filter((u) => u.points > points).length;
         const percentile = (higherCount / sorted.length) * 100;

         if (percentile < 20) return 'UFO';
         if (percentile < 60) return '로켓';
         return '행성';
      }

      // 등급 설정 타입 확인 (모든 설정이 같은 타입이어야 함)
      const gradeType = gradeConfigs[0]?.type || 'ABSOLUTE_POINTS';

      if (gradeType === 'PERCENTILE') {
         // PERCENTILE 모드: 상위 몇% 기준
         const eligibleUsers = allUsers.filter((u) => !u.isAdmin);
         if (eligibleUsers.length === 0) {
            const lowestGrade = [...gradeConfigs].sort((a, b) => a.orderIndex - b.orderIndex)[0];
            return lowestGrade?.name || '별';
         }

         const sorted = [...eligibleUsers].sort((a, b) => b.points - a.points);
         const userRank = sorted.findIndex((u) => u.points <= points);
         const percentile = userRank === -1 ? 100 : (userRank / sorted.length) * 100;

         // orderIndex가 높은 것부터 확인 (높은 등급부터)
         const sortedConfigs = [...gradeConfigs].sort((a, b) => b.orderIndex - a.orderIndex);

         for (const config of sortedConfigs) {
            // Check absolute min points for relative grades (e.g. must exceed threshold to get relative grade)
            if (config.minPoints > 0 && points < config.minPoints) {
               continue;
            }

            const meetsMin = config.percentileMin === null || percentile >= config.percentileMin;
            const meetsMax = config.percentileMax === null || percentile < config.percentileMax;

            if (meetsMin && meetsMax) {
               return config.name;
            }
         }
      } else {
         // ABSOLUTE_POINTS 모드: 절대 포인트 기준
         const sortedConfigs = [...gradeConfigs].sort((a, b) => b.orderIndex - a.orderIndex);

         for (const config of sortedConfigs) {
            const meetsMin = points >= config.minPoints;
            const meetsMax = config.maxPoints === null || points <= config.maxPoints;

            if (meetsMin && meetsMax) {
               return config.name;
            }
         }
      }

      // 매칭되는 등급이 없으면 가장 낮은 등급 반환
      const lowestGrade = [...gradeConfigs].sort((a, b) => a.orderIndex - b.orderIndex)[0];
      return lowestGrade?.name || '별';
   },

   // getGrade: 관리자 페이지용 (전체 유저 데이터가 로드되어 있을 때만 사용)
   // 일반 사용자는 meAPI.getGrade()를 사용하세요
   getGrade: (userId) => {
      const { users, currentUser } = get();
      let user = users.find((u) => u.id === userId);

      // users 배열에서 못 찾았고 currentUser가 해당 userId면 currentUser 사용
      if (!user && currentUser?.id === userId) {
         user = currentUser;
      }

      if (!user) return '별';

      // 등급 계산용 users 배열 구성
      let allUsers = [...users];

      // currentUser가 users에 없으면 추가
      if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
         allUsers.push(currentUser);
      }

      return get().getGradeByPoints(user.points, allUsers);
   },

   getGradeInfo: (grade) => {
      const { gradeConfigs } = get();

      // gradeConfigs에서 해당 등급 찾기
      const config = gradeConfigs.find(g => g.name === grade);

      if (config) {
         return {
            color: config.color,
            bg: config.bgColor,
            emoji: config.emoji,
            label: config.name,
         };
      }

      // gradeConfigs에 없으면 기본값 반환 (하드코딩된 값)
      switch (grade) {
         case '별':
            return { color: '#8B9BC8', bg: '#EEF1FC', emoji: '⭐', label: '별' };
         case '행성':
            return { color: '#4BA3E3', bg: '#EBF4FF', emoji: '🪐', label: '행성' };
         case '로켓':
            return { color: '#7DC443', bg: '#EFF8E6', emoji: '🚀', label: '로켓' };
         case 'UFO':
            return { color: '#F5C518', bg: '#FFF8E1', emoji: '🛸', label: 'UFO' };
         default:
            return { color: '#8B9BC8', bg: '#EEF1FC', emoji: '⭐', label: grade };
      }
   },

   finishLoading: () => set({ isLoading: false }),

   loadInitialData: async () => {
      try {

         const user = await authService.getCurrentUser();
         set({ currentUser: user });

         // 모든 사용자에게 필요한 데이터 로드
         const [eventsData, settingsData, gradeConfigsData] = await Promise.all([
            eventsAPI.getAll(),
            settingsAPI.get(),
            gradeConfigsAPI.getAll(),
         ]);

         set({
            events: eventsData.events,
            settings: settingsData.settings,
            gradeConfigs: gradeConfigsData.gradeConfigs,
         });

         if (user) {

            // 관리자만 전체 사용자 목록 및 포인트 내역 로드 (일반 사용자는 /api/me/grade, /api/me/point-history 사용)
            if (user.isAdmin) {
               const { users: usersData } = await usersAPI.getAll();
               set({ users: usersData });

               const { pointHistory: historyData } = await pointHistoryAPI.getAll();
               set({ pointHistory: historyData });
            }
         }

      } catch (error) {
         console.error('❌ 초기 데이터 로딩 실패:', error);
      } finally {
         set({ isLoading: false });
      }
   },
}));




// StoreInitializer component for Next.js
export function StoreInitializer() {
   const settings = useStore((state) => state.settings);

   useEffect(() => {
      const loadInitialData = useStore.getState().loadInitialData;
      loadInitialData();
   }, []);

   // settings가 로드되면 CSS 변수를 동적으로 업데이트
   useEffect(() => {
      if (settings) {
         const root = document.documentElement;

         if (settings.primaryColor) {
            root.style.setProperty('--primary', settings.primaryColor);
         }
         if (settings.secondaryColor) {
            root.style.setProperty('--secondary', settings.secondaryColor);
         }
      }
   }, [settings]);

   return null;
}

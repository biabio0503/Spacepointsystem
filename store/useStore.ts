'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import { authService } from '@/lib/auth';
import { eventsAPI, rentalItemsAPI, rentalsAPI, usersAPI, meAPI } from '@/lib/api-client';

export type Grade = '별' | '행성' | '로켓' | 'UFO';

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
   imageUrl?: string;
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

export interface RentalItem {
   id: string;
   name: string;
   category: string;
   totalStock: number;
   available: number;
   imageUrl?: string;
   emoji?: string;
   description?: string;
   isActive: boolean;
}

export interface Rental {
   id: string;
   userId: string;
   itemId: string;
   quantity: number;
   rentalDate: string;
   returnDate?: string;
   expectedReturnDate: string;
   status: 'active' | 'returned' | 'overdue';
   notes?: string;
}

export const DEPARTMENTS = [
   // 공과대학
   '기계시스템디자인공학과', '기계자동차공학과', '안전공학과', '신소재공학과', '건설시스템공학과', '건축학부',

   // 정보통신대학
   '전기정보공학과', '전자공학과', '컴퓨터공학과', '스마트ICT융합공학과',

   // 에너지바이오대학
   '화공생명공학과', '환경공학과', '식품공학과', '정밀화학과', '안경광학과', '스포츠과학과', '바이오메디컬학과',

   // 조형대학
   '디자인학과', '도예학과', '금속공예디자인학과', '조형예술학과',

   // 인문사회대학
   '영어영문학과', '행정학과', '문예창작학과',

   // 기술경영융합대학
   '산업공학과', '경영학과', 'MSDE학과',

   // 창의융합대학
   '인공지능응용학과', '지능형반도체공학과', '미래에너지융합학과',

   // 미래융합대학
   '융합기계공학과', '건설환경융합공학과', '헬스피트니스학과', '문화예술학과', '영어과', '벤처경영학과', '정보통신융합공학과',

   // 기타 및 세부 전공 (기존 리스트 반영)
   '경영학부', '화학공학과', '산업정보시스템전공', '토목공학과', '에너지바이오대학', '문화예술대학'
];

interface StoreState {
   // State
   currentUser: User | null;
   users: User[];
   events: Event[];
   pointHistory: PointHistory[];
   rentalItems: RentalItem[];
   rentals: Rental[];
   isLoading: boolean;

   // Actions
   setCurrentUser: (user: User | null) => void;
   setUsers: (users: User[]) => void;
   setEvents: (events: Event[]) => void;
   setPointHistory: (history: PointHistory[]) => void;
   setRentalItems: (items: RentalItem[]) => void;
   setRentals: (rentals: Rental[]) => void;
   setIsLoading: (loading: boolean) => void;

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

   // Rental Items
   addRentalItem: (item: Omit<RentalItem, 'id'>) => Promise<void>;
   updateRentalItem: (itemId: string, updates: Partial<RentalItem>) => Promise<void>;
   deleteRentalItem: (itemId: string) => Promise<void>;

   // Rentals
   createRental: (rental: Omit<Rental, 'id'>) => Promise<void>;
   updateRental: (rentalId: string, updates: Partial<Rental>) => Promise<void>;
   returnRental: (rentalId: string) => Promise<void>;

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
   rentalItems: [],
   rentals: [],
   isLoading: true,

   // Setters
   setCurrentUser: (user) => set({ currentUser: user }),
   setUsers: (users) => set({ users }),
   setEvents: (events) => set({ events }),
   setPointHistory: (history) => set({ pointHistory: history }),
   setRentalItems: (items) => set({ rentalItems: items }),
   setRentals: (rentals) => set({ rentals }),
   setIsLoading: (loading) => set({ isLoading: loading }),

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
         rentals: [],
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

   // Rental Items
   addRentalItem: async (item) => {
      try {
         const { rentalItem } = await rentalItemsAPI.create(item);
         set((state) => ({
            rentalItems: [...state.rentalItems, rentalItem],
         }));
      } catch (error) {
         console.error('Failed to create rental item:', error);
         throw error;
      }
   },

   updateRentalItem: async (itemId, updates) => {
      try {
         const { rentalItem } = await rentalItemsAPI.update(itemId, updates);
         set((state) => ({
            rentalItems: state.rentalItems.map((item) => (item.id === itemId ? rentalItem : item)),
         }));
      } catch (error) {
         console.error('Failed to update rental item:', error);
         throw error;
      }
   },

   deleteRentalItem: async (itemId) => {
      try {
         await rentalItemsAPI.delete(itemId);
         set((state) => ({
            rentalItems: state.rentalItems.filter((item) => item.id !== itemId),
         }));
      } catch (error) {
         console.error('Failed to delete rental item:', error);
         throw error;
      }
   },

   // Rentals
   createRental: async (rental) => {
      try {
         const { rental: newRental } = await rentalsAPI.create(rental);
         set((state) => ({
            rentals: [...state.rentals, newRental],
            rentalItems: state.rentalItems.map((item) =>
               item.id === rental.itemId
                  ? { ...item, available: item.available - rental.quantity }
                  : item
            ),
         }));
      } catch (error) {
         console.error('Failed to create rental:', error);
         throw error;
      }
   },

   updateRental: async (rentalId, updates) => {
      try {
         set((state) => ({
            rentals: state.rentals.map((r) => (r.id === rentalId ? { ...r, ...updates } : r)),
         }));
      } catch (error) {
         console.error('Failed to update rental:', error);
         throw error;
      }
   },

   returnRental: async (rentalId) => {
      try {
         const { rental } = await rentalsAPI.return(rentalId);
         const { rentals } = get();
         const rentalData = rentals.find((r) => r.id === rentalId);

         set((state) => ({
            rentals: state.rentals.map((r) => (r.id === rentalId ? rental : r)),
            rentalItems: rentalData
               ? state.rentalItems.map((item) =>
                  item.id === rentalData.itemId
                     ? { ...item, available: item.available + rentalData.quantity }
                     : item
               )
               : state.rentalItems,
         }));
      } catch (error) {
         console.error('Failed to return rental:', error);
         throw error;
      }
   },

   // Utilities
   getGradeByPoints: (points, allUsers) => {
      console.log('🔍 등급 계산:', { points, totalUsers: allUsers.length });

      if (points < 10) return '별';

      const eligibleUsers = allUsers.filter((u) => u.points >= 10 && !u.isAdmin);
      console.log('✅ 10점 이상 사용자:', eligibleUsers.length, '명');

      if (eligibleUsers.length === 0) return '행성';

      const sorted = [...eligibleUsers].sort((a, b) => b.points - a.points);
      const higherCount = sorted.filter((u) => u.points > points).length;
      const percentile = (higherCount / sorted.length) * 100;

      console.log('📊 등급 판정:', {
         myPoints: points,
         higherCount,
         totalEligible: sorted.length,
         percentile: percentile.toFixed(1) + '%',
      });

      if (percentile < 20) return 'UFO';
      if (percentile < 60) return '로켓';
      return '행성';
   },

   getGrade: (userId) => {
      const { users } = get();
      const user = users.find((u) => u.id === userId);
      if (!user) return '별';
      return get().getGradeByPoints(user.points, users);
   },

   getGradeInfo: (grade) => {
      switch (grade) {
         case '별':
            return { color: '#8B9BC8', bg: '#EEF1FC', emoji: '⭐', label: '별' };
         case '행성':
            return { color: '#4BA3E3', bg: '#EBF4FF', emoji: '🪐', label: '행성' };
         case '로켓':
            return { color: '#7DC443', bg: '#EFF8E6', emoji: '🚀', label: '로켓' };
         case 'UFO':
            return { color: '#F5C518', bg: '#FFF8E1', emoji: '🛸', label: 'UFO' };
      }
   },

   finishLoading: () => set({ isLoading: false }),

   loadInitialData: async () => {
      try {
         const user = await authService.getCurrentUser();
         set({ currentUser: user });

         const { events: eventsData } = await eventsAPI.getAll();
         set({ events: eventsData });

         const { rentalItems: itemsData } = await rentalItemsAPI.getAll();
         set({ rentalItems: itemsData });

         if (user) {
            const { rentals: rentalsData } = await rentalsAPI.getAll();
            set({ rentals: rentalsData });

            if (user.isAdmin) {
               const { users: usersData } = await usersAPI.getAll();
               set({ users: usersData });
            }
         }
      } catch (error) {
         console.error('Failed to load initial data:', error);
      } finally {
         set({ isLoading: false });
      }
   },
}));

// Setup auth state listener
if (typeof window !== 'undefined') {
   authService.onAuthStateChange(async (user) => {
      useStore.setState({ currentUser: user });

      if (user) {
         try {
            const { rentals: rentalsData } = await rentalsAPI.getAll();
            useStore.setState({ rentals: rentalsData });

            if (user.isAdmin) {
               const { users: usersData } = await usersAPI.getAll();
               useStore.setState({ users: usersData });
            }
         } catch (error) {
            console.error('Failed to reload data after login:', error);
         }
      } else {
         useStore.setState({
            users: [],
            rentals: [],
            pointHistory: [],
         });
      }
   });
}

// StoreInitializer component for Next.js
export function StoreInitializer() {
   useEffect(() => {
      const loadInitialData = useStore.getState().loadInitialData;
      loadInitialData();
   }, []);

   return null;
}

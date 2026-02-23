'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Grade = '별' | '행성' | '로켓' | 'UFO';

export interface User {
  id: string;
  studentId: string;
  name: string;
  department: string;
  phone: string;
  referralCode?: string;
  points: number;
  joinedAt: string;
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

interface AppContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  pointHistory: PointHistory[];
  rentalItems: RentalItem[];
  rentals: Rental[];
  isLoading: boolean;
  login: (studentId: string) => User | null;
  logout: () => void;
  register: (info: Omit<User, 'id' | 'points' | 'joinedAt'>) => User;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  addPoints: (userId: string, points: number, reason: string) => void;
  addRentalItem: (item: Omit<RentalItem, 'id'>) => void;
  updateRentalItem: (itemId: string, updates: Partial<RentalItem>) => void;
  deleteRentalItem: (itemId: string) => void;
  createRental: (rental: Omit<Rental, 'id'>) => void;
  updateRental: (rentalId: string, updates: Partial<Rental>) => void;
  returnRental: (rentalId: string) => void;
  getGrade: (userId: string) => Grade;
  getGradeByPoints: (points: number, allUsers: User[]) => Grade;
  getGradeInfo: (grade: Grade) => { color: string; bg: string; emoji: string; label: string };
  finishLoading: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEPARTMENTS = [
  '경영학부', '전기정보공학과', '컴퓨터공학과', '기계시스템디자인공학과',
  '건축학부', '화학공학과', '신소재공학과', '산업정보시스템전공',
  '환경공학과', '토목공학과', '에너지바이오대학', '문화예술대학',
];

const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: '5월 컬처데이',
    location: '서울과학기술대학교 학생회관',
    date: '2025-05-17',
    content: '봄을 맞이하는 특별한 문화 행사! 다양한 공연과 체험 부스가 준비되어 있습니다.',
    imageUrl: '',
    instagramUrl: 'https://instagram.com/seoultech_welfare',
    points: 20,
    postDate: '2025-05-01',
    postEndDate: '2025-05-17',
    isActive: true,
  },
  {
    id: 'e2',
    title: '성년의 날',
    location: '학생회관 1층 로비',
    date: '2025-05-19',
    content: '성년을 축하하는 특별한 행사! 꽃다발과 기념품을 드립니다.',
    imageUrl: '',
    instagramUrl: 'https://instagram.com/seoultech_welfare',
    points: 25,
    postDate: '2025-05-10',
    postEndDate: '2025-05-19',
    isActive: true,
  },
  {
    id: 'e3',
    title: '야외 영화관',
    location: '서울과학기술대학교 중앙광장',
    date: '2025-06-07',
    content: '여름밤, 별빛 아래서 즐기는 야외 영화 상영! 팝콘과 함께 특별한 밤을 즐겨보세요.',
    imageUrl: '',
    instagramUrl: 'https://instagram.com/seoultech_welfare',
    points: 25,
    postDate: '2025-05-20',
    postEndDate: '2025-06-07',
    isActive: true,
  },
  {
    id: 'e4',
    title: "S'TED",
    location: '서울과학기술대학교 대강당',
    date: '2025-11-15',
    content: '서울과기대 학생들이 직접 만드는 TED 스타일의 강연 행사입니다.',
    imageUrl: '',
    instagramUrl: 'https://instagram.com/seoultech_welfare',
    points: 30,
    postDate: '2025-10-01',
    postEndDate: '2025-11-15',
    isActive: true,
  },
  {
    id: 'e5',
    title: '어의사랑 안전규찰대',
    location: '학교 전역',
    date: '2025-09-01',
    endDate: '2025-12-31',
    content: '학교 안전을 위한 규찰 활동에 참여해보세요. 활동 완료 시 포인트를 드립니다.',
    imageUrl: '',
    instagramUrl: '',
    points: 10,
    postDate: '2025-08-01',
    postEndDate: '2025-12-31',
    isActive: true,
  },
];

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    studentId: '20240001',
    name: '김민준',
    department: '컴퓨터공학과',
    phone: '01012345678',
    points: 85,
    joinedAt: '2025-04-15',
  },
  {
    id: 'u2',
    studentId: '20240002',
    name: '이서연',
    department: '경영학부',
    phone: '01023456789',
    points: 55,
    joinedAt: '2025-04-15',
  },
  {
    id: 'u3',
    studentId: '20230010',
    name: '박지호',
    department: '전기정보공학과',
    phone: '01034567890',
    points: 30,
    joinedAt: '2025-04-20',
  },
  {
    id: 'u4',
    studentId: '20220005',
    name: '최수아',
    department: '건축학부',
    phone: '01045678901',
    points: 8,
    joinedAt: '2025-05-01',
  },
  {
    id: 'admin',
    studentId: 'admin',
    name: '관리자',
    department: '대외홍보국',
    phone: '01000000000',
    points: 0,
    joinedAt: '2025-01-01',
    isAdmin: true,
  },
];

const MOCK_HISTORY: PointHistory[] = [
  { id: 'h1', userId: 'u1', points: 10, reason: '4월 컬처데이 참여', date: '2025-04-20' },
  { id: 'h2', userId: 'u1', points: 25, reason: '성년의 날 참여', date: '2025-05-19' },
  { id: 'h3', userId: 'u1', points: 5, reason: '추천인 코드 적용', date: '2025-04-15' },
  { id: 'h4', userId: 'u1', points: 25, reason: '야외 영화관 참여', date: '2025-06-07' },
  { id: 'h5', userId: 'u1', points: 5, reason: '대여왕 선정', date: '2025-06-30' },
  { id: 'h6', userId: 'u1', points: 10, reason: '안전규찰대 참여', date: '2025-09-15' },
  { id: 'h7', userId: 'u1', points: 5, reason: '웹 로그인 포인트', date: '2025-10-01' },
  { id: 'h8', userId: 'u2', points: 10, reason: '4월 컬처데이 참여', date: '2025-04-20' },
  { id: 'h9', userId: 'u2', points: 25, reason: '야외 영화관 참여', date: '2025-06-07' },
  { id: 'h10', userId: 'u2', points: 20, reason: '성년의 날 참여', date: '2025-05-19' },
];

const MOCK_RENTAL_ITEMS: RentalItem[] = [
  { id: 'ri1', name: 'L카드', category: '카드', emoji: '💳', totalStock: 5, available: 5, isActive: true },
  { id: 'ri2', name: '담요', category: '담요', emoji: '🛏️', totalStock: 10, available: 8, isActive: true },
  { id: 'ri3', name: '돗자리 대형', category: '돗자리 대형', emoji: '🏕️', totalStock: 3, available: 2, isActive: true },
  { id: 'ri4', name: '돗자리 중형', category: '돗자리 중형', emoji: '🏕️', totalStock: 5, available: 4, isActive: true },
  { id: 'ri5', name: '보조배터리', category: '보조배터리', emoji: '🔋', totalStock: 15, available: 12, isActive: true },
  { id: 'ri6', name: '연결선(5핀)', category: '연결선(5핀, 8핀, C타입)', emoji: '🔌', totalStock: 8, available: 7, isActive: true },
  { id: 'ri7', name: '연결선(8핀)', category: '연결선(5핀, 8핀, C타입)', emoji: '🔌', totalStock: 8, available: 6, isActive: true },
  { id: 'ri8', name: '연결선(C타입)', category: '연결선(5핀, 8핀, C타입)', emoji: '🔌', totalStock: 10, available: 8, isActive: true },
  { id: 'ri9', name: '삼각대', category: '삼각대', emoji: '📷', totalStock: 4, available: 3, isActive: true },
  { id: 'ri10', name: '셀카봉', category: '셀카봉', emoji: '🤳', totalStock: 6, available: 5, isActive: true },
  { id: 'ri11', name: '휴대용 선풍기', category: '휴대용 선풍기', emoji: '🌀', totalStock: 8, available: 7, isActive: true },
  { id: 'ri12', name: '블루투스 스피커', category: '블루투스 스피커', emoji: '🔊', totalStock: 5, available: 4, isActive: true },
  { id: 'ri13', name: '공학용 계산기', category: '공학용 계산기', emoji: '🧮', totalStock: 6, available: 5, isActive: true },
  { id: 'ri14', name: '포인터', category: '포인터', emoji: '👆', totalStock: 4, available: 4, isActive: true },
  { id: 'ri15', name: '무선 마우스', category: '무선 마우스', emoji: '🖱️', totalStock: 7, available: 6, isActive: true },
  { id: 'ri16', name: '유선 마우스', category: '유선 마우스', emoji: '🖱️', totalStock: 7, available: 6, isActive: true },
  { id: 'ri17', name: '핸맥(M 사이즈)', category: '핸맥(M, L사이즈)', emoji: '🧤', totalStock: 5, available: 4, isActive: true },
  { id: 'ri18', name: '핸맥(L 사이즈)', category: '핸맥(M, L사이즈)', emoji: '🧤', totalStock: 5, available: 5, isActive: true },
  { id: 'ri19', name: '공 바람 주입기', category: '공 바람 주입기', emoji: '⚽', totalStock: 3, available: 3, isActive: true },
  { id: 'ri20', name: '우산', category: '우산', emoji: '☂️', totalStock: 20, available: 18, isActive: true },
];

const MOCK_RENTALS: Rental[] = [
  {
    id: 'r1',
    userId: 'u1',
    itemId: 'ri2',
    quantity: 1,
    rentalDate: '2026-02-20',
    expectedReturnDate: '2026-02-23',
    status: 'active',
    notes: '학과 MT에서 사용',
  },
  {
    id: 'r2',
    userId: 'u1',
    itemId: 'ri5',
    quantity: 1,
    rentalDate: '2026-02-15',
    returnDate: '2026-02-18',
    expectedReturnDate: '2026-02-18',
    status: 'returned',
  },
  {
    id: 'r3',
    userId: 'u2',
    itemId: 'ri12',
    quantity: 1,
    rentalDate: '2026-02-21',
    expectedReturnDate: '2026-02-24',
    status: 'active',
  },
];

function getStoredUsers(): User[] {
  try {
    const stored = localStorage.getItem('space_users');
    return stored ? JSON.parse(stored) : MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
}

function getStoredEvents(): Event[] {
  try {
    const stored = localStorage.getItem('space_events');
    return stored ? JSON.parse(stored) : MOCK_EVENTS;
  } catch {
    return MOCK_EVENTS;
  }
}

function getStoredHistory(): PointHistory[] {
  try {
    const stored = localStorage.getItem('space_history');
    return stored ? JSON.parse(stored) : MOCK_HISTORY;
  } catch {
    return MOCK_HISTORY;
  }
}

function getStoredCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem('space_current_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getStoredRentalItems(): RentalItem[] {
  try {
    const stored = localStorage.getItem('space_rental_items');
    return stored ? JSON.parse(stored) : MOCK_RENTAL_ITEMS;
  } catch {
    return MOCK_RENTAL_ITEMS;
  }
}

function getStoredRentals(): Rental[] {
  try {
    const stored = localStorage.getItem('space_rentals');
    return stored ? JSON.parse(stored) : MOCK_RENTALS;
  } catch {
    return MOCK_RENTALS;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUsers(getStoredUsers());
    setEvents(getStoredEvents());
    setPointHistory(getStoredHistory());
    setCurrentUser(getStoredCurrentUser());
    setRentalItems(getStoredRentalItems());
    setRentals(getStoredRentals());
  }, []);

  useEffect(() => {
    if (users.length > 0) localStorage.setItem('space_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (events.length > 0) localStorage.setItem('space_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('space_history', JSON.stringify(pointHistory));
  }, [pointHistory]);

  useEffect(() => {
    if (rentalItems.length > 0) localStorage.setItem('space_rental_items', JSON.stringify(rentalItems));
  }, [rentalItems]);

  useEffect(() => {
    localStorage.setItem('space_rentals', JSON.stringify(rentals));
  }, [rentals]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('space_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('space_current_user');
  }, [currentUser]);

  const finishLoading = () => setIsLoading(false);

  const login = (studentId: string): User | null => {
    const user = users.find(u => u.studentId === studentId);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('space_current_user');
  };

  const register = (info: Omit<User, 'id' | 'points' | 'joinedAt'>): User => {
    const newUser: User = {
      ...info,
      id: `u${Date.now()}`,
      points: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    if (info.referralCode) {
      const referrer = users.find(u => u.studentId === info.referralCode);
      if (referrer) {
        setUsers(prev => prev.map(u =>
          u.id === referrer.id ? { ...u, points: u.points + 5 } : u
        ));
        setPointHistory(prev => [...prev, {
          id: `h${Date.now()}`,
          userId: referrer.id,
          points: 5,
          reason: '추천인 코드 적용',
          date: new Date().toISOString().split('T')[0],
        }]);
        newUser.points = 5;
        setPointHistory(prev => [...prev, {
          id: `h${Date.now() + 1}`,
          userId: newUser.id,
          points: 5,
          reason: '추천인 코드 적용',
          date: new Date().toISOString().split('T')[0],
        }]);
      }
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...event, id: `e${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const addPoints = (userId: string, points: number, reason: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: u.points + points } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, points: prev.points + points } : null);
    }
    setPointHistory(prev => [...prev, {
      id: `h${Date.now()}`,
      userId,
      points,
      reason,
      date: new Date().toISOString().split('T')[0],
    }]);
  };

  const getGradeByPoints = (points: number, allUsers: User[]): Grade => {
    if (points < 10) return '별';
    const eligibleUsers = allUsers.filter(u => u.points >= 10 && !u.isAdmin);
    const sorted = [...eligibleUsers].sort((a, b) => b.points - a.points);
    const rank = sorted.findIndex(u => u.points <= points);
    const percentile = rank === -1 ? 0 : (rank / sorted.length) * 100;
    if (percentile < 20) return 'UFO';
    if (percentile < 60) return '로켓';
    return '행성';
  };

  const getGrade = (userId: string): Grade => {
    const user = users.find(u => u.id === userId);
    if (!user) return '별';
    return getGradeByPoints(user.points, users);
  };

  const getGradeInfo = (grade: Grade) => {
    switch (grade) {
      case '별': return { color: '#8B9BC8', bg: '#EEF1FC', emoji: '⭐', label: '별' };
      case '행성': return { color: '#4BA3E3', bg: '#EBF4FF', emoji: '🪐', label: '행성' };
      case '로켓': return { color: '#7DC443', bg: '#EFF8E6', emoji: '🚀', label: '로켓' };
      case 'UFO': return { color: '#F5C518', bg: '#FFF8E1', emoji: '🛸', label: 'UFO' };
    }
  };

  const addRentalItem = (item: Omit<RentalItem, 'id'>) => {
    const newItem: RentalItem = { ...item, id: `ri${Date.now()}` };
    setRentalItems(prev => [...prev, newItem]);
  };

  const updateRentalItem = (itemId: string, updates: Partial<RentalItem>) => {
    setRentalItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
  };

  const deleteRentalItem = (itemId: string) => {
    setRentalItems(prev => prev.filter(item => item.id !== itemId));
  };

  const createRental = (rental: Omit<Rental, 'id'>) => {
    const newRental: Rental = { ...rental, id: `r${Date.now()}` };
    setRentals(prev => [...prev, newRental]);

    // 재고 감소
    setRentalItems(prev => prev.map(item =>
      item.id === rental.itemId
        ? { ...item, available: item.available - rental.quantity }
        : item
    ));
  };

  const updateRental = (rentalId: string, updates: Partial<Rental>) => {
    setRentals(prev => prev.map(r => r.id === rentalId ? { ...r, ...updates } : r));
  };

  const returnRental = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;

    setRentals(prev => prev.map(r =>
      r.id === rentalId
        ? { ...r, returnDate: new Date().toISOString().split('T')[0], status: 'returned' as const }
        : r
    ));

    // 재고 복구
    setRentalItems(prev => prev.map(item =>
      item.id === rental.itemId
        ? { ...item, available: item.available + rental.quantity }
        : item
    ));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      events,
      pointHistory,
      rentalItems,
      rentals,
      isLoading,
      login,
      logout,
      register,
      updateUser,
      addEvent,
      updateEvent,
      deleteEvent,
      addPoints,
      addRentalItem,
      updateRentalItem,
      deleteRentalItem,
      createRental,
      updateRental,
      returnRental,
      getGrade,
      getGradeByPoints,
      getGradeInfo,
      finishLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { DEPARTMENTS };

// API 호출 유틸리티

const API_BASE = '/api';

interface FetchOptions extends RequestInit {
   params?: Record<string, string>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
   const { params, ...fetchOptions } = options;

   let url = `${API_BASE}${endpoint}`;

   // Query params 추가
   if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
   }

   const response = await fetch(url, {
      ...fetchOptions,
      headers: {
         'Content-Type': 'application/json',
         ...fetchOptions.headers,
      },
   });

   // 빈 응답 또는 비-JSON 응답 안전 처리
   const text = await response.text();
   let data: any = {};
   if (text) {
      try {
         data = JSON.parse(text);
      } catch {
         if (!response.ok) {
            throw new Error(`서버 오류 (${response.status})`);
         }
      }
   }

   if (!response.ok) {
      throw new Error(data.error || 'API 요청 실패');
   }

   return data;
}

// Events API
export const eventsAPI = {
   getAll: () => fetchAPI<{ events: any[] }>('/events'),

   getById: (id: string) => fetchAPI<{ event: any }>(`/events/${id}`),

   create: (eventData: any) =>
      fetchAPI<{ event: any }>('/events', {
         method: 'POST',
         body: JSON.stringify(eventData),
      }),

   update: (id: string, eventData: any) =>
      fetchAPI<{ event: any }>(`/events/${id}`, {
         method: 'PATCH',
         body: JSON.stringify(eventData),
      }),

   delete: (id: string) =>
      fetchAPI<{ message: string }>(`/events/${id}`, {
         method: 'DELETE',
      }),
};

// Rental Items API
export const rentalItemsAPI = {
   getAll: () => fetchAPI<{ rentalItems: any[] }>('/rental-items'),

   getById: (id: string) => fetchAPI<{ rentalItem: any }>(`/rental-items/${id}`),

   create: (itemData: any) =>
      fetchAPI<{ rentalItem: any }>('/rental-items', {
         method: 'POST',
         body: JSON.stringify(itemData),
      }),

   update: (id: string, itemData: any) =>
      fetchAPI<{ rentalItem: any }>(`/rental-items/${id}`, {
         method: 'PATCH',
         body: JSON.stringify(itemData),
      }),

   delete: (id: string) =>
      fetchAPI<{ message: string }>(`/rental-items/${id}`, {
         method: 'DELETE',
      }),
};

// Rentals API
export const rentalsAPI = {
   getAll: (isAdmin: boolean = true) => fetchAPI<{ rentals: any[] }>(`/rentals${isAdmin ? '?admin=true' : ''}`),

   getById: (id: string) => fetchAPI<{ rental: any }>(`/rentals/${id}`),

   create: (rentalData: any) =>
      fetchAPI<{ rental: any }>('/rentals', {
         method: 'POST',
         body: JSON.stringify(rentalData),
      }),

   return: (id: string) =>
      fetchAPI<{ rental: any }>(`/rentals/${id}/return`, {
         method: 'POST',
      }),
};

// Users API (관리자용)
export const usersAPI = {
   getAll: () => fetchAPI<{ users: any[] }>('/users'),

   getById: (id: string) => fetchAPI<{ user: any }>(`/users/${id}`),

   update: (id: string, userData: any) =>
      fetchAPI<{ user: any }>(`/users/${id}`, {
         method: 'PATCH',
         body: JSON.stringify(userData),
      }),

   addPoints: (id: string, points: number, reason: string) =>
      fetchAPI<{ user: any }>(`/users/${id}/points`, {
         method: 'POST',
         body: JSON.stringify({ points, reason }),
      }),

   delete: (id: string) =>
      fetchAPI<{ message: string }>(`/users/${id}`, {
         method: 'DELETE',
      }),
};

// Point History API (관리자용)
export const pointHistoryAPI = {
   getAll: () => fetchAPI<{ pointHistory: any[] }>('/point-history'),
};

// Me API (현재 사용자 전용)
export const meAPI = {
   claimPoints: (points: number = 2, reason: string = '웹 로그인 포인트') =>
      fetchAPI<{ user: any; history: any }>('/me/claim-points', {
         method: 'POST',
         body: JSON.stringify({ points, reason }),
      }),

   getGrade: () =>
      fetchAPI<{
         grade: string;
         rank: number | null;
         totalEligible: number;
         topPercent: number | null;
         nextGrade: { next: string; need: number } | null;
         points: number;
      }>('/me/grade'),

   getPointHistory: () =>
      fetchAPI<{
         pointHistory: Array<{
            id: string;
            userId: string;
            points: number;
            reason: string;
            date: string;
         }>;
      }>('/me/point-history'),
};

// Image Upload API
export const uploadAPI = {
   uploadImage: async (file: File, bucket: 'event-images' | 'rental-item-images' = 'event-images') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      const response = await fetch('/api/upload/image', {
         method: 'POST',
         body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || '이미지 업로드 실패');
      }

      return data;
   },

   deleteImage: async (fileName: string, bucket: 'event-images' | 'rental-item-images' = 'event-images') => {
      const response = await fetch(`/api/upload/image?fileName=${fileName}&bucket=${bucket}`, {
         method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || '이미지 삭제 실패');
      }

      return data;
   },
};

// Settings API
export const settingsAPI = {
   get: () => fetchAPI<{ settings: any }>('/settings'),

   update: (settingsData: any) =>
      fetchAPI<{ settings: any }>('/settings', {
         method: 'PATCH',
         body: JSON.stringify(settingsData),
      }),
};

// Grade Configs API
export const gradeConfigsAPI = {
   getAll: () => fetchAPI<{ gradeConfigs: any[] }>('/grade-configs'),

   create: (configData: any) =>
      fetchAPI<{ gradeConfig: any }>('/grade-configs', {
         method: 'POST',
         body: JSON.stringify(configData),
      }),

   update: (id: string, configData: any) =>
      fetchAPI<{ gradeConfig: any }>(`/grade-configs/${id}`, {
         method: 'PATCH',
         body: JSON.stringify(configData),
      }),

   delete: (id: string) =>
      fetchAPI<{ message: string }>(`/grade-configs/${id}`, {
         method: 'DELETE',
      }),
};

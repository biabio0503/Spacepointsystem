import { z } from 'zod';

// 인증 관련 스키마
export const signUpSchema = z.object({
   studentId: z.string().min(1, '학번을 입력해주세요').max(20, '학번은 20자 이내로 입력해주세요'),
   name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
   department: z.string().min(1, '학과를 입력해주세요').max(100, '학과는 100자 이내로 입력해주세요'),
   phone: z.string().min(10, '올바른 전화번호를 입력해주세요').max(15, '올바른 전화번호를 입력해주세요'),
   password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').max(100, '비밀번호는 100자 이내로 입력해주세요'),
   referralCode: z.string().optional(),
});

export const loginSchema = z.object({
   studentId: z.string().min(1, '학번을 입력해주세요'),
   password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// 이벤트 관련 스키마
export const createEventSchema = z.object({
   title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내로 입력해주세요'),
   location: z.string().min(1, '장소를 입력해주세요').max(200, '장소는 200자 이내로 입력해주세요'),
   date: z.string().min(1, '날짜를 입력해주세요').or(z.date()),
   endDate: z.string().optional().nullable().or(z.date()),
   content: z.string().min(1, '내용을 입력해주세요'),
   imageUrls: z.array(z.string().url()).optional().nullable(),
   instagramUrl: z.string().url('올바른 URL을 입력해주세요').optional().nullable(),
   points: z.number().int().min(0, '포인트는 0 이상이어야 합니다').or(z.string().transform(Number)),
   postDate: z.string().min(1, '게시일을 입력해주세요').or(z.date()),
   postEndDate: z.string().min(1, '게시 종료일을 입력해주세요').or(z.date()),
});

export const updateEventSchema = createEventSchema.partial().extend({
   isActive: z.boolean().optional(),
});

// 대여 물품 관련 스키마
export const createRentalItemSchema = z.object({
   name: z.string().min(1, '물품명을 입력해주세요').max(100, '물품명은 100자 이내로 입력해주세요'),
   category: z.string().min(1, '카테고리를 입력해주세요').max(50, '카테고리는 50자 이내로 입력해주세요'),
   totalStock: z.number().int().min(1, '재고는 최소 1개 이상이어야 합니다').or(z.string().transform(Number)),
   emoji: z.string().max(10, '이모지는 10자 이내로 입력해주세요').optional().nullable(),
   description: z.string().max(1000, '설명은 1000자 이내로 입력해주세요').optional().nullable(),
});

export const updateRentalItemSchema = createRentalItemSchema.partial().extend({
   isActive: z.boolean().optional(),
});

// 대여 신청 스키마
export const createRentalSchema = z.object({
   itemId: z.string().uuid('올바른 물품 ID가 아닙니다'),
   quantity: z.number().int().min(1, '수량은 최소 1개 이상이어야 합니다').or(z.string().transform(Number)),
   expectedReturnDate: z.string().min(1, '반납 예정일을 입력해주세요').or(z.date()),
   notes: z.string().max(500, '비고는 500자 이내로 입력해주세요').optional().nullable(),
});

// 사용자 정보 수정 스키마
export const updateUserSchema = z.object({
   name: z.string().min(1).max(50).optional(),
   department: z.string().min(1).max(100).optional(),
   phone: z.string().min(10).max(15).optional(),
   isAdmin: z.boolean().optional(),
});

// 포인트 지급 스키마
export const addPointsSchema = z.object({
   points: z.number().int().or(z.string().transform(Number)),
   reason: z.string().min(1, '사유를 입력해주세요').max(200, '사유는 200자 이내로 입력해주세요'),
});

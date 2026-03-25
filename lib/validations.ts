import { z } from 'zod';

// 인증 관련 스키마
export const signUpSchema = z.object({
   studentId: z.string().min(1, '학번을 입력해주세요').max(20, '학번은 20자 이내로 입력해주세요'),
   name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
   department: z.string().min(1, '학과를 입력해주세요').max(100, '학과는 100자 이내로 입력해주세요'),
   phone: z.string().min(10, '올바른 전화번호를 입력해주세요').max(15, '올바른 전화번호를 입력해주세요'),
   password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다').max(100, '비밀번호는 100자 이내로 입력해주세요'),
   referralCode: z.string().optional(),
   membershipFeeStatus: z.enum(['paid', 'not_paid', 'unknown']).optional(),
});

export const loginSchema = z.object({
   studentId: z.string().min(1, '학번을 입력해주세요'),
   password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// 프론트엔드 폼 관련 스키마
export const loginFormSchema = z.object({
   studentId: z
      .string()
      .trim()
      .min(1, '학번을 입력해주세요')
      .regex(/^\d{8}$/, '학번은 숫자 8자리여야 합니다'),
   password: z.string().trim().min(1, '비밀번호를 입력해주세요'),
});

export const signUpBasicInfoSchema = z.object({
   name: z.string().trim().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
   studentId: z.string().trim().regex(/^\d{8}$/, '학번 8자리를 입력해주세요.'),
   department: z.string().trim().min(1, '학과를 선택해주세요.'),
   phone: z.string().trim().regex(/^010\d{7,8}$/, '올바른 휴대폰 번호를 입력해주세요. (010으로 시작)'),
   membershipFeeStatus: z.enum(['paid', 'not_paid', 'unknown']),
});

export const signUpPasswordSchema = z
   .object({
      password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
      passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
   })
   .refine((value) => value.password === value.passwordConfirm, {
      path: ['passwordConfirm'],
      message: '비밀번호가 일치하지 않습니다.',
   });

export const signUpOptionalSchema = z.object({
   referralCode: z
      .string()
      .trim()
      .regex(/^\d{8}$/, '추천인 학번은 숫자 8자리여야 합니다.')
      .or(z.literal(''))
      .optional(),
});

export const kakaoSignUpSchema = z.object({
   name: z.string().trim().min(1, '이름을 입력해주세요.'),
   studentId: z.string().trim().regex(/^\d{8}$/, '학번 8자리를 입력해주세요.'),
   department: z.string().trim().min(1, '학과를 선택해주세요.'),
   phone: z.string().trim().regex(/^010\d{7,8}$/, '올바른 휴대폰 번호를 입력해주세요. (010으로 시작)'),
   referralCode: z
      .string()
      .trim()
      .regex(/^\d{8}$/, '추천인 학번은 숫자 8자리여야 합니다.')
      .or(z.literal(''))
      .optional(),
});

export const settingsProfileSchema = z.object({
   name: z.string().trim().min(1, '이름을 입력해주세요.'),
   phone: z.string().trim().regex(/^010\d{7,8}$/, '올바른 휴대폰 번호를 입력해주세요.'),
});

export const adminEventFormSchema = z.object({
   title: z.string().trim().min(1, '사업명을 입력해주세요.'),
   location: z.string().trim().min(1, '장소를 입력해주세요.'),
   date: z.string().min(1, '날짜를 입력해주세요.'),
   endDate: z.string().optional(),
   content: z.string().trim().min(1, '내용을 입력해주세요.'),
   imageUrls: z.array(z.string()).default([]),
   instagramUrl: z.string().trim().or(z.literal('')).optional(),
   points: z.coerce.number().int().min(0, '포인트는 0 이상이어야 합니다.'),
   postDate: z.string().min(1, '게시일을 입력해주세요.'),
   postEndDate: z.string().min(1, '게시 종료일을 입력해주세요.'),
   isActive: z.boolean().default(true),
});

export const adminRentalItemFormSchema = z.object({
   name: z.string().trim().min(1, '물품명을 입력해주세요.'),
   category: z.string().trim().min(1, '카테고리를 입력해주세요.'),
   emoji: z.string().max(10, '이모지는 10자 이내로 입력해주세요.').optional().or(z.literal('')),
   totalStock: z.coerce.number().int().min(1, '총 재고는 최소 1개 이상이어야 합니다.'),
   description: z.string().max(1000, '설명은 1000자 이내로 입력해주세요.').optional().or(z.literal('')),
});

export const adminSettingsFormSchema = z.object({
   organizationName: z.string().trim().min(1, '조직 이름을 입력해주세요.').max(100, '조직 이름은 100자 이내여야 합니다.'),
   primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요.'),
   secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요.'),
   contactPhone: z.string().trim().max(30, '연락처는 30자 이내여야 합니다.').optional().default(''),
   contactPerson: z.string().trim().max(100, '담당자 정보는 100자 이내여야 합니다.').optional().default(''),
});

export const adminGradeConfigFormSchema = z
   .object({
      name: z.string().trim().min(1, '등급 이름을 입력해주세요.').max(50, '등급 이름은 50자 이내여야 합니다.'),
      type: z.enum(['ABSOLUTE_POINTS', 'PERCENTILE']),
      minPoints: z.coerce.number().int().min(0, '최소 포인트는 0 이상이어야 합니다.'),
      maxPoints: z.coerce.number().int().nullable(),
      percentileMin: z.coerce.number().min(0).max(100).nullable(),
      percentileMax: z.coerce.number().min(0).max(100).nullable(),
      emoji: z.string().trim().min(1, '이모지를 입력해주세요.').max(10, '이모지는 10자 이내여야 합니다.'),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요.'),
      bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요.'),
      benefit: z.string().max(500, '혜택 설명은 500자 이내여야 합니다.').optional().default(''),
      orderIndex: z.coerce.number().int().min(0, '순서는 0 이상이어야 합니다.'),
   })
   .superRefine((data, ctx) => {
      if (data.type === 'ABSOLUTE_POINTS') {
         if (data.maxPoints !== null && data.maxPoints < data.minPoints) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               path: ['maxPoints'],
               message: '최대 포인트는 최소 포인트보다 크거나 같아야 합니다.',
            });
         }
      }

      if (data.type === 'PERCENTILE') {
         if (data.percentileMin === null || data.percentileMax === null) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               path: ['percentileMin'],
               message: '퍼센트 기준의 최소/최대 값을 입력해주세요.',
            });
            return;
         }

         if (data.percentileMax < data.percentileMin) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               path: ['percentileMax'],
               message: '최대 퍼센트는 최소 퍼센트보다 크거나 같아야 합니다.',
            });
         }
      }
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
   membershipFeeStatus: z.enum(['paid', 'not_paid', 'unknown']).optional(),
});

// 포인트 지급 스키마
export const addPointsSchema = z.object({
   points: z.number().int().or(z.string().transform(Number)),
   reason: z.string().min(1, '사유를 입력해주세요').max(200, '사유는 200자 이내로 입력해주세요'),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type SignUpBasicInfoInput = z.infer<typeof signUpBasicInfoSchema>;
export type SignUpPasswordInput = z.infer<typeof signUpPasswordSchema>;
export type SignUpOptionalInput = z.infer<typeof signUpOptionalSchema>;
export type KakaoSignUpInput = z.infer<typeof kakaoSignUpSchema>;
export type SettingsProfileInput = z.infer<typeof settingsProfileSchema>;
export type AdminEventFormInput = z.infer<typeof adminEventFormSchema>;
export type AdminRentalItemFormInput = z.infer<typeof adminRentalItemFormSchema>;
export type AdminSettingsFormInput = z.infer<typeof adminSettingsFormSchema>;
export type AdminGradeConfigFormInput = z.infer<typeof adminGradeConfigFormSchema>;

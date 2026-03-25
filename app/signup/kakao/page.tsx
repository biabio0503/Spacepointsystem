'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { DEPARTMENTS } from '@/store/useStore';
import { kakaoSignUpSchema, type KakaoSignUpInput } from '@/lib/validations';

export default function KakaoSignUpPage() {
   const router = useRouter();
   const searchParams = useSearchParams();

   const kakaoId = searchParams.get('kakaoId');
   const nickname = searchParams.get('nickname') || '';

   const [showDeptDropdown, setShowDeptDropdown] = useState(false);
   const [serverError, setServerError] = useState('');

   const {
      register,
      control,
      setValue,
      clearErrors,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<KakaoSignUpInput>({
      resolver: zodResolver(kakaoSignUpSchema),
      defaultValues: {
         name: nickname,
         studentId: '',
         department: '',
         phone: '',
         referralCode: '',
      },
      mode: 'onBlur',
   });

   const values = useWatch({ control });

   useEffect(() => {
      if (!kakaoId) {
         router.push('/login');
      }
   }, [kakaoId, router]);

   const onSubmit = async (form: KakaoSignUpInput) => {
      if (!kakaoId) {
         setServerError('카카오 인증 정보가 없습니다. 다시 로그인해주세요.');
         return;
      }

      setServerError('');

      try {
         const response = await fetch('/api/auth/signup/kakao', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               kakaoId,
               studentId: form.studentId,
               name: form.name,
               department: form.department,
               phone: form.phone,
               referralCode: form.referralCode || undefined,
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            setServerError(data.error || '회원가입 중 오류가 발생했습니다.');
            return;
         }

         router.replace('/home');
      } catch {
         setServerError('회원가입 중 오류가 발생했습니다.');
      }
   };

   return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>
         <div className="px-5 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-3">
               <button onClick={() => router.push('/login')} className="p-1" type="button">
                  <ChevronLeft size={24} color="#1B2A5C" />
               </button>
               <div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1B2A5C' }}>카카오 계정 연동</h1>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>학생 정보를 입력해주세요</p>
               </div>
            </div>
         </div>

         <div className="flex-1 px-6 py-6">
            <div className="max-w-md mx-auto">
               <div className="mb-6 p-4 rounded-xl" style={{ background: '#FEF9E7' }}>
                  <p style={{ fontSize: 13, color: '#92400E', lineHeight: '1.5' }}>
                     🎓 카카오 계정과 연동하기 위해
                     <br />
                     학생 정보를 입력해주세요.
                  </p>
               </div>

               {serverError && (
                  <div className="mb-4 p-3 rounded-xl" style={{ background: '#FEE2E2' }}>
                     <p style={{ fontSize: 13, color: '#DC2626', textAlign: 'center' }}>{serverError}</p>
                  </div>
               )}

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        이름
                     </label>
                     <input
                        type="text"
                        {...register('name')}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.name ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.name && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.name.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        학번 (8자리)
                     </label>
                     <input
                        type="text"
                        {...register('studentId', {
                           onChange: e => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                              setValue('studentId', value, { shouldValidate: true });
                              clearErrors('studentId');
                           },
                        })}
                        placeholder="20240001"
                        maxLength={8}
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.studentId ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.studentId && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.studentId.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        학과
                     </label>
                     <div className="relative">
                        <button
                           type="button"
                           onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                           className="w-full px-4 py-3 rounded-xl border outline-none transition-colors text-left flex items-center justify-between"
                           style={{
                              borderColor: errors.department ? '#EF4444' : '#E5E7EB',
                              fontSize: 15,
                              background: '#F9F9F9',
                              color: values.department ? '#000' : '#9CA3AF',
                           }}
                        >
                           <span>{values.department || '학과를 선택하세요'}</span>
                           <ChevronDown size={18} color="#9CA3AF" />
                        </button>
                        {showDeptDropdown && (
                           <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
                              {DEPARTMENTS.map((dept) => (
                                 <button
                                    key={dept}
                                    type="button"
                                    onClick={() => {
                                       setValue('department', dept, { shouldValidate: true });
                                       setShowDeptDropdown(false);
                                       clearErrors('department');
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                    style={{ fontSize: 14 }}
                                 >
                                    {dept}
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                     {errors.department && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.department.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        휴대폰 번호
                     </label>
                     <input
                        type="tel"
                        {...register('phone', {
                           onChange: e => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                              setValue('phone', value, { shouldValidate: true });
                              clearErrors('phone');
                           },
                        })}
                        placeholder="01012345678 (- 없이)"
                        maxLength={11}
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.phone ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.phone && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.phone.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        추천인 코드 (선택)
                     </label>
                     <input
                        type="text"
                        {...register('referralCode', {
                           onChange: e => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                              setValue('referralCode', value, { shouldValidate: true });
                           },
                        })}
                        placeholder="추천인이 있다면 입력하세요"
                        maxLength={8}
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.referralCode ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.referralCode && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.referralCode.message}</p>}
                  </div>

                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full py-4 rounded-xl text-white transition-opacity active:opacity-80 mt-6"
                     style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
                  >
                     {isSubmitting ? '가입 중...' : '가입 완료'}
                  </button>
               </form>
            </div>
         </div>
      </div>
   );
}

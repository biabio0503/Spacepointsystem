'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';

export default function ForgotPasswordPage() {
   const router = useRouter();
   const [serverError, setServerError] = useState('');
   const [isSuccess, setIsSuccess] = useState(false);

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors, isSubmitting },
   } = useForm<ForgotPasswordInput>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
         studentId: '',
         name: '',
         phone: '',
         password: '',
         passwordConfirm: '',
      },
      mode: 'onBlur',
   });

   const onSubmit = async (values: ForgotPasswordInput) => {
      setServerError('');

      try {
         const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
         });

         const data = await response.json();

         if (!response.ok) {
            setServerError(data.error || '비밀번호 재설정에 실패했습니다.');
            return;
         }

         setIsSuccess(true);
      } catch {
         setServerError('비밀번호 재설정 중 오류가 발생했습니다.');
      }
   };

   return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>
         <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(160deg, #0D1B3E 0%, #1B2A5C 60%, #253671 100%)' }}>
            <button
               type="button"
               onClick={() => router.push('/login')}
               className="flex items-center gap-1 text-white/80 mb-8"
               style={{ fontSize: 14, fontWeight: 600 }}
            >
               <ChevronLeft size={18} />
               로그인으로 돌아가기
            </button>

            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <KeyRound size={24} color="white" />
               </div>
               <div>
                  <h1 className="text-white" style={{ fontSize: 24, fontWeight: 850 }}>
                     비밀번호 찾기
                  </h1>
                  <p className="text-white/60 mt-1" style={{ fontSize: 13 }}>
                     회원 정보 확인 후 새 비밀번호를 설정합니다
                  </p>
               </div>
            </div>
         </div>

         <div className="flex-1 px-5 py-6">
            <motion.div
               initial={{ opacity: 0, y: 16 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
            >
               {isSuccess ? (
                  <div className="py-8 text-center">
                     <div className="w-16 h-16 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-4">
                        <CheckCircle2 size={34} color="#10B981" />
                     </div>
                     <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>
                        비밀번호가 변경되었습니다
                     </h2>
                     <p className="mt-2" style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                        새 비밀번호로 다시 로그인해주세요.
                     </p>
                     <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="w-full mt-6 py-3.5 rounded-xl text-white transition-opacity active:opacity-80"
                        style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 15 }}
                     >
                        로그인하기
                     </button>
                  </div>
               ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                           학번
                        </label>
                        <input
                           type="text"
                           {...register('studentId', {
                              onChange: e => {
                                 const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 8);
                                 setValue('studentId', onlyDigits, { shouldValidate: true });
                                 setServerError('');
                              },
                           })}
                           placeholder="ex) 20240001"
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
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                           이름
                        </label>
                        <input
                           type="text"
                           {...register('name', {
                              onChange: () => setServerError(''),
                           })}
                           placeholder="이름을 입력하세요"
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
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                           휴대폰 번호
                        </label>
                        <input
                           type="tel"
                           {...register('phone', {
                              onChange: e => {
                                 const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 11);
                                 setValue('phone', onlyDigits, { shouldValidate: true });
                                 setServerError('');
                              },
                           })}
                           placeholder="01012345678"
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
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                           새 비밀번호
                        </label>
                        <input
                           type="password"
                           {...register('password', {
                              onChange: () => setServerError(''),
                           })}
                           placeholder="새 비밀번호 (최소 6자)"
                           className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                           style={{
                              borderColor: errors.password ? '#EF4444' : '#E5E7EB',
                              fontSize: 15,
                              background: '#F9F9F9',
                           }}
                        />
                        {errors.password && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.password.message}</p>}
                     </div>

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                           새 비밀번호 확인
                        </label>
                        <input
                           type="password"
                           {...register('passwordConfirm', {
                              onChange: () => setServerError(''),
                           })}
                           placeholder="새 비밀번호 재입력"
                           className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                           style={{
                              borderColor: errors.passwordConfirm ? '#EF4444' : '#E5E7EB',
                              fontSize: 15,
                              background: '#F9F9F9',
                           }}
                        />
                        {errors.passwordConfirm && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.passwordConfirm.message}</p>}
                     </div>

                     {serverError && (
                        <div className="p-3 rounded-xl" style={{ background: '#FEE2E2' }}>
                           <p style={{ fontSize: 13, color: '#DC2626', textAlign: 'center' }}>{serverError}</p>
                        </div>
                     )}

                     <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                        가입 시 입력한 학번, 이름, 휴대폰 번호가 모두 일치해야 비밀번호를 변경할 수 있습니다.
                     </p>

                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl text-white transition-opacity active:opacity-80"
                        style={{
                           background: isSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #1B2A5C, #2E4A9A)',
                           fontWeight: 700,
                           fontSize: 15,
                        }}
                     >
                        {isSubmitting ? '변경 중...' : '비밀번호 재설정'}
                     </button>
                  </form>
               )}
            </motion.div>
         </div>
      </div>
   );
}

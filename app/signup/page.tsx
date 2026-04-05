'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DEPARTMENTS, useStore } from '@/store/useStore';
import { Skeleton } from '@/app/_components/ui/skeleton';
import {
   signUpBasicInfoSchema,
   signUpOptionalSchema,
   signUpPasswordSchema,
   type SignUpBasicInfoInput,
   type SignUpOptionalInput,
   type SignUpPasswordInput,
} from '@/lib/validations';

type SignUpFormValues = SignUpBasicInfoInput & SignUpPasswordInput & SignUpOptionalInput;

type MembershipFeeStatus = 'paid' | 'not_paid' | 'unknown';
type SignUpStep = 0 | 1 | 2 | 'welcome';

function SignUpPageContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { settings } = useStore();
   const logoUrl = settings?.logoMain || '/logo.png';
   
   const [isImageLoaded, setIsImageLoaded] = useState(false);
   const [showDeptDropdown, setShowDeptDropdown] = useState(false);
   const [currentStep, setCurrentStep] = useState<SignUpStep>(0);
   const [newUser, setNewUser] = useState<any>(null);
   const [studentIdChecked, setStudentIdChecked] = useState(false);
   const [checkingStudentId, setCheckingStudentId] = useState(false);
   const [studentIdAvailable, setStudentIdAvailable] = useState<boolean | null>(null);
   const [serverError, setServerError] = useState('');
   const [agreedTerms, setAgreedTerms] = useState(false);
   const [agreedPrivacy, setAgreedPrivacy] = useState(false);

   const prefillStudentId = searchParams.get('studentId') || '';

   const {
      register,
      watch,
      setValue,
      getValues,
      clearErrors,
      setError,
      trigger,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<SignUpFormValues>({
      resolver: zodResolver(signUpBasicInfoSchema.merge(signUpPasswordSchema).merge(signUpOptionalSchema)),
      defaultValues: {
         name: '',
         studentId: prefillStudentId,
         department: '',
         phone: '',
         password: '',
         passwordConfirm: '',
         referralCode: '',
         membershipFeeStatus: 'unknown',
      },
      mode: 'onBlur',
   });

   const values = watch();

   const checkStudentId = async () => {
      const studentId = getValues('studentId');

      const parsed = signUpBasicInfoSchema.shape.studentId.safeParse(studentId);
      if (!parsed.success) {
         setError('studentId', { message: parsed.error.issues[0].message });
         return;
      }

      setCheckingStudentId(true);
      setServerError('');

      try {
         const response = await fetch('/api/auth/check-student-id', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId }),
         });

         const data = await response.json();

         if (data.available) {
            setStudentIdAvailable(true);
            setStudentIdChecked(true);
            clearErrors('studentId');
         } else {
            setStudentIdAvailable(false);
            setStudentIdChecked(false);
            setError('studentId', { message: data.message || '이미 등록된 학번입니다.' });
         }
      } catch {
         setError('studentId', { message: '학번 확인 중 오류가 발생했습니다.' });
      } finally {
         setCheckingStudentId(false);
      }
   };

   const handleNextStep = async () => {
      setServerError('');

      if (currentStep === 1) {
         if (!agreedTerms || !agreedPrivacy) {
            setServerError('이용약관 및 개인정보처리방침에 모두 동의해주세요.');
            return;
         }

         const valid = await trigger(['name', 'studentId', 'department', 'phone', 'membershipFeeStatus']);
         if (!valid) return;

         if (!studentIdChecked || !studentIdAvailable) {
            setError('studentId', { message: '학번 중복 확인을 해주세요.' });
            return;
         }

         setCurrentStep(2);
         return;
      }
   };

   const handlePrevStep = () => {
      if (currentStep === 1) setCurrentStep(0);
      else if (currentStep === 2) setCurrentStep(1);
      else router.push('/login');
   };

   const onSubmit = async (formValues: SignUpFormValues) => {
      setServerError('');

      try {
         const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               studentId: formValues.studentId,
               name: formValues.name,
               department: formValues.department,
               phone: formValues.phone,
               password: formValues.password,
               referralCode: formValues.referralCode || undefined,
               membershipFeeStatus: formValues.membershipFeeStatus,
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            setServerError(data.error || '회원가입 중 오류가 발생했습니다.');
            return;
         }

         const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               studentId: formValues.studentId,
               password: formValues.password,
            }),
         });

         if (loginResponse.ok) {
            setNewUser(data.user);
            setCurrentStep('welcome');
         } else {
            setServerError('회원가입은 완료되었지만 로그인에 실패했습니다. 다시 로그인해주세요.');
         }
      } catch {
         setServerError('회원가입 중 오류가 발생했습니다.');
      }
   };

   const getStepDescription = () => {
      if (currentStep === 0) return '회원가입 방법을 선택하세요';
      if (currentStep === 1) return '회원 정보를 입력해주세요';
      if (currentStep === 2) return '로그인에 사용할 비밀번호를 설정하세요';
      return '';
   };

   const getCurrentStepNumber = () => {
      if (currentStep === 0) return 0;
      if (currentStep === 1) return 1;
      if (currentStep === 2) return 2;
      return 0;
   };

   if (currentStep === 'welcome') {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F0F2F8' }}>
            <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="flex flex-col items-center gap-6 text-center"
            >
               <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1], y: [-4, 4, -4] }}
                  transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                  className="text-7xl"
               >
                  🎉
               </motion.div>
               <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1B2A5C' }}>
                     환영해요, {newUser?.name}님!
                  </h1>
                  <p className="flex flex-col mt-3 text-gray-600 gap-3" style={{ fontSize: 14, lineHeight: '1.6' }}>
                     <p>
                        <b>학생복지위원회 멤버십</b>에 가입되셨습니다!<br />
                     </p>
                     <p>
                        행사와 사업 소식을 빠르고 편하게 접하고,<br /> 
                        마일리지를 쌓아 상품을 노려보세요!<br /> 
                     </p>
                  </p>
               </div>

               <button
                  onClick={() => router.replace('/home')}
                  className="w-full py-4 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
               >
                  홈으로 가기 ✨
               </button>
            </motion.div>
         </div>
      );
   }

   if (currentStep === 0) {
      return (
         <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>
            <div
               className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 relative overflow-hidden"
               style={{ minHeight: '58vh', background: 'linear-gradient(160deg, #0D1B3E 0%, #1B2A5C 60%, #253671 100%)' }}
            >
               {[...Array(16)].map((_, i) => (
                  <motion.div
                     key={i}
                     className="absolute rounded-full bg-white"
                     style={{
                        width: 2 + (i % 2),
                        height: 2 + (i % 2),
                        left: `${(i * 19 + 3) % 90}%`,
                        top: `${(i * 27 + 5) % 85}%`,
                     }}
                     animate={{ opacity: [0.2, 0.8, 0.2] }}
                     transition={{ duration: 2 + i * 0.2, repeat: Infinity, delay: i * 0.1 }}
                  />
               ))}

               <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-4 relative z-10"
               >
                  <motion.div
                     animate={{ y: [-3, 3, -3] }}
                     transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                     {!isImageLoaded && (
                        <Skeleton className="w-24 h-24 rounded-full bg-white/20" />
                     )}
                     <img
                        src={logoUrl}
                        alt="SPACE logo"
                        style={{
                           width: 96,
                           height: 96,
                           borderRadius: '50%',
                           display: isImageLoaded ? 'block' : 'none',
                        }}
                        onLoad={() => setIsImageLoaded(true)}
                     />
                  </motion.div>
                  <div className="text-center">
                     <h1 className="text-white" style={{ fontSize: 30, fontWeight: 900, letterSpacing: '3px' }}>{settings?.organizationName || ' '}</h1>
                     <p className="text-white/50 mt-0.5" style={{ fontSize: 11 }}>{settings?.organizationSlogun || ' '}</p>
                     <p className="text-white/50 mt-0.5" style={{ fontSize: 11 }}>서울과학기술대학교 학생복지위원회</p>
                  </div>
               </motion.div>
            </div>

            <div className="px-6 pb-10 pt-8 bg-white rounded-t-3xl -mt-6 shadow-lg">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
               >
                  <p className="text-gray-600 mb-6 text-center" style={{ fontSize: 14 }}>
                     회원가입하고 마일리지를 적립해보세요!
                  </p>

                  <button
                     onClick={() => setCurrentStep(1)}
                     className="w-full py-3.5 rounded-xl border-2 transition-colors active:opacity-80 mb-3"
                     style={{ borderColor: '#1B2A5C', color: '#1B2A5C', background: 'white' }}
                  >
                     <span style={{ fontWeight: 600, fontSize: 15 }}>학번으로 회원가입</span>
                  </button>

                  <button
                     onClick={() => router.push('/login')}
                     className="w-full py-2 text-center transition-colors"
                     style={{ fontSize: 13, color: '#1B2A5C' }}
                  >
                     이미 계정이 있으신가요? <span style={{ fontWeight: 600 }}>로그인</span>
                  </button>
               </motion.div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen" style={{ background: '#F0F2F8' }}>
         <div
            className="px-4 pt-12 pb-6"
            style={{ background: 'linear-gradient(135deg, #1B2A5C, #253671)' }}
         >
            <button onClick={handlePrevStep} className="mb-4">
               <ChevronLeft size={24} color="white" />
            </button>
            <h1 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>회원가입</h1>
            <p className="text-white/70 mt-1" style={{ fontSize: 13 }}>{getStepDescription()}</p>

            <div className="flex gap-2 mt-4">
               {Array.from({ length: 2 }, (_, i) => i + 1).map(step => (
                  <div
                     key={step}
                     className="flex-1 h-1 rounded-full"
                     style={{
                        background: getCurrentStepNumber() >= step ? '#FFF' : 'rgba(255,255,255,0.3)',
                     }}
                  />
               ))}
            </div>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-6 space-y-4">
            {currentStep === 1 && (
               <>
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        이름 (실명) *
                     </label>
                     <input
                        type="text"
                        {...register('name')}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 rounded-xl border outline-none"
                        style={{ borderColor: errors.name ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
                     />
                     {errors.name && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.name.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        학번 (8자리) *
                     </label>
                     <div className="flex gap-2">
                        <input
                           type="text"
                           {...register('studentId', {
                              onChange: e => {
                                 const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                 setValue('studentId', value, { shouldValidate: true });
                                 clearErrors('studentId');
                                 setStudentIdChecked(false);
                                 setStudentIdAvailable(null);
                              },
                           })}
                           placeholder="20240001"
                           maxLength={8}
                           className="flex-1 px-4 py-3 rounded-xl border outline-none"
                           style={{
                              borderColor: errors.studentId ? '#EF4444' : studentIdAvailable === true ? '#10B981' : '#E5E7EB',
                              background: '#fff',
                              fontSize: 15,
                           }}
                        />
                        <button
                           type="button"
                           onClick={checkStudentId}
                           disabled={checkingStudentId || values.studentId.length !== 8}
                           className="px-4 py-3 rounded-xl transition-colors whitespace-nowrap"
                           style={{
                              background: studentIdAvailable === true ? '#10B981' : '#1B2A5C',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 600,
                              opacity: checkingStudentId || values.studentId.length !== 8 ? 0.5 : 1,
                              cursor: checkingStudentId || values.studentId.length !== 8 ? 'not-allowed' : 'pointer',
                           }}
                        >
                           {checkingStudentId ? '확인 중...' : studentIdAvailable === true ? '확인완료' : '중복확인'}
                        </button>
                     </div>
                     {errors.studentId && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.studentId.message}</p>}
                     {studentIdAvailable === true && !errors.studentId && (
                        <p className="mt-1" style={{ fontSize: 12, color: '#10B981' }}>✓ 사용 가능한 학번입니다.</p>
                     )}
                  </div>

                  <div className="relative">
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        학과 *
                     </label>
                     <button
                        type="button"
                        onClick={() => setShowDeptDropdown(p => !p)}
                        className="w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between"
                        style={{
                           borderColor: errors.department ? '#EF4444' : '#E5E7EB',
                           background: '#fff',
                           fontSize: 15,
                           color: values.department ? '#1F2937' : '#9CA3AF',
                        }}
                     >
                        <span>{values.department || '학과를 선택해주세요'}</span>
                        <ChevronDown size={18} color="#9CA3AF" />
                     </button>
                     {showDeptDropdown && (
                        <motion.div
                           initial={{ opacity: 0, y: -8 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-56 overflow-y-auto"
                        >
                           {DEPARTMENTS.map(dept => (
                              <button
                                 key={dept}
                                 type="button"
                                 onClick={() => {
                                    setValue('department', dept, { shouldValidate: true });
                                    clearErrors('department');
                                    setShowDeptDropdown(false);
                                 }}
                                 className="w-full px-4 py-3 text-left transition-colors"
                                 style={{ fontSize: 14, color: '#374151' }}
                                 onMouseEnter={e => (e.currentTarget.style.background = '#EEF1FC')}
                                 onMouseLeave={e => (e.currentTarget.style.background = '')}
                              >
                                 {dept}
                              </button>
                           ))}
                        </motion.div>
                     )}
                     {errors.department && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.department.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        휴대폰 번호 * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(-없이 010부터)</span>
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
                        placeholder="01012345678"
                        maxLength={11}
                        className="w-full px-4 py-3 rounded-xl border outline-none"
                        style={{ borderColor: errors.phone ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
                     />
                     {errors.phone && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.phone.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-2.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        자치회비 납부 여부
                     </label>
                     <div className="flex gap-2">
                        {[
                           { value: 'paid', label: '납부', active: '#10B981', bg: '#ECFDF5' },
                           { value: 'not_paid', label: '미납부', active: '#EF4444', bg: '#FEF2F2' },
                           { value: 'unknown', label: '확인 필요', active: '#F59E0B', bg: '#FFFBEB' },
                        ].map(item => {
                           const selected = values.membershipFeeStatus === item.value;
                           return (
                              <button
                                 key={item.value}
                                 type="button"
                                 onClick={() => setValue('membershipFeeStatus', item.value as MembershipFeeStatus, { shouldValidate: true })}
                                 className="flex-1 py-3 rounded-xl border-2 transition-all"
                                 style={{
                                    borderColor: selected ? item.active : '#E5E7EB',
                                    background: selected ? item.bg : '#fff',
                                    color: selected ? item.active : '#6B7280',
                                    fontSize: 14,
                                    fontWeight: selected ? 700 : 500,
                                 }}
                              >
                                 {item.label}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  <div>
                     <label className="block mb-2.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        이용약관 및 개인정보 동의
                     </label>
                     <div className="space-y-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                           <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={agreedTerms}
                                 onChange={(e) => setAgreedTerms(e.target.checked)}
                                 className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" 
                              />
                              <span className="text-sm font-medium text-gray-700">[필수] 서비스 이용약관 동의</span>
                           </label>
                           <button 
                              type="button" 
                              onClick={() => window.open('/terms', '_blank')}
                              className="text-xs text-gray-500 underline"
                           >
                              보기
                           </button>
                        </div>
                        <div className="flex items-center justify-between">
                           <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={agreedPrivacy}
                                 onChange={(e) => setAgreedPrivacy(e.target.checked)}
                                 className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" 
                              />
                              <span className="text-sm font-medium text-gray-700">[필수] 개인정보처리방침 동의</span>
                           </label>
                           <button 
                              type="button" 
                              onClick={() => window.open('/privacy', '_blank')}
                              className="text-xs text-gray-500 underline"
                           >
                              보기
                           </button>
                        </div>
                     </div>
                     {serverError && <p className="mt-2 text-red-600 text-xs font-medium pl-1">{serverError}</p>}
                  </div>

                  <button
                     type="button"
                     onClick={handleNextStep}
                     className="w-full py-4 rounded-xl text-white mt-6"
                     style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
                  >
                     다음 단계
                  </button>
               </>
            )}

            {currentStep === 2 && (
               <>
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        비밀번호 * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(최소 6자)</span>
                     </label>
                     <input
                        type="password"
                        {...register('password')}
                        placeholder="비밀번호를 입력하세요"
                        className="w-full px-4 py-3 rounded-xl border outline-none"
                        style={{ borderColor: errors.password ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
                     />
                     {errors.password && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.password.message}</p>}
                  </div>

                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                        비밀번호 확인 *
                     </label>
                     <input
                        type="password"
                        {...register('passwordConfirm')}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="w-full px-4 py-3 rounded-xl border outline-none"
                        style={{ borderColor: errors.passwordConfirm ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
                     />
                     {errors.passwordConfirm && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.passwordConfirm.message}</p>}
                  </div>

                  {serverError && (
                     <div className="p-3 rounded-xl mb-4" style={{ background: '#FEE2E2' }}>
                        <p style={{ fontSize: 13, color: '#DC2626' }}>{serverError}</p>
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full py-4 rounded-xl text-white mt-6"
                     style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
                  >
                     {isSubmitting ? '가입 중...' : '가입 완료하기'}
                  </button>
               </>
            )}
         </form>
      </div>
   );
}

export default function SignUpPage() {
   return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: '#F0F2F8' }} />}>
         <SignUpPageContent />
      </Suspense>
   );
}

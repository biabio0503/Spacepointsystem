'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { DEPARTMENTS } from '@/store/useStore';
import { useSearchParams } from 'next/navigation';

export default function KakaoSignUpPage() {
   const router = useRouter();
   const searchParams = useSearchParams();

   const kakaoId = searchParams.get('kakaoId');
   const nickname = searchParams.get('nickname') || '';

   const [form, setForm] = useState({
      name: nickname,
      studentId: '',
      department: '',
      phone: '',
      referralCode: '',
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [showDeptDropdown, setShowDeptDropdown] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      if (!kakaoId) {
         router.push('/login');
      }
   }, [kakaoId, router]);

   const validateForm = () => {
      const newErrors: Record<string, string> = {};
      if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.';
      if (!form.studentId || form.studentId.length !== 8) newErrors.studentId = '학번 8자리를 입력해주세요.';
      if (!form.department) newErrors.department = '학과를 선택해주세요.';
      if (!form.phone || !form.phone.startsWith('010') || form.phone.length < 10) {
         newErrors.phone = '올바른 휴대폰 번호를 입력해주세요. (010으로 시작)';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async () => {
      if (!validateForm()) return;

      setIsLoading(true);
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
            setErrors({ general: data.error || '회원가입 중 오류가 발생했습니다.' });
            setIsLoading(false);
            return;
         }

         // 회원가입 성공 - 홈으로 리다이렉트
         router.replace('/home');
      } catch (error) {
         console.error('Kakao signup error:', error);
         setErrors({ general: '회원가입 중 오류가 발생했습니다.' });
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>
         {/* Header */}
         <div className="px-5 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-3">
               <button onClick={() => router.push('/login')} className="p-1">
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
               {/* 안내 메시지 */}
               <div className="mb-6 p-4 rounded-xl" style={{ background: '#FEF9E7' }}>
                  <p style={{ fontSize: 13, color: '#92400E', lineHeight: '1.5' }}>
                     🎓 카카오 계정과 연동하기 위해<br />
                     학생 정보를 입력해주세요.
                  </p>
               </div>

               {/* 에러 메시지 */}
               {errors.general && (
                  <div className="mb-4 p-3 rounded-xl" style={{ background: '#FEE2E2' }}>
                     <p style={{ fontSize: 13, color: '#DC2626', textAlign: 'center' }}>{errors.general}</p>
                  </div>
               )}

               {/* Form */}
               <div className="space-y-4">
                  {/* 이름 */}
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        이름
                     </label>
                     <input
                        type="text"
                        value={form.name}
                        onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.name ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.name && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.name}</p>}
                  </div>

                  {/* 학번 */}
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        학번 (8자리)
                     </label>
                     <input
                        type="text"
                        value={form.studentId}
                        onChange={e => {
                           const value = e.target.value.replace(/\D/g, '');
                           setForm({ ...form, studentId: value });
                           setErrors({ ...errors, studentId: '' });
                        }}
                        placeholder="20240001"
                        maxLength={8}
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.studentId ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.studentId && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.studentId}</p>}
                  </div>

                  {/* 학과 */}
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
                              color: form.department ? '#000' : '#9CA3AF',
                           }}
                        >
                           <span>{form.department || '학과를 선택하세요'}</span>
                           <ChevronDown size={18} color="#9CA3AF" />
                        </button>
                        {showDeptDropdown && (
                           <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
                              {DEPARTMENTS.map((dept) => (
                                 <button
                                    key={dept}
                                    type="button"
                                    onClick={() => {
                                       setForm({ ...form, department: dept });
                                       setShowDeptDropdown(false);
                                       setErrors({ ...errors, department: '' });
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
                     {errors.department && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.department}</p>}
                  </div>

                  {/* 휴대폰 */}
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        휴대폰 번호
                     </label>
                     <input
                        type="tel"
                        value={form.phone}
                        onChange={e => {
                           const value = e.target.value.replace(/\D/g, '');
                           setForm({ ...form, phone: value });
                           setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="01012345678 (- 없이)"
                        maxLength={11}
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: errors.phone ? '#EF4444' : '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     {errors.phone && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.phone}</p>}
                  </div>

                  {/* 추천인 코드 */}
                  <div>
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        추천인 코드 (선택)
                     </label>
                     <input
                        type="text"
                        value={form.referralCode}
                        onChange={e => setForm({ ...form, referralCode: e.target.value })}
                        placeholder="추천인이 있다면 입력하세요"
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                        style={{
                           borderColor: '#E5E7EB',
                           fontSize: 15,
                           background: '#F9F9F9',
                        }}
                     />
                     <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                        💡 추천인 코드를 입력하면 포인트 혜택을 받을 수 있어요
                     </p>
                  </div>
               </div>

               {/* 제출 버튼 */}
               <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl text-white transition-opacity active:opacity-80 mt-6"
                  style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
               >
                  {isLoading ? '가입 중...' : '가입 완료'}
               </button>
            </div>
         </div>
      </div>
   );
}

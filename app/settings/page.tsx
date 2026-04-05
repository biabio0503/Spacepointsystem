'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, LogOut, AlertCircle, Lock, UserX, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useStore } from '@/store/useStore';
import { settingsProfileSchema, type SettingsProfileInput } from '@/lib/validations';
import { meAPI } from '@/lib/api-client';

export default function SettingsPage() {
   const router = useRouter();
   const { currentUser, updateUser, logout, settings } = useStore();
   const [saved, setSaved] = useState(false);
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   const [showPasswordChange, setShowPasswordChange] = useState(false);
   const [showDeleteAccount, setShowDeleteAccount] = useState(false);

   // Password change state
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showCurrentPw, setShowCurrentPw] = useState(false);
   const [showNewPw, setShowNewPw] = useState(false);
   const [passwordError, setPasswordError] = useState<string | null>(null);
   const [passwordSuccess, setPasswordSuccess] = useState(false);
   const [passwordLoading, setPasswordLoading] = useState(false);

   // Delete account state
   const [deletePassword, setDeletePassword] = useState('');
   const [deleteError, setDeleteError] = useState<string | null>(null);
   const [deleteLoading, setDeleteLoading] = useState(false);
   const [showDeletePw, setShowDeletePw] = useState(false);

   const primaryColor = settings?.primaryColor || '#1B2A5C';
   const secondaryColor = settings?.secondaryColor || '#7DC443';

   const {
      register,
      setValue,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<SettingsProfileInput>({
      resolver: zodResolver(settingsProfileSchema),
      defaultValues: {
         name: currentUser?.name ?? '',
         phone: currentUser?.phone ?? '',
      },
      mode: 'onBlur',
   });

   useEffect(() => {
      if (!currentUser) {
         router.replace('/login');
         return;
      }

      setValue('name', currentUser.name);
      setValue('phone', currentUser.phone);
   }, [currentUser, router, setValue]);

   if (!currentUser) {
      return null;
   }

   const onSubmit = async (form: SettingsProfileInput) => {
      try {
         await updateUser(currentUser.id, { name: form.name, phone: form.phone });
         setSaved(true);
         setTimeout(() => setSaved(false), 2000);
      } catch (error) {
         console.error('Failed to update user:', error);
      }
   };

   const handleLogout = async () => {
      try {
         await logout();
         router.replace('/login');
      } catch (error) {
         console.error('Logout failed:', error);
      }
   };

   const handlePasswordChange = async () => {
      setPasswordError(null);
      if (newPassword !== confirmPassword) {
         setPasswordError('새 비밀번호가 일치하지 않습니다.');
         return;
      }
      if (newPassword.length < 4) {
         setPasswordError('비밀번호는 4자 이상이어야 합니다.');
         return;
      }
      setPasswordLoading(true);
      try {
         await meAPI.changePassword(currentPassword, newPassword);
         setPasswordSuccess(true);
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
         setTimeout(() => {
            setPasswordSuccess(false);
            setShowPasswordChange(false);
         }, 2000);
      } catch (error: any) {
         setPasswordError(error.message || '비밀번호 변경에 실패했습니다.');
      } finally {
         setPasswordLoading(false);
      }
   };

   const handleDeleteAccount = async () => {
      if (!deletePassword) {
         setDeleteError('비밀번호를 입력해주세요.');
         return;
      }
      setDeleteLoading(true);
      setDeleteError(null);
      try {
         await meAPI.deleteAccount(deletePassword);
         logout();
         router.replace('/login');
      } catch (error: any) {
         setDeleteError(error.message || '회원 탈퇴에 실패했습니다.');
         setDeleteLoading(false);
      }
   };

   return (
      <div className="min-h-screen" style={{ background: '#EEF1F8' }}>
         <div
            className="px-5 pt-12 pb-5"
            style={{ background: `linear-gradient(135deg, #0D1B3E, ${primaryColor})` }}
         >
            <div className="flex items-center gap-3">
               <button onClick={() => router.push('/mypage')}>
                  <ChevronLeft size={24} color="white" />
               </button>
               <h1 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>계정 관리</h1>
            </div>
         </div>

         <div className="px-5 py-6 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-5 shadow-sm">
               <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>
                  개인정보 수정
               </h3>

               <div className="mb-4">
                  <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                     이름 (실명)
                  </label>
                  <input
                     type="text"
                     {...register('name')}
                     className="w-full px-4 py-3 rounded-xl border outline-none"
                     style={{ borderColor: errors.name ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                  />
                  {errors.name && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.name.message}</p>}
               </div>

               <div className="mb-5">
                  <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                     휴대폰 번호
                  </label>
                  <input
                     type="tel"
                     {...register('phone', {
                        onChange: e => {
                           const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                           setValue('phone', value, { shouldValidate: true });
                        },
                     })}
                     maxLength={11}
                     className="w-full px-4 py-3 rounded-xl border outline-none"
                     style={{ borderColor: errors.phone ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                  />
                  {errors.phone && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.phone.message}</p>}
               </div>

               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-white transition-all"
                  style={{
                     background: saved ? secondaryColor : `linear-gradient(135deg, ${primaryColor}, #2E4A9A)`,
                     fontWeight: 700,
                     fontSize: 15,
                  }}
               >
                  {saved ? '✅ 저장되었어요!' : isSubmitting ? '저장 중...' : '저장하기'}
               </button>
            </form>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
               <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>
                  변경 불가 항목
               </h3>
               <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                  학번/학과 변경은 아래 연락처로 문의해주세요
               </p>

               {[
                  { label: '학번', value: currentUser.studentId },
                  { label: '학과', value: currentUser.department },
               ].map(item => (
                  <div key={item.label} className="mb-3">
                     <label className="block mb-1.5" style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                        {item.label}
                     </label>
                     <div
                        className="w-full px-4 py-3 rounded-xl"
                        style={{ background: '#F3F4F6', fontSize: 15, color: '#9CA3AF' }}
                     >
                        {item.value}
                     </div>
                  </div>
               ))}

               <div
                  className="mt-4 p-3 rounded-xl flex items-start gap-2"
                  style={{ background: '#EEF1FC' }}
               >
                  <AlertCircle size={16} color={primaryColor} className="mt-0.5 flex-shrink-0" />
                  <p style={{ fontSize: 12, color: primaryColor, lineHeight: '1.5' }}>
                     학번 및 학과 변경은 <strong>{settings?.contactPhone} {settings?.contactPerson}</strong>으로 문의해주세요.
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
               <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>계정 정보</h3>
               {[
                  { label: '가입일', value: typeof currentUser.joinedAt === 'string' ? currentUser.joinedAt.split('T')[0] : new Date(currentUser.joinedAt).toLocaleDateString() },
                  { label: '현재 포인트', value: `${currentUser.points}점` },
               ].map(item => (
                  <div key={item.label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
                     <span style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</span>
                     <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{item.value}</span>
                  </div>
               ))}
            </div>

            {/* 비밀번호 변경 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
               <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="w-full flex items-center justify-between"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#EEF1FC' }}>
                        <Lock size={18} color={primaryColor} />
                     </div>
                     <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>비밀번호 변경</span>
                  </div>
                  <ChevronRight
                     size={16}
                     color="#9CA3AF"
                     style={{ transform: showPasswordChange ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  />
               </button>

               {showPasswordChange && (
                  <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="mt-4 space-y-3"
                  >
                     <div>
                        <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                           현재 비밀번호
                        </label>
                        <div className="relative">
                           <input
                              type={showCurrentPw ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border outline-none pr-12"
                              style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                              placeholder="현재 비밀번호"
                           />
                           <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                           >
                              {showCurrentPw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                           </button>
                        </div>
                     </div>
                     <div>
                        <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                           새 비밀번호
                        </label>
                        <div className="relative">
                           <input
                              type={showNewPw ? 'text' : 'password'}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border outline-none pr-12"
                              style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                              placeholder="새 비밀번호 (4자 이상)"
                           />
                           <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                           >
                              {showNewPw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                           </button>
                        </div>
                     </div>
                     <div>
                        <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                           새 비밀번호 확인
                        </label>
                        <input
                           type="password"
                           value={confirmPassword}
                           onChange={e => setConfirmPassword(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border outline-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                           placeholder="새 비밀번호 재입력"
                        />
                     </div>

                     {passwordError && (
                        <p style={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>⚠️ {passwordError}</p>
                     )}

                     <button
                        onClick={handlePasswordChange}
                        disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full py-3 rounded-xl text-white"
                        style={{
                           background: passwordSuccess
                              ? secondaryColor
                              : currentPassword && newPassword && confirmPassword
                                 ? `linear-gradient(135deg, ${primaryColor}, #2E4A9A)`
                                 : '#E5E7EB',
                           fontWeight: 700,
                           color: currentPassword && newPassword && confirmPassword ? 'white' : '#9CA3AF',
                        }}
                     >
                        {passwordSuccess ? '✅ 변경 완료!' : passwordLoading ? '변경 중...' : '비밀번호 변경'}
                     </button>
                  </motion.div>
               )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-1">
               <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>앱 정보</h3>
               <div
                  onClick={() => router.push('/developer')}
                  className="flex justify-between py-3 border-b border-gray-50 cursor-pointer active:scale-[0.98] transition-all"
               >
                  <span style={{ fontSize: 14, color: '#374151' }}>개발자 소개</span>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>ver 1.0</span>
               </div>
               <div
                  onClick={() => router.push('/privacy')}
                  className="flex justify-between py-3 border-b border-gray-50 cursor-pointer active:scale-[0.98] transition-all"
               >
                  <span style={{ fontSize: 14, color: '#374151' }}>개인정보처리방침</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
               </div>
               <div
                  onClick={() => router.push('/terms')}
                  className="flex justify-between py-3 cursor-pointer active:scale-[0.98] transition-all"
               >
                  <span style={{ fontSize: 14, color: '#374151' }}>서비스 이용약관</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
               </div>
            </div>

            <button
               onClick={() => setShowLogoutConfirm(true)}
               className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center gap-2"
               style={{ color: '#EF4444' }}
            >
               <LogOut size={18} />
               <span style={{ fontSize: 15, fontWeight: 600 }}>로그아웃</span>
            </button>

            {/* 회원 탈퇴 */}
            <button
               onClick={() => setShowDeleteAccount(true)}
               className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
               style={{ color: '#9CA3AF', fontSize: 13 }}
            >
               <UserX size={15} />
               <span>회원 탈퇴</span>
            </button>
         </div>

         {/* 로그아웃 확인 모달 */}
         {showLogoutConfirm && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 z-[60] flex items-center justify-center px-6"
               style={{ background: 'rgba(0,0,0,0.5)' }}
            >
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-[320px]"
               >
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
                     로그아웃 하시겠어요?
                  </h3>
                  <p className="mt-2 text-center" style={{ fontSize: 13, color: '#6B7280' }}>
                     다음에 다시 만나요 🛸
                  </p>
                  <div className="flex gap-3 mt-5">
                     <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 py-3 rounded-xl border"
                        style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600, fontSize: 14 }}
                     >
                        취소
                     </button>
                     <button
                        onClick={handleLogout}
                        className="flex-1 py-3 rounded-xl text-white"
                        style={{ background: '#EF4444', fontWeight: 600, fontSize: 14 }}
                     >
                        로그아웃
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}

         {/* 회원 탈퇴 모달 */}
         {showDeleteAccount && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 z-[60] flex items-end justify-center"
               style={{ background: 'rgba(0,0,0,0.5)' }}
               onClick={() => setShowDeleteAccount(false)}
            >
               <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-t-3xl w-full max-w-[430px] p-6"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="flex items-center gap-3 mb-5">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                        <UserX size={24} color="#EF4444" />
                     </div>
                     <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>회원 탈퇴</h3>
                        <p style={{ fontSize: 13, color: '#6B7280' }}>탈퇴 후 모든 데이터가 삭제됩니다</p>
                     </div>
                  </div>

                  <div className="mb-4 p-4 rounded-xl" style={{ background: '#FEF2F2' }}>
                     <p style={{ fontSize: 13, color: '#991B1B', lineHeight: '1.6' }}>
                        ⚠️ 회원 탈퇴 시 <strong>모든 포인트 내역과 계정 정보</strong>가 영구적으로 삭제되며 복구할 수 없습니다.
                     </p>
                  </div>

                  <div className="mb-5">
                     <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        비밀번호 확인
                     </label>
                     <div className="relative">
                        <input
                           type={showDeletePw ? 'text' : 'password'}
                           value={deletePassword}
                           onChange={e => setDeletePassword(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border outline-none pr-12"
                           style={{ borderColor: deleteError ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                           placeholder="현재 비밀번호 입력"
                        />
                        <button
                           type="button"
                           onClick={() => setShowDeletePw(!showDeletePw)}
                           className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                           {showDeletePw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                        </button>
                     </div>
                     {deleteError && <p className="mt-1.5" style={{ fontSize: 12, color: '#EF4444' }}>{deleteError}</p>}
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => { setShowDeleteAccount(false); setDeletePassword(''); setDeleteError(null); }}
                        className="flex-1 py-3 rounded-xl border"
                        style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
                     >
                        취소
                     </button>
                     <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || !deletePassword}
                        className="flex-1 py-3 rounded-xl text-white"
                        style={{
                           background: deletePassword ? 'linear-gradient(135deg, #EF4444, #DC2626)' : '#E5E7EB',
                           fontWeight: 700,
                           color: deletePassword ? 'white' : '#9CA3AF',
                        }}
                     >
                        {deleteLoading ? '처리 중...' : '탈퇴하기'}
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </div>
   );
}

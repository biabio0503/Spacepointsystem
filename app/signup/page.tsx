'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useStore, DEPARTMENTS } from '@/store/useStore';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useStore();

  const prefillStudentId = searchParams.get('studentId') || '';

  const [form, setForm] = useState({
    name: '',
    studentId: prefillStudentId,
    department: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    referralCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 'welcome'>(0); // 0: 초기 선택 화면
  const [newUser, setNewUser] = useState<any>(null);
  const [studentIdChecked, setStudentIdChecked] = useState(false); // 학번 중복 확인 여부
  const [checkingStudentId, setCheckingStudentId] = useState(false); // 중복 확인 로딩
  const [studentIdAvailable, setStudentIdAvailable] = useState<boolean | null>(null); // 사용 가능 여부

  const handleKakaoSignup = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  // 학번 중복 확인
  const checkStudentId = async () => {
    if (!form.studentId || form.studentId.length !== 8) {
      setErrors({ ...errors, studentId: '학번 8자리를 입력해주세요.' });
      return;
    }

    setCheckingStudentId(true);
    try {
      const response = await fetch('/api/auth/check-student-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: form.studentId }),
      });

      const data = await response.json();

      if (data.available) {
        setStudentIdAvailable(true);
        setStudentIdChecked(true);
        setErrors({ ...errors, studentId: '' });
      } else {
        setStudentIdAvailable(false);
        setStudentIdChecked(false);
        setErrors({ ...errors, studentId: data.message || '이미 등록된 학번입니다.' });
      }
    } catch (error) {
      console.error('학번 확인 오류:', error);
      setErrors({ ...errors, studentId: '학번 확인 중 오류가 발생했습니다.' });
    } finally {
      setCheckingStudentId(false);
    }
  };

  // 단계별 validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!form.studentId || form.studentId.length !== 8) {
      newErrors.studentId = '학번 8자리를 입력해주세요.';
    } else if (!studentIdChecked || !studentIdAvailable) {
      newErrors.studentId = '학번 중복 확인을 해주세요.';
    }
    if (!form.department) newErrors.department = '학과를 선택해주세요.';
    if (!form.phone || !form.phone.startsWith('010') || form.phone.length < 10) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요. (010으로 시작)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.password || form.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 1) setCurrentStep(0); // 초기 선택 화면으로
    else if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else router.push('/login');
  };

  const handleSubmit = async () => {
    try {
      // 실제 API 호출
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: form.studentId,
          name: form.name,
          department: form.department,
          phone: form.phone,
          password: form.password,
          referralCode: form.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || '회원가입 중 오류가 발생했습니다.' });
        return;
      }

      // 회원가입 성공 시 로그인 처리
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: form.studentId,
          password: form.password,
        }),
      });

      if (loginResponse.ok) {
        setNewUser(data.user);
        setCurrentStep('welcome');
      } else {
        setErrors({ general: '회원가입은 완료되었지만 로그인에 실패했습니다. 다시 로그인해주세요.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: '회원가입 중 오류가 발생했습니다.' });
    }
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
            🛸
          </motion.div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1B2A5C' }}>
              환영해요, {newUser?.name}님!
            </h1>
            <p className="mt-2" style={{ fontSize: 14, color: '#6B7280', lineHeight: '1.6' }}>
              SPACE 포인트에 가입되었어요.<br />
              별부터 UFO까지 함께 우주를 탐험해요!
            </p>
          </div>

          {/* Grade progression */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <p className="mb-4 text-center" style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
              마일리지 등급
            </p>
            <div className="flex items-center justify-between">
              {[
                { grade: '별', emoji: '⭐', color: '#8B9BC8' },
                { grade: '행성', emoji: '🪐', color: '#4BA3E3' },
                { grade: '로켓', emoji: '🚀', color: '#7DC443' },
                { grade: 'UFO', emoji: '🛸', color: '#F5C518' },
              ].map((g, i, arr) => (
                <div key={g.grade} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <span style={{ fontSize: 24 }}>{g.emoji}</span>
                    <span style={{ fontSize: 10, color: g.color, fontWeight: 600 }}>{g.grade}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-6 h-0.5 mx-1" style={{ background: '#E5E7EB' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {newUser?.points > 0 && (
            <div
              className="w-full rounded-xl p-4 flex items-center gap-3"
              style={{ background: '#EEF1FC' }}
            >
              <span style={{ fontSize: 24 }}>🎉</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1B2A5C' }}>
                  추천인 코드 적용!
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                  +{newUser.points}점이 지급되었어요
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => router.replace('/home')}
            className="w-full py-4 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
          >
            홈으로 가기 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  // 단계별 타이틀
  const getStepTitle = () => {
    if (currentStep === 1) return '기본 정보';
    if (currentStep === 2) return '비밀번호 설정';
    return '추천인 코드 (선택)';
  };

  const getStepDescription = () => {
    if (currentStep === 0) return '회원가입 방법을 선택하세요';
    if (currentStep === 1) return '회원 정보를 입력해주세요';
    if (currentStep === 2) return '로그인에 사용할 비밀번호를 설정하세요';
    return '추천인이 있으시면 학번을 입력해주세요';
  };

  const getTotalSteps = () => 3;
  const getCurrentStepNumber = () => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 1;
    if (currentStep === 2) return 2;
    if (currentStep === 3) return 3;
    return 0;
  };

  // 초기 선택 화면
  if (currentStep === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>
        {/* Top section */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 relative overflow-hidden"
          style={{ minHeight: '58vh', background: 'linear-gradient(160deg, #0D1B3E 0%, #1B2A5C 60%, #253671 100%)' }}
        >
          {/* Stars */}
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
            {/* Logo */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/logos/logo.png"
                alt="SPACE logo"
                style={{ width: 96, height: 96, borderRadius: '50%' }}
              />
            </motion.div>
            <div className="text-center">
              <h1 className="text-white" style={{ fontSize: 30, fontWeight: 900, letterSpacing: '3px' }}>SPACE</h1>
              <p className="text-white/60 mt-1" style={{ fontSize: 12 }}>In your space, with our SPACE</p>
              <p className="text-white/50 mt-0.5" style={{ fontSize: 11 }}>서울과학기술대학교 학생복지위원회</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className="px-6 pb-10 pt-8 bg-white rounded-t-3xl -mt-6 shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-600 mb-6 text-center" style={{ fontSize: 14 }}>
              회원가입하고 우주를 탐험해보세요 🚀
            </p>

            {/* 카카오 회원가입 - 임시 비활성화 */}
            {/* <button
              onClick={handleKakaoSignup}
              className="w-full py-3.5 rounded-xl transition-colors active:opacity-80 mb-3"
              style={{ background: '#FEE500', color: '#000000' }}
            >
              <div className="flex items-center justify-center gap-2">
                <span style={{ fontWeight: 600, fontSize: 15 }}>카카오톡으로 회원가입</span>
              </div>
            </button> */}

            {/* 학번 회원가입 */}
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
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #1B2A5C, #253671)' }}
      >
        <button onClick={handlePrevStep} className="mb-4">
          <ChevronLeft size={24} color="white" />
        </button>
        <h1 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>회원가입</h1>
        <p className="text-white/70 mt-1" style={{ fontSize: 13 }}>{getStepDescription()}</p>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map(step => (
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

      {/* Form */}
      <div className="px-5 py-6 space-y-4">
        {/* Step 1: 기본 정보 */}
        {currentStep === 1 && (
          <>
            {/* Name */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                이름 (실명) *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                placeholder="홍길동"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: errors.name ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
              />
              {errors.name && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.name}</p>}
            </div>

            {/* Student ID */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                학번 (8자리) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.studentId}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setForm(p => ({ ...p, studentId: value }));
                    setErrors(p => ({ ...p, studentId: '' }));
                    setStudentIdChecked(false);
                    setStudentIdAvailable(null);
                  }}
                  placeholder="20240001"
                  maxLength={8}
                  className="flex-1 px-4 py-3 rounded-xl border outline-none"
                  style={{
                    borderColor: errors.studentId ? '#EF4444' : studentIdAvailable === true ? '#10B981' : '#E5E7EB',
                    background: '#fff',
                    fontSize: 15
                  }}
                />
                <button
                  type="button"
                  onClick={checkStudentId}
                  disabled={checkingStudentId || form.studentId.length !== 8}
                  className="px-4 py-3 rounded-xl transition-colors whitespace-nowrap"
                  style={{
                    background: studentIdAvailable === true ? '#10B981' : '#1B2A5C',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: checkingStudentId || form.studentId.length !== 8 ? 0.5 : 1,
                    cursor: checkingStudentId || form.studentId.length !== 8 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {checkingStudentId ? '확인 중...' : studentIdAvailable === true ? '확인완료' : '중복확인'}
                </button>
              </div>
              {errors.studentId && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.studentId}</p>}
              {studentIdAvailable === true && !errors.studentId && (
                <p className="mt-1" style={{ fontSize: 12, color: '#10B981' }}>✓ 사용 가능한 학번입니다.</p>
              )}
            </div>

            {/* Department */}
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
                  color: form.department ? '#1F2937' : '#9CA3AF',
                }}
              >
                <span>{form.department || '학과를 선택해주세요'}</span>
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
                      onClick={() => {
                        setForm(p => ({ ...p, department: dept }));
                        setErrors(p => ({ ...p, department: '' }));
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
              {errors.department && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.department}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                휴대폰 번호 * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(-없이 010부터)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => { setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') })); setErrors(p => ({ ...p, phone: '' })); }}
                placeholder="01012345678"
                maxLength={11}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: errors.phone ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
              />
              {errors.phone && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.phone}</p>}
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-4 rounded-xl text-white mt-6"
              style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
            >
              다음 단계
            </button>
          </>
        )}

        {/* Step 2: 비밀번호 */}
        {currentStep === 2 && (
          <>
            {/* Password */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                비밀번호 * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(최소 6자)</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: errors.password ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
              />
              {errors.password && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.password}</p>}
            </div>

            {/* Password Confirm */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                비밀번호 확인 *
              </label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={e => { setForm(p => ({ ...p, passwordConfirm: e.target.value })); setErrors(p => ({ ...p, passwordConfirm: '' })); }}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: errors.passwordConfirm ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
              />
              {errors.passwordConfirm && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.passwordConfirm}</p>}
            </div>

            <div className="mt-4 p-3 rounded-xl" style={{ background: '#EEF1FC' }}>
              <p style={{ fontSize: 12, color: '#6B7280', lineHeight: '1.6' }}>
                💡 이 비밀번호로 학번 로그인할 수 있습니다
              </p>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-4 rounded-xl text-white mt-6"
              style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
            >
              다음 단계
            </button>
          </>
        )}

        {/* Step 3: 추천인 */}
        {currentStep === 3 && (
          <>
            {/* Referral */}
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                추천인 학번 <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(선택사항)</span>
              </label>
              <input
                type="text"
                value={form.referralCode}
                onChange={e => setForm(p => ({ ...p, referralCode: e.target.value }))}
                placeholder="추천인의 학번 8자리"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: '#E5E7EB', background: '#fff', fontSize: 15 }}
              />
              <p className="mt-2" style={{ fontSize: 12, color: '#9CA3AF', lineHeight: '1.6' }}>
                💎 추천인 입력 시 서로 포인트 지급!<br />
                • 추천인: +100점<br />
                • 나: +50점
              </p>
            </div>

            {errors.general && (
              <div className="p-3 rounded-xl" style={{ background: '#FEE2E2' }}>
                <p style={{ fontSize: 13, color: '#DC2626' }}>{errors.general}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl text-white mt-6"
              style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
            >
              가입 완료하기 🚀
            </button>

            <button
              onClick={() => handleSubmit()}
              className="w-full py-3 rounded-xl text-gray-600 mt-2"
              style={{ background: '#F3F4F6', fontWeight: 600, fontSize: 14 }}
            >
              추천인 없이 가입
            </button>
          </>
        )}

        <p className="text-center mt-4" style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '1.5' }}>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useStore } from '@/store/useStore';
import { Skeleton } from '@/app/_components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormInput } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const { login, settings } = useStore();

  const logoUrl = settings?.logoMain || '/logo.png';
  const [error, setError] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    const urlMessage = params.get('message');

    if (urlMessage) {
      return decodeURIComponent(urlMessage);
    }

    if (urlError) {
      const errorMessages: Record<string, string> = {
        kakao_disabled: '카카오 로그인이 비활성화되었습니다. 학번으로 로그인해주세요.',
        unknown: '알 수 없는 오류가 발생했습니다.',
      };
      return errorMessages[urlError] || '로그인 중 오류가 발생했습니다.';
    }

    return '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showStudentIdInput, setShowStudentIdInput] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      studentId: '',
      password: '',
    },
  });

  // URL에서 에러 파라미터 제거
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    const urlMessage = params.get('message');

    if (urlMessage || urlError) {
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleStudentLogin = async (values: LoginFormInput) => {
    setIsLoading(true);
    setError('');

    try {
      const user = await login(values.studentId, values.password);

      if (!user) {
        setError('로그인에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      // 로그인 성공
      if (user.isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/home');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };



  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

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

      {/* Bottom section */}
      <div className="px-6 pb-10 pt-8 bg-white rounded-t-3xl -mt-6 shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-600 mb-6 text-center" style={{ fontSize: 14 }}>
            로그인하고 마일리지를 적립해보세요 
          </p>

          {!showStudentIdInput ? (
            <>
              {/* 에러 메시지 */}
              {error && (
                <div className="mb-3 p-3 rounded-xl" style={{ background: '#FEE2E2' }}>
                  <p style={{ fontSize: 13, color: '#DC2626', textAlign: 'center' }}>{error}</p>
                </div>
              )}

              {/* 카카오 로그인 - 임시 비활성화 */}
              {/* <button
                onClick={handleKakaoLogin}
                className="w-full py-3.5 rounded-xl transition-colors active:opacity-80 mb-3"
                style={{ background: '#FEE500', color: '#000000' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span style={{ fontWeight: 600, fontSize: 15 }}>카카오로 시작하기</span>
                </div>
              </button> */}

              {/* 학번 로그인 */}
              <button
                onClick={() => setShowStudentIdInput(true)}
                className="w-full py-3.5 rounded-xl border-2 transition-colors active:opacity-80 mb-3"
                style={{ borderColor: '#1B2A5C', color: '#1B2A5C', background: 'white' }}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>학번으로 로그인</span>
              </button>

              {/* 회원가입 링크 */}
              <button
                onClick={() => router.push('/signup')}
                className="w-full py-2 text-center transition-colors"
                style={{ fontSize: 13, color: '#1B2A5C' }}
              >
                계정이 없으신가요? <span style={{ fontWeight: 600 }}>회원가입</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(handleStudentLogin)} className="space-y-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                  학번 (8자리)
                </label>
                <input
                  type="text"
                  {...register('studentId', {
                    onChange: e => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setValue('studentId', onlyDigits, { shouldValidate: true });
                      setError('');
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
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  💡 학번으로 로그인할 수 있습니다
                </p>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  {...register('password', {
                    onChange: () => setError(''),
                  })}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                  style={{
                    borderColor: errors.password ? '#EF4444' : '#E5E7EB',
                    fontSize: 15,
                    background: '#F9F9F9',
                  }}
                />
                {errors.password && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.password.message}</p>}
                {error && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{error}</p>}
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="mt-2 text-right w-full transition-colors"
                  style={{ fontSize: 12, color: '#1B2A5C', fontWeight: 600 }}
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-white transition-opacity active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 15 }}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="w-full py-2 text-center transition-colors"
                style={{ fontSize: 13, color: '#1B2A5C' }}
              >
                계정이 없으신가요? <span style={{ fontWeight: 600 }}>회원가입</span>
              </button>
              <button
                onClick={() => setShowStudentIdInput(false)}
                className="w-full py-2 text-gray-400"
                style={{ fontSize: 13 }}
              >
                뒤로 가기
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

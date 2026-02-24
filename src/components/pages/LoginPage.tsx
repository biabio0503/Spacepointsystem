'use client';

import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { authService } from '@/lib/auth';

const logoImg = '/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: demoLogin } = useApp(); // Demo login for development
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStudentIdInput, setShowStudentIdInput] = useState(false);

  const handleKakaoLogin = async () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  const handleStudentLogin = async () => {
    if (!studentId.trim()) {
      setError('학번을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { user, error: loginError } = await authService.login(studentId, password);

      if (loginError || !user) {
        setError(loginError || '로그인에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      // 로그인 성공
      if (user.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleDemo = (id: string) => {
    demoLogin(id);
    navigate(id === 'admin' ? '/admin' : '/home', { replace: true });
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
            <img
              src={logoImg}
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
            로그인하고 우주를 탐험해보세요 🚀
          </p>

          {!showStudentIdInput ? (
            <>
              {/* Kakao Login */}
              <button
                onClick={handleKakaoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl mb-3 transition-opacity active:opacity-80"
                style={{ background: '#FEE500', color: '#191919' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 2C5.58172 2 2 4.91015 2 8.5C2 10.7614 3.36937 12.7591 5.47456 13.9399L4.61803 17.0279C4.55237 17.2629 4.80899 17.4521 5.01132 17.3196L8.60585 14.9451C9.06107 14.9814 9.52713 15 10 15C14.4183 15 18 12.0899 18 8.5C18 4.91015 14.4183 2 10 2Z" fill="#191919" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>카카오로 시작하기</span>
                  </>
                )}
              </button>

              {/* Student ID direct login */}
              <button
                onClick={() => setShowStudentIdInput(true)}
                className="w-full py-3.5 rounded-xl border-2 transition-colors active:opacity-80"
                style={{ borderColor: '#1B2A5C', color: '#1B2A5C', background: 'white' }}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>학번으로 로그인</span>
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                  학번 (8자리)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => { setStudentId(e.target.value); setError(''); }}
                  placeholder="ex) 20240001"
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                  style={{
                    borderColor: error ? '#EF4444' : '#E5E7EB',
                    fontSize: 15,
                    background: '#F9F9F9',
                  }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-colors"
                  style={{
                    borderColor: error ? '#EF4444' : '#E5E7EB',
                    fontSize: 15,
                    background: '#F9F9F9',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleStudentLogin()}
                />
                {error && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{error}</p>}
              </div>
              <button
                onClick={handleStudentLogin}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-white transition-opacity active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 15 }}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
              <button
                onClick={() => navigate('/signup')}
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
            </div>
          )}

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-center mb-3" style={{ fontSize: 12, color: '#9CA3AF' }}>데모 계정으로 체험하기</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDemo('20240001')}
                className="flex-1 py-2 rounded-lg text-xs transition-colors"
                style={{ background: '#EEF1FC', color: '#1B2A5C', fontWeight: 600 }}
              >
                🚀 일반 유저
              </button>
              <button
                onClick={() => handleDemo('admin')}
                className="flex-1 py-2 rounded-lg text-xs transition-colors"
                style={{ background: '#EEF1FC', color: '#1B2A5C', fontWeight: 600 }}
              >
                🔧 관리자
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

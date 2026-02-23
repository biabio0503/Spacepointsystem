import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useApp, DEPARTMENTS } from '../context/AppContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useApp();

  const prefillStudentId = (location.state as any)?.studentId || '';

  const [form, setForm] = useState({
    name: '',
    studentId: prefillStudentId,
    department: '',
    phone: '',
    referralCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [step, setStep] = useState<'info' | 'welcome'>('info');
  const [newUser, setNewUser] = useState<any>(null);

  const validate = () => {
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

  const handleSubmit = () => {
    if (!validate()) return;
    const user = register({
      studentId: form.studentId,
      name: form.name,
      department: form.department,
      phone: form.phone,
      referralCode: form.referralCode || undefined,
    });
    setNewUser(user);
    setStep('welcome');
  };

  if (step === 'welcome') {
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
            onClick={() => navigate('/home', { replace: true })}
            className="w-full py-4 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
          >
            홈으로 가기 🚀
          </button>
        </motion.div>
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
        <button onClick={() => navigate('/login')} className="mb-4">
          <ChevronLeft size={24} color="white" />
        </button>
        <h1 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>회원가입</h1>
        <p className="text-white/70 mt-1" style={{ fontSize: 13 }}>SPACE 포인트에 오신 것을 환영해요!</p>
      </div>

      {/* Form */}
      <div className="px-5 py-6 space-y-4">
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
          <input
            type="text"
            value={form.studentId}
            onChange={e => { setForm(p => ({ ...p, studentId: e.target.value })); setErrors(p => ({ ...p, studentId: '' })); }}
            placeholder="20240001"
            maxLength={8}
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ borderColor: errors.studentId ? '#EF4444' : '#E5E7EB', background: '#fff', fontSize: 15 }}
          />
          {errors.studentId && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.studentId}</p>}
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

        {/* Referral */}
        <div>
          <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
            추천인 학번 <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(선택)</span>
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
          <p className="mt-1" style={{ fontSize: 11, color: '#9CA3AF' }}>
            추천인 입력 시 양측 모두 5점 지급!
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl text-white mt-4"
          style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}
        >
          가입하기
        </button>

        <p className="text-center" style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '1.5' }}>
          가입 시 개인정보 수집 및 이용에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

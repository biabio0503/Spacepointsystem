import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, LogOut, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useApp();
  const [form, setForm] = useState({
    name: currentUser?.name ?? '',
    phone: currentUser?.phone ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!currentUser) {
    navigate('/login', { replace: true });
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!form.phone || !form.phone.startsWith('010') || form.phone.length < 10) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateUser(currentUser.id, { name: form.name, phone: form.phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #0D1B3E, #1B2A5C)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>계정 관리</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Editable fields */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>
            개인정보 수정
          </h3>

          {/* Name */}
          <div className="mb-4">
            <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
              이름 (실명)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
              className="w-full px-4 py-3 rounded-xl border outline-none"
              style={{ borderColor: errors.name ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
            />
            {errors.name && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
              휴대폰 번호
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => { setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') })); setErrors(p => ({ ...p, phone: '' })); }}
              maxLength={11}
              className="w-full px-4 py-3 rounded-xl border outline-none"
              style={{ borderColor: errors.phone ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
            />
            {errors.phone && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.phone}</p>}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-white transition-all"
            style={{
              background: saved ? '#7DC443' : 'linear-gradient(135deg, #1B2A5C, #2E4A9A)',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {saved ? '✅ 저장되었어요!' : '저장하기'}
          </button>
        </div>

        {/* Non-editable fields */}
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
            <AlertCircle size={16} color="#1B2A5C" className="mt-0.5 flex-shrink-0" />
            <p style={{ fontSize: 12, color: '#1B2A5C', lineHeight: '1.5' }}>
              학번 및 학과 변경은 <strong>010-6778-5658 (김규원)</strong>으로 문의해주세요.
            </p>
          </div>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>계정 정보</h3>
          {[
            { label: '가입일', value: currentUser.joinedAt },
            { label: '현재 포인트', value: `${currentUser.points}점` },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center gap-2"
          style={{ color: '#EF4444' }}
        >
          <LogOut size={18} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>로그아웃</span>
        </button>
      </div>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
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
    </div>
  );
}

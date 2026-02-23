'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminMembersPage() {
  const { users, getGrade, getGradeInfo, addPoints } = useApp();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [pointAmount, setPointAmount] = useState(10);
  const [pointReason, setPointReason] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'name' | 'joined'>('points');

  const realUsers = users.filter(u => !u.isAdmin);

  const filtered = realUsers.filter(u =>
    u.name.includes(search) ||
    u.studentId.includes(search) ||
    u.department.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'joined') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    return 0;
  });

  const handleAddPoints = () => {
    if (!selectedUser || pointAmount <= 0 || !pointReason.trim()) return;
    addPoints(selectedUser, pointAmount, pointReason);
    setSelectedUser(null);
    setPointAmount(10);
    setPointReason('');
  };

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null;

  return (
    <div className="px-5 py-5">
      <div className="mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B2A5C' }}>가입자 관리</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>총 {realUsers.length}명 가입</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름, 학번, 학과 검색"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none"
          style={{ borderColor: '#E5E7EB', background: 'white', fontSize: 14 }}
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'points', label: '포인트순' },
          { key: 'name', label: '이름순' },
          { key: 'joined', label: '가입순' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key as any)}
            className="px-3 py-1.5 rounded-full text-xs transition-colors"
            style={{
              background: sortBy === s.key ? '#1B2A5C' : 'white',
              color: sortBy === s.key ? 'white' : '#6B7280',
              fontWeight: 600,
              border: `1px solid ${sortBy === s.key ? '#1B2A5C' : '#E5E7EB'}`,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="space-y-2">
        {sorted.map((user, i) => {
          const grade = getGrade(user.id);
          const info = getGradeInfo(grade);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: info.bg }}
                  >
                    <span style={{ fontSize: 18 }}>{info.emoji}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{user.name}</span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: info.bg, color: info.color, fontSize: 10 }}
                      >
                        {grade}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {user.studentId} · {user.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#1B2A5C' }}>{user.points}점</span>
                  <button
                    onClick={() => setSelectedUser(user.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#EEF1FC' }}
                  >
                    <Plus size={16} color="#1B2A5C" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span style={{ fontSize: 10, color: '#D1D5DB' }}>📱 {user.phone}</span>
                <span style={{ fontSize: 10, color: '#D1D5DB' }}>📅 {user.joinedAt}</span>
              </div>
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p style={{ fontSize: 32 }}>👥</p>
            <p className="mt-2" style={{ fontSize: 14, color: '#9CA3AF' }}>검색 결과가 없어요</p>
          </div>
        )}
      </div>

      {/* Add points modal */}
      {selectedUser && selectedUserData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#EEF1FC' }}
              >
                <Gift size={24} color="#1B2A5C" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>포인트 수동 지급</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>{selectedUserData.name} · {selectedUserData.points}점</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                포인트
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pointAmount}
                  onChange={e => setPointAmount(Number(e.target.value))}
                  min={1}
                  className="flex-1 px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                />
                <span style={{ fontWeight: 600 }}>점</span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[5, 10, 15, 20, 25, 30].map(p => (
                  <button
                    key={p}
                    onClick={() => setPointAmount(p)}
                    className="px-3 py-1 rounded-lg text-xs"
                    style={{
                      background: pointAmount === p ? '#1B2A5C' : '#F3F4F6',
                      color: pointAmount === p ? 'white' : '#6B7280',
                      fontWeight: 600,
                    }}
                  >
                    {p}점
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                지급 사유
              </label>
              <input
                type="text"
                value={pointReason}
                onChange={e => setPointReason(e.target.value)}
                placeholder="ex) S'TED 참여"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 rounded-xl border"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
              >
                취소
              </button>
              <button
                onClick={handleAddPoints}
                disabled={!pointReason.trim() || pointAmount <= 0}
                className="flex-1 py-3 rounded-xl text-white"
                style={{
                  background: pointReason.trim() && pointAmount > 0
                    ? 'linear-gradient(135deg, #1B2A5C, #2E4A9A)'
                    : '#E5E7EB',
                  fontWeight: 700,
                  color: pointReason.trim() && pointAmount > 0 ? 'white' : '#9CA3AF',
                }}
              >
                지급하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

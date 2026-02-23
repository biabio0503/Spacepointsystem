'use client';

import { useNavigate } from '@/lib/navigation';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const { users, events, pointHistory, getGrade, getGradeInfo } = useApp();

  const realUsers = users.filter(u => !u.isAdmin);
  const totalPoints = realUsers.reduce((sum, u) => sum + u.points, 0);
  const activeEvents = events.filter(e => e.isActive).length;

  // Grade distribution
  const gradeCounts = realUsers.reduce((acc, u) => {
    const grade = getGrade(u.id);
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top users
  const topUsers = [...realUsers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  // Recent point history
  const recentHistory = [...pointHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name ?? '-';

  return (
    <div className="px-5 py-5">
      <div className="mb-5">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B2A5C' }}>대시보드</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>2025 SPACE 포인트 현황</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: '총 가입자', value: realUsers.length, unit: '명', icon: '👥', color: '#1B2A5C', bg: '#EEF1FC' },
          { label: '진행중 사업', value: activeEvents, unit: '개', icon: '🚀', color: '#4BA3E3', bg: '#EBF4FF' },
          { label: '총 적립 포인트', value: totalPoints, unit: '점', icon: '🛸', color: '#7DC443', bg: '#EFF8E6' },
          { label: '이번달 적립', value: pointHistory.filter(h => h.date.startsWith('2025-06')).length, unit: '건', icon: '⭐', color: '#F5C518', bg: '#FFF8E1' },
        ].map(item => (
          <motion.div
            key={item.label}
            whileTap={{ scale: 0.97 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: item.bg }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
              {item.value}<span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{item.unit}</span>
            </p>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Grade distribution */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 14 }}>등급 분포</h3>
        {(['별', '행성', '로켓', 'UFO'] as const).map(grade => {
          const info = getGradeInfo(grade);
          const count = gradeCounts[grade] || 0;
          const percent = realUsers.length ? (count / realUsers.length) * 100 : 0;
          return (
            <div key={grade} className="flex items-center gap-3 mb-3 last:mb-0">
              <span style={{ fontSize: 16, minWidth: 24 }}>{info.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{grade}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{count}명 ({Math.round(percent)}%)</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: info.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top users */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>포인트 TOP 5</h3>
          <button
            onClick={() => navigate('/admin/members')}
            className="flex items-center gap-0.5"
            style={{ fontSize: 12, color: '#6B7280' }}
          >
            전체 <ChevronRight size={13} />
          </button>
        </div>
        {topUsers.map((user, i) => {
          const grade = getGrade(user.id);
          const info = getGradeInfo(grade);
          return (
            <div key={user.id} className={`flex items-center gap-3 py-2.5 ${i < topUsers.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span style={{ fontSize: 16, minWidth: 24, fontWeight: 800, color: i < 3 ? '#1B2A5C' : '#9CA3AF' }}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{user.name}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>{user.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: info.bg, color: info.color }}
                >
                  {grade}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A5C' }}>{user.points}점</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>최근 적립 내역</h3>
        {recentHistory.map((h, i) => (
          <div key={h.id} className={`flex items-center justify-between py-2.5 ${i < recentHistory.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{getUserName(h.userId)}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{h.reason} · {h.date}</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A5C' }}>+{h.points}점</span>
          </div>
        ))}
      </div>
    </div>
  );
}

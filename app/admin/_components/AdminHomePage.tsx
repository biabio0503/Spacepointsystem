'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminHomePage() {
  const router = useRouter();
  const { users, events, pointHistory, gradeConfigs, getGrade, getGradeInfo, refreshUsers, refreshEvents, refreshPointHistory, refreshGradeConfigs, settings, refreshSettings } = useStore();

  useEffect(() => {
    refreshUsers();
    refreshEvents();
    refreshPointHistory();
    refreshGradeConfigs();
    refreshSettings();
  }, [refreshUsers, refreshEvents, refreshPointHistory, refreshGradeConfigs, refreshSettings]);

  const realUsers = users.filter(u => !u.isAdmin);
  const totalPoints = realUsers.reduce((sum, u) => sum + u.points, 0);
  const activeEvents = events.filter(e => e.isActive).length;

  // Grade distribution
  const gradeCounts = realUsers.reduce((acc, u) => {
    const grade = getGrade(u.id);
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent point history
  const recentHistory = [...pointHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name ?? '-';

  // 월별 통계 데이터 계산 (최근 6개월)
  const getMonths = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const year = String(d.getFullYear()).substring(2);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return { label: `${year}.${month}`, full: `${d.getFullYear()}-${month}` };
    });
  };

  const signupData = useMemo(() => {
    const months = getMonths();
    const data = months.map(m => ({ name: m.label, 가입자: 0 }));
    
    realUsers.forEach(u => {
      if (!u.joinedAt) return;
      const d = typeof u.joinedAt === 'string' ? new Date(u.joinedAt) : u.joinedAt;
      if (!(d instanceof Date) || isNaN(d.getTime())) return;
      const monthLabel = `${String(d.getFullYear()).substring(2)}.${String(d.getMonth() + 1).padStart(2, '0')}`;
      const target = data.find(m => m.name === monthLabel);
      if (target) target.가입자++;
    });
    return data;
  }, [realUsers]);

  const pointsData = useMemo(() => {
    const months = getMonths();
    const data = months.map(m => ({ name: m.label, 포인트: 0 }));
    
    pointHistory.forEach(h => {
      if (!h.date) return;
      const d = typeof h.date === 'string' ? new Date(h.date) : h.date;
      if (!(d instanceof Date) || isNaN(d.getTime())) return;
      const monthLabel = `${String(d.getFullYear()).substring(2)}.${String(d.getMonth() + 1).padStart(2, '0')}`;
      const target = data.find(m => m.name === monthLabel);
      if (target) target.포인트 += h.points;
    });
    return data;
  }, [pointHistory]);

  const handleGradeClick = (gradeName: string) => {
    router.push(`/admin/members?search=${encodeURIComponent(gradeName)}`);
  };

  return (
    <div className="px-5 py-5 pb-24">
      <div className="mb-5">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B2A5C' }}>대시보드</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>{settings?.organizationName || '학생복지위원회'} 활동 통계</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: '총 가입자', value: realUsers.length, unit: '명', bg: '#EEF1FC' },
          { label: '진행중 사업', value: activeEvents, unit: '개', bg: '#EBF4FF' },
          { label: '총 적립 포인트', value: totalPoints, unit: '점', bg: '#EFF8E6' },
          { label: '이번달 적립', value: pointHistory.filter(h => {
            const today = new Date();
            const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            return h.date.startsWith(ym);
          }).length, unit: '건', bg: '#FFF8E1' },
        ].map(item => (
          <motion.div
            key={item.label}
            whileTap={{ scale: 0.97 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <p style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
              {item.value}<span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{item.unit}</span>
            </p>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>월별 가입자 추이</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dx={-10} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="가입자" fill="#4BA3E3" radius={[4, 4, 4, 4]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>월별 포인트 적립 추이</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pointsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dx={-10} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="포인트" stroke="#F5C518" strokeWidth={3} dot={{ r: 4, fill: '#F5C518', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>등급 분포</h3>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>클릭하여 멤버 보기</span>
        </div>
        
        {gradeConfigs.length === 0 ? (
          (['별', '행성', '로켓', 'UFO'] as const).map(grade => {
            const info = getGradeInfo(grade);
            const count = gradeCounts[grade] || 0;
            const percent = realUsers.length ? (count / realUsers.length) * 100 : 0;
            return (
              <div 
                key={grade} 
                className="flex items-center gap-3 mb-3 last:mb-0 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                onClick={() => handleGradeClick(grade)}
              >
                <span style={{ fontSize: 16, minWidth: 24 }}>{info.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{grade}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{count}명 ({Math.round(percent)}%) <ChevronRight size={12} className="inline mb-0.5" /></span>
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
          })
        ) : (
          [...gradeConfigs].sort((a, b) => a.minPoints - b.minPoints).map(config => {
            const grade = config.name;
            const info = getGradeInfo(grade);
            const count = gradeCounts[grade] || 0;
            const percent = realUsers.length ? (count / realUsers.length) * 100 : 0;
            return (
              <div 
                key={grade} 
                className="flex items-center gap-3 mb-3 last:mb-0 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                onClick={() => handleGradeClick(grade)}
              >
                <span style={{ fontSize: 16, minWidth: 24 }}>{info.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{grade}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{count}명 ({Math.round(percent)}%) <ChevronRight size={12} className="inline mb-0.5" /></span>
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
          })
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>최근 적립 내역</h3>
          <span 
            className="text-xs text-blue-500 font-medium cursor-pointer"
            onClick={() => router.push('/admin/members')}
          >
            포인트 지급
          </span>
        </div>
        {recentHistory.map((h, i) => (
          <div key={h.id} className={`flex items-center justify-between py-3 ${i < recentHistory.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{getUserName(h.userId)}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{h.reason} · {h.date.split('T')[0]}</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A5C' }}>+{h.points}점</span>
          </div>
        ))}
        {recentHistory.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">최근 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

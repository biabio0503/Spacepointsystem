'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRight, Users, Zap, TrendingUp, Calendar, Award, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

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
  const avgPoints = realUsers.length > 0 ? Math.round(totalPoints / realUsers.length) : 0;
  const activeEvents = events.filter(e => e.isActive).length;

  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = (() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const thisMonthPoints = pointHistory.filter(h => h.date.startsWith(thisMonth)).reduce((sum, h) => sum + h.points, 0);
  const lastMonthPoints = pointHistory.filter(h => h.date.startsWith(lastMonth)).reduce((sum, h) => sum + h.points, 0);
  const pointGrowthRate = lastMonthPoints > 0 ? Math.round(((thisMonthPoints - lastMonthPoints) / lastMonthPoints) * 100) : 0;

  const thisMonthSignups = realUsers.filter(u => {
    if (!u.joinedAt) return false;
    const d = typeof u.joinedAt === 'string' ? new Date(u.joinedAt) : u.joinedAt;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === thisMonth;
  }).length;

  // 자치회비 통계
  type MembershipStatus = 'paid' | 'not_paid' | 'unknown';
  const getMembershipStatus = (value: unknown): MembershipStatus => {
    if (value === 'paid' || value === 'not_paid' || value === 'unknown') return value;
    return 'unknown';
  };
  const membershipStats = {
    paid: realUsers.filter(u => getMembershipStatus((u as any).membershipFeeStatus) === 'paid').length,
    not_paid: realUsers.filter(u => getMembershipStatus((u as any).membershipFeeStatus) === 'not_paid').length,
    unknown: realUsers.filter(u => getMembershipStatus((u as any).membershipFeeStatus) === 'unknown').length,
  };
  const membershipRate = realUsers.length > 0
    ? Math.round((membershipStats.paid / realUsers.length) * 100)
    : 0;

  // 미납 회원 (주의 필요)
  const unpaidCount = membershipStats.not_paid;

  // Grade distribution
  const gradeCounts = realUsers.reduce((acc, u) => {
    const grade = getGrade(u.id);
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 최근 포인트 내역
  const recentHistory = [...pointHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name ?? '-';



  const signupData = (() => {
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
  })();

  const pointsData = (() => {
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
  })();

  // 자치회비 파이 차트 데이터
  const membershipPieData = [
    { name: '납부', value: membershipStats.paid, color: '#10B981' },
    { name: '미납', value: membershipStats.not_paid, color: '#EF4444' },
    { name: '확인필요', value: membershipStats.unknown, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const handleGradeClick = (gradeName: string) => {
    router.push(`/admin/members?search=${encodeURIComponent(gradeName)}`);
  };

  return (
    <div className="px-5 py-5 pb-24">
      <div className="mb-5">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B2A5C' }}>대시보드</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>{settings?.organizationName || '학생복지위원회'} 운영 현황</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div whileTap={{ scale: 0.97 }} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EEF1FC' }}>
              <Users size={16} color="#1B2A5C" />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
            {realUsers.length}<span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>명</span>
          </p>
          <p style={{ fontSize: 12, color: '#6B7280' }}>총 가입자</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>이번달 +{thisMonthSignups}명</p>
        </motion.div>

        <motion.div whileTap={{ scale: 0.97 }} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EBF4FF' }}>
              <Calendar size={16} color="#4BA3E3" />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
            {activeEvents}<span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>개</span>
          </p>
          <p style={{ fontSize: 12, color: '#6B7280' }}>진행중 사업</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>총 {events.length}개 사업</p>
        </motion.div>

        <motion.div whileTap={{ scale: 0.97 }} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF8E6' }}>
              <Zap size={16} color="#7DC443" />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
            {totalPoints.toLocaleString()}<span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>점</span>
          </p>
          <p style={{ fontSize: 12, color: '#6B7280' }}>총 적립 포인트</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>평균 {avgPoints}점</p>
        </motion.div>

        <motion.div whileTap={{ scale: 0.97 }} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFF8E1' }}>
              <TrendingUp size={16} color="#F5C518" />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>
            {thisMonthPoints.toLocaleString()}<span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>점</span>
          </p>
          <p style={{ fontSize: 12, color: '#6B7280' }}>이번달 적립</p>
          <p style={{ fontSize: 11, color: pointGrowthRate >= 0 ? '#10B981' : '#EF4444', marginTop: 2 }}>
            {pointGrowthRate >= 0 ? `▲ 전월 대비 +${pointGrowthRate}%` : `▼ 전월 대비 ${pointGrowthRate}%`}
          </p>
        </motion.div>
      </div>

      {/* 자치회비 납부 현황 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>자치회비 납부 현황</h3>
          <div className="flex items-center gap-1.5">
            {unpaidCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#FEF2F2' }}>
                <AlertTriangle size={11} color="#EF4444" />
                <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>미납 {unpaidCount}명</span>
              </span>
            )}
            <button
              onClick={() => router.push('/admin/members?filter=not_paid')}
              className="flex items-center gap-0.5"
              style={{ fontSize: 11, color: '#1B2A5C' }}
            >
              관리 <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {membershipPieData.length > 0 ? (
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipPieData}
                    innerRadius={28}
                    outerRadius={50}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {membershipPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          <div className="flex-1 space-y-2">
            {[
              { label: '납부', count: membershipStats.paid, color: '#10B981', bg: '#ECFDF5' },
              { label: '미납', count: membershipStats.not_paid, color: '#EF4444', bg: '#FEF2F2' },
              { label: '확인필요', count: membershipStats.unknown, color: '#F59E0B', bg: '#FFFBEB' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${realUsers.length > 0 ? (item.count / realUsers.length) * 100 : 0}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280', minWidth: 28, textAlign: 'right' }}>{item.count}명</span>
                </div>
              </div>
            ))}
            <div className="pt-1 border-t border-gray-50">
              <span style={{ fontSize: 11, color: '#6B7280' }}>
                납부율 <strong style={{ color: membershipRate >= 70 ? '#10B981' : '#EF4444' }}>{membershipRate}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 등급 분포 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={16} color="#1B2A5C" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>등급 분포</h3>
          </div>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>클릭 → 멤버 보기</span>
        </div>

        {(gradeConfigs.length === 0
          ? (['별', '행성', '로켓', 'UFO'] as const).map(grade => {
              const info = getGradeInfo(grade);
              const count = gradeCounts[grade] || 0;
              const percent = realUsers.length ? (count / realUsers.length) * 100 : 0;
              return { grade, info, count, percent };
            })
          : [...gradeConfigs].sort((a, b) => a.minPoints - b.minPoints).map(config => {
              const grade = config.name;
              const info = getGradeInfo(grade);
              const count = gradeCounts[grade] || 0;
              const percent = realUsers.length ? (count / realUsers.length) * 100 : 0;
              return { grade, info, count, percent };
            })
        ).map(({ grade, info, count, percent }) => (
          <div
            key={grade}
            className="flex items-center gap-3 mb-3 last:mb-0 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
            onClick={() => handleGradeClick(grade)}
          >
            <span style={{ fontSize: 16, minWidth: 24 }}>{info.emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{grade}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {count}명 ({Math.round(percent)}%) <ChevronRight size={12} className="inline mb-0.5" />
                </span>
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
        ))}
      </div>

      {/* 월별 가입자 추이 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>월별 가입자 추이</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dx={-10} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="가입자" fill="#4BA3E3" radius={[4, 4, 4, 4]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 월별 포인트 적립 추이 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>월별 포인트 적립 추이</h3>
        <div className="h-44 w-full">
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

      {/* 최근 포인트 적립 내역 */}
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
            <span style={{ fontSize: 14, fontWeight: 700, color: h.points > 0 ? '#1B2A5C' : '#EF4444' }}>
              {h.points > 0 ? '+' : ''}{h.points}점
            </span>
          </div>
        ))}
        {recentHistory.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">최근 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

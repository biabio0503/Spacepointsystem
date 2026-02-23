'use client';

import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { motion } from 'motion/react';
import { Bell, Settings, ChevronRight, Instagram, QrCode, Gift, Star, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GradeBadge, GradeIcon } from '../components/GradeBadge';
import { BottomNav } from '../components/BottomNav';

const EVENT_IMAGES: Record<string, string> = {
  e1: 'https://images.unsplash.com/photo-1674801800498-cebd8db582a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  e2: 'https://images.unsplash.com/photo-1764920265158-500a6e60c487?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  e3: 'https://images.unsplash.com/photo-1744659749905-471decea0ea7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser, events, users, getGrade, getGradeInfo, addPoints, pointHistory } = useApp();
  const [pointClicked, setPointClicked] = useState(false);

  if (!currentUser) {
    navigate('/login', { replace: true });
    return null;
  }

  const grade = getGrade(currentUser.id);
  const gradeInfo = getGradeInfo(grade);

  // Upcoming events (active, sorted by date)
  const upcomingEvents = events
    .filter(e => e.isActive)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Calculate next grade threshold
  const getNextGradeInfo = () => {
    const eligibleUsers = users.filter(u => u.points >= 10 && !u.isAdmin);
    const sorted = [...eligibleUsers].sort((a, b) => b.points - a.points);
    const total = sorted.length;
    if (grade === '별') return { next: '행성', need: 10 - currentUser.points, emoji: '🪐' };
    if (grade === 'UFO') return null;
    const top20idx = Math.floor(total * 0.2);
    const top20Points = sorted[top20idx]?.points ?? 0;
    if (grade === '로켓') return { next: 'UFO', need: Math.max(0, top20Points - currentUser.points + 1), emoji: '🛸' };
    const top60idx = Math.floor(total * 0.6);
    const top60Points = sorted[Math.max(0, top60idx - 1)]?.points ?? currentUser.points;
    return { next: '로켓', need: Math.max(0, top60Points - currentUser.points + 1), emoji: '🚀' };
  };

  const nextGrade = getNextGradeInfo();

  const handleGetPoints = () => {
    if (pointClicked) return;
    setPointClicked(true);
    addPoints(currentUser.id, 2, '웹 로그인 포인트');
    setTimeout(() => setPointClicked(false), 60000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const getDday = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-Day';
    if (diff < 0) return `D+${Math.abs(diff)}`;
    return `D-${diff}`;
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1B2A5C 60%, #253671 100%)' }}
      >
        {/* Star decorations */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              left: `${(i * 22 + 5) % 90}%`,
              top: `${(i * 31 + 8) % 70}%`,
              opacity: 0.3 + (i % 3) * 0.1,
            }}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
          />
        ))}
        {/* Nebula circle */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-blue-400 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 bg-green-400 translate-y-1/4 -translate-x-1/4" />

        <div className="relative flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70" style={{ fontSize: 13 }}>안녕하세요 👋</p>
            <h1 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>
              {currentUser.name}님
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
              <Bell size={18} color="white" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"
            >
              <Settings size={18} color="white" />
            </button>
          </div>
        </div>

        {/* Points card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GradeIcon grade={grade} size={52} />
              <div>
                <GradeBadge grade={grade} size="sm" />
                <p className="mt-0.5" style={{ fontSize: 13, color: '#6B7280' }}>{currentUser.department}</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontSize: 28, fontWeight: 800, color: '#1B2A5C' }}>
                {currentUser.points}<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>점</span>
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>누적 포인트</p>
            </div>
          </div>

          {/* Progress bar to next grade */}
          {nextGrade ? (
            <div>
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>다음 등급까지</span>
                <span style={{ fontSize: 11, color: gradeInfo.color, fontWeight: 600 }}>
                  {nextGrade.emoji} {nextGrade.next}까지 {nextGrade.need}점 더!
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (currentUser.points / (currentUser.points + nextGrade.need)) * 100)}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}aa)` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2" style={{ color: '#F5C518' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>🏆 최고 등급 달성!</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: QrCode, label: 'QR 적립', color: '#1B2A5C', bg: '#EEF1FC', action: () => navigate('/qr') },
            { icon: Gift, label: '포인트 받기', color: '#7DC443', bg: '#EFF8E6', action: handleGetPoints },
            { icon: Star, label: '마이페이지', color: '#F5C518', bg: '#FFF8E1', action: () => navigate('/mypage') },
            { icon: TrendingUp, label: '사업 보기', color: '#4BA3E3', bg: '#EBF4FF', action: () => navigate('/events') },
          ].map(({ icon: Icon, label, color, bg, action }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.95 }}
              onClick={action}
              className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl shadow-sm"
              style={{ background: 'white' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 500, lineHeight: '1.2' }}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>

        {pointClicked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2"
            style={{ background: '#EFF8E6' }}
          >
            <span style={{ fontSize: 16 }}>🚀</span>
            <span style={{ fontSize: 13, color: '#7DC443', fontWeight: 600 }}>+2점 적립! 오늘의 로그인 포인트를 받았어요.</span>
          </motion.div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>다가오는 학복위 사업</h2>
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-0.5"
            style={{ fontSize: 12, color: '#1B2A5C' }}
          >
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex"
              style={{ height: 90 }}
            >
              <div
                className="w-20 flex-shrink-0 flex items-center justify-center"
                style={{
                  background: EVENT_IMAGES[event.id]
                    ? `url(${EVENT_IMAGES[event.id]}) center/cover`
                    : 'linear-gradient(135deg, #1B2A5C, #253671)',
                }}
              >
                {!EVENT_IMAGES[event.id] && (
                  <span style={{ fontSize: 28 }}>🚀</span>
                )}
              </div>
              <div className="flex-1 px-3 py-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{event.title}</h3>
                    <span
                      className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                      style={{ background: '#EEF1FC', color: '#1B2A5C', fontSize: 10 }}
                    >
                      +{event.points}점
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    📍 {event.location}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    📅 {formatDate(event.date)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#1B2A5C', color: 'white', fontSize: 10 }}
                  >
                    {getDday(event.date)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grade Benefits */}
      <div className="px-5 mt-6">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>등급별 혜택 안내</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {[
            { grade: '별', emoji: '⭐', color: '#8B9BC8', benefit: '포인트 적립 시작', points: '0~9점' },
            { grade: '행성', emoji: '🪐', color: '#4BA3E3', benefit: '기본 혜택 제공', points: '10점~' },
            { grade: '로켓', emoji: '🚀', color: '#7DC443', benefit: '간식 2종 + 응모권', points: '상위 60~20%' },
            { grade: 'UFO', emoji: '🛸', color: '#F5C518', benefit: '최고 혜택 + 특별 경품', points: '상위 20%' },
          ].map((item, i) => (
            <div
              key={item.grade}
              className={`flex items-center gap-3 py-2.5 ${i < 3 ? 'border-b border-gray-50' : ''}`}
            >
              <span style={{ fontSize: 22, minWidth: 28 }}>{item.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.grade}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{item.points}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{item.benefit}</p>
              </div>
              {grade === item.grade && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: item.color + '20', color: item.color, fontWeight: 600 }}
                >
                  현재
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SNS */}
      <div className="px-5 mt-6 mb-4">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>SPACE 학복위 SNS</h2>
        <a
          href="https://instagram.com/seoultech_welfare"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
          >
            <Instagram size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>인스타그램</p>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>@seoultech_welfare</p>
          </div>
          <ChevronRight size={16} color="#9CA3AF" className="ml-auto" />
        </a>
      </div>

      <BottomNav />
    </div>
  );
}

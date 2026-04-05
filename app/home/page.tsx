'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Settings, ChevronRight, Instagram, QrCode, Star, TrendingUp } from 'lucide-react';
import { useStore, GradeConfig } from '@/store/useStore';
import { GradeBadge, GradeIcon } from '@/app/_components/shared/GradeBadge';
import { BottomNav } from '@/app/_components/shared/BottomNav';
import { meAPI } from '@/lib/api-client';

interface GradeData {
  grade: string;
  rank: number | null;
  totalEligible: number;
  topPercent: number | null;
  nextGrade: { next: string; need: number } | null;
  points: number;
}

export default function HomePage() {
  const router = useRouter();
  const { currentUser, events, gradeConfigs, getGradeInfo } = useStore();
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [gradeDataLoading, setGradeDataLoading] = useState(false);


  const settings = useStore(state => state.settings);
  // 로그인 여부 확인 후 리다이렉트
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  // 등급 정보 로드
  useEffect(() => {
    if (!currentUser) return;
    const fetchGrade = async () => {
      setGradeDataLoading(true);
      try {
        const data = await meAPI.getGrade();
        setGradeData(data);
      } catch (err) {
        console.error('등급 정보를 불러오는데 실패했습니다:', err);
      } finally {
        setGradeDataLoading(false);
      }
    };
    fetchGrade();
  }, [currentUser]);

  // 로그인 여부 확인 후 리다이렉트
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  // gradeData 로딩 중: 스켈레톤
  if (gradeDataLoading || !gradeData) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
        <div className="px-5 pt-12 pb-20" style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1B2A5C 60%, #253671 100%)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-3 w-16 rounded bg-white/20 mb-2" />
              <div className="h-6 w-28 rounded bg-white/30" />
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20" />
              <div className="flex-1">
                <div className="h-4 w-16 rounded bg-white/20 mb-2" />
                <div className="h-3 w-24 rounded bg-white/10" />
              </div>
              <div className="h-8 w-16 rounded bg-white/20" />
            </div>
            <div className="h-2 rounded-full bg-white/10" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const gradeInfo = getGradeInfo(gradeData.grade);

  // 다가오는 이벤트만 필터링하여 최대 3개까지 보여줌
  const upcomingEvents = (events || [])
    .filter(e => e.isActive)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);



  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const getDday = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-Day';
    if (diff < 0) return `D+${Math.abs(diff)}`;
    return `D-${diff}`;
  };

  const instagramUrl = settings?.instagram || 'https://instagram.com/42welfare_st';
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
            <button
              onClick={() => router.push('/settings')}
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
              <GradeIcon grade={gradeData.grade} size={52} />
              <div>
                <GradeBadge grade={gradeData.grade} size="sm" />
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
          {gradeData.nextGrade ? (() => {
            const nextGradeConfig = gradeConfigs.find(g => g.name === gradeData.nextGrade?.next);
            const nextEmoji = nextGradeConfig?.emoji || '⭐';
            const nextColor = nextGradeConfig?.color || gradeInfo.color;
            return (
              <div>
                <div className="flex justify-between mb-1.5">
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>다음 등급까지</span>
                  <span style={{ fontSize: 11, color: nextColor, fontWeight: 600 }}>
                    {nextEmoji} {gradeData.nextGrade.next}까지 {gradeData.nextGrade.need}점 더!
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (currentUser.points / (currentUser.points + gradeData.nextGrade.need)) * 100)}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}aa)` }}
                  />
                </div>
              </div>
            );
          })() : (
            <div className="flex items-center gap-2" style={{ color: '#F5C518' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>🏆 최고 등급 달성!</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: QrCode, label: 'QR 적립', color: '#1B2A5C', bg: '#EEF1FC', action: () => router.push('/qr') },
            { icon: TrendingUp, label: '사업 보기', color: '#4BA3E3', bg: '#EBF4FF', action: () => router.push('/events') },
            { icon: Star, label: '마이페이지', color: '#F5C518', bg: '#FFF8E1', action: () => router.push('/mypage') },
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
      </div>

      {/* Upcoming Events */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>다가오는 학복위 사업</h2>
          <button
            onClick={() => router.push('/events')}
            className="flex items-center gap-0.5"
            style={{ fontSize: 12, color: '#1B2A5C' }}
          >
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((event, i) => {
            const displayImage = event.imageUrls?.[0];

            return (
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
                    background: displayImage
                      ? `url(${displayImage}) center/cover`
                      : 'linear-gradient(135deg, #1B2A5C, #253671)',
                  }}
                >
                  {!displayImage && (
                    <span style={{ fontSize: 28 }}>📅</span>
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
            );
          })}
        </div>
      </div>

      {/* Grade Benefits */}
      <div className="px-5 mt-6">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>등급별 혜택 안내</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {gradeConfigs.map((grade, i) => (
            <div
              key={grade.id}
              className={`flex items-center gap-3 py-2.5 ${i < gradeConfigs.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span style={{ fontSize: 22, minWidth: 28 }}>{grade.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 700, color: grade.color }}>{grade.name}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {grade.type === 'ABSOLUTE_POINTS'
                      ? `${grade.minPoints}${grade.maxPoints ? `~${grade.maxPoints}` : '+'}점`
                      : grade.percentileMin && grade.percentileMax
                        ? `상위 ${100 - grade.percentileMax}~${100 - grade.percentileMin}%`
                        : grade.percentileMax
                          ? `상위 ${100 - grade.percentileMax}%`
                          : '정보 없음'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{grade.benefit}</p>
              </div>
              {gradeData?.grade === grade.name && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: grade.color + '20', color: grade.color, fontWeight: 600 }}
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
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>학복위 SNS</h2>
        <a
          href={instagramUrl}
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
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>
              {settings?.instagram ? settings.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, '') : '로드중'}
            </p>
          </div>
          <ChevronRight size={16} color="#9CA3AF" className="ml-auto" />
        </a>
      </div>

      <BottomNav />
    </div>
  );
}

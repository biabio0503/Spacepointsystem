'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useStore, GradeConfig } from '@/store/useStore';
import { GradeBadge, GradeIcon } from '@/app/_components/shared/GradeBadge';
import { BottomNav } from '@/app/_components/shared/BottomNav';
import { meAPI } from '@/lib/api-client';


interface PointHistory {
  id: string;
  userId: string;
  points: number;
  reason: string;
  date: string;
}

interface GradeData {
  grade: string;
  rank: number | null;
  totalEligible: number;
  topPercent: number | null;
  nextGrade: { next: string; need: number } | null;
  points: number;
}

export default function MyPage() {
  const router = useRouter();
  const { currentUser, gradeConfigs } = useStore();
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [gradeDataLoading, setGradeDataLoading] = useState(false);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  // 등급 정보 로드
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setGradeDataLoading(true);
      try {
        const [gradeResult, historyResult] = await Promise.all([
          meAPI.getGrade(),
          meAPI.getPointHistory()
        ]);
        setGradeData(gradeResult);
        setPointHistory(historyResult.pointHistory);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setGradeDataLoading(false);
      }
    };

    loadData();
  }, [currentUser]);



  if (!currentUser) {
    return null;
  }

  // gradeData 로딩 중: 스켈레톤
  if (gradeDataLoading || !gradeData) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
        <div className="px-5 pt-12 pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1B2A5C 100%)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/home')}>
                <ChevronLeft size={24} color="white" />
              </button>
              <h1 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>마이페이지</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 animate-pulse">
            <div className="ml-3 w-12 h-12 rounded-full bg-white/20" />
            <div>
              <div className="h-6 w-24 rounded bg-white/30 mb-2" />
              <div className="h-3 w-32 rounded bg-white/15" />
            </div>
          </div>
        </div>
        <div className="px-5 -mt-12 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-sm animate-pulse">
                <div className="h-6 w-6 rounded-full bg-gray-200 mx-auto mb-2" />
                <div className="h-4 w-12 rounded bg-gray-200 mx-auto mb-1" />
                <div className="h-3 w-16 rounded bg-gray-100 mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // 현재 등급 정보 가져오기
  const currentGradeConfig = gradeConfigs.find(g => g.name === gradeData.grade);
  const gradeInfo = {
    color: currentGradeConfig?.color || '#8B9BC8',
    bg: currentGradeConfig?.bgColor || '#EEF1FC',
    emoji: currentGradeConfig?.emoji || '⭐',
    label: gradeData.grade,
  };

  // pointHistory는 이미 현재 사용자 것만 로드됨
  const userHistory = pointHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Ranking
  const rankDisplay = gradeData.rank !== null ? `${gradeData.rank}위` : '-';
  const totalDisplay = gradeData.totalEligible;
  const topPercent = gradeData.topPercent !== null ? `상위 ${gradeData.topPercent}%` : '-';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1B2A5C 100%)' }}
      >
        {/* Stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 2,
              height: 2,
              left: `${(i * 23 + 5) % 90}%`,
              top: `${(i * 31 + 8) % 60}%`,
              opacity: 0.4,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
          />
        ))}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-blue-400 -translate-y-1/4 translate-x-1/4" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/home')}>
              <ChevronLeft size={24} color="white" />
            </button>
            <h1 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>마이페이지</h1>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"
          >
            <Settings size={18} color="white" />
          </button>
        </div>

        {/* User name & grade */}
        <div className="flex items-center gap-4">
          <div className='ml-3'>
            <GradeIcon grade={gradeData.grade} size={48} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>{currentUser.name}</h2>
              <GradeBadge grade={gradeData.grade} size="sm" />
            </div>
            <p className="text-white/70" style={{ fontSize: 13 }}>
              {currentUser.department} · {currentUser.studentId}
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '누적 포인트', value: `${currentUser.points}점`, icon: '🛸' },
            { label: '내 순위', value: rankDisplay, sub: `/ ${totalDisplay}명`, icon: '🏆' },
            { label: '퍼센타일', value: topPercent, icon: '📊' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <p style={{ fontSize: 20 }}>{item.icon}</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#1B2A5C', marginTop: 2 }}>{item.value}</p>
              {item.sub && <p style={{ fontSize: 10, color: '#9CA3AF' }}>{item.sub}</p>}
              <p style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grade progress */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>등급 현황</h3>

          {/* Grade steps - 데이터베이스에서 받아온 등급 */}
          {gradeConfigs.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              {gradeConfigs
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((g, i, arr) => {
                  const isActive = g.name === gradeData.grade;
                  const currentIndex = arr.findIndex(config => config.name === gradeData.grade);
                  const isPast = currentIndex > i;
                  return (
                    <div key={g.id} className="flex items-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: isActive ? g.color : isPast ? g.bgColor : '#F3F4F6',
                            border: `2px solid ${isActive ? g.color : isPast ? g.color + '80' : '#E5E7EB'}`,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{g.emoji}</span>
                        </div>
                        <span style={{
                          fontSize: 9,
                          color: isActive ? g.color : '#9CA3AF',
                          fontWeight: isActive ? 700 : 400,
                        }}>
                          {g.name}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className="w-6 h-0.5 mb-4"
                          style={{ background: isPast ? '#1B2A5C' : '#E5E7EB', marginLeft: 2, marginRight: 2 }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {gradeData.nextGrade ? (() => {
            const nextGradeConfig = gradeConfigs.find(g => g.name === gradeData.nextGrade?.next);
            const nextColor = nextGradeConfig?.color || gradeInfo.color;
            return (
              <>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>다음 등급 진행도</span>
                  <span style={{ fontSize: 12, color: nextColor, fontWeight: 600 }}>
                    {nextGradeConfig?.emoji} {gradeData.nextGrade.next}까지 {gradeData.nextGrade.need}점
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (currentUser.points / (currentUser.points + gradeData.nextGrade.need)) * 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}aa)` }}
                  />
                </div>
              </>
            );
          })() : (
            <div className="text-center py-2" style={{ color: '#F5C518', fontWeight: 600, fontSize: 14 }}>
              🏆 최고 등급 달성!
            </div>
          )}
        </div>
      </div>

      {/* Point History */}
      <div className="px-5 mt-4">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>포인트 내역</h3>

        {userHistory.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p style={{ fontSize: 32 }}>⭐</p>
            <p className="mt-2" style={{ fontSize: 14, color: '#9CA3AF' }}>아직 포인트 내역이 없어요</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {userHistory.map((h, i) => (
              <div
                key={h.id}
                className={`flex items-center justify-between px-4 py-3.5 ${i < userHistory.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#EEF1FC' }}
                  >
                    <span style={{ fontSize: 18 }}>🚀</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{h.reason}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>{h.date.split('T')[0]}</p>
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1B2A5C' }}>+{h.points}점</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings link */}
      <div className="px-5 mt-4">
        <button
          onClick={() => router.push('/settings')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F3F4F6' }}>
              <Settings size={18} color="#6B7280" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>계정 관리</span>
          </div>
          <ChevronRight size={16} color="#9CA3AF" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

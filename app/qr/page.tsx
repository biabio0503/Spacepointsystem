'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, type Grade } from '@/store/useStore';
import { GradeBadge } from '@/app/_components/shared/GradeBadge';
import { BottomNav } from '@/app/_components/shared/BottomNav';
import { meAPI } from '@/lib/api-client';

interface GradeData {
  grade: Grade;
  rank: number | null;
  totalEligible: number;
  topPercent: number | null;
  nextGrade: { next: string; need: number } | null;
  points: number;
}

export default function QRPage() {
  const router = useRouter();
  const { currentUser } = useStore();
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrKey, setQrKey] = useState(() => new Date().getTime());

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  // 등급 정보 로드
  useEffect(() => {
    if (currentUser) {
      meAPI.getGrade()
        .then(setGradeData)
        .catch(err => console.error('Failed to load grade:', err));
    }
  }, [currentUser]);

  if (!currentUser || !gradeData) {
    return null;
  }

  const qrData = JSON.stringify({
    studentId: currentUser.studentId,
    name: currentUser.name,
    timestamp: qrKey,
    type: 'space_point_checkin',
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setQrKey(Date.now());
    setIsRefreshing(false);
    setScanned(false);
  };

  const handleSimulateScan = () => {
    setScanned(true);
    setTimeout(() => setScanned(false), 3000);
  };

  const timeStr = new Date(qrKey).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #0D1B3E, #1B2A5C)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/home')}>
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>포인트 적립 QR</h1>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col items-center">
        {/* Instruction */}
        <div className="w-full bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 28 }}>📱</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>QR 코드 사용 방법</p>
              <p style={{ fontSize: 12, color: '#6B7280', lineHeight: '1.5', marginTop: 2 }}>
                행사장의 집부 카메라(아이패드)에 이 QR을 인식시키면 포인트가 자동으로 적립됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* QR Card */}
        <motion.div
          layout
          className="w-full bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* User info */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1B2A5C, #253671)' }}
          >
            <div>
              <p className="text-white" style={{ fontSize: 16, fontWeight: 800 }}>{currentUser.name}</p>
              <p className="text-white/70" style={{ fontSize: 12 }}>
                {currentUser.studentId} · {currentUser.department}
              </p>
            </div>
            <GradeBadge grade={gradeData.grade} size="sm" />
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-8 px-6">
            <AnimatePresence mode="wait">
              {scanned ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                  style={{ height: 220 }}
                >
                  <CheckCircle size={80} color="#7DC443" />
                  <div className="text-center">
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#7DC443' }}>인식 완료!</p>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>포인트가 적립되었어요 🚀</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={qrKey}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4"
                >
                  {isRefreshing ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                      <div
                        className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#1B2A5C', borderTopColor: 'transparent' }}
                      />
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl border-4" style={{ borderColor: '#1B2A5C' }}>
                      <QRCodeSVG
                        value={qrData}
                        size={200}
                        bgColor="#FFFFFF"
                        fgColor="#1B2A5C"
                        level="M"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>생성 시각: {timeStr}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Point info */}
            <div
              className="w-full mt-4 py-3 px-4 rounded-xl flex items-center justify-center gap-2"
              style={{ background: '#EEF1FC' }}
            >
              <span style={{ fontSize: 16 }}>🛸</span>
              <p style={{ fontSize: 13, color: '#1B2A5C', fontWeight: 600 }}>
                현재 포인트: {currentUser.points}점
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border-2 transition-colors"
              style={{ borderColor: '#1B2A5C', color: '#1B2A5C', background: 'white' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>QR 새로고침</span>
            </button>
            <button
              onClick={handleSimulateScan}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', color: 'white' }}
            >
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>인식 테스트</span>
            </button>
          </div>
        </motion.div>

        {/* How to use steps */}
        <div className="w-full mt-5 space-y-3">
          {[
            { step: '1', icon: '🌐', text: '웹 로그인 후 QR 코드 생성' },
            { step: '2', icon: '📸', text: '행사장에서 집부 카메라에 QR 인식' },
            { step: '3', icon: '🚀', text: '자동으로 포인트 적립 완료!' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#EEF1FC', color: '#1B2A5C', fontWeight: 700, fontSize: 14 }}
              >
                {item.step}
              </div>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <p style={{ fontSize: 13, color: '#374151' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

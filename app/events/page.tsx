'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BottomNav } from '@/app/_components/shared/BottomNav';


type TabType = '전체' | '진행중' | '종료';

// 이미지 캐러셀 컴포넌트
function ImageCarousel({
  images,
  className = '',
  style = {},
  objectFit = 'cover',
}: {
  images: string[];
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain';
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ ...style, background: 'linear-gradient(135deg, #1B2A5C, #253671)' }}
      >
        <span style={{ fontSize: 48 }}>🚀</span>
      </div>
    );
  }

  const handleDragEnd = (_e: any, info: any) => {
    const swipeThreshold = 50;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (info.offset.x < 0 && currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    setIsDragging(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* 배경 블러 (contain 모드에서 검은 여백 대신 블러 배경) */}
      {objectFit === 'contain' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${images[currentIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.4)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: currentIndex === 0 ? 0 : 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ cursor: isDragging ? 'grabbing' : images.length > 1 ? 'grab' : 'default' }}
        >
          <img
            src={images[currentIndex]}
            alt={`이미지 ${currentIndex + 1}`}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: objectFit,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* 인디케이터 */}
      {images.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="rounded-full transition-all"
                style={{
                  height: '6px',
                  background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  width: i === currentIndex ? '20px' : '6px',
                }}
              />
            ))}
          </div>

          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center z-10"
            >
              <ChevronLeft size={20} color="white" />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center z-10"
            >
              <ChevronRight size={20} color="white" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const { events, refreshEvents } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    refreshEvents();
  }, []);

  console.log('📅 이벤트 페이지 - 전체 이벤트:', events);

  const now = new Date();

  const filteredEvents = (events || []).filter(e => {
    if (activeTab === '전체') return true;
    const endDate = new Date(e.postEndDate);
    if (activeTab === '진행중') return endDate >= now && e.isActive;
    if (activeTab === '종료') return endDate < now || !e.isActive;
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
  };

  const getDday = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-Day';
    if (diff < 0) return `D+${Math.abs(diff)}`;
    return `D-${diff}`;
  };

  const selected = selectedEvent ? (events || []).find(e => e.id === selectedEvent) : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #0D1B3E, #1B2A5C)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.push('/home')}>
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>학복위 사업 모아보기</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['전체', '진행중', '종료'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full transition-all"
              style={{
                background: activeTab === tab ? 'white' : 'rgba(255,255,255,0.15)',
                color: activeTab === tab ? '#1B2A5C' : 'white',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="px-5 py-5 space-y-4">
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <p style={{ fontSize: 40 }}>🚀</p>
            <p className="mt-3" style={{ fontSize: 14, color: '#9CA3AF' }}>등록된 사업이 없어요</p>
          </div>
        )}

        {filteredEvents.map((event, i) => {
          const isExpired = new Date(event.postEndDate) < now;
          const displayImages = event.imageUrls ?? [];

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedEvent(event.id)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* Image Carousel with badges */}
              <div className="h-40 relative">
                <ImageCarousel
                  images={displayImages}
                  className="h-40 absolute inset-0"
                />
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <span
                    className="px-2.5 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: '#1B2A5C' }}
                  >
                    +{event.points}점
                  </span>
                  {!isExpired && (
                    <span
                      className="px-2.5 py-1 rounded-full text-white text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      {getDday(event.date)}
                    </span>
                  )}
                  {isExpired && (
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.5)', color: '#E5E7EB' }}
                    >
                      종료
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>{event.title}</h3>
                <p className="mt-1 line-clamp-2" style={{ fontSize: 13, color: '#6B7280', lineHeight: '1.5' }}>
                  {event.content}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#9CA3AF' }}>
                    <MapPin size={12} /> {event.location}
                  </span>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#9CA3AF' }}>
                    <Calendar size={12} /> {formatDate(event.date)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Image Carousel */}
            {(() => {
              const displayImages = selected.imageUrls ?? [];

              return (
                <div className="relative rounded-t-3xl overflow-hidden" style={{ height: 280 }}>
                  <ImageCarousel
                    images={displayImages}
                    className="w-full h-full"
                    objectFit="contain"
                  />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center z-20"
                  >
                    <span className="text-white font-bold" style={{ fontSize: 18, lineHeight: 1 }}>×</span>
                  </button>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span
                      className="px-3 py-1 rounded-full text-white text-sm font-bold"
                      style={{ background: '#1B2A5C' }}
                    >
                      +{selected.points}점
                    </span>
                  </div>
                  {/* 이미지 장 수 표시 */}
                  {displayImages.length > 1 && (
                    <div className="absolute top-4 left-4 z-20 px-2 py-0.5 rounded-full bg-black/40">
                      <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>
                        사진 {displayImages.length}장
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="p-5">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>{selected.title}</h2>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B7280' }}>
                  <MapPin size={14} color="#1B2A5C" />
                  <span>{selected.location}</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B7280' }}>
                  <Calendar size={14} color="#1B2A5C" />
                  <span>{formatDate(selected.date)}</span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl" style={{ background: '#EEF1F8' }}>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: '1.7' }}>{selected.content}</p>
              </div>

              {selected.instagramUrl && (
                <a
                  href={selected.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 py-3 rounded-xl justify-center"
                  style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)', color: 'white', fontWeight: 600, fontSize: 14 }}
                >
                  <ExternalLink size={16} />
                  인스타그램에서 보기
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}

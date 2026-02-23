'use client';

import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';

const EVENT_IMAGES: Record<string, string> = {
  e1: 'https://images.unsplash.com/photo-1674801800498-cebd8db582a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  e2: 'https://images.unsplash.com/photo-1764920265158-500a6e60c487?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  e3: 'https://images.unsplash.com/photo-1744659749905-471decea0ea7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
};

type TabType = '전체' | '진행중' | '종료';

export default function EventsPage() {
  const navigate = useNavigate();
  const { events } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const now = new Date();

  const filteredEvents = events.filter(e => {
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

  const selected = selectedEvent ? events.find(e => e.id === selectedEvent) : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #0D1B3E, #1B2A5C)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/home')}>
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
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedEvent(event.id)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* Image */}
              <div
                className="h-40 relative"
                style={{
                  background: EVENT_IMAGES[event.id]
                    ? `url(${EVENT_IMAGES[event.id]}) center/cover`
                    : 'linear-gradient(135deg, #1B2A5C, #253671)',
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 right-3 flex gap-2">
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
                {!EVENT_IMAGES[event.id] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontSize: 48 }}>🚀</span>
                  </div>
                )}
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
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div
              className="h-48 relative"
              style={{
                background: EVENT_IMAGES[selected.id]
                  ? `url(${EVENT_IMAGES[selected.id]}) center/cover`
                  : 'linear-gradient(135deg, #1B2A5C, #253671)',
              }}
            >
              <div className="absolute inset-0 bg-black/20 rounded-t-3xl" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center"
              >
                <span className="text-white" style={{ fontSize: 18 }}>×</span>
              </button>
              <div className="absolute bottom-4 left-4">
                <span
                  className="px-3 py-1 rounded-full text-white text-sm font-bold"
                  style={{ background: '#1B2A5C' }}
                >
                  +{selected.points}점
                </span>
              </div>
            </div>

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

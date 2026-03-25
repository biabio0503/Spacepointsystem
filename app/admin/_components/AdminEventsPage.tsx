'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Calendar, MapPin, Star } from 'lucide-react';
import { useStore, Event } from '@/store/useStore';

export default function AdminEventsPage() {
  const router = useRouter();
  const { events, deleteEvent, updateEvent, refreshEvents } = useStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDeleteId(null);
  };

  const toggleActive = (event: Event) => {
    updateEvent(event.id, { isActive: !event.isActive });
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>사업 관리</h2>
          <p style={{ fontSize: 13, color: '#6B7280' }}>총 {events.length}개 사업</p>
        </div>
        <button
          onClick={() => router.push('/admin/events/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} />
          등록
        </button>
      </div>

      <div className="space-y-3">
        {sortedEvents.map((event, i) => {
          const isExpired = new Date(event.postEndDate) < new Date();
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>{event.title}</h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: '#EEF1FC', color: '#1B2A5C' }}
                    >
                      +{event.points}점
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: event.isActive && !isExpired ? '#EFF8E6' : '#F3F4F6',
                        color: event.isActive && !isExpired ? '#7DC443' : '#9CA3AF',
                      }}
                    >
                      {event.isActive && !isExpired ? '진행중' : '비활성'}
                    </span>
                  </div>
                  <p className="line-clamp-2" style={{ fontSize: 12, color: '#6B7280', lineHeight: '1.5' }}>
                    {event.content}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#EFF6FF' }}
                  >
                    <Edit size={15} color="#3B82F6" />
                  </button>
                  <button
                    onClick={() => setDeleteId(event.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#FEF2F2' }}
                  >
                    <Trash2 size={15} color="#EF4444" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#9CA3AF' }}>
                  <MapPin size={11} /> {event.location}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#9CA3AF' }}>
                  <Calendar size={11} /> {formatDate(event.date)}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#9CA3AF' }}>
                  게시: {formatDate(event.postDate)} ~ {formatDate(event.postEndDate)}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>활성화 상태</span>
                <button
                  onClick={() => toggleActive(event)}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: event.isActive ? '#1B2A5C' : '#E5E7EB' }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: event.isActive ? '24px' : '4px' }}
                  />
                </button>
              </div>
            </motion.div>
          );
        })}

        {events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p style={{ fontSize: 40 }}>🚀</p>
            <p className="mt-3" style={{ fontSize: 14, color: '#9CA3AF' }}>등록된 사업이 없어요</p>
            <button
              onClick={() => router.push('/admin/events/new')}
              className="mt-4 px-6 py-2 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontSize: 14 }}
            >
              사업 등록하기
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-[300px]"
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>
              사업을 삭제할까요?
            </h3>
            <p className="mt-2 text-center" style={{ fontSize: 13, color: '#6B7280' }}>
              삭제 후 복구가 불가능합니다.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600, fontSize: 14 }}
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl text-white"
                style={{ background: '#EF4444', fontWeight: 600, fontSize: 14 }}
              >
                삭제
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
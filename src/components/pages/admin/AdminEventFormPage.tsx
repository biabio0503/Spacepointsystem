'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/lib/navigation';
import { ChevronLeft, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminEventFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { events, addEvent, updateEvent } = useApp();
  const isEdit = !!id;
  const existingEvent = isEdit ? events.find(e => e.id === id) : null;

  const [form, setForm] = useState({
    title: '',
    location: '',
    date: '',
    endDate: '',
    content: '',
    imageUrl: '',
    instagramUrl: '',
    points: 10,
    postDate: '',
    postEndDate: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setForm({
        title: existingEvent.title,
        location: existingEvent.location,
        date: existingEvent.date,
        endDate: existingEvent.endDate ?? '',
        content: existingEvent.content,
        imageUrl: existingEvent.imageUrl ?? '',
        instagramUrl: existingEvent.instagramUrl ?? '',
        points: existingEvent.points,
        postDate: existingEvent.postDate,
        postEndDate: existingEvent.postEndDate,
        isActive: existingEvent.isActive,
      });
    }
  }, [existingEvent]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = '사업명을 입력해주세요.';
    if (!form.location.trim()) newErrors.location = '장소를 입력해주세요.';
    if (!form.date) newErrors.date = '날짜를 입력해주세요.';
    if (!form.content.trim()) newErrors.content = '내용을 입력해주세요.';
    if (!form.postDate) newErrors.postDate = '게시일을 입력해주세요.';
    if (!form.postEndDate) newErrors.postEndDate = '게시 종료일을 입력해주세요.';
    if (form.points < 0) newErrors.points = '포인트는 0 이상이어야 합니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (isEdit && id) {
      updateEvent(id, { ...form, endDate: form.endDate || undefined, imageUrl: form.imageUrl || undefined, instagramUrl: form.instagramUrl || undefined });
    } else {
      addEvent({ ...form, endDate: form.endDate || undefined, imageUrl: form.imageUrl || undefined, instagramUrl: form.instagramUrl || undefined });
    }
    setSaved(true);
    setTimeout(() => navigate('/admin/events'), 1000);
  };

  const InputField = ({
    label, name, type = 'text', placeholder, required = false,
    value, onChange, error, hint,
  }: any) => (
    <div>
      <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border outline-none"
        style={{ borderColor: error ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
      />
      {error && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{error}</p>}
      {hint && <p className="mt-1" style={{ fontSize: 11, color: '#9CA3AF' }}>{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen pb-8" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-5"
        style={{ background: 'linear-gradient(135deg, #0A1328, #1B2A5C)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/events')}>
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 className="text-white" style={{ fontSize: 18, fontWeight: 800 }}>
            {isEdit ? '사업 수정' : '사업 등록'}
          </h1>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Title */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>기본 정보</h3>
          <InputField
            label="사업명" required
            value={form.title}
            onChange={(v: string) => setForm(p => ({ ...p, title: v }))}
            placeholder="ex) 5월 컬처데이"
            error={errors.title}
          />
          <InputField
            label="사업 장소" required
            value={form.location}
            onChange={(v: string) => setForm(p => ({ ...p, location: v }))}
            placeholder="ex) 학생회관 1층 로비"
            error={errors.location}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="행사 날짜" type="date" required
              value={form.date}
              onChange={(v: string) => setForm(p => ({ ...p, date: v }))}
              error={errors.date}
            />
            <InputField
              label="종료 날짜" type="date"
              value={form.endDate}
              onChange={(v: string) => setForm(p => ({ ...p, endDate: v }))}
              hint="기간 행사 시 입력"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}>사업 내용</h3>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
              내용 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="사업 내용을 입력해주세요..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
              style={{ borderColor: errors.content ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 14, lineHeight: '1.6' }}
            />
            {errors.content && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.content}</p>}
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>미디어 & 링크</h3>
          <InputField
            label="행사 이미지 URL"
            value={form.imageUrl}
            onChange={(v: string) => setForm(p => ({ ...p, imageUrl: v }))}
            placeholder="https://..."
            hint="이미지 URL을 입력해주세요 (선택)"
          />
          <InputField
            label="인스타그램 게시물 주소"
            value={form.instagramUrl}
            onChange={(v: string) => setForm(p => ({ ...p, instagramUrl: v }))}
            placeholder="https://instagram.com/..."
            hint="게시물 URL을 입력해주세요 (선택)"
          />
        </div>

        {/* Points & Dates */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>포인트 & 게시 기간</h3>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
              SPACE 포인트 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={form.points}
                onChange={e => setForm(p => ({ ...p, points: Number(e.target.value) }))}
                min={0}
                className="flex-1 px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: errors.points ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
              />
              <span style={{ fontSize: 15, color: '#374151', fontWeight: 600 }}>점</span>
            </div>
            {/* Quick select */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[5, 10, 15, 20, 25, 30].map(p => (
                <button
                  key={p}
                  onClick={() => setForm(prev => ({ ...prev, points: p }))}
                  className="px-3 py-1 rounded-lg text-xs transition-colors"
                  style={{
                    background: form.points === p ? '#1B2A5C' : '#F3F4F6',
                    color: form.points === p ? 'white' : '#6B7280',
                    fontWeight: 600,
                  }}
                >
                  {p}점
                </button>
              ))}
            </div>
            {errors.points && <p className="mt-1" style={{ fontSize: 12, color: '#EF4444' }}>{errors.points}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="게시일" type="date" required
              value={form.postDate}
              onChange={(v: string) => setForm(p => ({ ...p, postDate: v }))}
              error={errors.postDate}
            />
            <InputField
              label="게시 종료일" type="date" required
              value={form.postEndDate}
              onChange={(v: string) => setForm(p => ({ ...p, postEndDate: v }))}
              error={errors.postEndDate}
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>사업 활성화</p>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>비활성화 시 사용자에게 표시되지 않습니다</p>
          </div>
          <button
            onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: form.isActive ? '#1B2A5C' : '#E5E7EB' }}
          >
            <div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ left: form.isActive ? '26px' : '4px' }}
            />
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl text-white"
          style={{
            background: saved ? '#7DC443' : 'linear-gradient(135deg, #1B2A5C, #2E4A9A)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {saved ? '✅ 저장되었어요!' : isEdit ? '수정 완료' : '사업 등록'}
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Image } from 'lucide-react';
import { useStore } from '@/store/useStore';

// InputField 컴포넌트를 외부로 이동
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

export default function AdminEventFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { events, addEvent, updateEvent, refreshEvents } = useStore();
  const isEdit = !!id;
  const existingEvent = isEdit ? events.find(e => e.id === id) : null;

  const [form, setForm] = useState({
    title: '',
    location: '',
    date: '',
    endDate: '',
    content: '',
    imageUrls: [] as string[],
    instagramUrl: '',
    points: 10,
    postDate: '',
    postEndDate: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 날짜를 input type="date" 형식으로 변환하는 함수
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // YYYY-MM-DD 형식으로 변환
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // 이벤트 데이터 로드
  useEffect(() => {
    if (isEdit) {
      refreshEvents();
    }
  }, [isEdit]);

  useEffect(() => {
    if (existingEvent) {
      setForm({
        title: existingEvent.title,
        location: existingEvent.location,
        date: formatDateForInput(existingEvent.date),
        endDate: formatDateForInput(existingEvent.endDate),
        content: existingEvent.content,
        imageUrls: existingEvent.imageUrls ?? [],
        instagramUrl: existingEvent.instagramUrl ?? '',
        points: existingEvent.points,
        postDate: formatDateForInput(existingEvent.postDate),
        postEndDate: formatDateForInput(existingEvent.postEndDate),
        isActive: existingEvent.isActive,
      });
      // 기존 이미지들이 있으면 프리뷰 설정
      if (existingEvent.imageUrls && existingEvent.imageUrls.length > 0) {
        setImagePreviews(existingEvent.imageUrls);
      }
    }
  }, [existingEvent]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];
    const newPreviews: string[] = [];

    try {
      // 각 파일을 순차적으로 업로드
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 이미지 미리보기
        const reader = new FileReader();
        const previewPromise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const preview = await previewPromise;
        newPreviews.push(preview);

        // 업로드
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'event-images');

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '이미지 업로드 실패');
        }

        uploadedUrls.push(data.url);
      }

      // 기존 이미지들과 합치기
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setForm(p => ({
        ...p,
        imageUrls: [...p.imageUrls, ...uploadedUrls],
      }));
    } catch (error: any) {
      console.error('이미지 업로드 에러:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      // input 파일 선택 초기화
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setForm(p => {
      const newImageUrls = p.imageUrls.filter((_, i) => i !== index);
      return {
        ...p,
        imageUrls: newImageUrls,
      };
    });
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagePreviews.length) return;

    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const [movedItem] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, movedItem);
      return newPreviews;
    });

    setForm(p => {
      const newUrls = [...p.imageUrls];
      const [movedUrl] = newUrls.splice(fromIndex, 1);
      newUrls.splice(toIndex, 0, movedUrl);
      return {
        ...p,
        imageUrls: newUrls,
      };
    });
  };

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
    const submitData = {
      ...form,
      endDate: form.endDate || undefined,
      imageUrls: form.imageUrls.length > 0 ? form.imageUrls : [],
      instagramUrl: form.instagramUrl || undefined
    };
    if (isEdit && id) {
      updateEvent(id, submitData);
    } else {
      addEvent(submitData);
    }
    setSaved(true);
    setTimeout(() => router.push('/admin/events'), 1000);
  };

  return (
    <div className="min-h-screen pb-8" style={{ background: '#EEF1F8' }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-5"
        style={{ background: 'linear-gradient(135deg, #0A1328, #1B2A5C)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/events')}>
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

          {/* 이미지 업로드 */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
              행사 이미지 (최대 10장)
            </label>

            {/* 이미지 미리보기 그리드 */}
            {imagePreviews.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`행사 이미지 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    {/* 순서 표시 */}
                    <div
                      className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.7)' }}
                    >
                      {index + 1}
                    </div>
                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ fontSize: 16, fontWeight: 700 }}
                    >
                      ×
                    </button>
                    {/* 순서 변경 버튼 */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, index - 1)}
                          className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold shadow"
                          style={{ color: '#1B2A5C' }}
                        >
                          ←
                        </button>
                      )}
                      {index < imagePreviews.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, index + 1)}
                          className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold shadow"
                          style={{ color: '#1B2A5C' }}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 파일 업로드 버튼 */}
            {imagePreviews.length < 10 && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="event-image-upload"
                />
                <label
                  htmlFor="event-image-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
                  style={{
                    borderColor: uploading ? '#9CA3AF' : '#D1D5DB',
                    background: uploading ? '#F9FAFB' : '#FAFAFA',
                    color: uploading ? '#9CA3AF' : '#6B7280',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Image size={20} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {uploading ? '업로드 중...' : `이미지 추가 (${imagePreviews.length}/10)`}
                  </span>
                </label>
              </div>
            )}
            <p className="mt-1" style={{ fontSize: 11, color: '#9CA3AF' }}>
              JPEG, PNG, GIF, WebP 형식 / 최대 5MB / 여러 파일 선택 가능
            </p>
          </div>

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
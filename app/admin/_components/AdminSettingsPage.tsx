'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Edit2, Trash2, Upload, Palette } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '@/store/useStore';
import {
  adminSettingsFormSchema,
  adminGradeConfigFormSchema,
  type AdminSettingsFormInput,
  type AdminGradeConfigFormInput,
} from '@/lib/validations';

type Settings = {
  id: string;
  organizationName: string;
  logoMain: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactPhone: string;
  contactPerson: string;
};

type GradeConfig = {
  id: string;
  name: string;
  type: 'ABSOLUTE_POINTS' | 'PERCENTILE';
  minPoints: number;
  maxPoints: number | null;
  percentileMin: number | null;
  percentileMax: number | null;
  emoji: string;
  badgeImage: string | null;
  color: string;
  bgColor: string;
  benefit: string;
  orderIndex: number;
};

const defaultGradeForm = (orderIndex = 0): AdminGradeConfigFormInput => ({
  name: '',
  type: 'ABSOLUTE_POINTS',
  minPoints: 0,
  maxPoints: null,
  percentileMin: null,
  percentileMax: null,
  emoji: '*',
  color: '#10B981',
  bgColor: '#D1FAE5',
  benefit: '',
  orderIndex,
});

export default function AdminSettingsPage() {
  const { refreshSettings } = useStore();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'grades'>('general');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [editingGrade, setEditingGrade] = useState<GradeConfig | null>(null);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);

  const {
    control: settingsControl,
    setValue: setSettingsValue,
    reset: resetSettingsForm,
    handleSubmit: handleSettingsSubmit,
    formState: { errors: settingsErrors },
  } = useForm<AdminSettingsFormInput>({
    resolver: zodResolver(adminSettingsFormSchema),
    defaultValues: {
      organizationName: '',
      primaryColor: '#1B2A5C',
      secondaryColor: '#7DC443',
      contactPhone: '',
      contactPerson: '',
    },
  });

  const settingsValues = useWatch({ control: settingsControl });

  const {
    control: gradeControl,
    setValue: setGradeValue,
    reset: resetGradeForm,
    handleSubmit: handleGradeSubmit,
    formState: { errors: gradeErrors },
  } = useForm<AdminGradeConfigFormInput>({
    resolver: zodResolver(adminGradeConfigFormSchema),
    defaultValues: defaultGradeForm(),
  });

  const gradeValues = useWatch({ control: gradeControl });

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
        resetSettingsForm({
          organizationName: data.settings.organizationName ?? '',
          primaryColor: data.settings.primaryColor ?? '#1B2A5C',
          secondaryColor: data.settings.secondaryColor ?? '#7DC443',
          contactPhone: data.settings.contactPhone ?? '',
          contactPerson: data.settings.contactPerson ?? '',
        });
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [resetSettingsForm]);

  const loadGradeConfigs = useCallback(async () => {
    try {
      const response = await fetch('/api/grade-configs');
      const data = await response.json();
      if (data.gradeConfigs) {
        setGradeConfigs(data.gradeConfigs);
      }
    } catch (error) {
      console.error('등급 설정 로드 실패:', error);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadGradeConfigs();
  }, [loadSettings, loadGradeConfigs]);

  const onSaveSettings = handleSettingsSubmit(async (values) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '설정 저장에 실패했습니다.');
        return;
      }

      alert('설정이 저장되었습니다.');
      await loadSettings();
      refreshSettings();
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  });

  const onSaveGrade = handleGradeSubmit(async (values) => {
    setSavingGrade(true);
    try {
      const url = editingGrade ? `/api/grade-configs/${editingGrade.id}` : '/api/grade-configs';
      const method = editingGrade ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '등급 저장에 실패했습니다.');
        return;
      }

      alert(editingGrade ? '등급이 수정되었습니다.' : '등급이 추가되었습니다.');
      closeGradeDialog();
      await loadGradeConfigs();
    } catch (error) {
      console.error('등급 저장 오류:', error);
      alert('등급 저장에 실패했습니다.');
    } finally {
      setSavingGrade(false);
    }
  });

  const handleDeleteGrade = async (id: string) => {
    if (!confirm('이 등급을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/grade-configs/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '등급 삭제에 실패했습니다.');
        return;
      }
      alert('등급이 삭제되었습니다.');
      await loadGradeConfigs();
    } catch (error) {
      console.error('등급 삭제 오류:', error);
      alert('등급 삭제에 실패했습니다.');
    }
  };

  const handleLogoFileSelect = (file: File) => {
    setSelectedLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreviewLogoUrl(previewUrl);
  };

  const handleSaveLogo = async () => {
    if (!selectedLogoFile) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', selectedLogoFile);
    formData.append('bucket', 'logos');

    try {
      const response = await fetch('/api/upload/image', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '업로드 실패');

      const updateResponse = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoMain: data.url }),
      });
      if (!updateResponse.ok) throw new Error('로고 업데이트 실패');

      alert('로고가 업데이트되었습니다.');
      await loadSettings();
      refreshSettings();
      handleCancelLogo();
    } catch (error: any) {
      console.error('로고 업로드 오류:', error);
      alert(error.message || '로고 업로드 실패');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancelLogo = () => {
    if (previewLogoUrl) {
      URL.revokeObjectURL(previewLogoUrl);
    }
    setPreviewLogoUrl(null);
    setSelectedLogoFile(null);
  };

  const openGradeDialog = (grade?: GradeConfig) => {
    if (grade) {
      setEditingGrade(grade);
      resetGradeForm({
        name: grade.name,
        type: grade.type,
        minPoints: grade.minPoints,
        maxPoints: grade.maxPoints,
        percentileMin: grade.percentileMin,
        percentileMax: grade.percentileMax,
        emoji: grade.emoji,
        color: grade.color,
        bgColor: grade.bgColor,
        benefit: grade.benefit || '',
        orderIndex: grade.orderIndex,
      });
    } else {
      setEditingGrade(null);
      resetGradeForm(defaultGradeForm(gradeConfigs.length));
    }
    setShowGradeDialog(true);
  };

  const closeGradeDialog = () => {
    setShowGradeDialog(false);
    setEditingGrade(null);
    resetGradeForm(defaultGradeForm(gradeConfigs.length));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: '#9CA3AF' }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <div className="mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B2A5C' }}>시스템 설정</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>조직 및 등급 설정</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('general')}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: activeTab === 'general' ? '#1B2A5C' : 'white', color: activeTab === 'general' ? 'white' : '#6B7280' }}
        >
          일반
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: activeTab === 'grades' ? '#1B2A5C' : 'white', color: activeTab === 'grades' ? 'white' : '#6B7280' }}
        >
          등급
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>조직명</label>
              <input
                type="text"
                value={settingsValues.organizationName || ''}
                onChange={(e) => setSettingsValue('organizationName', e.target.value, { shouldValidate: true })}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: settingsErrors.organizationName ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>연락처 전화</label>
              <input
                type="text"
                value={settingsValues.contactPhone || ''}
                onChange={(e) => setSettingsValue('contactPhone', e.target.value, { shouldValidate: true })}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: settingsErrors.contactPhone ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>담당자</label>
              <input
                type="text"
                value={settingsValues.contactPerson || ''}
                onChange={(e) => setSettingsValue('contactPerson', e.target.value, { shouldValidate: true })}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: settingsErrors.contactPerson ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>로고</h3>
            {/* 현재 로고 */}
            {settings?.logoMain && !previewLogoUrl && (
              <div>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>현재 로고:</p>
                <img src={settings.logoMain} alt="Main logo" className="w-20 h-20 object-contain rounded-lg bg-gray-100 p-2" />
              </div>
            )}
            {/* 미리보기 */}
            {previewLogoUrl && (
              <div>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>미리보기:</p>
                <img src={previewLogoUrl} alt="Preview logo" className="w-20 h-20 object-contain rounded-lg bg-gray-100 p-2" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleLogoFileSelect(e.target.files[0])}
              disabled={uploadingLogo || previewLogoUrl !== null}
              className="hidden"
              id="logo-main"
            />
            {!previewLogoUrl ? (
              <label htmlFor="logo-main" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer" style={{ background: '#EFF6FF', color: '#3B82F6', fontSize: 13, fontWeight: 600 }}>
                <Upload size={16} />
                파일 선택
              </label>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveLogo} disabled={uploadingLogo} className="flex-1 py-2 rounded-lg text-white flex items-center justify-center gap-2" style={{ background: uploadingLogo ? '#9CA3AF' : '#10B981', fontWeight: 600, fontSize: 13 }}>
                  {uploadingLogo ? '업로드 중...' : '저장'}
                </button>
                <button onClick={handleCancelLogo} disabled={uploadingLogo} className="flex-1 py-2 rounded-lg border" style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600, fontSize: 13 }}>
                  취소
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}><Palette size={16} className="inline mr-2" />테마</h3>
            <div className="flex items-center gap-3">
              <input type="color" value={settingsValues.primaryColor || '#1B2A5C'} onChange={(e) => setSettingsValue('primaryColor', e.target.value, { shouldValidate: true })} className="w-16 h-12 rounded-lg cursor-pointer" />
              <input type="text" value={settingsValues.primaryColor || '#1B2A5C'} onChange={(e) => setSettingsValue('primaryColor', e.target.value, { shouldValidate: true })} className="flex-1 px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={settingsValues.secondaryColor || '#7DC443'} onChange={(e) => setSettingsValue('secondaryColor', e.target.value, { shouldValidate: true })} className="w-16 h-12 rounded-lg cursor-pointer" />
              <input type="text" value={settingsValues.secondaryColor || '#7DC443'} onChange={(e) => setSettingsValue('secondaryColor', e.target.value, { shouldValidate: true })} className="flex-1 px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
            </div>
          </div>

          <button onClick={() => void onSaveSettings()} disabled={saving} className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2" style={{ background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700, fontSize: 16 }}>
            <Save size={20} />
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => openGradeDialog()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontSize: 14, fontWeight: 600 }}>
              <Plus size={16} />
              등급 추가
            </button>
          </div>

          {gradeConfigs.map((grade) => (
            <div key={grade.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: grade.bgColor }}>
                    <span style={{ fontSize: 24 }}>{grade.emoji}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>{grade.name}</h4>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {grade.type === 'ABSOLUTE_POINTS'
                        ? `절대 포인트: ${grade.minPoints}${grade.maxPoints ? ` ~ ${grade.maxPoints}` : '+'}점`
                        : `상대 등급: 상위 ${grade.percentileMin ?? 0}% ~ ${grade.percentileMax ?? 100}%`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openGradeDialog(grade)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0F9FF' }}><Edit2 size={15} color="#3B82F6" /></button>
                  <button onClick={() => void handleDeleteGrade(grade.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF2F2' }}><Trash2 size={15} color="#EF4444" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGradeDialog && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={closeGradeDialog}>
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-white rounded-t-3xl w-full max-w-[430px] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937', marginBottom: 16 }}>{editingGrade ? '등급 수정' : '등급 추가'}</h3>
            <div className="space-y-4">
              <input type="text" value={gradeValues.name || ''} onChange={(e) => setGradeValue('name', e.target.value, { shouldValidate: true })} placeholder="등급명" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: gradeErrors.name ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
              <input type="text" value={gradeValues.emoji || ''} onChange={(e) => setGradeValue('emoji', e.target.value, { shouldValidate: true })} placeholder="이모지" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: gradeErrors.emoji ? '#EF4444' : '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />

              {/* 등급 타입 선택 */}
              <div>
                <label className="block mb-2" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>등급 타입</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGradeValue('type', 'ABSOLUTE_POINTS', { shouldValidate: true });
                      setGradeValue('percentileMin', null);
                      setGradeValue('percentileMax', null);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      background: gradeValues.type === 'ABSOLUTE_POINTS' ? '#1B2A5C' : '#F3F4F6',
                      color: gradeValues.type === 'ABSOLUTE_POINTS' ? 'white' : '#6B7280',
                    }}
                  >
                    절대 등급
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradeValue('type', 'PERCENTILE', { shouldValidate: true });
                      setGradeValue('minPoints', 0);
                      setGradeValue('maxPoints', null);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      background: gradeValues.type === 'PERCENTILE' ? '#1B2A5C' : '#F3F4F6',
                      color: gradeValues.type === 'PERCENTILE' ? 'white' : '#6B7280',
                    }}
                  >
                    상대 등급
                  </button>
                </div>
              </div>

              {/* 절대 포인트 입력 */}
              {gradeValues.type === 'ABSOLUTE_POINTS' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1" style={{ fontSize: 12, color: '#6B7280' }}>최소 포인트</label>
                    <input type="number" value={gradeValues.minPoints ?? 0} onChange={(e) => setGradeValue('minPoints', Number(e.target.value), { shouldValidate: true })} placeholder="0" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: 12, color: '#6B7280' }}>최대 포인트 (선택)</label>
                    <input type="number" value={gradeValues.maxPoints ?? ''} onChange={(e) => setGradeValue('maxPoints', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })} placeholder="무제한" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
                  </div>
                </div>
              )}

              {/* 상대 등급 퍼센트 입력 */}
              {gradeValues.type === 'PERCENTILE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1" style={{ fontSize: 12, color: '#6B7280' }}>최소 % (상위)</label>
                    <input type="number" min={0} max={100} value={gradeValues.percentileMin ?? ''} onChange={(e) => setGradeValue('percentileMin', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })} placeholder="0" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: 12, color: '#6B7280' }}>최대 % (상위)</label>
                    <input type="number" min={0} max={100} value={gradeValues.percentileMax ?? ''} onChange={(e) => setGradeValue('percentileMax', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })} placeholder="100" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }} />
                  </div>
                </div>
              )}

              <textarea value={gradeValues.benefit || ''} onChange={(e) => setGradeValue('benefit', e.target.value, { shouldValidate: true })} rows={3} placeholder="혜택" className="w-full px-4 py-3 rounded-xl border outline-none resize-none" style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 14 }} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeGradeDialog} className="flex-1 py-3 rounded-xl border" style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}>취소</button>
              <button onClick={() => void onSaveGrade()} disabled={savingGrade} className="flex-1 py-3 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontWeight: 700 }}>{savingGrade ? '저장 중...' : editingGrade ? '수정' : '생성'}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

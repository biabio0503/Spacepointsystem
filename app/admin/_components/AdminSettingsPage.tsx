'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Image, Plus, Edit2, Trash2, Upload, Palette } from 'lucide-react';
import { useStore } from '@/store/useStore';

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
   type: string;
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

export default function AdminSettingsPage() {
   const { refreshSettings } = useStore();
   const [settings, setSettings] = useState<Settings | null>(null);
   const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [activeTab, setActiveTab] = useState<'general' | 'grades'>('general');

   // Form state
   const [orgName, setOrgName] = useState('');
   const [primaryColor, setPrimaryColor] = useState('#1B2A5C');
   const [secondaryColor, setSecondaryColor] = useState('#7DC443');
   const [contactPhone, setContactPhone] = useState('');
   const [contactPerson, setContactPerson] = useState('');
   const [uploadingLogo, setUploadingLogo] = useState(false);

   // Grade edit state
   const [editingGrade, setEditingGrade] = useState<GradeConfig | null>(null);
   const [showGradeDialog, setShowGradeDialog] = useState(false);
   const [gradeForm, setGradeForm] = useState({
      name: '',
      type: 'ABSOLUTE_POINTS' as 'ABSOLUTE_POINTS' | 'PERCENTILE',
      minPoints: 0,
      maxPoints: null as number | null,
      percentileMin: null as number | null,
      percentileMax: null as number | null,
      emoji: '',
      color: '#10B981',
      bgColor: '#D1FAE5',
      benefit: '',
      orderIndex: 0,
   });

   useEffect(() => {
      loadSettings();
      loadGradeConfigs();
   }, []);

   const loadSettings = async () => {
      try {
         const response = await fetch('/api/settings');
         const data = await response.json();
         if (data.settings) {
            setSettings(data.settings);
            setOrgName(data.settings.organizationName);
            setPrimaryColor(data.settings.primaryColor);
            setSecondaryColor(data.settings.secondaryColor);
            setContactPhone(data.settings.contactPhone || '');
            setContactPerson(data.settings.contactPerson || '');
         }
      } catch (error) {
         console.error('Failed to load settings:', error);
      } finally {
         setLoading(false);
      }
   };

   const loadGradeConfigs = async () => {
      try {
         const response = await fetch('/api/grade-configs');
         const data = await response.json();
         if (data.gradeConfigs) {
            setGradeConfigs(data.gradeConfigs);
         }
      } catch (error) {
         console.error('Failed to load grade configs:', error);
      }
   };

   const handleSaveSettings = async () => {
      setSaving(true);
      try {
         const response = await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               organizationName: orgName,
               primaryColor,
               secondaryColor,
               contactPhone,
               contactPerson,
            }),
         });

         if (response.ok) {
            alert('설정이 저장되었습니다.');
            loadSettings();
            refreshSettings();
         } else {
            const data = await response.json();
            alert(data.error || '설정 저장에 실패했습니다.');
         }
      } catch (error) {
         console.error('Save settings error:', error);
         alert('설정 저장 중 오류가 발생했습니다.');
      } finally {
         setSaving(false);
      }
   };

   const handleLogoUpload = async (file: File) => {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'logos');

      try {
         const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || '이미지 업로드 실패');
         }

         const updateResponse = await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoMain: data.url }),
         });

         if (updateResponse.ok) {
            alert('로고가 업데이트되었습니다.');
            loadSettings();
         }
      } catch (error: any) {
         console.error('Logo upload error:', error);
         alert(error.message || '로고 업로드에 실패했습니다.');
      } finally {
         setUploadingLogo(false);
      }
   };

   const handleSaveGrade = async () => {
      try {
         if (editingGrade) {
            // 수정
            const response = await fetch(`/api/grade-configs/${editingGrade.id}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(gradeForm),
            });

            if (response.ok) {
               alert('등급이 수정되었습니다.');
            } else {
               const data = await response.json();
               alert(data.error || '등급 수정에 실패했습니다.');
            }
         } else {
            // 추가
            const response = await fetch('/api/grade-configs', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(gradeForm),
            });

            if (response.ok) {
               alert('등급이 추가되었습니다.');
            } else {
               const data = await response.json();
               alert(data.error || '등급 추가에 실패했습니다.');
            }
         }

         setShowGradeDialog(false);
         setEditingGrade(null);
         resetGradeForm();
         loadGradeConfigs();
      } catch (error) {
         console.error('Save grade error:', error);
         alert('등급 저장 중 오류가 발생했습니다.');
      }
   };

   const handleDeleteGrade = async (id: string) => {
      if (!confirm('정말 이 등급을 삭제하시겠습니까?')) return;

      try {
         const response = await fetch(`/api/grade-configs/${id}`, {
            method: 'DELETE',
         });

         if (response.ok) {
            alert('등급이 삭제되었습니다.');
            loadGradeConfigs();
         } else {
            const data = await response.json();
            alert(data.error || '등급 삭제에 실패했습니다.');
         }
      } catch (error) {
         console.error('Delete grade error:', error);
         alert('등급 삭제 중 오류가 발생했습니다.');
      }
   };

   const openGradeDialog = (grade?: GradeConfig) => {
      if (grade) {
         setEditingGrade(grade);
         setGradeForm({
            name: grade.name,
            type: (grade.type || 'ABSOLUTE_POINTS') as 'ABSOLUTE_POINTS' | 'PERCENTILE',
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
         resetGradeForm();
      }
      setShowGradeDialog(true);
   };

   const resetGradeForm = () => {
      setGradeForm({
         name: '',
         type: 'ABSOLUTE_POINTS',
         minPoints: 0,
         maxPoints: null,
         percentileMin: null,
         percentileMax: null,
         emoji: '🌱',
         color: '#10B981',
         bgColor: '#D1FAE5',
         benefit: '',
         orderIndex: gradeConfigs.length,
      });
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
            <p style={{ fontSize: 13, color: '#6B7280' }}>조직 정보 및 테마 관리</p>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 mb-4">
            <button
               onClick={() => setActiveTab('general')}
               className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
               style={{
                  background: activeTab === 'general' ? '#1B2A5C' : 'white',
                  color: activeTab === 'general' ? 'white' : '#6B7280',
               }}
            >
               기본 설정
            </button>
            <button
               onClick={() => setActiveTab('grades')}
               className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
               style={{
                  background: activeTab === 'grades' ? '#1B2A5C' : 'white',
                  color: activeTab === 'grades' ? 'white' : '#6B7280',
               }}
            >
               등급 관리
            </button>
         </div>

         <div className="space-y-4">
            {activeTab === 'general' && (
               <>
                  {/* Organization Name */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                     <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>조직 정보</h3>
                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           조직 이름 <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                           type="text"
                           value={orgName}
                           onChange={e => setOrgName(e.target.value)}
                           placeholder="예: 학생복지위원회"
                           className="w-full px-4 py-3 rounded-xl border outline-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                        />
                     </div>
                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           학번/학과 변경 문의 전화번호
                        </label>
                        <input
                           type="text"
                           value={contactPhone}
                           onChange={e => setContactPhone(e.target.value)}
                           placeholder="예: 010-1234-5678"
                           className="w-full px-4 py-3 rounded-xl border outline-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                        />
                     </div>
                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           담당자 이름 및 직위
                        </label>
                        <input
                           type="text"
                           value={contactPerson}
                           onChange={e => setContactPerson(e.target.value)}
                           placeholder="예: 홍길동(학생복지위원회 부위원장)"
                           className="w-full px-4 py-3 rounded-xl border outline-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                        />
                     </div>
                  </div>

                  {/* Logos */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                     <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>로고 관리</h3>

                     {/* Main Logo */}
                     <div>
                        <label className="block mb-2" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           메인 로고
                        </label>
                        {settings?.logoMain && (
                           <div className="mb-2">
                              <img src={settings.logoMain} alt="메인 로고" className="w-20 h-20 object-contain rounded-lg bg-gray-100 p-2" />
                           </div>
                        )}
                        <input
                           type="file"
                           accept="image/*"
                           onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                           disabled={uploadingLogo}
                           className="hidden"
                           id="logo-main"
                        />
                        <label
                           htmlFor="logo-main"
                           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
                           style={{
                              background: uploadingLogo ? '#F3F4F6' : '#EFF6FF',
                              color: uploadingLogo ? '#9CA3AF' : '#3B82F6',
                              fontSize: 13,
                              fontWeight: 600,
                           }}
                        >
                           <Upload size={16} />
                           {uploadingLogo ? '업로드 중...' : '파일 선택'}
                        </label>
                     </div>
                  </div>

                  {/* Colors */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                     <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
                        <Palette size={16} className="inline mr-2" />
                        테마 색상
                     </h3>
                     <div>
                        <label className="block mb-2" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           주 색상
                        </label>
                        <div className="flex items-center gap-3">
                           <input
                              type="color"
                              value={primaryColor}
                              onChange={e => setPrimaryColor(e.target.value)}
                              className="w-16 h-12 rounded-lg cursor-pointer"
                           />
                           <input
                              type="text"
                              value={primaryColor}
                              onChange={e => setPrimaryColor(e.target.value)}
                              className="flex-1 px-4 py-3 rounded-xl border outline-none"
                              style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block mb-2" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           보조 색상
                        </label>
                        <div className="flex items-center gap-3">
                           <input
                              type="color"
                              value={secondaryColor}
                              onChange={e => setSecondaryColor(e.target.value)}
                              className="w-16 h-12 rounded-lg cursor-pointer"
                           />
                           <input
                              type="text"
                              value={secondaryColor}
                              onChange={e => setSecondaryColor(e.target.value)}
                              className="flex-1 px-4 py-3 rounded-xl border outline-none"
                              style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Save Button */}
                  <button
                     onClick={handleSaveSettings}
                     disabled={saving}
                     className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2"
                     style={{
                        background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #1B2A5C, #2E4A9A)',
                        fontWeight: 700,
                        fontSize: 16,
                     }}
                  >
                     <Save size={20} />
                     {saving ? '저장 중...' : '설정 저장'}
                  </button>
               </>
            )}

            {activeTab === 'grades' && (
               <>
                  {/* Add Grade Button */}
                  <div className="flex justify-end">
                     <button
                        onClick={() => openGradeDialog()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)', fontSize: 14, fontWeight: 600 }}
                     >
                        <Plus size={16} />
                        등급 추가
                     </button>
                  </div>

                  {/* Grade List */}
                  <div className="space-y-3">
                     {gradeConfigs.map((grade, i) => (
                        <motion.div
                           key={grade.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           className="bg-white rounded-2xl p-4 shadow-sm"
                        >
                           <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                 <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: grade.bgColor }}
                                 >
                                    <span style={{ fontSize: 24 }}>{grade.emoji}</span>
                                 </div>
                                 <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                       <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>{grade.name}</h4>
                                       <span
                                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                                          style={{ background: grade.bgColor, color: grade.color }}
                                       >
                                          {grade.type === 'PERCENTILE'
                                             ? `상위 ${grade.percentileMin ?? 0}%${grade.percentileMax ? ` ~ ${grade.percentileMax}%` : '+'}`
                                             : `${grade.minPoints}점${grade.maxPoints ? ` ~ ${grade.maxPoints}점` : '+'}`
                                          }
                                       </span>
                                    </div>
                                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                                       {grade.type === 'PERCENTILE' ? '퍼센트 기준' : '포인트 기준'} · 순서: {grade.orderIndex + 1}
                                    </p>
                                    {grade.benefit && (
                                       <p className="mt-1" style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>
                                          혜택: {grade.benefit}
                                       </p>
                                    )}
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button
                                    onClick={() => openGradeDialog(grade)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: '#F0F9FF' }}
                                 >
                                    <Edit2 size={15} color="#3B82F6" />
                                 </button>
                                 <button
                                    onClick={() => handleDeleteGrade(grade.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: '#FEF2F2' }}
                                 >
                                    <Trash2 size={15} color="#EF4444" />
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                     ))}

                     {gradeConfigs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                           <p style={{ fontSize: 32 }}>🏆</p>
                           <p className="mt-2" style={{ fontSize: 14, color: '#9CA3AF' }}>등급이 없습니다</p>
                           <p style={{ fontSize: 12, color: '#D1D5DB' }}>등급을 추가해주세요</p>
                        </div>
                     )}
                  </div>
               </>
            )}
         </div>

         {/* Grade Dialog */}
         {showGradeDialog && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 z-[60] flex items-end justify-center"
               style={{ background: 'rgba(0,0,0,0.5)' }}
               onClick={() => setShowGradeDialog(false)}
            >
               <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-t-3xl w-full max-w-[430px] p-6 max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
               >
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937', marginBottom: 16 }}>
                     {editingGrade ? '등급 수정' : '등급 추가'}
                  </h3>

                  <div className="space-y-4">
                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           등급 이름 <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                           type="text"
                           value={gradeForm.name}
                           onChange={e => setGradeForm({ ...gradeForm, name: e.target.value })}
                           placeholder="예: 새싹"
                           className="w-full px-4 py-3 rounded-xl border outline-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                        />
                     </div>

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           등급 기준 <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div className="flex gap-2">
                           <button
                              onClick={() => setGradeForm({ ...gradeForm, type: 'ABSOLUTE_POINTS' })}
                              className="flex-1 py-3 rounded-xl border transition-all"
                              style={{
                                 borderColor: gradeForm.type === 'ABSOLUTE_POINTS' ? '#1B2A5C' : '#E5E7EB',
                                 background: gradeForm.type === 'ABSOLUTE_POINTS' ? '#EEF1FC' : 'white',
                                 color: gradeForm.type === 'ABSOLUTE_POINTS' ? '#1B2A5C' : '#6B7280',
                                 fontWeight: gradeForm.type === 'ABSOLUTE_POINTS' ? 700 : 500,
                                 fontSize: 14,
                              }}
                           >
                              절대 포인트
                           </button>
                           <button
                              onClick={() => setGradeForm({ ...gradeForm, type: 'PERCENTILE' })}
                              className="flex-1 py-3 rounded-xl border transition-all"
                              style={{
                                 borderColor: gradeForm.type === 'PERCENTILE' ? '#1B2A5C' : '#E5E7EB',
                                 background: gradeForm.type === 'PERCENTILE' ? '#EEF1FC' : 'white',
                                 color: gradeForm.type === 'PERCENTILE' ? '#1B2A5C' : '#6B7280',
                                 fontWeight: gradeForm.type === 'PERCENTILE' ? 700 : 500,
                                 fontSize: 14,
                              }}
                           >
                              상위 퍼센트
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           이모지 <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                           type="text"
                           value={gradeForm.emoji}
                           onChange={e => setGradeForm({ ...gradeForm, emoji: e.target.value })}
                           placeholder="🌱"
                           className="w-full px-4 py-3 rounded-xl border outline-none text-3xl text-center"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9' }}
                           maxLength={4}
                        />
                     </div>

                     {gradeForm.type === 'ABSOLUTE_POINTS' ? (
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                                 최소 포인트 <span style={{ color: '#EF4444' }}>*</span>
                              </label>
                              <input
                                 type="number"
                                 value={gradeForm.minPoints}
                                 onChange={e => setGradeForm({ ...gradeForm, minPoints: Number(e.target.value) })}
                                 className="w-full px-4 py-3 rounded-xl border outline-none"
                                 style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                              />
                           </div>
                           <div>
                              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                                 최대 포인트
                              </label>
                              <input
                                 type="number"
                                 value={gradeForm.maxPoints ?? ''}
                                 onChange={e => setGradeForm({ ...gradeForm, maxPoints: e.target.value ? Number(e.target.value) : null })}
                                 placeholder="무제한"
                                 className="w-full px-4 py-3 rounded-xl border outline-none"
                                 style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                              />
                           </div>
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                                 최소 % <span style={{ color: '#EF4444' }}>*</span>
                              </label>
                              <input
                                 type="number"
                                 step="0.1"
                                 value={gradeForm.percentileMin ?? ''}
                                 onChange={e => setGradeForm({ ...gradeForm, percentileMin: e.target.value ? Number(e.target.value) : null })}
                                 placeholder="예: 0"
                                 className="w-full px-4 py-3 rounded-xl border outline-none"
                                 style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                              />
                           </div>
                           <div>
                              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                                 최대 % <span style={{ color: '#EF4444' }}>*</span>
                              </label>
                              <input
                                 type="number"
                                 step="0.1"
                                 value={gradeForm.percentileMax ?? ''}
                                 onChange={e => setGradeForm({ ...gradeForm, percentileMax: e.target.value ? Number(e.target.value) : null })}
                                 placeholder="예: 10"
                                 className="w-full px-4 py-3 rounded-xl border outline-none"
                                 style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                              />
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           순서 (낮을수록 낮은 등급)
                        </label>
                        <input
                           type="number"
                           value={gradeForm.orderIndex}
                           onChange={e => setGradeForm({ ...gradeForm, orderIndex: Number(e.target.value) })}
                           className="w-full px-4 py-3 rounded-xl border outline-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                        />
                     </div>

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           텍스트 색상
                        </label>
                        <div className="flex items-center gap-3">
                           <input
                              type="color"
                              value={gradeForm.color}
                              onChange={e => setGradeForm({ ...gradeForm, color: e.target.value })}
                              className="w-16 h-12 rounded-lg cursor-pointer"
                           />
                           <input
                              type="text"
                              value={gradeForm.color}
                              onChange={e => setGradeForm({ ...gradeForm, color: e.target.value })}
                              className="flex-1 px-4 py-3 rounded-xl border outline-none"
                              style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           배경 색상
                        </label>
                        <div className="flex items-center gap-3">
                           <input
                              type="color"
                              value={gradeForm.bgColor}
                              onChange={e => setGradeForm({ ...gradeForm, bgColor: e.target.value })}
                              className="w-16 h-12 rounded-lg cursor-pointer"
                           />
                           <input
                              type="text"
                              value={gradeForm.bgColor}
                              onChange={e => setGradeForm({ ...gradeForm, bgColor: e.target.value })}
                              className="flex-1 px-4 py-3 rounded-xl border outline-none"
                              style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                           등급 혜택 설명
                        </label>
                        <textarea
                           value={gradeForm.benefit}
                           onChange={e => setGradeForm({ ...gradeForm, benefit: e.target.value })}
                           placeholder="예: 대여 우선권, 학과 할인 제공 등 이 등급에서 누리는 혜택을 입력하세요"
                           rows={3}
                           className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                           style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 14 }}
                        />
                     </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                     <button
                        onClick={() => setShowGradeDialog(false)}
                        className="flex-1 py-3 rounded-xl border"
                        style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
                     >
                        취소
                     </button>
                     <button
                        onClick={handleSaveGrade}
                        className="flex-1 py-3 rounded-xl text-white"
                        style={{
                           background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)',
                           fontWeight: 700,
                        }}
                     >
                        {editingGrade ? '수정' : '추가'}
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </div>
   );
}

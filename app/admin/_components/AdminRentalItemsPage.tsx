'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { RentalItem } from '@/store/useStore';
import { type Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Package, X, Save } from 'lucide-react';
import { adminRentalItemFormSchema, type AdminRentalItemFormInput } from '@/lib/validations';

export default function AdminRentalItemsPage() {
  const { rentalItems, rentals, addRentalItem, updateRentalItem, deleteRentalItem, refreshRentalItems, refreshRentals } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRentalItemFormInput>({
    resolver: zodResolver(adminRentalItemFormSchema) as Resolver<AdminRentalItemFormInput>,
    defaultValues: {
      name: '',
      category: '',
      emoji: '',
      totalStock: 1,
      description: '',
    },
  });
  const formData = useWatch({ control });
  const [isNewCategory, setIsNewCategory] = useState(false);

  useEffect(() => {
    refreshRentalItems();
    refreshRentals();
  }, [refreshRentalItems, refreshRentals]);

  // rentalItems가 undefined일 수 있으므로 안전하게 처리
  const items = rentalItems || [];

  // 기존 카테고리 목록 추출
  const existingCategories = Array.from(new Set(items.map(item => item.category))).sort();

  // 특정 물품의 대여 가능 수량 계산 (편집 모드용)
  const calculateAvailable = (itemId: string, totalStock: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return totalStock;

    // 현재 대여 중인 수량 계산
    const rentedQuantity = (rentals || []).filter(r =>
      r.itemId === itemId && r.status === 'active'
    ).reduce((sum, r) => sum + r.quantity, 0);

    return totalStock - rentedQuantity;
  };

  const popularEmojis = ['📦', '💳', '🛏️', '🏕️', '🔋', '🔌', '📷', '🤳', '🌀', '🔊', '🧮', '👆', '🖱️', '🧤', '⚽', '☂️', '📱', '💻', '🎒', '📚'];

  const resetForm = () => {
    reset({
      name: '',
      category: '',
      emoji: '',
      totalStock: 1,
      description: '',
    });
    setEditingItem(null);
    setIsNewCategory(false);
  };

  const onAdd = async (values: AdminRentalItemFormInput) => {
    await addRentalItem({
      ...values,
      available: values.totalStock,
      emoji: values.emoji || undefined,
      isActive: true,
    });

    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = (item: RentalItem) => {
    setEditingItem(item);
    reset({
      name: item.name,
      category: item.category,
      emoji: item.emoji || '',
      totalStock: item.totalStock,
      description: item.description || '',
    });
    // 기존 카테고리에 없는 경우 새 카테고리로 처리
    setIsNewCategory(!existingCategories.includes(item.category));
    setShowAddDialog(true);
  };

  const onUpdate = async (values: AdminRentalItemFormInput) => {
    if (!editingItem) return;

    // 총 재고가 변경된 경우 available 재계산
    const newAvailable = calculateAvailable(editingItem.id, values.totalStock);

    await updateRentalItem(editingItem.id, {
      ...values,
      available: newAvailable,
      emoji: values.emoji || undefined,
    });

    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = (itemId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteRentalItem(itemId);
    }
  };

  const handleToggleActive = (itemId: string, currentStatus: boolean) => {
    updateRentalItem(itemId, { isActive: !currentStatus });
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F0F2F8' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)' }}>
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">대여물품 관리</h1>
          <p className="text-white/70 text-sm">물품 추가/수정/삭제</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          className="bg-white text-blue-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 active:opacity-80 transition-opacity"
        >
          <Plus size={20} />
          추가
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-900">{items.length}</p>
          <p className="text-xs text-gray-600 mt-1">전체 품목</p>
        </div>
        <div className="bg-white p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-600">
            {items.filter(i => i.isActive).length}
          </p>
          <p className="text-xs text-gray-600 mt-1">활성 품목</p>
        </div>
        <div className="bg-white p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-orange-600">
            {items.reduce((sum, i) => sum + i.totalStock, 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">총 재고</p>
        </div>
      </div>

      {/* Items List */}
      <div className="px-5 pb-5">
        <div className="space-y-3">
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border-2"
              style={{ borderColor: item.isActive ? '#E5E7EB' : '#FEE' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {item.emoji ? (
                    <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  ) : (
                    <Package size={24} color={item.isActive ? '#1B2A5C' : '#999'} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{item.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} color="#666" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">총 재고</p>
                      <p className="text-sm font-bold text-gray-800">{item.totalStock}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">대여 가능</p>
                      <p className="text-sm font-bold" style={{ color: item.available > 0 ? '#7DC443' : '#EF4444' }}>
                        {item.available}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">대여 중</p>
                      <p className="text-sm font-bold text-orange-600">
                        {item.totalStock - item.available}
                      </p>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-500 mt-2">{item.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      style={{
                        background: item.isActive ? '#D1FAE5' : '#FEE2E2',
                        color: item.isActive ? '#065F46' : '#991B1B',
                      }}
                    >
                      {item.isActive ? '활성' : '비활성'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 60,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6"
              style={{
                position: 'fixed',
                inset: 0,
                margin: 'auto',
                width: '90%',
                maxWidth: '400px',
                height: 'fit-content',
                maxHeight: '90vh',
                overflow: 'auto',
                zIndex: 61,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingItem ? '물품 수정' : '물품 추가'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} color="#666" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    물품명 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setValue('name', e.target.value, { shouldValidate: true })}
                    placeholder="예: 보조배터리"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                  />
                  {errors.name && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>

                  {/* 기존 카테고리 선택 */}
                  {!isNewCategory && existingCategories.length > 0 && (
                    <div className="mb-2">
                      <select
                        value={formData.category}
                        onChange={e => {
                          if (e.target.value === '__new__') {
                            setIsNewCategory(true);
                            setValue('category', '', { shouldValidate: true });
                          } else {
                            setValue('category', e.target.value, { shouldValidate: true });
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">카테고리 선택</option>
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__new__">+ 새 카테고리 만들기</option>
                      </select>
                    </div>
                  )}

                  {/* 새 카테고리 입력 */}
                  {(isNewCategory || existingCategories.length === 0) && (
                    <div>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={e => setValue('category', e.target.value, { shouldValidate: true })}
                        placeholder="새 카테고리 입력 (예: 전자기기)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                      />
                      {existingCategories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewCategory(false);
                            setValue('category', '', { shouldValidate: true });
                          }}
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          ← 기존 카테고리 선택하기
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이모티콘 (선택)
                  </label>
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                    {popularEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setValue('emoji', emoji, { shouldValidate: true })}
                        className="flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-all hover:bg-gray-50"
                        style={{
                          borderColor: formData.emoji === emoji ? '#1B2A5C' : '#E5E7EB',
                          background: formData.emoji === emoji ? '#EEF1FC' : 'white',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={e => setValue('emoji', e.target.value, { shouldValidate: true })}
                    placeholder="또는 직접 입력"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                    maxLength={4}
                  />
                  {errors.emoji && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.emoji.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      총 재고 *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalStock ?? 1}
                      onChange={e => setValue('totalStock', Math.max(1, Number(e.target.value)), { shouldValidate: true })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                    />
                    {errors.totalStock && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.totalStock.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대여 가능 (자동 계산)
                    </label>
                    <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-between">
                      <span>
                        {editingItem
                          ? calculateAvailable(editingItem.id, formData.totalStock ?? 1)
                          : (formData.totalStock ?? 1)
                        }
                      </span>
                      <span className="text-xs text-gray-400">
                        (총 {formData.totalStock ?? 1}개)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * 대여 중인 수량을 제외한 가능 수량
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명 (선택)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setValue('description', e.target.value, { shouldValidate: true })}
                    placeholder="물품에 대한 설명을 입력하세요"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 resize-none"
                    rows={3}
                  />
                  {errors.description && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.description.message}</p>}
                </div>
                {errors.category && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.category.message}</p>}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold transition-opacity active:opacity-80"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit(editingItem ? onUpdate : onAdd)}
                  disabled={!formData.name?.trim() || !formData.category?.trim()}
                  className="flex-1 py-3 rounded-xl text-white font-bold transition-opacity active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)' }}
                >
                  <Save size={20} />
                  {editingItem ? '수정' : '추가'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

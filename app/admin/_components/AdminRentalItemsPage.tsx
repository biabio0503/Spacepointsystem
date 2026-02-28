'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { RentalItem } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Package, X, Save } from 'lucide-react';

export default function AdminRentalItemsPage() {
  const { rentalItems, addRentalItem, updateRentalItem, deleteRentalItem } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    emoji: '',
    totalStock: 1,
    available: 1,
    description: '',
  });

  // rentalItems가 undefined일 수 있으므로 안전하게 처리
  const items = rentalItems || [];

  const popularEmojis = ['📦', '💳', '🛏️', '🏕️', '🔋', '🔌', '📷', '🤳', '🌀', '🔊', '🧮', '👆', '🖱️', '🧤', '⚽', '☂️', '📱', '💻', '🎒', '📚'];

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      emoji: '',
      totalStock: 1,
      available: 1,
      description: '',
    });
    setEditingItem(null);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.category) return;

    addRentalItem({
      ...formData,
      emoji: formData.emoji || undefined,
      isActive: true,
    });

    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = (item: RentalItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      emoji: item.emoji || '',
      totalStock: item.totalStock,
      available: item.available,
      description: item.description || '',
    });
    setShowAddDialog(true);
  };

  const handleUpdate = () => {
    if (!editingItem || !formData.name || !formData.category) return;

    updateRentalItem(editingItem.id, {
      ...formData,
      emoji: formData.emoji || undefined,
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
                zIndex: 9998,
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
                zIndex: 9999,
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
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 보조배터리"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="예: 보조배터리"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                  />
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
                        onClick={() => setFormData({ ...formData, emoji })}
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
                    onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                    placeholder="또는 직접 입력"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                    maxLength={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      총 재고 *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalStock}
                      onChange={e => setFormData({
                        ...formData,
                        totalStock: Math.max(1, Number(e.target.value)),
                        available: Math.min(formData.available, Number(e.target.value))
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대여 가능 *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={formData.totalStock}
                      value={formData.available}
                      onChange={e => setFormData({
                        ...formData,
                        available: Math.min(formData.totalStock, Math.max(0, Number(e.target.value)))
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명 (선택)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="물품에 대한 설명을 입력하세요"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>
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
                  onClick={editingItem ? handleUpdate : handleAdd}
                  disabled={!formData.name || !formData.category}
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

'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { RentalItem } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Calendar, ChevronLeft, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/app/_components/shared/BottomNav';

export default function RentalPage() {
  const { currentUser, rentalItems, rentals, createRental } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [showRentalDialog, setShowRentalDialog] = useState(false);
  const [rentalDays, setRentalDays] = useState(3);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const categories = ['전체', ...Array.from(new Set((rentalItems || []).map(item => item.category)))];
  const filteredItems = selectedCategory === '전체'
    ? (rentalItems || []).filter(item => item.isActive)
    : (rentalItems || []).filter(item => item.isActive && item.category === selectedCategory);

  const myActiveRentals = (rentals || []).filter(r => r.userId === currentUser?.id && r.status === 'active');

  const handleRentalRequest = async () => {
    if (!currentUser || !selectedItem) return;

    const expectedReturnDate = new Date();
    expectedReturnDate.setDate(expectedReturnDate.getDate() + rentalDays);

    try {
      await createRental({
        userId: currentUser.id,
        itemId: selectedItem.id,
        quantity: 1,
        rentalDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: expectedReturnDate.toISOString().split('T')[0],
        status: 'active',
        notes: notes || undefined,
      });

      setShowRentalDialog(false);
      setShowSuccess(true);
      setSelectedItem(null);
      setNotes('');
      setRentalDays(3);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create rental:', error);
    }
  };

  const openRentalDialog = (item: RentalItem) => {
    setSelectedItem(item);
    setShowRentalDialog(true);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F0F2F8' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex flex-col" style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/home')}>
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 className="text-white text-2xl font-bold mb-1">대여사업</h1>
        </div>
      </div>

      {/* My Rentals */}
      {myActiveRentals.length > 0 && (
        <div className="px-5 py-4">
          <h2 className="font-bold mb-3 text-gray-700">내 대여 현황</h2>
          <div className="space-y-2">
            {myActiveRentals.map(rental => {
              const item = (rentalItems || []).find(i => i.id === rental.itemId);
              if (!item) return null;
              return (
                <div
                  key={rental.id}
                  className="bg-white p-4 rounded-xl border-2"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        대여일: {rental.rentalDate}
                      </p>
                      <p className="text-xs text-gray-500">
                        반납예정: {rental.expectedReturnDate}
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#FFF3CD', color: '#856404' }}
                    >
                      대여중
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="px-5 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium"
              style={{
                background: selectedCategory === cat ? '#1B2A5C' : 'white',
                color: selectedCategory === cat ? 'white' : '#666',
                border: selectedCategory === cat ? 'none' : '1px solid #E5E7EB',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 border-2 cursor-pointer transition-all active:scale-95"
              style={{ borderColor: '#E5E7EB' }}
              onClick={() => item.available > 0 && openRentalDialog(item)}
            >
              <div className="flex items-center justify-center mb-3 h-16">
                {item.emoji ? (
                  <span style={{ fontSize: 48 }}>{item.emoji}</span>
                ) : (
                  <Package size={40} color={item.available > 0 ? '#1B2A5C' : '#999'} />
                )}
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1 text-center">
                {item.name}
              </h3>
              <div className="text-center">
                {item.available > 0 ? (
                  <p className="text-xs" style={{ color: '#7DC443' }}>
                    재고: {item.available}/{item.totalStock}
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: '#EF4444' }}>
                    대여 불가
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rental Dialog */}
      <AnimatePresence>
        {showRentalDialog && selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRentalDialog(false)}
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
                <h2 className="text-xl font-bold text-gray-800">대여 신청</h2>
                <button
                  onClick={() => setShowRentalDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} color="#666" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3">
                  {selectedItem.emoji && (
                    <span style={{ fontSize: 32 }}>{selectedItem.emoji}</span>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{selectedItem.name}</h3>
                    <p className="text-sm text-gray-600">{selectedItem.category}</p>
                    <p className="text-sm mt-2" style={{ color: '#7DC443' }}>
                      재고: {selectedItem.available}/{selectedItem.totalStock}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  대여 기간
                </label>
                <select
                  value={rentalDays}
                  onChange={e => setRentalDays(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500"
                >
                  <option value={1}>1일</option>
                  <option value={3}>3일</option>
                  <option value={7}>7일</option>
                  <option value={14}>14일</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 목적 (선택)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="예: 학과 MT에서 사용"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={handleRentalRequest}
                className="w-full py-3.5 rounded-xl text-white font-bold transition-opacity active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)' }}
              >
                대여 신청하기
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            <CheckCircle size={20} />
            <span className="font-medium">대여 신청이 완료되었습니다!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

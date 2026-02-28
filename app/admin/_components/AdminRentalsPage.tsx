'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Rental } from '@/store/useStore';
import { motion } from 'motion/react';
import { Package, User, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AdminRentalsPage() {
  const { rentals, rentalItems, users, returnRental, updateRental } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

  const filteredRentals = rentals.filter(rental => {
    if (filterStatus === 'all') return true;
    return rental.status === filterStatus;
  }).sort((a, b) => new Date(b.rentalDate).getTime() - new Date(a.rentalDate).getTime());

  const activeCount = rentals.filter(r => r.status === 'active').length;
  const returnedCount = rentals.filter(r => r.status === 'returned').length;
  const overdueCount = rentals.filter(r => {
    if (r.status !== 'active') return false;
    return new Date(r.expectedReturnDate) < new Date();
  }).length;

  const handleReturn = (rentalId: string) => {
    if (confirm('반납 처리하시겠습니까?')) {
      returnRental(rentalId);
    }
  };

  const handleMarkOverdue = (rentalId: string) => {
    if (confirm('연체로 표시하시겠습니까?')) {
      updateRental(rentalId, { status: 'overdue' });
    }
  };

  const getRentalStatusColor = (rental: Rental) => {
    if (rental.status === 'returned') return { bg: '#D1FAE5', text: '#065F46', label: '반납완료' };
    if (rental.status === 'overdue') return { bg: '#FEE2E2', text: '#991B1B', label: '연체' };

    const isOverdue = new Date(rental.expectedReturnDate) < new Date();
    if (isOverdue) return { bg: '#FEF3C7', text: '#92400E', label: '반납지연' };

    return { bg: '#DBEAFE', text: '#1E3A8A', label: '대여중' };
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F0F2F8' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)' }}>
        <h1 className="text-white text-2xl font-bold mb-1">대여 현황 관리</h1>
        <p className="text-white/70 text-sm">대여 및 반납 관리</p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-xl text-center">
          <p className="text-xl font-bold text-blue-900">{rentals.length}</p>
          <p className="text-xs text-gray-600 mt-1">전체</p>
        </div>
        <div className="bg-white p-3 rounded-xl text-center">
          <p className="text-xl font-bold text-blue-600">{activeCount}</p>
          <p className="text-xs text-gray-600 mt-1">대여중</p>
        </div>
        <div className="bg-white p-3 rounded-xl text-center">
          <p className="text-xl font-bold text-green-600">{returnedCount}</p>
          <p className="text-xs text-gray-600 mt-1">반납완료</p>
        </div>
        <div className="bg-white p-3 rounded-xl text-center">
          <p className="text-xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-xs text-gray-600 mt-1">지연</p>
        </div>
      </div>

      {/* Filter */}
      <div className="px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'all' as const, label: '전체', count: rentals.length },
            { value: 'active' as const, label: '대여중', count: activeCount },
            { value: 'returned' as const, label: '반납완료', count: returnedCount },
            { value: 'overdue' as const, label: '연체', count: overdueCount },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className="px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium"
              style={{
                background: filterStatus === filter.value ? '#1B2A5C' : 'white',
                color: filterStatus === filter.value ? 'white' : '#666',
                border: filterStatus === filter.value ? 'none' : '1px solid #E5E7EB',
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Rentals List */}
      <div className="px-5 pb-5">
        {filteredRentals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Package size={48} color="#CCC" className="mx-auto mb-3" />
            <p className="text-gray-500">대여 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRentals.map(rental => {
              const item = rentalItems.find(i => i.id === rental.itemId);
              const user = users.find(u => u.id === rental.userId);
              const statusInfo = getRentalStatusColor(rental);

              if (!item || !user) return null;

              return (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 border-2"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Package size={24} color="#1B2A5C" className="flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ background: statusInfo.bg, color: statusInfo.text }}
                    >
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={16} />
                      <span>{user.name} ({user.studentId})</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>대여: {rental.rentalDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>반납예정: {rental.expectedReturnDate}</span>
                    </div>
                    {rental.returnDate && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={16} />
                        <span>반납: {rental.returnDate}</span>
                      </div>
                    )}
                    {rental.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">사용목적: {rental.notes}</p>
                      </div>
                    )}
                  </div>

                  {rental.status === 'active' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleReturn(rental.id)}
                        className="flex-1 py-2 rounded-lg font-medium text-sm transition-opacity active:opacity-80"
                        style={{ background: '#D1FAE5', color: '#065F46' }}
                      >
                        반납 처리
                      </button>
                      {new Date(rental.expectedReturnDate) < new Date() && (
                        <button
                          onClick={() => handleMarkOverdue(rental.id)}
                          className="flex-1 py-2 rounded-lg font-medium text-sm transition-opacity active:opacity-80"
                          style={{ background: '#FEE2E2', color: '#991B1B' }}
                        >
                          연체 표시
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Gift, Trash2, Edit2, Shield } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminMembersPage() {
  const { users, currentUser, getGrade, getGradeInfo, addPoints, deleteUser, updateUser, refreshUsers, refreshPointHistory } = useStore();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [pointAmount, setPointAmount] = useState(10);
  const [pointReason, setPointReason] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'name' | 'joined'>('points');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'paid' | 'not_paid' | 'unknown'>('all');
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    phone: '',
    studentId: '',
    membershipFeeStatus: 'unknown' as 'paid' | 'not_paid' | 'unknown',
  });

  useEffect(() => {
    refreshUsers();
    refreshPointHistory();
  }, []);

  // 자기 자신을 제외한 모든 사용자 (관리자 포함)
  const realUsers = users.filter(u => u.id !== currentUser?.id);

  const filtered = realUsers.filter(u => {
    const matchesSearch = u.name.includes(search) ||
      u.studentId.includes(search) ||
      u.department.includes(search);

    const matchesMembership = membershipFilter === 'all' ||
      (u as any).membershipFeeStatus === membershipFilter;

    return matchesSearch && matchesMembership;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'joined') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    return 0;
  });

  const handleAddPoints = () => {
    if (!selectedUser || pointAmount <= 0 || !pointReason.trim()) return;
    addPoints(selectedUser, pointAmount, pointReason);
    setSelectedUser(null);
    setPointAmount(10);
    setPointReason('');
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser, editForm);
      setEditingUser(null);
      setEditForm({ name: '', department: '', phone: '', studentId: '', membershipFeeStatus: 'unknown' });
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('사용자 정보 수정에 실패했습니다.');
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const action = user.isAdmin ? '일반 유저로 강등' : '관리자로 승격';
    const newStatus = !user.isAdmin;

    if (confirm(`${user.name}님을 ${action}하시겠습니까?`)) {
      try {
        await updateUser(userId, { isAdmin: newStatus });
        alert(`${action}되었습니다.`);
      } catch (error) {
        console.error('Failed to toggle admin:', error);
        alert(`${action}에 실패했습니다.`);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setUserToDelete(userId);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      setUserToDelete(null);
      alert('사용자가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('사용자 삭제에 실패했습니다.');
    }
  };

  const openEditModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setEditForm({
      name: user.name,
      department: user.department,
      phone: user.phone,
      studentId: user.studentId,
      membershipFeeStatus: (user as any).membershipFeeStatus || 'unknown',
    });
    setEditingUser(userId);
  };

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null;
  const editingUserData = editingUser ? users.find(u => u.id === editingUser) : null;

  // 자치회비 통계
  const membershipStats = {
    paid: realUsers.filter(u => (u as any).membershipFeeStatus === 'paid').length,
    not_paid: realUsers.filter(u => (u as any).membershipFeeStatus === 'not_paid').length,
    unknown: realUsers.filter(u => (u as any).membershipFeeStatus === 'unknown').length,
  };

  return (
    <div className="px-5 py-5">
      <div className="mb-4">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B2A5C' }}>가입자 관리</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>
          총 {realUsers.length}명 (관리자 {realUsers.filter(u => u.isAdmin).length}명)
        </p>
      </div>

      {/* Membership Fee Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border-2" style={{ borderColor: '#ECFDF5' }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>납부</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{membershipStats.paid}명</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border-2" style={{ borderColor: '#FEF2F2' }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 16 }}>❌</span>
            <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>미납</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>{membershipStats.not_paid}명</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border-2" style={{ borderColor: '#FFFBEB' }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 16 }}>❓</span>
            <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>모름</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B' }}>{membershipStats.unknown}명</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름, 학번, 학과 검색"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none"
          style={{ borderColor: '#E5E7EB', background: 'white', fontSize: 14 }}
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-3">
        {[
          { key: 'points', label: '포인트순' },
          { key: 'name', label: '이름순' },
          { key: 'joined', label: '가입순' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key as any)}
            className="px-3 py-1.5 rounded-full text-xs transition-colors"
            style={{
              background: sortBy === s.key ? '#1B2A5C' : 'white',
              color: sortBy === s.key ? 'white' : '#6B7280',
              fontWeight: 600,
              border: `1px solid ${sortBy === s.key ? '#1B2A5C' : '#E5E7EB'}`,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Membership Fee Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: '전체', emoji: '👥' },
          { key: 'paid', label: '납부', emoji: '✅' },
          { key: 'not_paid', label: '미납', emoji: '❌' },
          { key: 'unknown', label: '모름', emoji: '❓' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setMembershipFilter(f.key as any)}
            className="px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap"
            style={{
              background: membershipFilter === f.key ? '#7DC443' : 'white',
              color: membershipFilter === f.key ? 'white' : '#6B7280',
              fontWeight: 600,
              border: `1px solid ${membershipFilter === f.key ? '#7DC443' : '#E5E7EB'}`,
            }}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="space-y-2">
        {sorted.map((user, i) => {
          const grade = getGrade(user.id);
          const info = getGradeInfo(grade);
          const membershipStatus = (user as any).membershipFeeStatus || 'unknown';
          const membershipInfo = {
            paid: { emoji: '✅', label: '납부', bg: '#ECFDF5', color: '#10B981' },
            not_paid: { emoji: '❌', label: '미납', bg: '#FEF2F2', color: '#EF4444' },
            unknown: { emoji: '❓', label: '모름', bg: '#FFFBEB', color: '#F59E0B' },
          }[membershipStatus];

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl p-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: info.bg }}
                  >
                    <span style={{ fontSize: 18 }}>{info.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{user.name}</span>
                      {user.isAdmin && (
                        <span
                          className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: '#DBEAFE', color: '#3B82F6', fontSize: 9 }}
                        >
                          관리자
                        </span>
                      )}
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: info.bg, color: info.color, fontSize: 9 }}
                      >
                        {grade}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: membershipInfo.bg, color: membershipInfo.color, fontSize: 9 }}
                        title="자치회비 납부 여부"
                      >
                        {membershipInfo.emoji} {membershipInfo.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1B2A5C' }}>{user.points}점</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {user.studentId} · {user.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleToggleAdmin(user.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: user.isAdmin ? '#DBEAFE' : '#FEF3C7' }}
                    title={user.isAdmin ? '일반 유저로 강등' : '관리자로 승격'}
                  >
                    <Shield size={14} color={user.isAdmin ? '#3B82F6' : '#F59E0B'} />
                  </button>
                  <button
                    onClick={() => openEditModal(user.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#F0F9FF' }}
                    title="정보 수정"
                  >
                    <Edit2 size={14} color="#3B82F6" />
                  </button>
                  <button
                    onClick={() => setSelectedUser(user.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#EEF1FC' }}
                    title="포인트 지급"
                  >
                    <Plus size={14} color="#1B2A5C" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#FEE2E2' }}
                    title="사용자 삭제"
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span style={{ fontSize: 10, color: '#D1D5DB' }}>📱 {user.phone}</span>
                <span style={{ fontSize: 10, color: '#D1D5DB' }}>📅 {typeof user.joinedAt === 'string' ? user.joinedAt.split('T')[0] : new Date(user.joinedAt).toISOString().split('T')[0]}</span>
              </div>
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p style={{ fontSize: 32 }}>👥</p>
            <p className="mt-2" style={{ fontSize: 14, color: '#9CA3AF' }}>검색 결과가 없어요</p>
          </div>
        )}
      </div>

      {/* Add points modal */}
      {selectedUser && selectedUserData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#EEF1FC' }}
              >
                <Gift size={24} color="#1B2A5C" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>포인트 수동 지급</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>{selectedUserData.name} · {selectedUserData.points}점</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                포인트
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pointAmount}
                  onChange={e => setPointAmount(Number(e.target.value))}
                  min={1}
                  className="flex-1 px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                />
                <span style={{ fontWeight: 600 }}>점</span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[5, 10, 15, 20, 25, 30].map(p => (
                  <button
                    key={p}
                    onClick={() => setPointAmount(p)}
                    className="px-3 py-1 rounded-lg text-xs"
                    style={{
                      background: pointAmount === p ? '#1B2A5C' : '#F3F4F6',
                      color: pointAmount === p ? 'white' : '#6B7280',
                      fontWeight: 600,
                    }}
                  >
                    {p}점
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                지급 사유
              </label>
              <input
                type="text"
                value={pointReason}
                onChange={e => setPointReason(e.target.value)}
                placeholder="ex) S'TED 참여"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 rounded-xl border"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
              >
                취소
              </button>
              <button
                onClick={handleAddPoints}
                disabled={!pointReason.trim() || pointAmount <= 0}
                className="flex-1 py-3 rounded-xl text-white"
                style={{
                  background: pointReason.trim() && pointAmount > 0
                    ? 'linear-gradient(135deg, #1B2A5C, #2E4A9A)'
                    : '#E5E7EB',
                  fontWeight: 700,
                  color: pointReason.trim() && pointAmount > 0 ? 'white' : '#9CA3AF',
                }}
              >
                지급하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit user modal */}
      {editingUser && editingUserData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setEditingUser(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#F0F9FF' }}
              >
                <Edit2 size={24} color="#3B82F6" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>가입자 정보 수정</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>{editingUserData.name}</p>
              </div>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                  이름 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="이름"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                />
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                  학번 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.studentId}
                  onChange={e => setEditForm({ ...editForm, studentId: e.target.value })}
                  placeholder="학번"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                />
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                  학과 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="학과"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                />
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                  전화번호 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#E5E7EB', background: '#F9F9F9', fontSize: 15 }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
                  자치회비 납부 여부
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, membershipFeeStatus: 'paid' })}
                    className="flex-1 py-2.5 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: editForm.membershipFeeStatus === 'paid' ? '#10B981' : '#E5E7EB',
                      background: editForm.membershipFeeStatus === 'paid' ? '#ECFDF5' : '#F9F9F9',
                      color: editForm.membershipFeeStatus === 'paid' ? '#10B981' : '#6B7280',
                      fontSize: 13,
                      fontWeight: editForm.membershipFeeStatus === 'paid' ? 700 : 500,
                    }}
                  >
                    ✅ 납부
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, membershipFeeStatus: 'not_paid' })}
                    className="flex-1 py-2.5 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: editForm.membershipFeeStatus === 'not_paid' ? '#EF4444' : '#E5E7EB',
                      background: editForm.membershipFeeStatus === 'not_paid' ? '#FEF2F2' : '#F9F9F9',
                      color: editForm.membershipFeeStatus === 'not_paid' ? '#EF4444' : '#6B7280',
                      fontSize: 13,
                      fontWeight: editForm.membershipFeeStatus === 'not_paid' ? 700 : 500,
                    }}
                  >
                    ❌ 미납
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, membershipFeeStatus: 'unknown' })}
                    className="flex-1 py-2.5 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: editForm.membershipFeeStatus === 'unknown' ? '#F59E0B' : '#E5E7EB',
                      background: editForm.membershipFeeStatus === 'unknown' ? '#FFFBEB' : '#F9F9F9',
                      color: editForm.membershipFeeStatus === 'unknown' ? '#F59E0B' : '#6B7280',
                      fontSize: 13,
                      fontWeight: editForm.membershipFeeStatus === 'unknown' ? 700 : 500,
                    }}
                  >
                    ❓ 모름
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 rounded-xl border"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
              >
                취소
              </button>
              <button
                onClick={handleEditUser}
                disabled={!editForm.name.trim() || !editForm.studentId.trim() || !editForm.department.trim() || !editForm.phone.trim()}
                className="flex-1 py-3 rounded-xl text-white"
                style={{
                  background: editForm.name.trim() && editForm.studentId.trim() && editForm.department.trim() && editForm.phone.trim()
                    ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                    : '#E5E7EB',
                  fontWeight: 700,
                  color: editForm.name.trim() && editForm.studentId.trim() && editForm.department.trim() && editForm.phone.trim() ? 'white' : '#9CA3AF',
                }}
              >
                수정하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      {userToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setUserToDelete(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#FEE2E2' }}
              >
                <Trash2 size={24} color="#EF4444" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>사용자 삭제</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>정말 삭제하시겠습니까?</p>
              </div>
            </div>

            <div className="mb-5 p-4 rounded-xl" style={{ background: '#FEF2F2' }}>
              <p style={{ fontSize: 14, color: '#991B1B', lineHeight: '1.6' }}>
                이 작업은 되돌릴 수 없습니다. 사용자의 모든 포인트 기록과 대여 내역이 삭제됩니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 rounded-xl border"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
              >
                취소
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-3 rounded-xl text-white"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  fontWeight: 700,
                }}
              >
                삭제하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

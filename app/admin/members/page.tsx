import { Suspense } from 'react';
import AdminMembersPage from '../_components/AdminMembersPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">로딩 중...</div>}>
      <AdminMembersPage />
    </Suspense>
  );
}

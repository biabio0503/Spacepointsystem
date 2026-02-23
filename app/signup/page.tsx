'use client';

import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

import SignUpPageComponent from '@/components/pages/SignUpPage';

export default function SignUpPage() {
   return (
      <Suspense fallback={<div>Loading...</div>}>
         <SignUpPageComponent />
      </Suspense>
   );
}

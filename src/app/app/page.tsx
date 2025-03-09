'use client';

import TranslateOverlay from '@/components/TranslateOverlay';
import { Suspense } from 'react';


export default function Page() {


  return (
    <Suspense fallback={<div>Loading...</div>}>
        <TranslateOverlay />
    </Suspense>
  );
}

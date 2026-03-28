import { Suspense } from 'react';
import { MixStudyClient } from './MixStudyClient';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function MixPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MixStudyClient />
    </Suspense>
  );
}

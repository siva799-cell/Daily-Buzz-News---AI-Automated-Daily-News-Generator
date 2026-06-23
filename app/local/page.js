'use client';

import React from 'react';
import { ShieldAlert, AlertCircle, Compass } from 'lucide-react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/translations';

export default function LocalNewsPage() {
  const { language, loading: contextLoading } = useApp();

  if (contextLoading) {
    return <LocalPageSkeleton />;
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-3xl border border-zinc-300 bg-white p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="mx-auto rounded-full bg-rose-50 p-4 border border-rose-100 text-rose-600 w-fit">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-wider mt-5 font-serif">
          {t('localNews', language)}
        </h1>
        <p className="text-xs text-zinc-600 mt-4 leading-relaxed font-medium font-serif">
          This section has been disabled. All verified stories are now published in the main feed and are available across categories.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 border border-zinc-200">
          <Compass className="h-4 w-4" />
          Browse the verified global feed instead
        </div>
      </div>
    </div>
  );
}

function LocalPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      <div className="h-20 w-full rounded-2xl bg-zinc-200"></div>
      <div className="h-80 rounded-3xl bg-zinc-200"></div>
    </div>
  );
}

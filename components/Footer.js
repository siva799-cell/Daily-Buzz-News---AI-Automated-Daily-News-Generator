'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from './AppContext';
import { t } from '@/lib/translations';

export default function Footer() {
  const { language } = useApp();

  return (
    <footer className="border-t border-zinc-300 bg-zinc-100 py-10 mt-auto text-zinc-600">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-lg font-black tracking-widest text-zinc-900 font-serif">
              Daily Buzz News
            </span>
            <p className="mt-3 text-xs leading-relaxed text-zinc-550 font-medium">
              {t('fairUseNotice', language)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-3">{t('home', language)}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link href="/category/technology" className="hover:text-zinc-900 transition-colors">Technology</Link>
              <Link href="/category/business" className="hover:text-zinc-900 transition-colors">Business</Link>
              <Link href="/category/science" className="hover:text-zinc-900 transition-colors">Science</Link>
              <Link href="/category/politics" className="hover:text-zinc-900 transition-colors">Politics</Link>
              <Link href="/category/sports" className="hover:text-zinc-900 transition-colors">Sports</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-3">{t('trustIndex', language)}</h4>
            <p className="text-xs leading-relaxed text-zinc-550 font-medium">
              Summaries are generated from trusted public feeds using machine learning models. Under no circumstances do we copy full paragraphs or rewrite lines.
            </p>
            <div className="mt-4 text-xs font-semibold text-zinc-500">
              © {new Date().getFullYear()} Daily Buzz News. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

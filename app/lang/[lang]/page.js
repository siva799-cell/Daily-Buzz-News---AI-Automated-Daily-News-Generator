'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Globe, AlertCircle } from 'lucide-react';
import { getLanguageName } from '@/lib/locationHelper';
import { t } from '@/lib/translations';
import { useApp } from '@/components/AppContext';

export default function LanguageNewsPage() {
  const { lang } = useParams();
  const { language } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayLang = getLanguageName(lang);

  useEffect(() => {
    async function loadLanguageNews() {
      if (!lang) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts?lang=${lang}&limit=60&_t=${Date.now()}`);
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error('Failed to load language-based news:', err);
        setError('Error fetching articles. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    loadLanguageNews();
  }, [lang]);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-300 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
          <Globe className="h-6 w-6 text-cyan-600" />
          {displayLang} Edition
        </h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
          Factual summaries translated and verified by artificial intelligence
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-4 shadow-sm h-72">
              <div className="h-full w-full rounded-xl bg-zinc-200/50"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-zinc-300 bg-white p-8 text-center max-w-sm mx-auto space-y-4 shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
          <p className="text-sm text-zinc-700 font-bold uppercase tracking-wider">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-zinc-300 bg-white p-12 text-center text-zinc-500 font-semibold italic shadow-sm">
          "No news summaries currently translated to {displayLang}."
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 items-stretch">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} layout="narrow" />
          ))}
        </div>
      )}
    </div>
  );
}

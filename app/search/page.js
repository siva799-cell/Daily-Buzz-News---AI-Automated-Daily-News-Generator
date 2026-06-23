'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import PostCard from '@/components/PostCard';
import { Search, AlertCircle, Inbox } from 'lucide-react';
import { t } from '@/lib/translations';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { language } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts?q=${encodeURIComponent(query.trim())}&lang=${language}&limit=60&_t=${Date.now()}`);
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error('Failed to search news:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, language]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-300 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2 font-serif">
          <Search className="h-6 w-6 text-brand-slate" />
          {t('searchPlaceholder', language).replace('...', '')}
        </h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
          Showing matching articles for: <span className="text-zinc-800">"{query}"</span>
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
        <div className="rounded-3xl border border-zinc-300 bg-white p-12 text-center max-w-sm mx-auto space-y-4 shadow-sm">
          <Inbox className="h-10 w-10 text-zinc-400 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">No matching summaries</h3>
          <p className="text-xs text-zinc-650 leading-relaxed font-medium">
            We couldn't find any approved AI summaries matching that keyword. Try searching for technology, sports, or business.
          </p>
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

export default function SearchPage() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-10 text-xs text-zinc-500 font-semibold uppercase tracking-widest animate-pulse">Loading search content...</div>}>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}

'use client';
 
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { ArrowLeft, Calendar, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, DollarSign, Languages, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/translations';

const languagesList = [
  { code: 'en', name: 'English Edition' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'brx', name: 'बर’ (Bodo)' },
  { code: 'doi', name: 'डोगरी (Dogri)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ks', name: 'کٲশुर / कश्मीरी (Kashmiri)' },
  { code: 'kok', name: 'कोंकणी (Konkani)' },
  { code: 'mai', name: 'मैथिली (Maithili)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mni', name: 'মৈতৈলোন্ (Manipuri)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'sa', name: 'संस्कृतम् (Sanskrit)' },
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)' },
  { code: 'sd', name: 'सिन्धी / سنڌي (Sindhi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ur', name: 'اردو (Urdu)' }
];

export default function SinglePostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { language, changeLanguage } = useApp();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTranslateDropdown, setShowTranslateDropdown] = useState(false);
  
  // Translation state
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedSummaryText, setTranslatedSummaryText] = useState('');
  const [translatedKeyPoints, setTranslatedKeyPoints] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [currentPostLang, setCurrentPostLang] = useState('en');
  
  const translateDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (translateDropdownRef.current && !translateDropdownRef.current.contains(event.target)) {
        setShowTranslateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch only once in English when slug changes
  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts/${slug}?lang=en&_t=${Date.now()}`);
        const data = await res.json();
        if (data.success) {
          setPost(data.post);
        } else {
          throw new Error(data.error || 'Post not found');
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  // Handle translation dynamically when post is loaded or global language selection changes
  useEffect(() => {
    if (!post) return;

    const translatePostContent = async () => {
      if (language === 'en') {
        setTranslatedTitle(post.title);
        setTranslatedSummaryText(post.summary);
        setTranslatedKeyPoints(post.keyPoints || []);
        setCurrentPostLang('en');
        return;
      }

      // Check if we have pre-cached translations on the post object
      const cachedSummary = post.translatedSummary ? post.translatedSummary[language] : null;
      const cachedTitle = post.translatedTitle ? post.translatedTitle[language] : null;
      const cachedKeyPoints = post.translatedKeyPoints ? post.translatedKeyPoints[language] : null;

      if (cachedSummary && cachedTitle && cachedKeyPoints) {
        setTranslatedTitle(cachedTitle);
        setTranslatedSummaryText(cachedSummary);
        setTranslatedKeyPoints(cachedKeyPoints);
        setCurrentPostLang(language);
        return;
      }

      // Otherwise, request dynamic translation
      setTranslating(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: post.title,
            summary: post.summary,
            keyPoints: post.keyPoints || [],
            lang: language
          })
        });
        const data = await res.json();

        if (data.success) {
          setTranslatedTitle(data.title);
          setTranslatedSummaryText(data.summary);
          setTranslatedKeyPoints(data.keyPoints || []);
          setCurrentPostLang(language);

          // Cache on post object in memory
          if (!post.translatedSummary) post.translatedSummary = {};
          post.translatedSummary[language] = data.summary;

          if (!post.translatedTitle) post.translatedTitle = {};
          post.translatedTitle[language] = data.title;

          if (!post.translatedKeyPoints) post.translatedKeyPoints = {};
          post.translatedKeyPoints[language] = data.keyPoints;
        }
      } catch (err) {
        console.error('Error translating post content:', err);
      } finally {
        setTranslating(false);
      }
    };

    translatePostContent();
  }, [post, language]);

  if (loading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-600 mx-auto animate-bounce" />
        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wider">News Post Not Found</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The article you are looking for may have been archived, removed, or is awaiting administrator approval.
        </p>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-all cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const getConfidenceLevel = (score) => {
    if (score >= 85) return { text: 'High Verification', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', border: 'border-emerald-200' };
    if (score >= 70) return { text: 'Standard Verification', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', border: 'border-amber-200' };
    return { text: 'Needs Review', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-100', border: 'border-rose-200' };
  };

  const conf = getConfidenceLevel(post.confidenceScore);

  return (
    <article className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> {t('back', language)}
      </button>

      {/* Header and title */}
      <div className={`space-y-4 transition-all duration-305 ${translating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-brand-yellow px-2.5 py-0.5 font-extrabold uppercase tracking-wider text-brand-dark shadow-md font-serif">
            {post.category}
          </span>
          {post.city && (
            <span className="rounded bg-rose-50 border border-rose-100 px-2.5 py-0.5 font-bold text-rose-700">
              📍 {post.city}, {post.state}
            </span>
          )}
          {post.genre && (
            <span className="rounded bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-zinc-600 font-semibold">
              {post.genre}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 leading-tight font-serif">
          {translatedTitle || post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-3 font-semibold">
            <span className="text-zinc-700">
              {t('source', language)}: {post.sourceName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              Published: {new Date(post.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : language, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })} at {new Date(post.publishedAt).toLocaleTimeString(language === 'en' ? 'en-US' : language, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* HD Translate Symbol Dropdown */}
          <div className="relative" ref={translateDropdownRef}>
            <button
              onClick={() => setShowTranslateDropdown(!showTranslateDropdown)}
              className={`flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-black text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 shadow-sm transition-all cursor-pointer ${translating ? 'animate-pulse' : ''}`}
              title="Translate article details"
              disabled={translating}
            >
              {translating ? (
                <Loader2 className="h-4 w-4 animate-spin text-brand-yellow" />
              ) : (
                <Languages className="h-4 w-4 text-brand-slate" />
              )}
              <span>HD Translate ({currentPostLang.toUpperCase()})</span>
            </button>
            
            {showTranslateDropdown && (
              <div className="absolute right-0 mt-2 w-52 max-h-64 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-950/10 z-30 animate-scaleIn">
                <div className="px-2.5 py-1.5 text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 mb-1 sticky top-0 bg-white z-10">
                  Select Edition Language
                </div>
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowTranslateDropdown(false);
                    }}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition-all hover:bg-zinc-100 font-serif ${language === lang.code ? 'text-brand-dark bg-brand-slate-light' : 'text-zinc-700 hover:text-zinc-950'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Image & Ad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto w-full">
        <div className="md:col-span-2 relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-md">
          <img
            src={post.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'}
            alt={translatedTitle || post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent"></div>
          {/* Caption */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-[10px] text-zinc-650 font-bold border border-zinc-200">
            {post.imageSource} | {t('imageLicenseLabel', language)}: {post.imageLicense}
          </div>
        </div>
        
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Core content */}
        <div className={`lg:col-span-2 space-y-6 transition-all duration-305 ${translating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <div className="space-y-3">
            <h2 className="text-base font-black text-zinc-950 uppercase tracking-wider border-l-2 border-zinc-800 pl-3">
              {t('aiSummary', language)}
            </h2>
            <div className="space-y-4">
              {(translatedSummaryText || post.summary).split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} className="text-sm sm:text-base leading-relaxed text-zinc-800 font-medium animate-fadeIn">
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border-l-4 border-l-brand-yellow border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="text-xs font-black text-brand-slate uppercase tracking-widest border-b border-zinc-100 pb-2 font-serif">
              {t('coreHighlights', language)}
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-750 font-medium">
              {(translatedKeyPoints || post.keyPoints || []).map((point, index) => (
                <li key={index} className="flex items-start gap-3 animate-fadeIn">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-black text-zinc-700">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Attribution Action */}
          <div className="border-t border-zinc-200 pt-6 space-y-3">
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-all shadow cursor-pointer"
            >
              {t('readFullArticle', language)} {post.sourceName} <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
              {t('fairUseNotice', language)}
            </p>
          </div>
        </div>

        {/* Verification Sidebar */}
        <div className="space-y-6">
          
          {/* Trust Score Panel */}
          <div className={`rounded-3xl border p-5 space-y-4 shadow-sm ${conf.bg} ${conf.border}`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${conf.color}`}>
              {conf.text}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-900">{post.confidenceScore}%</span>
              <span className="text-xs text-zinc-500 font-bold">{t('trustScore', language)} Index</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-650 font-medium">
              Calculated dynamically based on source verification count, publisher authority, and machine learning semantic analysis metrics.
            </p>
          </div>

          {/* Verification Sources */}
          {post.verificationSources && post.verificationSources.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {t('crossVerification', language)}
              </h4>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-medium">
                We cross-reference coverage across multiple trusted publications to maintain reliability and eliminate single-source bias.
              </p>
              <div className="space-y-2">
                {post.verificationSources.map((url, i) => {
                  let hostname = 'Verifying Source';
                  try {
                    hostname = new URL(url).hostname.replace('www.', '');
                  } catch (e) {}
                  
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer"
                    >
                      <span className="truncate max-w-[150px]">{hostname}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-2" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('tags', language)}</h4>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-650 border border-zinc-200"
                  >
                    #{tag.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// Loading Skeleton Component
function PostSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-4 w-16 bg-zinc-200 rounded"></div>
      <div className="space-y-3">
        <div className="h-10 w-3/4 bg-zinc-200 rounded"></div>
        <div className="h-4 w-1/2 bg-zinc-200 rounded"></div>
      </div>
      <div className="aspect-video w-full rounded-2xl bg-zinc-200"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[150px] w-full rounded-xl bg-zinc-200"></div>
          <div className="h-[200px] w-full rounded-xl bg-zinc-200"></div>
        </div>
        <div className="h-[300px] w-full rounded-xl bg-zinc-200"></div>
      </div>
    </div>
  );
}

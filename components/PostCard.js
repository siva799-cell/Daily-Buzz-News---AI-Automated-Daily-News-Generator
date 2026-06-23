'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, CheckCircle, ExternalLink, Languages, Loader2 } from 'lucide-react';
import { useApp } from './AppContext';
import { t } from '@/lib/translations';

export default function PostCard({ post, layout = 'wide' }) {
  const { language } = useApp();
  const { title, slug, summary, category, sourceName, publishedAt, confidenceScore, city, state, imageUrl, translatedSummary } = post;
  
  // Translation state
  const [cardLang, setCardLang] = useState('en');
  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [translatedSummaryText, setTranslatedSummaryText] = useState(summary);
  const [translating, setTranslating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Format Date
  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Get confidence score style
  const getConfidenceBadgeStyle = (score) => {
    if (score >= 85) return 'bg-brand-slate-light text-brand-slate border-brand-slate/25';
    if (score >= 70) return 'bg-brand-yellow/10 text-brand-slate-dark border-brand-yellow/25';
    return 'bg-rose-50 text-rose-750 border-rose-150';
  };

  const handleTranslate = async (targetLang) => {
    setShowDropdown(false);
    if (targetLang === 'en') {
      setCardLang('en');
      setTranslatedTitle(title);
      setTranslatedSummaryText(summary);
      return;
    }

    // Check if we have pre-cached translation in post
    const cachedSummary = post.translatedSummary ? post.translatedSummary[targetLang] : null;
    const cachedTitle = post.translatedTitle ? post.translatedTitle[targetLang] : null;
    if (cachedSummary && cachedTitle) {
      setCardLang(targetLang);
      setTranslatedSummaryText(cachedSummary);
      setTranslatedTitle(cachedTitle);
      return;
    }

    // If not cached, translate on-the-fly!
    setTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, lang: targetLang })
      });
      const data = await res.json();

      if (data.success) {
        setTranslatedTitle(data.title);
        setTranslatedSummaryText(data.summary);
        setCardLang(targetLang);

        // Cache it locally so we don't fetch it again
        if (!post.translatedSummary) post.translatedSummary = {};
        post.translatedSummary[targetLang] = data.summary;
        if (!post.translatedTitle) post.translatedTitle = {};
        post.translatedTitle[targetLang] = data.title;
      }
    } catch (e) {
      console.error('Error translating card:', e);
    } finally {
      setTranslating(false);
    }
  };

  // Sync state when props or global language changes
  useEffect(() => {
    handleTranslate(language);
  }, [language, title, summary]);

  const languagesList = [
    { code: 'en', name: 'English' },
    { code: 'as', name: 'অসমীয়া (Assamese)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'brx', name: 'बर’ (Bodo)' },
    { code: 'doi', name: 'डोगरी (Dogri)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ks', name: 'کٲشुर / कश्मीरी (Kashmiri)' },
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

  const isNarrow = layout === 'narrow';

  return (
    <article className={`group relative flex ${isNarrow ? 'flex-col' : 'flex-col md:flex-row'} overflow-hidden rounded-2xl border border-brand-slate/15 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-slate/35 hover:shadow-md hover:shadow-brand-slate/5 h-full`}>
      {/* Article Image */}
      <div className={`relative shrink-0 overflow-hidden bg-zinc-100 ${isNarrow ? 'aspect-video w-full' : 'aspect-video w-full md:aspect-auto md:w-72 lg:w-80 md:min-h-full'}`}>
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'}
          alt={translatedTitle}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          loading="lazy"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/25 to-transparent"></div>
        
        {/* Badges on image */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 animate-fadeIn">
          <span className="rounded bg-brand-yellow px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-dark shadow-sm">
            {category}
          </span>
          {city && (
            <span className="flex items-center gap-1 rounded bg-brand-dark/95 border border-white/10 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-sm shadow-sm">
              <MapPin className="h-3 w-3 text-brand-yellow" /> {city}
            </span>
          )}
        </div>
 
        {/* HD Translate Dropdown */}
        <div className="absolute right-3 top-3 z-20" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowDropdown(!showDropdown);
            }}
            className="flex items-center gap-1 rounded-lg bg-brand-dark/90 border border-white/15 px-2.5 py-1 text-[9px] font-black text-white backdrop-blur-md shadow-sm transition-all hover:bg-brand-slate hover:border-brand-slate cursor-pointer"
            title="Translate article summary"
          >
            {translating ? (
              <Loader2 className="h-3 w-3 animate-spin text-brand-yellow" />
            ) : (
              <Languages className="h-3 w-3 text-brand-yellow" />
            )}
            HD {cardLang.toUpperCase()}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1.5 w-48 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg shadow-zinc-950/10 z-30 animate-scaleIn">
              <div className="px-2 py-1 text-[8px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 mb-1 sticky top-0 bg-white z-10 font-serif">
                Select Language
              </div>
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTranslate(lang.code);
                  }}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-[10px] font-bold transition-all hover:bg-zinc-100 ${cardLang === lang.code ? 'text-brand-slate bg-brand-slate-light' : 'text-zinc-700 hover:text-zinc-950'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 mb-2.5 font-semibold">
          <span className="flex items-center gap-1 font-serif">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            {dateStr}
          </span>
          <span className="text-brand-slate font-serif">
            {sourceName}
          </span>
        </div>
 
        {/* Title */}
        <h3 className={`font-black leading-snug text-brand-dark group-hover:text-brand-slate transition-colors line-clamp-2 mb-3 font-serif ${isNarrow ? 'text-sm sm:text-base' : 'text-base sm:text-lg lg:text-xl'}`}>
          <Link href={`/posts/${slug}`}>
            {translatedTitle}
          </Link>
        </h3>
 
        {/* Summary Snippet */}
        <p className={`leading-relaxed text-zinc-600 font-medium mb-4 font-serif ${isNarrow ? 'text-xs line-clamp-2' : 'text-xs sm:text-sm line-clamp-3'}`}>
          {translatedSummaryText}
        </p>
 
        {/* Card Footer actions */}
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-brand-slate/10 pt-4">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold font-serif ${getConfidenceBadgeStyle(confidenceScore)}`}>
            <CheckCircle className="h-3 w-3" /> {confidenceScore}% {t('trustScore', language)}
          </span>
          <Link
            href={`/posts/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold leading-none text-brand-slate hover:text-brand-slate-dark transition-colors font-serif"
          >
            {t('readSummary', language)}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

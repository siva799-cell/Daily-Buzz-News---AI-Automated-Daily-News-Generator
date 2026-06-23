'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/AppContext';
import { Settings, Globe, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/translations';

export default function SettingsPage() {
  const { language, changeLanguage } = useApp();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const languagesList = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'brx', name: 'Bodo', native: 'बर’' },
    { code: 'doi', name: 'Dogri', native: 'डोगरी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ks', name: 'Kashmiri', native: 'کٲशुर' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
    { code: 'mai', name: 'Maithili', native: 'मैथिली' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'sd', name: 'Sindhi', native: 'सिन्धी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ur', name: 'Urdu', native: 'اردو' }
  ];

  const selectLang = (code) => {
    changeLanguage(code);
    triggerSavedToast();
  };

  const triggerSavedToast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> {t('back', language)}
      </button>

      {/* Header */}
      <div className="border-b border-zinc-300 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-6 w-6 text-brand-slate" />
            {t('configurePreferences', language)}
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
            Configure local-language aggregation and geolocation overrides
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" /> Saved!
          </span>
        )}
      </div>

      {/* Language Section */}
      <div className="rounded-3xl border border-zinc-300 bg-white p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-600" /> Preferred Language
        </h3>
        <p className="text-xs text-zinc-650 leading-relaxed font-medium">
          Select the default language for summaries. Articles will be automatically translated using neural models.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {languagesList.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => selectLang(lang.code)}
                className={`rounded-xl border p-4 text-center transition-all cursor-pointer ${
                  active
                    ? 'border-brand-slate bg-brand-slate-light text-brand-dark font-black shadow-sm ring-1 ring-brand-slate'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-650 hover:border-zinc-350 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <div className="text-sm">{lang.native}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5 font-bold">{lang.name}</div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

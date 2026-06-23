'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import { Globe, Search, Shield, Menu, X, Newspaper } from 'lucide-react';
import { t } from '@/lib/translations';

const LINE_1_CATEGORIES = ['Technology', 'Sports', 'Education', 'Men', 'Women', 'Children', 'International'];
const LINE_2_CATEGORIES = ['Accidents', 'National', 'Business', 'Health', 'Jobs', 'Entertainment', 'Politics', 'Science'];

export default function Navbar() {
  const { language, changeLanguage } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream border-b-4 border-brand-yellow shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          
          {/* Professional Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img src="/images/daily-buzz-logo.svg" alt="Daily Buzz News logo" className="h-12 w-auto" />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-widest text-brand-dark uppercase font-serif">
                Daily Buzz
              </span>
              <span className="text-[8px] font-bold text-brand-slate tracking-wider uppercase -mt-0.5">
                NEWS
              </span>
            </div>
          </Link>

          {/* Search bar - Clean Editorial Design */}
          <form onSubmit={handleSearchSubmit} className="hidden md:block max-w-xs flex-1 relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder', language)}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded bg-white/70 border border-brand-slate/20 px-4 py-1.5 pl-9 text-xs text-brand-dark placeholder-brand-slate/60 focus:outline-none focus:bg-white focus:border-brand-slate/50 focus:ring-1 focus:ring-brand-slate/40 transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-slate/60" />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {/* Language Selector */}
            <div className="relative flex items-center gap-1.5 rounded bg-white/70 border border-brand-slate/20 px-3 py-1.5 text-xs font-bold text-brand-slate">
              <Globe className="h-3.5 w-3.5 text-brand-slate" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent pr-1 focus:outline-none text-brand-dark cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="as">AS (অসমীয়া)</option>
                <option value="bn">BN (বাংলা)</option>
                <option value="brx">BRX (बर’)</option>
                <option value="doi">DOI (डोगरी)</option>
                <option value="gu">GU (ગુજરાતી)</option>
                <option value="hi">HI (हिंदी)</option>
                <option value="kn">KN (ಕನ್ನಡ)</option>
                <option value="ks">KS (کٲشुर)</option>
                <option value="kok">KOK (कोंकणी)</option>
                <option value="mai">MAI (मैथिली)</option>
                <option value="ml">ML (മലയാളം)</option>
                <option value="mni">MNI (মৈতৈলোন্)</option>
                <option value="mr">MR (मराठी)</option>
                <option value="ne">NE (नेपाली)</option>
                <option value="or">OR (ଓଡ଼ିଆ)</option>
                <option value="pa">PA (ਪੰਜਾਬੀ)</option>
                <option value="sa">SA (संस्कृतम्)</option>
                <option value="sat">SAT (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                <option value="sd">SD (सिन्धी)</option>
                <option value="ta">TA (தமிழ்)</option>
                <option value="te">TE (తెలుగు)</option>
                <option value="ur">UR (اردو)</option>
              </select>
            </div>

            {/* Admin Dashboard */}
            <Link
              href="/admin"
              className="rounded bg-white/70 border border-brand-slate/20 hover:border-brand-slate/40 p-2 text-brand-slate hover:text-brand-dark transition-all"
              title="Admin Control"
            >
              <Shield className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden rounded bg-white/70 border border-brand-slate/20 p-2 text-brand-slate hover:text-brand-dark cursor-pointer"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Categories Navigation Bar (2-Line display on desktop) */}
        <div className="hidden border-t border-brand-slate/10 py-2.5 md:block space-y-2">
          
          {/* Line 1: Home, Tech, Sports, Education, Men, Women, Children */}
          <nav className="flex items-center space-x-5 py-0.5 text-xs font-bold uppercase tracking-wider">
            <Link
              href="/"
              className={`transition-colors pb-0.5 ${
                pathname === '/'
                  ? 'text-brand-dark border-b-2 border-brand-yellow font-black'
                  : 'text-brand-slate hover:text-brand-dark'
              }`}
            >
              {t('home', language)}
            </Link>
            <div className="h-3 w-[1px] bg-brand-slate/20"></div>

            {LINE_1_CATEGORIES.map((cat) => {
              const href = `/category/${cat.toLowerCase()}`;
              const active = pathname === href;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`transition-colors pb-0.5 ${
                    active ? 'text-brand-dark border-b-2 border-brand-yellow font-black' : 'text-brand-slate hover:text-brand-dark'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>

          {/* Line 2: Accidents, Business, Health, Jobs, Entertainment, Politics, Science */}
          <nav className="flex items-center space-x-5 py-0.5 text-xs font-bold uppercase tracking-wider border-t border-brand-slate/10 pt-2">
            {LINE_2_CATEGORIES.map((cat) => {
              const href = `/category/${cat.toLowerCase()}`;
              const active = pathname === href;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`transition-colors pb-0.5 ${
                    active ? 'text-brand-dark border-b-2 border-brand-yellow font-black' : 'text-brand-slate hover:text-brand-dark'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-brand-slate/10 bg-brand-cream px-4 py-4 space-y-4 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t('searchPlaceholder', language)}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded bg-white border border-brand-slate/25 px-4 py-2 pl-9 text-xs text-brand-dark"
            />
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-brand-slate/60" />
          </form>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="rounded bg-white/80 px-4 py-2.5 text-brand-dark hover:bg-brand-slate-light text-center border border-brand-slate/10"
            >
              {t('home', language)}
            </Link>
            {[...LINE_1_CATEGORIES, ...LINE_2_CATEGORIES].map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="rounded bg-white/80 px-4 py-2.5 text-brand-slate hover:text-brand-dark hover:bg-brand-slate-light text-center border border-brand-slate/10"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

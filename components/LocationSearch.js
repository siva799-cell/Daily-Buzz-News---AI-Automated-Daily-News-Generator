'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

export default function LocationSearch({ onSelect, placeholder = 'Search city or town...', initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API call to Nominatim
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Search Nominatim with country code IN (India) to prioritize Indian cities, but keep it robust
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&addressdetails=1&limit=6&countrycodes=in`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    const addr = item.address || {};
    // Extract city names with fallback to town, suburb, village, county, state_district etc.
    const city = addr.city || addr.town || addr.suburb || addr.village || addr.municipality || addr.county || addr.state_district || '';
    const state = addr.state || '';
    const country = addr.country || 'India';

    if (city || state) {
      const displayName = [city, state].filter(Boolean).join(', ');
      setQuery(displayName);
      setIsOpen(false);
      onSelect({ city, state, country });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white border border-zinc-300 px-4 py-2.5 pl-10 pr-10 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 transition-all shadow-sm"
        />
        <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-zinc-400" />
        {loading && (
          <Loader2 className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-zinc-400 animate-spin" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-200 bg-white shadow-lg max-h-56 overflow-y-auto divide-y divide-zinc-100">
          {suggestions.map((item, index) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.suburb || addr.village || addr.municipality || addr.county || addr.state_district || '';
            const state = addr.state || '';
            const country = addr.country || 'India';
            
            // Format nice title and subtitle
            const title = city || state || item.display_name.split(',')[0];
            const subtitle = [state, country].filter((val) => val && val !== title).join(', ');

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-start gap-2.5 transition-colors cursor-pointer text-xs"
              >
                <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-800">{title}</span>
                  {subtitle && <span className="text-[10px] text-zinc-400 font-medium">{subtitle}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.trim().length >= 3 && !loading && suggestions.length === 0 && (
        <div className="absolute z-55 mt-1.5 w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-lg text-center text-xs text-zinc-500 font-medium font-serif">
          No matching locations found.
        </div>
      )}
    </div>
  );
}

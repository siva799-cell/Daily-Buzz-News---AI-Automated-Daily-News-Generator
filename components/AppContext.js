'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or fetch client ID
    let storedUserId = localStorage.getItem('news_user_id');
    if (!storedUserId) {
      storedUserId = 'usr_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('news_user_id', storedUserId);
    }
    setUserId(storedUserId);

    // Load initial settings
    const storedLang = localStorage.getItem('news_lang');
    if (storedLang) setLanguage(storedLang);

    setLoading(false);
  }, []);

  // Update language preference
  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('news_lang', newLang);
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        language,
        loading,
        changeLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

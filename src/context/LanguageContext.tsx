import React, { createContext, useContext, useState, useEffect } from 'react';

// English translations
import enHeader from '../assets/langs/en/header.json';
import enHome from '../assets/langs/en/home.json';
import enSidebar from '../assets/langs/en/sidebar.json';
import enPosts from '../assets/langs/en/posts.json';
import enModals from '../assets/langs/en/modals.json';
import enExplore from '../assets/langs/en/explore.json';
import enMessages from '../assets/langs/en/messages.json';
import enCalls from '../assets/langs/en/calls.json';
import enEvents from '../assets/langs/en/events.json';
import enSettings from '../assets/langs/en/settings.json';
import enFriends from '../assets/langs/en/friends.json';
import enCreatePost from '../assets/langs/en/createPost.json';
import enGroups from '../assets/langs/en/groups.json';

// Khmer translations
import kmHeader from '../assets/langs/km/header.json';
import kmHome from '../assets/langs/km/home.json';
import kmSidebar from '../assets/langs/km/sidebar.json';
import kmPosts from '../assets/langs/km/posts.json';
import kmModals from '../assets/langs/km/modals.json';
import kmExplore from '../assets/langs/km/explore.json';
import kmMessages from '../assets/langs/km/messages.json';
import kmCalls from '../assets/langs/km/calls.json';
import kmEvents from '../assets/langs/km/events.json';
import kmSettings from '../assets/langs/km/settings.json';
import kmFriends from '../assets/langs/km/friends.json';
import kmCreatePost from '../assets/langs/km/createPost.json';
import kmGroups from '../assets/langs/km/groups.json';

export type Language = 'en' | 'km';

const translations = {
  en: {
    header: enHeader,
    home: enHome,
    sidebar: enSidebar,
    posts: enPosts,
    modals: enModals,
    explore: enExplore,
    messages: enMessages,
    calls: enCalls,
    events: enEvents,
    settings: enSettings,
    friends: enFriends,
    createPost: enCreatePost,
    groups: enGroups,
  },
  km: {
    header: kmHeader,
    home: kmHome,
    sidebar: kmSidebar,
    posts: kmPosts,
    modals: kmModals,
    explore: kmExplore,
    messages: kmMessages,
    calls: kmCalls,
    events: kmEvents,
    settings: kmSettings,
    friends: kmFriends,
    createPost: kmCreatePost,
    groups: kmGroups,
  },
};

type TranslationNamespaces = keyof typeof translations['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('connecthub_lang') as Language;
    return saved === 'km' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('connecthub_lang', lang);
    document.documentElement.lang = lang;
    if (lang === 'km') {
      document.body.classList.add('font-khmer');
    } else {
      document.body.classList.remove('font-khmer');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'km') {
      document.body.classList.add('font-khmer');
    } else {
      document.body.classList.remove('font-khmer');
    }
  }, [language]);

  const t = (path: string, vars?: Record<string, string | number>): string => {
    const parts = path.split('.');
    const namespace = parts[0] as TranslationNamespaces;
    const key = parts.slice(1).join('.');

    let text: string | undefined;

    if (translations[language]?.[namespace]) {
      const nsObj = translations[language][namespace] as Record<string, string>;
      text = nsObj[key];
    }

    // Fallback to English if missing in current language
    if (!text && translations.en?.[namespace]) {
      const enNsObj = translations.en[namespace] as Record<string, string>;
      text = enNsObj[key];
    }

    if (!text) {
      return key || path;
    }

    // Replace variables like {name}
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      <div className={language === 'km' ? 'font-khmer' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

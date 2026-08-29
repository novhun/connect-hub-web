import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Home,
  Users,
  Bell,
  MessageSquare,
  ChevronDown,
  Link2,
  Settings,
  Bookmark,
  LogOut,
  HelpCircle,
  X,
  Globe,
  Menu,
  Sparkles,
  Smartphone,
  Download
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import appLogo from '../assets/icons/icon.png';
import { initPwaInstallPrompt, promptPwaInstall } from '../registerServiceWorker';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

interface HeaderProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  onOpenSupport: () => void;
  onOpenProfile: () => void;
  onViewProfile?: (userId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleMobileMenu?: () => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  isVisible?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenMessages,
  onOpenSupport,
  onOpenProfile,
  onViewProfile,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu,
  onLogout,
  onOpenLogin,
  isVisible = true,
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 300);

  useEffect(() => {
    initPwaInstallPrompt(() => {
      setCanInstallPwa(true);
    });
  }, []);

  const handleInstallApp = async () => {
    const installed = await promptPwaInstall();
    if (installed) {
      setCanInstallPwa(false);
    }
  };

  useEffect(() => {
    if (!debouncedQuery) {
      setUserResults([]);
      return;
    }
    let cancelled = false;
    setIsSearchingUsers(true);
    api
      .getUsers({ query: debouncedQuery })
      .then((users) => {
        if (!cancelled) setUserResults(users.slice(0, 5));
      })
      .catch((e) => console.warn('Search users API notice:', e))
      .finally(() => {
        if (!cancelled) setIsSearchingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-header"
      className={`bg-white border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-2 sm:px-6 shrink-0 shadow-xs z-30 sticky top-0 w-full transition-all duration-300 ease-in-out ${
        isVisible
          ? 'max-md:translate-y-0 max-md:mt-0 max-md:opacity-100'
          : 'max-md:-translate-y-full max-md:-mt-14 max-md:opacity-0 max-md:pointer-events-none'
      }`}
    >
      {/* Left: Hamburger (Mobile) + Brand Logo */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-xs bg-white border border-gray-100 shrink-0">
            <img 
              src={appLogo} 
              alt="ConnectHub Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-base sm:text-xl font-bold text-gray-900 tracking-tight hidden xs:inline">
            Connect<span className="text-[#2563eb]">Hub</span>
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-xl lg:max-w-2xl mx-1.5 sm:mx-6 relative" ref={searchRef}>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder={t('header.searchPlaceholder')}
            className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] border-none rounded-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim().length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {language === 'km' ? 'លទ្ធផលស្វែងរក' : 'Search Results'}
            </div>
            <div
              onClick={() => {
                setActiveTab('explore');
                setShowSearchDropdown(false);
              }}
              className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-800">
                  {language === 'km' ? `ស្វែងរក "${searchQuery}"` : `Search for "${searchQuery}"`}
                </span>
                <span className="text-xs text-gray-400 block">
                  {language === 'km' ? 'ក្នុងគ្រប់ការបង្ហោះ រឿងរ៉ាវ និងក្រុម' : 'in all posts, stories & groups'}
                </span>
              </div>
            </div>

            {isSearchingUsers ? (
              <div className="px-3 py-2.5 text-xs text-gray-400">
                {language === 'km' ? 'កំពុងស្វែងរក...' : 'Searching...'}
              </div>
            ) : (
              userResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onViewProfile?.(user.id);
                    setShowSearchDropdown(false);
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                >
                  <img
                    src={api.getMediaUrl(user.avatar)}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">{user.name}</span>
                    <span className="text-xs text-gray-400 block">
                      {user.role || (language === 'km' ? 'សមាជិក' : 'Member')}
                      {user.isOnline ? ` • ${language === 'km' ? 'កំពុងអនឡាញ' : 'Online'}` : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right: Language Switcher, Quick Action Navigation Icons & Profile */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Language Switcher Button */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all flex items-center gap-1 ${language === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            title="English"
          >
            <span>EN</span>
          </button>
          <button
            onClick={() => setLanguage('km')}
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all flex items-center gap-1 font-khmer ${language === 'km'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            title="ភាសាខ្មែរ"
          >
            <span>ខ្មែរ</span>
          </button>
        </div>

        {/* Live API Status Chip (Desktop) */}
        <button
          onClick={() => setActiveTab('about')}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${activeTab === 'about'
              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          title={language === 'km' ? 'ស្ថាបត្យកម្ម & ស្ថានភាពប្រព័ន្ធ Connect-Hub' : 'Connect-Hub Architecture & Live API Status'}
        >
          <span className={`w-2 h-2 rounded-full ${activeTab === 'about' ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="font-medium text-[11px]">
            {language === 'km' ? 'ស្ថានភាព: អនឡាញ' : 'Status: Online'}
          </span>
        </button>

        {/* PWA Install Button */}
        {canInstallPwa && (
          <button
            onClick={handleInstallApp}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer animate-in fade-in"
            title={language === 'km' ? 'ដំឡើង ConnectHub លើទូរស័ព្ទ ឬកុំព្យូទ័រ' : 'Install ConnectHub on Mobile or Desktop'}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">
              {language === 'km' ? 'ដំឡើង App' : 'Install App'}
            </span>
          </button>
        )}

        <nav className="flex items-center gap-1 sm:gap-1.5">
          {/* Home Icon (Desktop Only) */}
          <button
            id="nav-home-btn"
            onClick={() => setActiveTab('home')}
            aria-label={t('header.home')}
            title={t('header.home')}
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-colors relative ${activeTab === 'home'
                ? 'bg-blue-50 text-[#2563eb]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Groups / Communities (Desktop Only) */}
          <button
            id="nav-groups-btn"
            onClick={() => setActiveTab('groups')}
            aria-label={t('sidebar.groups')}
            title={t('sidebar.groups')}
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-colors ${activeTab === 'groups'
                ? 'bg-blue-50 text-[#2563eb]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Notifications with Badge (Desktop & Mobile) */}
          <button
            id="nav-notifs-btn"
            onClick={onOpenNotifications}
            aria-label={t('header.notifications')}
            title={t('header.notifications')}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Messages (Desktop Only) */}
          <button
            id="nav-messages-btn"
            onClick={onOpenMessages}
            aria-label={t('header.messages')}
            title={t('header.messages')}
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-colors ${activeTab === 'messages'
                ? 'bg-blue-50 text-[#2563eb]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </nav>

        {!currentUser.id ? (
          /* Guest state: no session — show an explicit way back in */
          <button
            onClick={onOpenLogin}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer shrink-0"
          >
            {t('header.logIn')}
          </button>
        ) : (
          /* Profile Pill Dropdown */
          <div className="relative" ref={profileMenuRef}>
            <div
              id="profile-dropdown-trigger"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pr-2 sm:pl-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
            >
              <img
                src={api.getMediaUrl(currentUser.avatar)}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-200"
              />
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
            </div>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div
                  onClick={() => {
                    onOpenProfile();
                    setShowProfileMenu(false);
                  }}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <p className="font-bold text-gray-900 text-sm">{currentUser.name}</p>
                  <p className="text-xs text-blue-600 font-medium">{t('header.seeYourProfile')}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('about');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>{language === 'km' ? 'អំពីវេទិកា & ស្ថាបត្យកម្ម' : 'About & System Status'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>{t('header.settings')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('saved');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-gray-500" />
                    <span>{t('sidebar.savedPosts')}</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenSupport();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span>{t('header.support')}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleInstallApp();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 cursor-pointer font-medium"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>{language === 'km' ? 'ដំឡើងកម្មវិធី ConnectHub (PWA)' : 'Install ConnectHub (PWA)'}</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout?.();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

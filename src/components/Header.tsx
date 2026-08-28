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
  User as UserIcon, 
  HelpCircle, 
  X,
  Globe
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  searchQuery,
  setSearchQuery,
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-xs z-30 sticky top-0"
    >
      {/* Left: Brand Logo */}
      <div 
        className="flex items-center gap-2.5 w-auto sm:w-60 cursor-pointer select-none"
        onClick={() => setActiveTab('home')}
      >
        <div className="bg-[#3b82f6] text-white p-2 rounded-xl flex items-center justify-center shadow-xs hover:bg-blue-600 transition-colors">
          <Link2 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          Connect<span className="text-[#2563eb]">Hub</span>
        </span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl lg:max-w-2xl mx-2 sm:mx-6 relative" ref={searchRef}>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
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
            className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] border-none rounded-full py-2 pl-10 pr-9 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
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
            <div 
              onClick={() => {
                setActiveTab('home');
                setShowSearchDropdown(false);
              }}
              className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3okZWj4HdiL1vFZUSxOjHIkXN_ZhmWwuflHAs89NBEBGO3KEg_K6q2-cxZVAGBNJR6ldoF2W8aJMf_-TfyWJIu8DDd7_3q4ALj3Vn8yt6_cqJJgOcW-mBiucYNZlXK2AgM3RjoeyGTc1omUabuTCgmTL8qP2wgc6hJJdfslDdjuch_0br44NUvM5P9t4KBSujHTQY0f5M1IxoAjvhz3xFcGafaPCZHAz_zukIikEULBMf15pmexPJ" 
                alt="Dara Kim" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-sm">
                <span className="font-semibold text-gray-800">Dara Kim</span>
                <span className="text-xs text-gray-400 block">Friend • Senior Developer</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Language Switcher, Quick Action Navigation Icons & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Language Switcher Button */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="English"
          >
            <span>EN</span>
          </button>
          <button
            onClick={() => setLanguage('km')}
            className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 font-khmer ${
              language === 'km'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="ភាសាខ្មែរ"
          >
            <span>ខ្មែរ</span>
          </button>
        </div>

        <nav className="flex items-center gap-1 sm:gap-1.5">
          {/* Home Icon */}
          <button
            id="nav-home-btn"
            onClick={() => setActiveTab('home')}
            aria-label={t('header.home')}
            title={t('header.home')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors relative ${
              activeTab === 'home'
                ? 'bg-blue-50 text-[#2563eb]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Groups / Communities */}
          <button
            id="nav-groups-btn"
            onClick={() => setActiveTab('groups')}
            aria-label={t('sidebar.groups')}
            title={t('sidebar.groups')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-50 text-[#2563eb]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Notifications with Badge */}
          <button
            id="nav-notifs-btn"
            onClick={onOpenNotifications}
            aria-label={t('header.notifications')}
            title={t('header.notifications')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Messages */}
          <button
            id="nav-messages-btn"
            onClick={onOpenMessages}
            aria-label={t('header.messages')}
            title={t('header.messages')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
              activeTab === 'messages'
                ? 'bg-blue-50 text-[#2563eb]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </nav>

        {/* Profile Pill Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <div
            id="profile-dropdown-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 sm:pr-2.5 rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <span className="text-sm font-semibold text-gray-700 hidden lg:block">
              {currentUser.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </div>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in duration-100">
              <div 
                onClick={() => {
                  onOpenProfile();
                  setShowProfileMenu(false);
                }}
                className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-blue-200"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{currentUser.name}</h4>
                  <p className="text-xs text-gray-500">{currentUser.role || 'Member'}</p>
                </div>
              </div>

              {/* Language Switch Option in Dropdown */}
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>{t('header.changeLanguage')}</span>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100"
                >
                  {language === 'en' ? '🇰🇭 ភាសាខ្មែរ' : '🇺🇸 English'}
                </button>
              </div>

              <div className="p-1 text-sm text-gray-700">
                <button
                  onClick={() => {
                    onOpenProfile();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span>{t('header.profile')}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('saved');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                >
                  <Bookmark className="w-4 h-4 text-gray-500" />
                  <span>{t('sidebar.savedPosts')}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>{t('header.settings')}</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSupport();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span>{t('sidebar.supportCenter')}</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>{t('header.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

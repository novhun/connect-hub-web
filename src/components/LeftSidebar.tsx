import React, { useState } from 'react';
import {
  SquarePen,
  Home,
  Compass,
  Film,
  Bell,
  Mail,
  Phone,
  Bookmark,
  FolderArchive,
  Calendar,
  Settings,
  ChevronDown,
  ChevronUp,
  Camera,
  Code2,
  Sparkles,
  UserPlus,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { Group } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePost: () => void;
  unreadNotifsCount: number;
  friendRequestsCount?: number;
  groups: Group[];
  onSelectGroup: (group: Group) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  unreadNotifsCount,
  friendRequestsCount = 0,
  groups,
  onSelectGroup,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { t, language } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [showMoreShortcuts, setShowMoreShortcuts] = useState(false);

  const navItems = [
    { id: 'home', label: t('sidebar.home'), icon: Home, badge: null, badgeColor: '' },
    { id: 'clips', label: t('sidebar.clips') || 'Clips', icon: Film, badge: 'HOT', badgeColor: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs text-[10px] font-extrabold' },
    { id: 'about', label: t('sidebar.welcome'), icon: Sparkles, badge: 'v1.0', badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs' },
    { id: 'explore', label: t('sidebar.explore'), icon: Compass, badge: null, badgeColor: '' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : null, badgeColor: 'bg-[#2563eb] text-white' },
    { id: 'messages', label: t('sidebar.messages'), icon: Mail, badge: null, badgeColor: '' },
    { id: 'friends', label: t('sidebar.friends'), icon: UserPlus, badge: friendRequestsCount > 0 ? friendRequestsCount : null, badgeColor: 'bg-[#2563eb] text-white' },
    { id: 'calls', label: t('sidebar.calls'), icon: Phone, badge: t('header.new'), badgeColor: 'bg-green-100 text-green-700' },
    { id: 'bookmarks', label: t('sidebar.bookmarks'), icon: Bookmark, badge: null, badgeColor: '' },
    { id: 'saved', label: t('sidebar.savedPosts'), icon: FolderArchive, badge: null, badgeColor: '' },
    { id: 'events', label: t('sidebar.events'), icon: Calendar, badge: null, badgeColor: '' },
    { id: 'settings', label: t('sidebar.settings'), icon: Settings, badge: null, badgeColor: '' },
  ];

  const extraShortcuts = groups.slice(3);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Mobile Drawer Header */}
      {isMobileOpen && (
        <div className="p-4 border-b border-gray-100 flex items-center justify-between lg:hidden">
          <span className="font-bold text-gray-900 text-sm">Navigation Menu</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Create Post Main Button */}
      <div className="p-4">
        <button
          id="sidebar-create-post-btn"
          onClick={() => {
            onOpenCreatePost();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs shadow-blue-500/20 cursor-pointer"
        >
          <SquarePen className="w-4 h-4 stroke-[2.5]" />
          <span>{t('sidebar.createPost')}</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${isActive
                ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-[#2563eb] stroke-[2.2]' : 'text-gray-500 stroke-[1.8]'
                    }`}
                />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="my-4 px-4">
        <hr className="border-gray-100" />
      </div>

      {/* Shortcuts / Managed Communities */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t('sidebar.shortcuts')}
          </span>
        </div>

        <div className="space-y-1">
          {groups.slice(0, 3).map((group) => (
            <div
              key={group.id}
              onClick={() => {
                onSelectGroup(group);
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <img
                src={group.icon}
                alt={group.name}
                className="w-7 h-7 rounded-lg object-cover group-hover:scale-105 transition-transform"
              />
              <span className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-600">
                {group.name}
              </span>
            </div>
          ))}

          {showMoreShortcuts &&
            extraShortcuts.map((shortcut) => (
              <div
                key={shortcut.id}
                onClick={() => {
                  onSelectGroup(shortcut);
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group animate-in fade-in duration-200"
              >
                <img
                  src={shortcut.icon}
                  alt={shortcut.name}
                  className="w-7 h-7 rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-600">
                  {shortcut.name}
                </span>
              </div>
            ))}

          <button
            onClick={() => setShowMoreShortcuts(!showMoreShortcuts)}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors mt-1 cursor-pointer"
          >
            {showMoreShortcuts ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>{t('sidebar.seeLess')}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>{t('sidebar.seeMore')}</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Quick Switcher in Sidebar */}
        <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/90 border border-gray-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {isDark ? (language === 'km' ? 'របៀបងងឹត' : 'Dark Mode') : (language === 'km' ? 'របៀបពន្លឺ' : 'Light Mode')}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all cursor-pointer shadow-2xs"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside
        id="left-sidebar"
        className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0 select-none h-full"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          onClick={onCloseMobile}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" />
          <div
            className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

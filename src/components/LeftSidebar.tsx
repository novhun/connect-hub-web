import React, { useState } from 'react';
import { 
  SquarePen, 
  Home, 
  Compass, 
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
  Code2
} from 'lucide-react';
import { Group } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePost: () => void;
  unreadNotifsCount: number;
  groups: Group[];
  onSelectGroup: (group: Group) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  unreadNotifsCount,
  groups,
  onSelectGroup,
}) => {
  const { t } = useLanguage();
  const [showMoreShortcuts, setShowMoreShortcuts] = useState(false);

  const navItems = [
    { id: 'home', label: t('sidebar.home'), icon: Home, badge: null, badgeColor: '' },
    { id: 'explore', label: t('sidebar.explore'), icon: Compass, badge: null, badgeColor: '' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : null, badgeColor: 'bg-[#2563eb] text-white' },
    { id: 'messages', label: t('sidebar.messages'), icon: Mail, badge: null, badgeColor: '' },
    { id: 'calls', label: t('sidebar.calls'), icon: Phone, badge: t('header.new'), badgeColor: 'bg-green-100 text-green-700' },
    { id: 'bookmarks', label: t('sidebar.bookmarks'), icon: Bookmark, badge: null, badgeColor: '' },
    { id: 'saved', label: t('sidebar.savedPosts'), icon: FolderArchive, badge: null, badgeColor: '' },
    { id: 'events', label: t('sidebar.events'), icon: Calendar, badge: null, badgeColor: '' },
    { id: 'settings', label: t('sidebar.settings'), icon: Settings, badge: null, badgeColor: '' },
  ];

  const extraShortcuts = [
    {
      id: 'grp-photo',
      name: 'Landscape Photography',
      icon: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=100&auto=format&fit=crop&q=80',
      isPrivate: false,
      membersCount: '15.4K members',
      membersNumber: 15400,
      description: 'Sharing nature and scenic captures.',
    },
    {
      id: 'grp-react',
      name: 'React Ecosystem Hub',
      icon: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&auto=format&fit=crop&q=80',
      isPrivate: false,
      membersCount: '24.1K members',
      membersNumber: 24100,
      description: 'Advanced React, TypeScript, and state management.',
    }
  ];

  return (
    <aside 
      id="left-sidebar"
      className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto select-none"
    >
      {/* Create Post Main Button */}
      <div className="p-4">
        <button
          id="sidebar-create-post-btn"
          onClick={onOpenCreatePost}
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs shadow-blue-500/20 cursor-pointer"
        >
          <SquarePen className="w-4 h-4 stroke-[2.5]" />
          <span>{t('sidebar.createPost')}</span>
        </button>
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 px-3 py-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#eff6ff] text-[#1d4ed8] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#2563eb]' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Shortcuts Section */}
      <div className="px-5 py-4 mt-auto border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          {t('sidebar.yourShortcuts')}
        </h3>
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-1 rounded-lg -mx-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                <img
                  src={group.icon}
                  alt={group.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 truncate">
                {group.name}
              </span>
            </div>
          ))}

          {showMoreShortcuts && extraShortcuts.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group as unknown as Group)}
              className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-1 rounded-lg -mx-1 transition-colors animate-in fade-in duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                <img
                  src={group.icon}
                  alt={group.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 truncate">
                {group.name}
              </span>
            </div>
          ))}

          <button
            id="shortcuts-toggle-btn"
            onClick={() => setShowMoreShortcuts(!showMoreShortcuts)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors w-full text-left pt-1 cursor-pointer"
          >
            {showMoreShortcuts ? (
              <>
                <ChevronUp className="w-4 h-4 text-center ml-1 text-gray-400" />
                <span>{t('sidebar.seeLess')}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-center ml-1 text-gray-400" />
                <span>{t('sidebar.seeAll')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

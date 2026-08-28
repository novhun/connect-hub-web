import React from 'react';
import { 
  Home, 
  Compass, 
  PlusSquare, 
  MessageSquare, 
  Phone, 
  Sparkles,
  Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePost: () => void;
  unreadNotifsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  unreadNotifsCount,
}) => {
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {/* Home */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'text-blue-600 font-bold scale-105'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('header.home')}</span>
      </button>

      {/* Explore */}
      <button
        onClick={() => setActiveTab('explore')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'explore'
            ? 'text-blue-600 font-bold scale-105'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('sidebar.explore')}</span>
      </button>

      {/* Create Post Action Button */}
      <button
        onClick={onOpenCreatePost}
        className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-500/30 border-2 border-white transition-transform active:scale-95 cursor-pointer"
        aria-label="Create Post"
      >
        <PlusSquare className="w-6 h-6" />
      </button>

      {/* Messages */}
      <button
        onClick={() => setActiveTab('messages')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
          activeTab === 'messages'
            ? 'text-blue-600 font-bold scale-105'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('header.messages')}</span>
      </button>

      {/* Calls */}
      <button
        onClick={() => setActiveTab('calls')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'calls'
            ? 'text-blue-600 font-bold scale-105'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Phone className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('sidebar.calls')}</span>
      </button>

      {/* Tech & Architecture */}
      <button
        onClick={() => setActiveTab('about')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          activeTab === 'about'
            ? 'text-indigo-600 font-bold scale-105'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <span className="text-[10px] mt-0.5">Info</span>
      </button>
    </nav>
  );
};

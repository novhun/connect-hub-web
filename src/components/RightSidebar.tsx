import React from 'react';
import { 
  Headphones, 
  Phone, 
  Video, 
  MessageSquare, 
  MoreHorizontal,
  Users
} from 'lucide-react';
import { Group, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface RightSidebarProps {
  activeTab?: string;
  managedGroups?: Group[];
  onlineMembers?: User[];
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
  onStartLiveChat?: () => void;
  onSelectGroup?: (group: Group) => void;
  onOpenDirectChat?: (user: User) => void;
  onOpenChat?: (user: User) => void;
  onSeeAllGroups?: () => void;
  onStartCall?: (user: User, type: 'audio' | 'video') => void;
  onOpenSupport?: (mode: 'audio' | 'video' | 'chat') => void;
  onViewProfile?: (userId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  activeTab = 'home',
  managedGroups = [],
  onlineMembers = [],
  onStartAudioCall,
  onStartVideoCall,
  onStartLiveChat,
  onSelectGroup,
  onOpenDirectChat,
  onOpenChat,
  onSeeAllGroups,
  onStartCall,
  onOpenSupport,
  onViewProfile,
}) => {
  const { t, language } = useLanguage();

  const handleAudioCall = () => {
    if (onStartAudioCall) onStartAudioCall();
    else if (onOpenSupport) onOpenSupport('audio');
    else if (onlineMembers.length > 0 && onStartCall) onStartCall(onlineMembers[0], 'audio');
  };

  const handleVideoCall = () => {
    if (onStartVideoCall) onStartVideoCall();
    else if (onOpenSupport) onOpenSupport('video');
    else if (onlineMembers.length > 0 && onStartCall) onStartCall(onlineMembers[0], 'video');
  };

  const handleLiveChat = () => {
    if (onStartLiveChat) onStartLiveChat();
    else if (onOpenSupport) onOpenSupport('chat');
    else if (onlineMembers.length > 0 && onOpenChat) onOpenChat(onlineMembers[0]);
  };

  const handleUserChat = (user: User) => {
    if (onOpenDirectChat) {
      onOpenDirectChat(user);
    } else if (onOpenChat) {
      onOpenChat(user);
    }
  };

  return (
    <aside
      id="right-sidebar"
      className="hidden xl:flex w-80 bg-white border-l border-gray-200 flex-col shrink-0 overflow-y-auto"
    >
      <div className="p-4 space-y-6">
        {/* BEGIN: Support Center Widget (Visible ONLY on About / Support page) */}
        {activeTab === 'about' && (
          <div
            id="support-widget"
            className="bg-[#eff6ff] rounded-2xl p-5 border border-blue-100/80 shadow-xs"
          >
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900 text-base mb-0.5 tracking-tight">
                {t('sidebar.supportCenter')}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {language === 'km' ? 'យើងនៅទីនេះដើម្បីជួយអ្នក' : "We're here to help you"}
              </p>
            </div>

            {/* Support Illustration Box */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-24 bg-[#dbeafe] rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
                <Headphones className="w-11 h-11 text-[#60a5fa]" />
              </div>
            </div>

            <div className="space-y-2">
              <button
                id="support-audio-call-btn"
                onClick={handleAudioCall}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#2563eb] font-semibold py-2 rounded-xl transition-all shadow-xs text-sm active:scale-[0.99] cursor-pointer"
              >
                <Phone className="w-4 h-4 text-green-500 fill-green-500" />
                <span>{t('sidebar.startAudioCall')}</span>
              </button>
              <button
                id="support-video-call-btn"
                onClick={handleVideoCall}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#2563eb] font-semibold py-2 rounded-xl transition-all shadow-xs text-sm active:scale-[0.99] cursor-pointer"
              >
                <Video className="w-4 h-4 text-blue-500 fill-blue-500" />
                <span>{t('sidebar.startVideoCall')}</span>
              </button>
              <button
                id="support-live-chat-btn"
                onClick={handleLiveChat}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#2563eb] font-semibold py-2 rounded-xl transition-all shadow-xs text-sm active:scale-[0.99] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                <span>{t('sidebar.liveChat')}</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-400 mt-3 font-medium">
              {language === 'km' ? 'ពេលវេលាឆ្លើយតបជាមធ្យម៖ ' : 'Average response time: '}
              <span className="text-[#2563eb] font-semibold">2m</span>
            </p>
          </div>
        )}
        {/* END: Support Center Widget */}

        {/* BEGIN: Groups You Manage */}
        {managedGroups && managedGroups.length > 0 && (
          <div id="managed-groups">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                {t('sidebar.managedGroups')}
              </h3>
            </div>
            <div className="space-y-2">
              {managedGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup?.(group)}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl -mx-2 transition-colors"
                >
                  <img
                    src={api.getMediaUrl(group.icon)}
                    alt={group.name}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {group.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {group.isPrivate 
                        ? (language === 'km' ? 'ក្រុមឯកជន' : 'Private Group') 
                        : (language === 'km' ? 'ក្រុមសាធារណៈ' : 'Public Group')} • {group.membersCount}
                    </p>
                  </div>
                </div>
              ))}

              {onSeeAllGroups && (
                <button
                  onClick={onSeeAllGroups}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {t('sidebar.seeAll')}
                </button>
              )}
            </div>
          </div>
        )}
        {/* END: Groups You Manage */}

        <hr className="border-gray-100" />

        {/* BEGIN: Online Members / Contacts */}
        <div id="online-members">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                {language === 'km' ? 'ទំនាក់ទំនង' : 'Contacts'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{onlineMembers.filter((m) => m.isOnline).length} {language === 'km' ? 'សកម្ម' : 'Online'}</span>
              </span>
            </div>
            {onlineMembers.length > 0 && (
              <button
                onClick={() => handleUserChat(onlineMembers[0])}
                className="text-xs text-[#2563eb] font-semibold hover:underline cursor-pointer"
              >
                {t('sidebar.seeAll')}
              </button>
            )}
          </div>

          <div className="space-y-1">
            {onlineMembers
              .slice()
              .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
              .map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleUserChat(member)}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl -mx-2 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={api.getMediaUrl(member.avatar)}
                        alt={member.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProfile?.(member.id);
                        }}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      />
                      {member.isOnline ? (
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs ring-1 ring-emerald-300/40"
                          title={language === 'km' ? 'សកម្ម (Online)' : 'Active now'}
                        />
                      ) : (
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 border-2 border-white rounded-full shadow-xs"
                          title={language === 'km' ? 'អសកម្ម (Offline)' : 'Offline'}
                        />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                        {member.name}
                      </span>
                      <span className={`text-[11px] truncate ${member.isOnline ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                        {member.isOnline
                          ? (language === 'km' ? 'សកម្មឥឡូវនេះ' : 'Active now')
                          : (language === 'km' ? 'ក្រៅបណ្ដាញ' : 'Offline')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onStartCall && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartCall(member, 'audio');
                        }}
                        className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                        title={language === 'km' ? 'ហៅជាសំឡេង' : 'Audio call'}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onStartCall && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartCall(member, 'video');
                        }}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                        title={language === 'km' ? 'ហៅជាវីដេអូ' : 'Video call'}
                      >
                        <Video className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile?.(member.id);
                      }}
                      className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                      aria-label="View profile"
                      title={language === 'km' ? 'មើលគណនី' : 'View profile'}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {/* END: Online Members / Contacts */}
      </div>
    </aside>
  );
};

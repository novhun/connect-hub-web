import React from 'react';
import { 
  Headphones, 
  Phone, 
  Video, 
  MessageSquare, 
  MoreHorizontal
} from 'lucide-react';
import { Group, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RightSidebarProps {
  managedGroups: Group[];
  onlineMembers: User[];
  onStartAudioCall: () => void;
  onStartVideoCall: () => void;
  onStartLiveChat: () => void;
  onSelectGroup: (group: Group) => void;
  onOpenDirectChat: (user: User) => void;
  onSeeAllGroups: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  managedGroups,
  onlineMembers,
  onStartAudioCall,
  onStartVideoCall,
  onStartLiveChat,
  onSelectGroup,
  onOpenDirectChat,
  onSeeAllGroups,
}) => {
  const { t, language } = useLanguage();

  return (
    <aside
      id="right-sidebar"
      className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto"
    >
      <div className="p-4 space-y-6">
        {/* BEGIN: Support Center Widget */}
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
              onClick={onStartAudioCall}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#2563eb] font-semibold py-2 rounded-xl transition-all shadow-xs text-sm active:scale-[0.99] cursor-pointer"
            >
              <Phone className="w-4 h-4 text-green-500 fill-green-500" />
              <span>{t('sidebar.startAudioCall')}</span>
            </button>
            <button
              id="support-video-call-btn"
              onClick={onStartVideoCall}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#2563eb] font-semibold py-2 rounded-xl transition-all shadow-xs text-sm active:scale-[0.99] cursor-pointer"
            >
              <Video className="w-4 h-4 text-blue-500 fill-blue-500" />
              <span>{t('sidebar.startVideoCall')}</span>
            </button>
            <button
              id="support-live-chat-btn"
              onClick={onStartLiveChat}
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
        {/* END: Support Center Widget */}

        {/* BEGIN: Groups You Manage */}
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
                onClick={() => onSelectGroup(group)}
                className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl -mx-2 transition-colors"
              >
                <img
                  src={group.icon}
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

            <button
              onClick={onSeeAllGroups}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {t('sidebar.seeAll')}
            </button>
          </div>
        </div>
        {/* END: Groups You Manage */}

        <hr className="border-gray-100" />

        {/* BEGIN: Online Members */}
        <div id="online-members">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              {t('sidebar.onlineFriends')}
            </h3>
            <button
              onClick={() => onOpenDirectChat(onlineMembers[0])}
              className="text-xs text-[#2563eb] font-semibold hover:underline cursor-pointer"
            >
              {t('sidebar.seeAll')}
            </button>
          </div>

          <div className="space-y-1">
            {onlineMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => onOpenDirectChat(member)}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl -mx-2 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDirectChat(member);
                  }}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  aria-label="Options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* END: Online Members */}
      </div>
    </aside>
  );
};

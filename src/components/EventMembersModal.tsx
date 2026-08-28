import React, { useState, useEffect } from 'react';
import { X, Search, Users, ShieldCheck, Loader2, MessageSquare, UserCheck, Calendar } from 'lucide-react';
import { EventItem, EventMember, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { eventsApi } from '../modules/events/api';

interface EventMembersModalProps {
  event: EventItem;
  currentUser: User;
  onClose: () => void;
  onSelectUser?: (user: User) => void;
  onStartChat?: (user: User) => void;
}

export const EventMembersModal: React.FC<EventMembersModalProps> = ({
  event,
  currentUser,
  onClose,
  onSelectUser,
  onStartChat,
}) => {
  const { t, language } = useLanguage();
  const [members, setMembers] = useState<EventMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getEventMembers(event.id);
        setMembers(data || []);
      } catch (err) {
        console.warn('Failed to load event members:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [event.id]);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                {t('events.eventMembers')}
              </h2>
              <p className="text-[11px] text-gray-400 truncate max-w-xs sm:max-w-sm font-medium">
                {event.title}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('events.searchMembers')}
              className="w-full bg-white border border-gray-200 rounded-full py-1.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-gray-50">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs">{language === 'km' ? 'កំពុងផ្ទុកបញ្ជីអ្នកចូលរួម...' : 'Loading attendees...'}</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-medium">{t('events.noMembersYet')}</p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isMe = member.userId === currentUser.id;
              return (
                <div 
                  key={member.id}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-gray-50/80 rounded-xl transition-colors"
                >
                  <div 
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (onSelectUser) {
                        onSelectUser({
                          id: member.userId,
                          name: member.name,
                          username: member.username,
                          avatar: member.avatar || '',
                          headline: member.headline,
                          isOnline: false,
                        });
                        onClose();
                      }
                    }}
                  >
                    <img 
                      src={api.getMediaUrl(member.avatar)} 
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" 
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{member.name}</span>
                        {member.isCreator && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                            👑 {t('events.organizer')}
                          </span>
                        )}
                        {isMe && (
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">({language === 'km' ? 'ខ្ញុំ' : 'You'})</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">@{member.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isMe && onStartChat && (
                      <button
                        onClick={() => {
                          onStartChat({
                            id: member.userId,
                            name: member.name,
                            username: member.username,
                            avatar: member.avatar || '',
                            isOnline: false,
                          });
                          onClose();
                        }}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title={language === 'km' ? 'ផ្ញើសារ' : 'Message'}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-[10px] text-green-700 bg-green-50 font-semibold px-2 py-0.5 rounded-full border border-green-200">
                      {t('events.attending')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>{filteredMembers.length} {t('events.attendees')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            {t('events.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

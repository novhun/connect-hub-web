import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, Image as ImageIcon, Smile, ArrowLeft } from 'lucide-react';
import { User, DirectMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { realtime, RealtimeMessage } from '../../services/realtime';

interface MessagesViewProps {
  onlineMembers: User[];
  currentUser: User;
  onStartCall: (user: User, type: 'audio' | 'video') => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  onlineMembers,
  currentUser,
  onStartCall,
}) => {
  const { t, language } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<User>(onlineMembers[0] || currentUser);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobileThreadActive, setIsMobileThreadActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from API whenever selected user changes
  const fetchMessages = async (userId: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await api.getMessages(userId);
      setMessages(data);
    } catch (e) {
      console.warn('Could not fetch messages from API, keeping local state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser?.id) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Live chat updates via the shared app-wide realtime connection (does not open
  // its own WebSocket — a second connection would replace the global one server-side).
  useEffect(() => {
    const unsubscribe = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === 'NEW_MESSAGE' && msg.message && msg.message.senderId === selectedUser?.id) {
        setMessages((prev) => [...prev, msg.message]);
      }
    });
    return unsubscribe;
  }, [selectedUser?.id]);

  const handleSelectMember = (member: User) => {
    setSelectedUser(member);
    setIsMobileThreadActive(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser?.id) return;

    const text = inputText.trim();
    setInputText('');

    // Optimistic message update
    const tempMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const serverMsg = await api.sendMessage(selectedUser.id, text);
      if (serverMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? serverMsg : m))
        );
      }
    } catch (e) {
      console.warn('Message send failed on API:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[75vh] sm:h-[78vh]">
      {/* Left conversation list */}
      <div className={`${isMobileThreadActive ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-200 flex-col`}>
        <div className="p-3.5 sm:p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-2.5">{t('messages.chats')}</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('messages.searchMessenger')}
              className="w-full bg-gray-100 rounded-full py-1.5 pl-9 pr-3 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {onlineMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => handleSelectMember(member)}
              className={`p-3 sm:p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                selectedUser?.id === member.id ? 'bg-blue-50/70' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <img
                  src={api.getMediaUrl(member.avatar)}
                  alt={member.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-200"
                />
                {member.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{member.name}</h4>
                <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                  {t('messages.startConversation')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right chat thread */}
      <div className={`${!isMobileThreadActive ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#f8fafc]`}>
        {/* Chat header */}
        <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Back Button */}
            <button
              onClick={() => setIsMobileThreadActive(false)}
              className="md:hidden p-1.5 -ml-1 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <img
                src={api.getMediaUrl(selectedUser?.avatar)}
                alt={selectedUser?.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
              />
              {selectedUser?.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-gray-900">{selectedUser?.name}</h3>
              <p className="text-[11px] text-green-600 font-medium">{t('messages.activeNow')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onStartCall(selectedUser, 'audio')}
              className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors cursor-pointer"
              title={t('messages.audioCall')}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStartCall(selectedUser, 'video')}
              className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors cursor-pointer"
              title={t('messages.videoCall')}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message history */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
          {loading && messages.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No messages yet. Say hello to {selectedUser?.name}! 👋
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${
                  msg.isMe ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {!msg.isMe && (
                  <img
                    src={api.getMediaUrl(selectedUser?.avatar)}
                    alt={selectedUser?.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 mt-1"
                  />
                )}
                <div>
                  <div
                    className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm ${
                      msg.isMe
                        ? 'bg-[#2563eb] text-white rounded-br-xs'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-2.5 sm:p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${t('messages.typeMessage')} (${selectedUser?.name || 'User'})`}
            className="flex-1 bg-gray-100 focus:bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 sm:p-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-full transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import { User, DirectMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

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
  const [selectedUser, setSelectedUser] = useState<User>(onlineMembers[0]);
  const [inputText, setInputText] = useState('');
  const [conversations, setConversations] = useState<{ [userId: string]: DirectMessage[] }>({
    [onlineMembers[0].id]: [
      { 
        id: '1', 
        senderId: onlineMembers[0].id, 
        text: language === 'km' 
          ? "សួស្តី សុគន្ធ! ខ្ញុំពិតជាពេញចិត្ត prototype ចុងក្រោយដែលអ្នកបានចែករំលែកនៅក្នុងក្រុម UI/UX Designers ណាស់។" 
          : "Hey Sokun! Loved the latest prototype you shared in UI/UX Designers.", 
        timestamp: '10:30 AM', 
        isMe: false 
      },
      { 
        id: '2', 
        senderId: currentUser.id, 
        text: language === 'km' 
          ? "អរគុណ តារា! អរគុណសម្រាប់ការផ្តល់មតិ។ តោះយើងបន្តកែលម្អ stories carousel tokens បន្តទៀត។" 
          : "Thanks Dara! Appreciate the feedback. Let's iterate on the stories carousel tokens next.", 
        timestamp: '10:32 AM', 
        isMe: true 
      },
      { 
        id: '3', 
        senderId: onlineMembers[0].id, 
        text: language === 'km' 
          ? "យល់ព្រម! តោះយើងធ្វើការហៅជាសំឡេងខ្លីមួយនៅពេលដែលអ្នកទំនេរ។" 
          : "Sounds like a plan! Let's do a quick audio call when you're free.", 
        timestamp: '10:35 AM', 
        isMe: false 
      }
    ],
    [onlineMembers[1].id]: [
      { 
        id: '4', 
        senderId: onlineMembers[1].id, 
        text: language === 'km' 
          ? "សួស្តី! ការដាក់ពង្រាយ Cloud Run បានបញ្ចប់យ៉ាងរលូនជាមួយ Vite & Tailwind CSS។" 
          : "Hey! The Cloud Run deploy completed smoothly with Vite & Tailwind CSS.", 
        timestamp: language === 'km' ? 'ម្សិលមិញ' : 'Yesterday', 
        isMe: false 
      },
      { 
        id: '5', 
        senderId: currentUser.id, 
        text: language === 'km' 
          ? "ការងារល្អណាស់ វីរៈ! ល្បឿនដំណើរការមើលទៅលឿនខ្លាំងណាស់។" 
          : "Awesome work Vireak! Performance looks lightning fast.", 
        timestamp: language === 'km' ? 'ម្សិលមិញ' : 'Yesterday', 
        isMe: true 
      }
    ],
  });

  const activeMessages = conversations[selectedUser.id] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setConversations((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMsg],
    }));
    setInputText('');

    setTimeout(() => {
      setConversations((prev) => ({
        ...prev,
        [selectedUser.id]: [
          ...(prev[selectedUser.id] || []),
          {
            id: `reply-${Date.now()}`,
            senderId: selectedUser.id,
            text: language === 'km' ? "ទទួលបានហើយ! អរគុណដែលបានប្រាប់ 👍" : "Got it! Thanks for keeping me in the loop 👍",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
          }
        ],
      }));
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[78vh]">
      {/* Left conversation list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-3">{t('messages.chats')}</h2>
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
              onClick={() => setSelectedUser(member)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                selectedUser.id === member.id ? 'bg-blue-50/70' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-11 h-11 rounded-full object-cover border border-gray-200"
                />
                {member.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">{member.name}</h4>
                <p className="text-xs text-gray-500 truncate">
                  {conversations[member.id]?.slice(-1)[0]?.text || t('messages.startConversation')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right chat thread */}
      <div className="flex-1 flex flex-col bg-[#f8fafc]">
        {/* Chat header */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              {selectedUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">{selectedUser.name}</h3>
              <p className="text-xs text-green-600 font-medium">{t('messages.activeNow')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[75%] ${
                msg.isMe ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {!msg.isMe && (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                />
              )}
              <div>
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    msg.isMe
                      ? 'bg-[#2563eb] text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 block mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${t('messages.typeMessage')} (${selectedUser.name})`}
            className="flex-1 bg-gray-100 focus:bg-white text-sm text-gray-800 placeholder-gray-400 rounded-full px-4 py-2.5 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-full transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

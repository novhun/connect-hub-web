import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Send, Phone, Video, Smile, MoreVertical } from 'lucide-react';
import { User, DirectMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { realtime, RealtimeMessage } from '../services/realtime';

interface ChatFloatingWindowProps {
  targetUser?: User;
  recipient?: User;
  currentUser?: User;
  onClose: () => void;
  onStartCall: (user: User, type: 'audio' | 'video') => void;
}

export const ChatFloatingWindow: React.FC<ChatFloatingWindowProps> = ({
  targetUser,
  recipient: propRecipient,
  currentUser,
  onClose,
  onStartCall,
}) => {
  const recipient = targetUser || propRecipient!;
  const { t, language } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipient?.id) {
      api.getMessages(recipient.id)
        .then((msgs) => setMessages(msgs || []))
        .catch((e) => console.warn('Load messages API notice:', e));
    }
  }, [recipient?.id]);

  // Live delivery via the shared app-wide realtime connection.
  useEffect(() => {
    const unsubscribe = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === 'NEW_MESSAGE' && msg.message && msg.message.senderId === recipient?.id) {
        setMessages((prev) => [...prev, msg.message]);
      }
    });
    return unsubscribe;
  }, [recipient?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const newMsg: DirectMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUser?.id || 'me',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      const saved = await api.sendMessage(recipient.id, userText);
      if (saved) {
        setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? saved : m)));
      }
    } catch (e) {
      console.warn('Send message API notice:', e);
    }
  };

  if (!recipient) return null;

  return (
    <div 
      className="fixed bottom-16 sm:bottom-4 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-80 max-w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Header */}
      <div 
        className="bg-white border-b border-gray-100 p-3 flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/80 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={api.getMediaUrl(recipient.avatar)}
              alt={recipient.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            {recipient.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 leading-tight">{recipient.name}</h4>
            <span className="text-[10px] text-green-600 font-medium">{language === 'km' ? 'កំពុងដំណើរការ' : 'Active now'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartCall(recipient, 'audio');
            }}
            className="p-1 hover:text-blue-600 rounded hover:bg-gray-100 cursor-pointer"
            title="Audio call"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartCall(recipient, 'video');
            }}
            className="p-1 hover:text-blue-600 rounded hover:bg-gray-100 cursor-pointer"
            title="Video call"
          >
            <Video className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:text-gray-600 rounded hover:bg-gray-100 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:text-gray-600 rounded hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body & Footer (Hidden when minimized) */}
      {!isMinimized && (
        <>
          {/* Messages Stream */}
          <div className="h-64 sm:h-72 overflow-y-auto p-3 space-y-2.5 bg-[#f8fafc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.isMe
                      ? 'bg-[#2563eb] text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 text-gray-400 text-[10px] italic">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-100 bg-white flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`${t('messages.typeMessage')}...`}
              className="flex-1 bg-gray-100 border-none rounded-full py-1.5 px-3 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 text-white rounded-full transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Send, Phone, Video, Smile, MoreVertical } from 'lucide-react';
import { User, DirectMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ChatFloatingWindowProps {
  recipient: User;
  onClose: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
}

export const ChatFloatingWindow: React.FC<ChatFloatingWindowProps> = ({
  recipient,
  onClose,
  onStartCall,
}) => {
  const { t, language } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([
    {
      id: 'm-1',
      senderId: recipient.id,
      text: language === 'km' 
        ? `សួស្តី សុគន្ធ! ប្រាប់ខ្ញុំបានប្រសិនបើអ្នកត្រូវការការផ្តល់យោបល់លើការរចនាចុងក្រោយ។`
        : `Hey Sokun! Let me know if you need feedback on the recent mockups.`,
      timestamp: '2:15 PM',
      isMe: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMsg: DirectMessage = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulated reply from friend
    setTimeout(() => {
      let reply = language === 'km' ? "អស្ចារ្យណាស់! ចាំបន្តិចទៀតយើងពិភាក្សាគ្នាបន្ថែម។" : "Sounds great! Let's catch up on that shortly.";
      if (userText.toLowerCase().includes('hike') || userText.toLowerCase().includes('photo') || userText.toLowerCase().includes('រូប')) {
        reply = language === 'km' 
          ? "ពិតជាស្រស់ស្អាតណាស់! ទេសភាពភ្នំមើលទៅពិតជាអស្ចារ្យ។ ចុងសប្តាហ៍ក្រោយយើងគួរតែទៅទាំងអស់គ្នា!"
          : "Yes! The mountain scenery was unbelievable. We should go together next weekend!";
      } else if (userText.toLowerCase().includes('design') || userText.toLowerCase().includes('figma') || userText.toLowerCase().includes('រចនា')) {
        reply = language === 'km'
          ? "ខ្ញុំបានពិនិត្យមើល Design Tokens ហើយឋានានុក្រមមើលទៅពិតជាស្អាត និងមានរបៀបរៀបរយល្អណាស់!"
          : "I checked the design tokens and the hierarchy looks super clean!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now() + 1}`,
          senderId: recipient.id,
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div 
      className="fixed bottom-4 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Header */}
      <div 
        className="bg-white border-b border-gray-100 p-3 flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/80 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={recipient.avatar}
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
              onStartCall('audio');
            }}
            className="p-1 hover:text-blue-600 rounded hover:bg-gray-100 cursor-pointer"
            title="Audio call"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartCall('video');
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
            className="p-1 hover:text-red-500 rounded hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body & Messages */}
      {!isMinimized && (
        <>
          <div className="h-64 p-3 overflow-y-auto space-y-2 bg-[#f0f2f5]/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-1.5 max-w-[82%] ${
                  m.isMe ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {!m.isMe && (
                  <img
                    src={recipient.avatar}
                    alt={recipient.name}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200 mt-1 shrink-0"
                  />
                )}
                <div>
                  <div
                    className={`p-2.5 rounded-2xl ${
                      m.isMe
                        ? 'bg-[#2563eb] text-white rounded-br-xs font-normal'
                        : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-gray-400 block mt-0.5 px-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <img
                  src={recipient.avatar}
                  alt={recipient.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <div className="bg-white border border-gray-200 px-2 py-1 rounded-full flex gap-1 items-center shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-100 bg-white flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Aa"
              className="flex-1 bg-gray-100 focus:bg-white text-xs text-gray-800 placeholder-gray-400 rounded-full px-3 py-2 border-none outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

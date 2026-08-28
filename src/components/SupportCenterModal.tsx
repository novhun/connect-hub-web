import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supportApi } from '../modules/calls/api';
import { SupportMessage } from '../types';

interface SupportCenterModalProps {
  mode: 'chat';
  onClose: () => void;
}

export const SupportCenterModal: React.FC<SupportCenterModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supportApi
      .getMessages()
      .then(setMessages)
      .catch((e) => console.warn('Load support history API notice:', e))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatInput('');
    setIsAgentTyping(true);

    try {
      const { userMessage, assistantMessage } = await supportApi.sendMessage(text);
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
    } catch (err) {
      console.warn('Send support message API notice:', err);
    } finally {
      setIsAgentTyping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {language === 'km' ? 'ជំនួយស្វ័យប្រវត្តិ ConnectHub' : 'ConnectHub Assistant'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500">
                {language === 'km' ? 'ការឆ្លើយតបជាស្វ័យប្រវត្តិ • ២៤/៧' : 'Automated help • Available 24/7'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat body */}
        <div className="flex flex-col h-96">
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                {language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading...'}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                      <Headphones className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#2563eb] text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}

            {isAgentTyping && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-200 p-2.5 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input bar */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={language === 'km' ? 'វាយសំណួររបស់អ្នកនៅទីនេះ...' : 'Type your question...'}
              className="flex-1 bg-gray-100 focus:bg-white text-sm text-gray-800 placeholder-gray-400 rounded-xl px-3.5 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

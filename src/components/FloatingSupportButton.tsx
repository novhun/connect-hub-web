import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Phone, Video, MessageSquare, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FloatingSupportButtonProps {
  onOpenSupport: (mode: 'audio' | 'video' | 'chat') => void;
}

export const FloatingSupportButton: React.FC<FloatingSupportButtonProps> = ({
  onOpenSupport,
}) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="xl:hidden fixed bottom-20 right-4 z-40">
      {/* Quick Action Popup Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 space-y-2 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 px-1">
            <span className="text-xs font-bold text-gray-900">
              {language === 'km' ? 'មជ្ឈមណ្ឌលជំនួយ' : 'Support Center'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSupport('chat');
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">{language === 'km' ? 'ការជជែកផ្ទាល់' : 'Live Chat'}</p>
              <p className="text-[10px] text-gray-400">{language === 'km' ? 'ឆ្លើយតបក្នុង ២ នាទី' : 'Avg 2m response'}</p>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSupport('audio');
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">{language === 'km' ? 'ការហៅជាសំឡេង' : 'Audio Support'}</p>
              <p className="text-[10px] text-gray-400">{language === 'km' ? 'ជំនួយផ្ទាល់មាត់' : 'Voice assistance'}</p>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSupport('video');
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">{language === 'km' ? 'ការហៅជាវីដេអូ' : 'Video Room'}</p>
              <p className="text-[10px] text-gray-400">{language === 'km' ? 'ចែករំលែកអេក្រង់' : 'HD Screen sharing'}</p>
            </div>
          </button>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
        aria-label="Open support center"
      >
        <Headphones className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    </div>
  );
};

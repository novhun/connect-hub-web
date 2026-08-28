import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play } from 'lucide-react';
import { Story, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  currentUser: User;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  onClose,
  currentUser,
}) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    setHasLiked(false);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((curr) => curr + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1.25;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyText('');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4 select-none backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50 cursor-pointer"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Container */}
      <div 
        className="relative w-full max-w-sm h-[82vh] max-h-[720px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Story Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{ backgroundImage: `url(${currentStory.storyImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
        </div>

        {/* Top Header: Progress bars & User profile */}
        <div className="relative z-10 p-3.5 space-y-2">
          {/* Progress Indicators */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Details */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.userName}
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-xs"
              />
              <div>
                <h4 className="text-white font-semibold text-sm leading-tight drop-shadow-sm">
                  {currentStory.userName}
                </h4>
                <p className="text-gray-300 text-[11px] font-medium">
                  {currentStory.timestamp}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-black/30 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Tap areas for Previous / Next */}
        <div className="relative z-10 flex-1 flex">
          <div 
            className="w-1/3 h-full cursor-pointer"
            onClick={handlePrev}
            title="Previous Story"
          />
          <div 
            className="w-2/3 h-full cursor-pointer"
            onClick={handleNext}
            title="Next Story"
          />
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="relative z-10 px-4 py-2 text-center">
            <p className="text-white text-sm font-medium drop-shadow-sm bg-black/40 backdrop-blur-xs py-1.5 px-3 rounded-full inline-block">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Bottom Bar: Reply form & Reactions */}
        <div className="relative z-10 p-3 pt-1 flex items-center gap-2">
          <form onSubmit={handleSendReply} className="flex-1 relative">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              placeholder={t('modals.replyTo', { name: currentStory.userName })}
              className="w-full bg-white/20 hover:bg-white/30 focus:bg-white/30 backdrop-blur-md text-white placeholder-white/70 text-sm rounded-full py-2.5 pl-4 pr-10 border border-white/20 outline-none"
            />
            {replyText && (
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-1 hover:text-blue-400"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          <button
            onClick={() => setHasLiked(!hasLiked)}
            className={`p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-125 ${
              hasLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Side navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import { Story, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatNotificationTimestamp } from '../utils/notificationHelpers';
import { api } from '../services/api';
import { isVideoFile } from '../utils/mediaHelpers';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  currentUser?: User;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  onClose,
  currentUser,
}) => {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStory = stories[currentIndex];
  const isVideo = isVideoFile(currentStory?.storyImage || '');
  const viewCount = 18 + ((currentIndex * 7 + 13) % 45);

  useEffect(() => {
    setProgress(0);
    setHasLiked(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPaused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  // Video play/pause effect
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused]);

  // Photo timer progression (only if not a video)
  useEffect(() => {
    if (isVideo || isPaused) return;

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
  }, [currentIndex, isPaused, isVideo, stories.length, onClose]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

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

  if (!currentStory) return null;

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
        className="relative w-full max-w-sm h-[84vh] max-h-[740px] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Story Content (Video or Image) */}
        {isVideo ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={api.getMediaUrl(currentStory.storyImage)}
              playsInline
              autoPlay
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleNext}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
          </div>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
            style={{ backgroundImage: `url(${api.getMediaUrl(currentStory.storyImage)})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
          </div>
        )}

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
                src={api.getMediaUrl(currentStory.userAvatar)}
                alt={currentStory.userName}
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-xs"
              />
              <div>
                <h4 className="text-white font-semibold text-sm leading-tight drop-shadow-sm flex items-center gap-1.5">
                  <span>{currentStory.userName}</span>
                </h4>
                <div className="flex items-center gap-2 text-gray-300 text-[11px] font-medium">
                  <span>{formatNotificationTimestamp(currentStory.timestamp, language)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-blue-300">
                    <Eye className="w-3 h-3" />
                    <span>{viewCount}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons: Play/Pause, Mute/Unmute */}
            <div className="flex items-center gap-1">
              {isVideo && (
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-black/40 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? t('modals.playStory') : t('modals.pauseStory')}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-black/40 transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Center: Tap areas for Previous / Next */}
        <div className="relative z-10 flex-1 flex">
          <div 
            className="w-1/3 h-full cursor-pointer"
            onClick={handlePrev}
            title={t('modals.previousStory')}
          />
          <div 
            className="w-2/3 h-full cursor-pointer"
            onClick={handleNext}
            title={t('modals.nextStory')}
          />
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="relative z-10 px-4 py-2 text-center">
            <p className="text-white text-sm font-medium drop-shadow-sm bg-black/50 backdrop-blur-xs py-1.5 px-3.5 rounded-full inline-block max-w-[90%]">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-1 hover:text-blue-400 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          <button
            onClick={() => setHasLiked(!hasLiked)}
            className={`p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-125 cursor-pointer ${
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
            title={t('modals.previousStory')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            title={t('modals.nextStory')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

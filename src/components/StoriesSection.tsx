import React, { useRef } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Story, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatNotificationTimestamp } from '../utils/notificationHelpers';
import { api } from '../services/api';

interface StoriesSectionProps {
  currentUser: User;
  stories: Story[];
  onOpenCreateStory: () => void;
  onViewStory: (story: Story, index: number) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  currentUser,
  stories,
  onOpenCreateStory,
  onViewStory,
}) => {
  const { t, language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'right' ? 220 : -220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="stories-carousel"
      className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100/70"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-bold text-gray-800 tracking-tight">{t('home.stories')}</h2>
        <button 
          onClick={() => onViewStory(stories[0], 0)}
          className="text-sm text-[#2563eb] font-semibold hover:underline cursor-pointer"
        >
          {t('sidebar.seeAll')}
        </button>
      </div>

      <div className="relative group/carousel">
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-none relative scroll-smooth"
        >
          {/* Create Story Card */}
          <div
            id="create-story-card"
            onClick={onOpenCreateStory}
            className="w-28 h-44 rounded-xl shrink-0 relative overflow-hidden group cursor-pointer border border-gray-200 shadow-xs bg-white select-none hover:shadow-md transition-all"
          >
            <img
              src={api.getMediaUrl(currentUser.avatar)}
              alt="Your Story"
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white flex flex-col items-center justify-end pb-2">
              <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center border-4 border-white absolute -top-4 shadow-xs group-hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 text-center px-1 truncate w-full">{t('home.createStory')}</span>
            </div>
          </div>

          {/* User Stories */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              onClick={() => onViewStory(story, index)}
              className="w-28 h-44 rounded-xl shrink-0 story-card-bg cursor-pointer group shadow-xs overflow-hidden select-none relative hover:shadow-md transition-all"
              style={{ backgroundImage: `url(${api.getMediaUrl(story.storyImage)})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 story-overlay rounded-xl group-hover:bg-black/30 transition-colors" />

              {/* Avatar on Top Left */}
              <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-[#3b82f6] overflow-hidden shadow-xs ring-1 ring-white/50">
                <img
                  src={api.getMediaUrl(story.userAvatar)}
                  alt={story.userName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Author & Time on Bottom */}
              <div className="absolute bottom-2.5 left-2.5 right-2 text-white drop-shadow-md">
                <p className="text-sm font-semibold leading-tight truncate">
                  {story.userName}
                </p>
                <p className="text-[10px] text-gray-200 font-medium">
                  {formatNotificationTimestamp(story.timestamp, language)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Next Button */}
        <button
          id="stories-scroll-right-btn"
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 backdrop-blur-xs rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:scale-105 z-10 border border-gray-200 mr-1 transition-all opacity-90 hover:opacity-100 cursor-pointer"
          aria-label="Next stories"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

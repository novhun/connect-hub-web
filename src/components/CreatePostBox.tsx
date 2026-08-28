import React from 'react';
import { Image as ImageIcon, Smile, MapPin, MoreHorizontal } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CreatePostBoxProps {
  currentUser: User;
  onOpenCreatePost: (initialType?: 'photo' | 'feeling' | 'location') => void;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({
  currentUser,
  onOpenCreatePost,
}) => {
  const { t } = useLanguage();

  return (
    <section 
      id="create-post-box"
      className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100/70"
    >
      <div className="flex gap-3 mb-4">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0"
        />
        <div className="flex-1">
          <input
            id="create-post-quick-input"
            onClick={() => onOpenCreatePost()}
            readOnly
            type="text"
            placeholder={t('home.whatsOnYourMind', { name: currentUser.name })}
            className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors border-none rounded-full py-2.5 px-4 text-sm text-gray-800 placeholder-gray-500 focus:ring-0 cursor-pointer outline-none select-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 px-1">
        <button
          id="btn-quick-photo"
          onClick={() => onOpenCreatePost('photo')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 py-2 px-3 rounded-xl transition-colors cursor-pointer"
        >
          <ImageIcon className="w-5 h-5 text-green-500" />
          <span>{t('home.photoVideo')}</span>
        </button>

        <button
          id="btn-quick-feeling"
          onClick={() => onOpenCreatePost('feeling')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 py-2 px-3 rounded-xl transition-colors cursor-pointer"
        >
          <Smile className="w-5 h-5 text-yellow-500" />
          <span>{t('home.feelingActivity')}</span>
        </button>

        <button
          id="btn-quick-location"
          onClick={() => onOpenCreatePost('location')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 py-2 px-3 rounded-xl transition-colors cursor-pointer"
        >
          <MapPin className="w-5 h-5 text-red-500" />
          <span>{t('home.checkIn')}</span>
        </button>

        <button
          id="btn-quick-more"
          onClick={() => onOpenCreatePost()}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          aria-label="More post options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

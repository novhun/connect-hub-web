import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload, Loader2 } from 'lucide-react';
import { Story, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface CreateStoryModalProps {
  currentUser: User;
  onClose: () => void;
  onAddStory: (newStory: Story) => void;
}

const SAMPLE_STORY_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  currentUser,
  onClose,
  onAddStory,
}) => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(SAMPLE_STORY_BACKGROUNDS[0]);
  const [caption, setCaption] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const imageToUse = customUrl.trim() || selectedImage;
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      storyImage: imageToUse,
      timestamp: language === 'km' ? 'ទើបតែមុននេះ' : 'Just now',
      caption: caption.trim() || undefined,
    };
    onAddStory(newStory);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const res = await api.uploadMedia(file);
        if (res?.url) {
          setSelectedImage(api.getMediaUrl(res.url));
          setCustomUrl('');
        }
      } catch (_) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSelectedImage(reader.result);
            setCustomUrl('');
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const activeDisplayImage = customUrl.trim() || selectedImage;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">{t('modals.createStoryTitle')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3.5 sm:space-y-4">
            {/* Story Card Live Preview */}
            <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden shadow-inner border border-gray-200 flex flex-col justify-between p-3 sm:p-3.5 group bg-gray-900">
              <img
                src={activeDisplayImage}
                alt="Story preview"
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75 pointer-events-none" />

              {/* Creator info badge */}
              <div className="relative z-10 flex items-center gap-2">
                <img
                  src={api.getMediaUrl(currentUser.avatar)}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <span className="text-white text-xs font-bold drop-shadow-md">{currentUser.name}</span>
              </div>

              {/* Caption preview */}
              <div className="relative z-10">
                {caption && (
                  <p className="text-white text-xs bg-black/50 p-2.5 rounded-lg backdrop-blur-xs font-medium line-clamp-2">
                    {caption}
                  </p>
                )}
              </div>
            </div>

            {/* Caption Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">{t('modals.addCaption')}</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('modals.captionPlaceholder')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Photo background choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">{t('modals.chooseBackground')}</label>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_STORY_BACKGROUNDS.map((bg, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(bg);
                      setCustomUrl('');
                    }}
                    className={`h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage === bg && !customUrl
                        ? 'border-blue-600 ring-2 ring-blue-600/30'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={bg} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Custom Image Upload or URL */}
              <div className="pt-2 flex items-center gap-2">
                <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                  )}
                  <span>{isUploading ? (language === 'km' ? 'កំពុងបញ្ចូល...' : 'Uploading...') : t('modals.uploadImage')}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={t('modals.orImageURL')}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              {isUploading ? (language === 'km' ? 'កំពុងដំណើរការ...' : 'Uploading...') : t('modals.shareToStory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Smile, 
  MapPin, 
  Globe, 
  Lock, 
  Users, 
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import { Post, User, Group } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onAddPost: (newPost: Post) => void;
  initialType?: 'photo' | 'feeling' | 'location';
  groups: Group[];
}

const PRESET_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onAddPost,
  initialType,
  groups,
}) => {
  const { t, language } = useLanguage();
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [feeling, setFeeling] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [showFeelingPicker, setShowFeelingPicker] = useState(initialType === 'feeling');
  const [showLocationInput, setShowLocationInput] = useState(initialType === 'location');
  const [showPhotoSection, setShowPhotoSection] = useState(initialType === 'photo');

  const FEELINGS = language === 'km' ? [
    '😊 មានអារម្មណ៍សប្បាយរីករាយ',
    '⛰️ មានអារម្មណ៍ផ្សងព្រេង',
    '☕ មានអារម្មណ៍ស្រស់ស្រាយ',
    '💻 កំពុងសរសេរកូដយ៉ាងជក់ចិត្ត',
    '🚀 រំភើបខ្លាំង',
    '🎨 កំពុងរចនា',
  ] : [
    '😊 Feeling Happy',
    '⛰️ Feeling Adventurous',
    '☕ Feeling Relaxed',
    '💻 Coding Passionately',
    '🚀 Excited',
    '🎨 Designing',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: currentUser,
      timestamp: language === 'km' ? 'ទើបតែមុននេះ' : 'Just now',
      privacy,
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      feeling: feeling || undefined,
      location: location || undefined,
      taggedGroup: selectedGroup || undefined,
      reactionCounts: {
        like: 1,
        love: 0,
        care: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
    };

    onAddPost(newPost);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddSampleImage = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{t('modals.createPostTitle')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Author info & Privacy Picker */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full border border-gray-200 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{currentUser.name}</span>
                {feeling && (
                  <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 font-medium">
                    {feeling}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {/* Privacy select */}
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="bg-gray-100 hover:bg-gray-200 border-none text-xs font-semibold text-gray-700 py-1 px-2.5 rounded-lg outline-none cursor-pointer"
                >
                  <option value="public">{t('modals.publicOption')}</option>
                  <option value="friends">{t('modals.friendsOption')}</option>
                  <option value="only_me">{t('modals.onlyMeOption')}</option>
                </select>

                {/* Group select */}
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-gray-100 hover:bg-gray-200 border-none text-xs font-semibold text-gray-700 py-1 px-2.5 rounded-lg outline-none cursor-pointer"
                >
                  <option value="">{t('modals.postToMainFeed')}</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder={t('home.whatsOnYourMind', { name: currentUser.name })}
            className="w-full text-base placeholder-gray-400 text-gray-800 border-none resize-none focus:ring-0 outline-none p-1"
            autoFocus
          />

          {/* Location Tag */}
          {showLocationInput && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('modals.whereAreYou')}
                className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
              />
              <button 
                type="button" 
                onClick={() => { setLocation(''); setShowLocationInput(false); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Feeling Selection Tray */}
          {showFeelingPicker && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">{t('modals.selectFeeling')}</span>
                <button type="button" onClick={() => setShowFeelingPicker(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FEELINGS.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFeeling(f);
                      setShowFeelingPicker(false);
                    }}
                    className={`text-xs py-1.5 px-3 rounded-full border transition-colors cursor-pointer ${
                      feeling === f ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photo Section */}
          {(showPhotoSection || images.length > 0) && (
            <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">{t('modals.attachPhotos')}</span>
                <button type="button" onClick={() => setShowPhotoSection(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Uploaded Photos Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden group border border-gray-200">
                      <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Preset Photos to quickly click */}
              <div>
                <span className="text-[11px] text-gray-500 font-medium block mb-1.5">{t('modals.pickHighRes')}</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_SAMPLE_PHOTOS.map((sample, idx) => (
                    <img
                      key={idx}
                      src={sample}
                      alt="preset"
                      onClick={() => handleAddSampleImage(sample)}
                      className="w-16 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 border border-gray-200 hover:scale-105 transition-all shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* File upload input */}
              <label className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>{t('modals.uploadPhotosFromPC')}</span>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Add to Post Quick Tool Bar */}
          <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <span className="text-xs font-bold text-gray-700">{t('modals.addToPost')}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPhotoSection(!showPhotoSection)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-green-500 transition-colors cursor-pointer"
                title="Photo/Video"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-yellow-500 transition-colors cursor-pointer"
                title="Feeling/Activity"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-red-500 transition-colors cursor-pointer"
                title="Check In"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim() && images.length === 0}
            className={`w-full py-2.5 font-semibold text-sm rounded-xl transition-all shadow-xs ${
              content.trim() || images.length > 0
                ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white cursor-pointer active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t('modals.postButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

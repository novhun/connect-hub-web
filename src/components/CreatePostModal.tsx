import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Video,
  Film,
  Smile, 
  MapPin, 
  Globe, 
  Lock, 
  Users, 
  Sparkles, 
  Plus, 
  Trash2, 
  Loader2
} from 'lucide-react';
import { Post, User, Group } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { isVideoFile } from '../utils/mediaHelpers';

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
  const [isUploading, setIsUploading] = useState(false);
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
        like: 0,
        love: 0,
        care: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      },
      userReaction: null,
      comments: [],
      sharesCount: 0,
    };

    onAddPost(newPost);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setIsUploading(true);
      const files: File[] = Array.from(fileList);
      for (const file of files) {
        try {
          const res = await api.uploadMedia(file);
          if (res?.url) {
            setImages((prev) => [...prev, api.getMediaUrl(res.url)]);
          }
        } catch (_) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setImages((prev) => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
      setIsUploading(false);
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
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">
            {language === 'km' ? 'បង្កើតការបង្ហោះ' : 'Create Post'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3.5 sm:space-y-4">
            {/* User Profile Info + Privacy */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <img
                src={api.getMediaUrl(currentUser.avatar)}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover border border-gray-100"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{currentUser.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {/* Privacy Selector */}
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full border-none outline-none font-medium flex items-center gap-1 cursor-pointer focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="public">{language === 'km' ? 'សាធារណៈ' : 'Public'}</option>
                    <option value="friends">{language === 'km' ? 'មិត្តភក្តិ' : 'Friends'}</option>
                    <option value="only_me">{language === 'km' ? 'តែខ្ញុំប៉ុណ្ណោះ' : 'Only Me'}</option>
                  </select>

                  {/* Tag Group */}
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full border-none outline-none font-medium flex items-center gap-1 cursor-pointer focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">{language === 'km' ? 'ទូទៅ (កាលប្បវត្តិ)' : 'General (Timeline)'}</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                language === 'km'
                  ? `តើអ្នកកំពុងគិតអ្វីដែរ, ${currentUser.name}?`
                  : `What's on your mind, ${currentUser.name}?`
              }
              className="w-full text-base placeholder-gray-400 border-none outline-none resize-none min-h-[110px] text-gray-800 focus:ring-0 p-0"
              autoFocus
            />

            {/* Extra tags badge display */}
            {(feeling || location) && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                {feeling && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs rounded-full border border-amber-200/60 font-medium">
                    <span>{feeling}</span>
                    <button type="button" onClick={() => setFeeling('')} className="hover:text-amber-950 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200/60 font-medium">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{location}</span>
                    <button type="button" onClick={() => setLocation('')} className="hover:text-red-950 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Location Input Accordion */}
            {showLocationInput && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 animate-in fade-in duration-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={language === 'km' ? 'តើអ្នកនៅឯណា?' : 'Where are you?'}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationInput(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Feeling Picker Accordion */}
            {showFeelingPicker && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {language === 'km' ? 'ជ្រើសរើសអារម្មណ៍ / សកម្មភាព' : 'Select Feeling / Activity'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFeelingPicker(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {FEELINGS.map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => {
                        setFeeling(feel);
                        setShowFeelingPicker(false);
                      }}
                      className="text-left text-xs p-2 rounded-lg bg-white hover:bg-amber-50 text-gray-800 border border-gray-100 transition-colors cursor-pointer"
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Upload & Selected Previews */}
            {showPhotoSection && (
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-green-600" />
                    <span>{language === 'km' ? 'រូបថត និងវីដេអូ' : 'Photos & Media'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPhotoSection(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload Button */}
                <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:bg-blue-50/30 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Plus className="w-5 h-5" />
                      <Video className="w-5 h-5" />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-700">
                    {isUploading 
                      ? (language === 'km' ? 'កំពុងបញ្ចូលទៅ Server...' : 'Uploading to Server...')
                      : (language === 'km' ? 'បញ្ចូលរូបថត ឬវីដេអូពីឧបករណ៍របស់អ្នក' : 'Upload photos or videos from device')}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Selected Previews Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-black flex items-center justify-center">
                        {isVideoFile(img) ? (
                          <div className="w-full h-full relative">
                            <video src={img} className="w-full h-full object-cover" preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                              <Video className="w-6 h-6 text-white drop-shadow" />
                            </div>
                            <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              VIDEO
                            </span>
                          </div>
                        ) : (
                          <img src={img} alt="Post preview" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full opacity-90 transition-all cursor-pointer z-10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Presets */}
                <div className="pt-2 border-t border-gray-200/80">
                  <span className="text-[11px] font-semibold text-gray-500 mb-2 block">
                    {language === 'km' ? 'រូបភាពគំរូទូទៅ' : 'Quick Scenery Presets'}
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_SAMPLE_PHOTOS.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Sample"
                        onClick={() => handleAddSampleImage(photo)}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar Footer */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            {/* Add-on Toolbar */}
            <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs font-bold text-gray-700">
                {language === 'km' ? 'បន្ថែមទៅការបង្ហោះរបស់អ្នក' : 'Add to your post'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPhotoSection(!showPhotoSection)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showPhotoSection ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-green-600'
                  }`}
                  title={language === 'km' ? 'រូបថត' : 'Photos'}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showFeelingPicker ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-amber-500'
                  }`}
                  title={language === 'km' ? 'អារម្មណ៍ / សកម្មភាព' : 'Feeling / Activity'}
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showLocationInput ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100 text-red-500'
                  }`}
                  title={language === 'km' ? 'ទីតាំង' : 'Location'}
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={(!content.trim() && images.length === 0) || isUploading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              {isUploading
                ? (language === 'km' ? 'កំពុងបញ្ចូលទៅ Server...' : 'Uploading...')
                : (language === 'km' ? 'បង្ហោះ' : 'Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

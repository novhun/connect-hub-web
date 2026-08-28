import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { Story, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
          setCustomUrl('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{language === 'km' ? 'បង្កើតរឿងរ៉ាវ' : 'Create a Story'}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          {/* Preview Container */}
          <div className="flex justify-center">
            <div 
              className="w-44 h-72 rounded-2xl overflow-hidden shadow-md relative bg-gray-900 bg-cover bg-center border-2 border-blue-500 flex flex-col justify-between p-3"
              style={{ backgroundImage: `url(${customUrl.trim() || selectedImage})` }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                />
                <span className="text-white text-xs font-semibold drop-shadow-sm">{currentUser.name}</span>
              </div>
              {caption && (
                <div className="bg-black/60 backdrop-blur-xs text-white text-xs p-2 rounded-xl text-center">
                  {caption}
                </div>
              )}
            </div>
          </div>

          {/* Preset Background Selection */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              {language === 'km' ? 'ជ្រើសរើសរូបភាពផ្ទៃខាងក្រោយ' : 'Select Background Image'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_STORY_BACKGROUNDS.map((bg, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedImage(bg);
                    setCustomUrl('');
                  }}
                  className={`h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImage === bg && !customUrl ? 'border-blue-600 scale-105' : 'border-transparent hover:opacity-80'
                  }`}
                >
                  <img src={bg} alt="preset" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Upload or Custom URL */}
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-2.5 px-3 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>{language === 'km' ? 'ផ្ទុកឡើងពីឧបករណ៍របស់អ្នក' : 'Upload from device'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Caption Input */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {language === 'km' ? 'បន្ថែមចំណងជើង' : 'Add Caption'}
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={language === 'km' ? 'តើមានអ្វីកើតឡើងថ្ងៃនេះ?' : "What's happening today?"}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              {language === 'km' ? 'ចែករំលែកទៅកាន់រឿងរ៉ាវ' : 'Share to Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

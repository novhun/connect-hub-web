import React, { useState } from 'react';
import { X, MapPin, Briefcase, Calendar, Edit3, Image as ImageIcon, Camera, Check } from 'lucide-react';
import { User, Post } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface UserProfileModalProps {
  user: User;
  currentUserPosts: Post[];
  onClose: () => void;
  onUpdateBio?: (newBio: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUserPosts,
  onClose,
  onUpdateBio,
}) => {
  const { t, language } = useLanguage();
  const [bio, setBio] = useState(language === 'km' 
    ? 'អ្នករចនាផលិតផល និងអ្នកអភិវឌ្ឍន៍ React ដែលស្រឡាញ់ការបង្កើត ConnectHub ដើម្បីភ្ជាប់ក្រុម និងសហគមន៍។'
    : 'Passionate Product Designer & React developer. Building ConnectHub to bridge teams and communities.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savedBio, setSavedBio] = useState(bio);

  const handleSaveBio = () => {
    setSavedBio(bio);
    setIsEditingBio(false);
    onUpdateBio?.(bio);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover image */}
        <div className="relative h-44 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile info header */}
        <div className="px-6 pb-4 pt-0 relative border-b border-gray-100 bg-white">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-white"
              />
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white cursor-pointer hover:bg-blue-700">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingBio ? (language === 'km' ? 'បោះបង់' : 'Cancel') : (language === 'km' ? 'កែប្រែប្រវត្តិរូប' : 'Edit Profile')}</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-xs text-gray-500 font-medium">{user.role || (language === 'km' ? 'សមាជិក' : 'Member')} • Active 2026</p>

          {/* Bio */}
          <div className="mt-3">
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSaveBio}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> {language === 'km' ? 'រក្សាទុកជីវប្រវត្តិ' : 'Save Bio'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">{savedBio}</p>
            )}
          </div>

          {/* Details metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span>ConnectHub Design Team</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>Phnom Penh / Global</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{language === 'km' ? 'បានចូលរួម ២០២៦' : 'Joined 2026'}</span>
            </div>
          </div>
        </div>

        {/* User stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50 py-3 text-center">
          <div>
            <span className="block font-bold text-gray-900 text-base">{currentUserPosts.length + 1}</span>
            <span className="text-xs text-gray-500">{language === 'km' ? 'ការបង្ហោះ' : 'Posts'}</span>
          </div>
          <div>
            <span className="block font-bold text-gray-900 text-base">348</span>
            <span className="text-xs text-gray-500">{t('sidebar.friends')}</span>
          </div>
          <div>
            <span className="block font-bold text-gray-900 text-base">3</span>
            <span className="text-xs text-gray-500">{language === 'km' ? 'ក្រុមគ្រប់គ្រង' : 'Managed Groups'}</span>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#f0f2f5] flex-1">
          <h3 className="font-bold text-sm text-gray-800">{language === 'km' ? 'សកម្មភាពថ្មីៗ' : 'Recent Activity'}</h3>
          {currentUserPosts.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-gray-500 text-sm border border-gray-100">
              {language === 'km' ? 'មិនទាន់មានការបង្ហោះថ្មីៗនៅឡើយទេ។ ចែករំលែកអ្វីមួយជាមួយមិត្តភក្តិរបស់អ្នក!' : 'No recent personal posts yet. Share something with your friends!'}
            </div>
          ) : (
            <div className="space-y-3">
              {currentUserPosts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                  <p className="text-sm text-gray-800">{post.content}</p>
                  <span className="text-[11px] text-gray-400 mt-2 block">{post.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

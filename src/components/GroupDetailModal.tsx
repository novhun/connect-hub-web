import React, { useState } from 'react';
import { X, Users, Lock, Globe, Plus, Check, MessageSquare, Share2, Sparkles } from 'lucide-react';
import { Group, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface GroupDetailModalProps {
  group: Group;
  currentUser: User;
  onClose: () => void;
  onOpenCreatePost: () => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  currentUser,
  onClose,
  onOpenCreatePost,
}) => {
  const { t, language } = useLanguage();
  const [isJoined, setIsJoined] = useState(group.joined ?? true);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover & Header */}
        <div className="relative h-44 bg-gradient-to-r from-blue-600 to-indigo-700">
          {group.coverImage && (
            <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Info Bar */}
        <div className="px-6 py-4 border-b border-gray-100 relative bg-white">
          <div className="flex items-end justify-between flex-wrap gap-4 -mt-12 mb-2">
            <div className="flex items-end gap-3.5">
              <img
                src={group.icon}
                alt={group.name}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
              />
              <div className="pt-2">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{group.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-medium">
                  {group.isPrivate ? (
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {language === 'km' ? 'ក្រុមឯកជន' : 'Private Group'}</span>
                  ) : (
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {language === 'km' ? 'ក្រុមសាធារណៈ' : 'Public Group'}</span>
                  )}
                  <span>•</span>
                  <span>{group.membersCount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsJoined(!isJoined)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isJoined
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                }`}
              >
                {isJoined ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isJoined ? (language === 'km' ? 'បានចូលរួម' : 'Joined') : (language === 'km' ? 'ចូលរួមក្រុម' : 'Join Group')}</span>
              </button>

              <button
                onClick={onOpenCreatePost}
                className="px-4 py-2 bg-[#eff6ff] hover:bg-blue-100 text-[#2563eb] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'បង្ហោះក្នុងក្រុម' : 'Post in Group'}</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-3">{group.description}</p>
        </div>

        {/* Group Tabs & Recent Content */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#f8fafc]">
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{language === 'km' ? 'គោលការណ៍ណែនាំសហគមន៍' : 'Community Guidelines'}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{language === 'km' ? 'សូមគោរពគ្នា ចែករំលែកមតិស្ថាបនា និងគ្មានសាររំខានឬផ្សាយពាណិជ្ជកម្មឥតការអនុញ្ញាត។' : 'Be respectful, share constructive feedback, and no promotional spam.'}</p>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              {t('settings.enabled')}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <h4 className="font-bold text-gray-900 text-sm mb-3">{language === 'km' ? 'អ្នកគ្រប់គ្រង និងសម្របសម្រួលក្រុម' : 'Group Admins & Moderators'}</h4>
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-blue-400"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">{currentUser.name} {language === 'km' ? '(អ្នក)' : '(You)'}</span>
                <span className="text-xs text-blue-600 font-medium">{language === 'km' ? 'អ្នកគ្រប់គ្រងក្រុម' : 'Group Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

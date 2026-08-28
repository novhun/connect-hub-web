import React from 'react';
import { X, Users, Lock, Globe, Plus, Check, Sparkles } from 'lucide-react';
import { Group, User, Post, ReactionType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { PostCard } from './PostCard';

interface GroupDetailModalProps {
  group: Group;
  currentUser: User;
  groupPosts: Post[];
  onClose: () => void;
  onToggleJoin: (groupId: string) => void;
  onReact: (postId: string, reaction: ReactionType | null) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onShare?: (post: Post) => void;
  onSaveToggle?: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  currentUser,
  groupPosts,
  onClose,
  onToggleJoin,
  onReact,
  onAddComment,
  onShare,
  onSaveToggle,
  onEditPost,
  onViewProfile,
  onDeletePost,
}) => {
  const { language } = useLanguage();
  const isJoined = !!group.joined;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover & Header */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
          {group.coverImage && (
            <img src={api.getMediaUrl(group.coverImage)} alt={group.name} className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 hover:bg-black/60 text-white p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Group Info Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 relative bg-white shrink-0">
          <div className="flex items-end justify-between flex-wrap gap-3 -mt-10 sm:-mt-12 mb-2">
            <div className="flex items-end gap-2.5 sm:gap-3.5">
              <img
                src={api.getMediaUrl(group.icon)}
                alt={group.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
              />
              <div className="pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{group.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 sm:mt-1 font-medium">
                  {group.isPrivate ? (
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {language === 'km' ? 'ក្រុមឯកជន' : 'Private Group'}</span>
                  ) : (
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {language === 'km' ? 'ក្រុមសាធារណៈ' : 'Public Group'}</span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.membersCount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleJoin(group.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isJoined
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                }`}
              >
                {isJoined ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>
                  {isJoined
                    ? (language === 'km' ? 'បានចូលរួម' : 'Joined')
                    : (language === 'km' ? 'ចូលរួមក្រុម' : 'Join Group')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Group Description, Feed & Actions */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {language === 'km' ? 'អំពីក្រុមនេះ' : 'About this community'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {group.description || (language === 'km'
                ? 'សូមស្វាគមន៍មកកាន់សហគមន៍! ចែករំលែកបទពិសោធន៍ ការរៀនសូត្រ និងភ្ជាប់ទំនាក់ទំនងជាមួយសមាជិកដែលមានចំណូលចិត្តដូចគ្នា។'
                : 'Welcome to the community hub! Share experiences, learn from peers, and connect with members.')}
            </p>
          </div>

          {!isJoined && (
            <div className="bg-blue-50/60 rounded-xl p-3 sm:p-4 border border-blue-100 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">
                  {language === 'km' ? 'ចូលរួមដើម្បីបង្ហោះ' : 'Join to post here'}
                </h4>
                <p className="text-[11px] sm:text-xs text-blue-800">
                  {language === 'km' ? 'ចូលរួមក្រុមនេះដើម្បីចែករំលែកគំនិតរបស់អ្នកជាមួយសមាជិកទាំងអស់' : 'Join this community to share updates directly in its feed'}
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {language === 'km' ? 'ការបង្ហោះថ្មីៗ' : 'Recent Posts'}
            </h3>
            {groupPosts.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                {language === 'km' ? 'មិនទាន់មានការបង្ហោះនៅក្នុងក្រុមនេះទេ។' : 'No posts in this group yet.'}
              </div>
            ) : (
              <div className="space-y-4">
                {groupPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onReact={onReact}
                    onAddComment={onAddComment}
                    onShare={onShare || (() => {})}
                    onSaveToggle={onSaveToggle || (() => {})}
                    onEditPost={onEditPost}
                    onDeletePost={onDeletePost}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

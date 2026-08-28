import React from 'react';
import { Bookmark, FolderArchive, ArrowRight } from 'lucide-react';
import { Post, User } from '../../types';
import { PostCard } from '../PostCard';
import { useLanguage } from '../../context/LanguageContext';

interface SavedPostsViewProps {
  posts: Post[];
  currentUser: User;
  onReact: (postId: string, reaction: any) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onShare: (post: Post) => void;
  onSaveToggle: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  posts,
  currentUser,
  onReact,
  onAddComment,
  onShare,
  onSaveToggle,
  onViewProfile,
}) => {
  const { t, language } = useLanguage();
  const savedPosts = posts.filter((p) => p.isSaved);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 fill-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {language === 'km' ? 'ការបង្ហោះដែលបានរក្សាទុក' : 'Saved Posts'}
            </h1>
            <p className="text-xs text-gray-500 truncate sm:whitespace-normal">
              {language === 'km' 
                ? 'ចូលមើល និងគ្រប់គ្រងការបង្ហោះដែលអ្នកបានរក្សាទុក។' 
                : "Access and manage all items you've bookmarked."}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 sm:px-3 py-1 rounded-full shrink-0">
          {savedPosts.length} {language === 'km' ? 'ធាតុ' : 'Items'}
        </span>
      </div>

      {savedPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-3">
          <FolderArchive className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">
            {language === 'km' ? 'មិនទាន់មានការបង្ហោះដែលបានរក្សាទុកទេ' : 'No saved posts yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {language === 'km'
              ? 'ចុចលើរូបសញ្ញាចុចបីចំណុចលើការបង្ហោះណាមួយក្នុង Feed ដើម្បីរក្សាទុកអត្ថបទ រូបថត និងការអាប់ដេតទុកមើលពេលក្រោយ។'
              : 'Click the three dots icon on any post in your feed to save articles, photos, and updates for later.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onReact={onReact}
              onAddComment={onAddComment}
              onShare={onShare}
              onSaveToggle={onSaveToggle}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

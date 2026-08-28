import React, { useMemo, useState } from 'react';
import { Compass, Flame, Users, X } from 'lucide-react';
import { Post, Group, User, ReactionType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { PostCard } from '../PostCard';

interface ExploreViewProps {
  posts: Post[];
  groups: Group[];
  currentUser: User;
  onSelectGroup: (group: Group) => void;
  onReact: (postId: string, reaction: ReactionType | null) => void;
  onAddComment: (postId: string, commentText: string, parentId?: string) => void;
  onViewProfile?: (userId: string) => void;
  onSelectPost?: (postId: string) => void;
}

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  groups,
  currentUser,
  onSelectGroup,
  onReact,
  onAddComment,
  onViewProfile,
  onSelectPost,
}) => {
  const { t } = useLanguage();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      const tags: string[] = post.content.match(HASHTAG_RE) || [];
      const unique = new Set<string>(tags.map((tg) => tg.toLowerCase()));
      unique.forEach((tag: string) => counts.set(tag, (counts.get(tag) || 0) + 1));
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const visualPosts = useMemo(
    () => posts.filter((p) => p.images && p.images.length > 0).slice(0, 12),
    [posts]
  );

  const discoverGroups = useMemo(() => groups.filter((g) => !g.joined).slice(0, 4), [groups]);

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.content.toLowerCase().includes(selectedTag))
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-blue-200" />
            <h1 className="text-xl font-bold">{t('explore.title')}</h1>
          </div>
          <p className="text-sm text-blue-100">{t('explore.subtitle')}</p>
        </div>
      </div>

      {/* Trending Tags (derived from real post content) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="font-bold text-gray-900 text-sm">{t('explore.trendingTopics')}</h2>
        </div>
        {trendingTopics.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">{t('explore.noTrendingTopics')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trendingTopics.map(({ tag, count }) => (
              <div
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedTag === tag
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="font-bold text-sm text-blue-600 block">{tag}</span>
                <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-2xs">
                  {count} {t('explore.postsCount')}
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedTag && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">{t('explore.noPostsForTag')}</p>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onReact={onReact}
                  onAddComment={onAddComment}
                  onShare={() => {}}
                  onSaveToggle={() => {}}
                  onViewProfile={onViewProfile}
                  onSelectPost={onSelectPost}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Trending Visual Gallery Grid (real post media) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm mb-4">{t('explore.trendingVisuals')}</h2>
        {visualPosts.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">{t('explore.noVisualsYet')}</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {visualPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => (onSelectPost ? onSelectPost(post.id) : setPreviewPost(post))}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group bg-gray-100"
              >
                <img
                  src={api.getMediaUrl(post.images[0])}
                  alt={post.content.slice(0, 30)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.likes} ❤️
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discover Groups */}
      {discoverGroups.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-gray-900 text-sm">{t('explore.discoverGroups')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {discoverGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
              >
                <img
                  src={api.getMediaUrl(group.icon)}
                  alt={group.name}
                  className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{group.name}</h4>
                  <span className="text-xs text-gray-400">{group.membersCount} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post preview lightbox */}
      {previewPost && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewPost(null)}
        >
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setPreviewPost(null)}
                className="bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <PostCard
              post={previewPost}
              currentUser={currentUser}
              onReact={onReact}
              onAddComment={onAddComment}
              onShare={() => {}}
              onSaveToggle={() => {}}
              onViewProfile={onViewProfile}
              onSelectPost={onSelectPost}
            />
          </div>
        </div>
      )}
    </div>
  );
};

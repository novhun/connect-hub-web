import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  Lock,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  Heart,
  Smile,
  Send,
  Bookmark,
  Link,
  Check,
  Loader2,
  Repeat,
  Languages
} from 'lucide-react';
import { Post, Comment, ReactionType, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { formatNotificationTimestamp } from '../utils/notificationHelpers';
import { getYouTubeVideoId, extractUrls, isVideoFile } from '../utils/mediaHelpers';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';
import { copyToClipboard } from '../utils/clipboard';
import { CommentItem } from './CommentItem';
import { detectLanguage, translatePostContent } from '../utils/translator';

interface PostDetailModalProps {
  postId?: string;
  initialPost?: Post | null;
  currentUser: User;
  onClose: () => void;
  onReact: (postId: string, reaction: ReactionType | null) => void;
  onAddComment: (postId: string, commentText: string, parentId?: string) => void;
  onShare?: (post: Post) => void;
  onSaveToggle?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
  onSelectPost?: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  postId,
  initialPost,
  currentUser,
  onClose,
  onReact,
  onAddComment,
  onShare,
  onSaveToggle,
  onViewProfile,
  onSelectPost,
}) => {
  const { t, language } = useLanguage();
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPost && !!postId);
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-Translation state
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<'km' | 'en' | 'unknown'>('unknown');

  // Shared post translation state
  const [isSharedTranslated, setIsSharedTranslated] = useState(false);
  const [translatedSharedContent, setTranslatedSharedContent] = useState<string | null>(null);
  const [detectedSharedLang, setDetectedSharedLang] = useState<'km' | 'en' | 'unknown'>('unknown');

  useEffect(() => {
    if (!post?.content || !post.content.trim()) return;
    const lang = detectLanguage(post.content);
    setDetectedLang(lang);

    if (lang !== 'unknown' && lang !== language) {
      let cancelled = false;
      translatePostContent(post.content, language as 'km' | 'en')
        .then((res) => {
          if (!cancelled && res && res !== post.content) {
            setTranslatedContent(res);
            setIsTranslated(true);
          }
        })
        .catch((err) => console.warn('Auto translate error in modal:', err));
      return () => {
        cancelled = true;
      };
    } else {
      setIsTranslated(false);
      setTranslatedContent(null);
    }
  }, [post?.content, language]);

  useEffect(() => {
    if (!post?.sharedPost?.content || !post.sharedPost.content.trim()) return;
    const lang = detectLanguage(post.sharedPost.content);
    setDetectedSharedLang(lang);

    if (lang !== 'unknown' && lang !== language) {
      let cancelled = false;
      translatePostContent(post.sharedPost.content, language as 'km' | 'en')
        .then((res) => {
          if (!cancelled && res && res !== post.sharedPost!.content) {
            setTranslatedSharedContent(res);
            setIsSharedTranslated(true);
          }
        })
        .catch((err) => console.warn('Auto translate shared post in modal:', err));
      return () => {
        cancelled = true;
      };
    } else {
      setIsSharedTranslated(false);
      setTranslatedSharedContent(null);
    }
  }, [post?.sharedPost?.content, language]);

  const REACTIONS: { type: ReactionType; label: string; icon: string; color: string }[] = [
    { type: 'like', label: t('posts.like'), icon: '👍', color: 'text-blue-600' },
    { type: 'love', label: t('posts.love'), icon: '❤️', color: 'text-red-500' },
    { type: 'care', label: t('posts.care'), icon: '🥰', color: 'text-yellow-500' },
    { type: 'haha', label: t('posts.haha'), icon: '😆', color: 'text-yellow-500' },
    { type: 'wow', label: t('posts.wow'), icon: '😮', color: 'text-yellow-500' },
    { type: 'sad', label: t('posts.sad'), icon: '😢', color: 'text-yellow-600' },
    { type: 'angry', label: t('posts.angry'), icon: '😡', color: 'text-orange-600' },
  ];

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      setIsLoading(false);
    }
  }, [initialPost]);

  useEffect(() => {
    if (postId && (!initialPost || initialPost.id !== postId)) {
      let cancelled = false;
      setIsLoading(true);
      
      const fetchPromise = typeof api.getPostById === 'function'
        ? api.getPostById(postId)
        : api.request<Post>(`/posts/${postId}`);

      fetchPromise
        .then((data) => {
          if (!cancelled && data) {
            setPost(data);
          }
        })
        .catch((err) => {
          console.warn('Fetch post by id error:', err);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [postId, initialPost]);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionsPicker(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowReactionsPicker(false);
  };

  const handleQuickLike = () => {
    if (!post) return;
    if (post.userReaction) {
      onReact(post.id, null);
      setPost((prev) => prev ? {
        ...prev,
        userReaction: null,
        reactionCounts: {
          ...prev.reactionCounts,
          [post.userReaction!]: Math.max(0, (prev.reactionCounts[post.userReaction!] || 1) - 1),
        }
      } : prev);
    } else {
      onReact(post.id, 'like');
      setPost((prev) => prev ? {
        ...prev,
        userReaction: 'like',
        reactionCounts: {
          ...prev.reactionCounts,
          like: (prev.reactionCounts.like || 0) + 1,
        }
      } : prev);
    }
  };

  const handleSelectReaction = (type: ReactionType) => {
    if (!post) return;
    const oldReaction = post.userReaction;
    onReact(post.id, type);
    setShowReactionsPicker(false);

    setPost((prev) => {
      if (!prev) return prev;
      const counts = { ...prev.reactionCounts };
      if (oldReaction) {
        counts[oldReaction] = Math.max(0, (counts[oldReaction] || 1) - 1);
      }
      counts[type] = (counts[type] || 0) + 1;
      return {
        ...prev,
        userReaction: type,
        reactionCounts: counts,
      };
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newCommentText.trim()) return;
    const text = newCommentText.trim();
    onAddComment(post.id, text);
    
    // Optimistic local comment
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user: currentUser,
      content: text,
      timestamp: language === 'km' ? 'អម្បាញ់មិញ' : 'Just now',
      likes: 0,
      isLiked: false,
      replies: [],
    };
    setPost((prev) => prev ? {
      ...prev,
      comments: [...prev.comments, newComment],
    } : prev);
    setNewCommentText('');
  };

  const handleAddReply = (parentId: string, replyText: string) => {
    if (!post) return;
    onAddComment(post.id, replyText, parentId);
    const tempReply: Comment = {
      id: `comment-${Date.now()}`,
      user: currentUser,
      content: replyText,
      timestamp: language === 'km' ? 'អម្បាញ់មិញ' : 'Just now',
      likes: 0,
      isLiked: false,
      parentId,
      replies: [],
    };
    setPost((prev) => {
      if (!prev) return prev;
      const insertReply = (comments: Comment[]): Comment[] => {
        return comments.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), tempReply] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: insertReply(c.replies) };
          }
          return c;
        });
      };
      return { ...prev, comments: insertReply(prev.comments) };
    });
  };

  const handleCopyLink = async () => {
    if (!post) return;
    const postPermalink = typeof window !== 'undefined'
      ? `${window.location.origin}/posts/${post.id}`
      : `https://connecthub.kh/posts/${post.id}`;
    const success = await copyToClipboard(postPermalink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-2xl">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">
            {language === 'km' ? 'កំពុងផ្ទុកការបង្ហោះ...' : 'Loading post...'}
          </span>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const totalReactions = 
    Object.values(post.reactionCounts).reduce<number>((sum, count) => sum + (Number(count) || 0), 0) + 
    (post.userReaction ? 1 : 0);

  const currentReactionMeta = REACTIONS.find((r) => r.type === post.userReaction);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              {language === 'km' ? `ការបង្ហោះរបស់ ${post.author.name}` : `${post.author.name}'s Post`}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Post Author Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={api.getMediaUrl(post.author.avatar)}
                alt={post.author.name}
                onClick={() => onViewProfile?.(post.author.id)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-100 object-cover shrink-0 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3
                    onClick={() => onViewProfile?.(post.author.id)}
                    className="text-sm font-bold text-gray-900 leading-none hover:underline cursor-pointer"
                  >
                    {post.author.name}
                  </h3>
                  {post.sharedPost && (
                    <span className="text-xs text-gray-500 font-normal flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{language === 'km' ? 'បានចែករំលែកការបង្ហោះ' : 'shared a post'}</span>
                    </span>
                  )}
                  {post.taggedGroup && (
                    <span className="text-xs text-gray-500">
                      {language === 'km' ? 'ក្នុងក្រុម ' : 'in '} 
                      <span className="font-semibold text-blue-600">{post.taggedGroup}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                  <span>{formatNotificationTimestamp(post.timestamp, language)}</span>
                  <span>•</span>
                  {post.privacy === 'public' ? (
                    <span className="flex items-center gap-0.5" title="Public">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                  ) : post.privacy === 'friends' ? (
                    <span className="flex items-center gap-0.5" title="Friends">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-medium text-[10px]" title="Only Me">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>{language === 'km' ? 'តែខ្ញុំប៉ុណ្ណោះ' : 'Only Me'}</span>
                    </span>
                  )}
                  {post.location && (
                    <>
                      <span>•</span>
                      <span className="text-gray-600 font-medium">📍 {post.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <div>
              <p className="text-sm sm:text-base text-gray-800 whitespace-pre-line leading-relaxed">
                {isTranslated && translatedContent ? translatedContent : post.content}
              </p>

              {/* Translation Banner & Toggle for Main Post */}
              {detectedLang !== 'unknown' && detectedLang !== language && translatedContent && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 mb-2 select-none">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Languages className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>
                      {isTranslated
                        ? (language === 'km' ? 'បានបកប្រែពីភាសាអង់គ្លេស • ' : 'Translated from Khmer • ')
                        : (language === 'km' ? 'ភាសាដើម៖ អង់គ្លេស • ' : 'Original: Khmer • ')}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTranslated(!isTranslated)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                  >
                    {isTranslated
                      ? (language === 'km' ? 'មើលអត្ថបទដើម' : 'See original')
                      : (language === 'km' ? 'មើលការបកប្រែ' : 'See translation')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Embedded YouTube / Video Link Player */}
          {(() => {
            const urls = extractUrls(post.content || '');
            const firstYtOrVideoUrl = urls.find((u) => getYouTubeVideoId(u) || isVideoFile(u));
            if (!firstYtOrVideoUrl) return null;
            return (
              <div className="mb-3">
                <VideoEmbedPlayer
                  url={firstYtOrVideoUrl}
                  onOpenFullscreen={(u) => setLightboxImage(u)}
                />
              </div>
            );
          })()}

          {/* Embedded Shared Post Box */}
          {post.sharedPost && (
            <div 
              onClick={() => onSelectPost?.(post.sharedPost!.id)}
              className="border border-gray-200/90 rounded-2xl p-4 bg-gray-50/70 hover:bg-gray-100/80 transition-colors space-y-3 cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={api.getMediaUrl(post.sharedPost.author.avatar)}
                    alt={post.sharedPost.author.name}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors block truncate">
                      {post.sharedPost.author.name}
                    </span>
                    <span className="text-[11px] text-gray-400 block">{post.sharedPost.timestamp}</span>
                  </div>
                </div>
                <span className="text-[11px] text-blue-600 font-semibold group-hover:underline">
                  {language === 'km' ? 'មើលការបង្ហោះដើម →' : 'View Original Post →'}
                </span>
              </div>

              {post.sharedPost.content && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {isSharedTranslated && translatedSharedContent
                      ? translatedSharedContent
                      : post.sharedPost.content}
                  </p>

                  {/* Translation Banner & Toggle for Shared Post */}
                  {detectedSharedLang !== 'unknown' && detectedSharedLang !== language && translatedSharedContent && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 select-none"
                    >
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Languages className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>
                          {isSharedTranslated
                            ? (language === 'km' ? 'បានបកប្រែពីអង់គ្លេស • ' : 'Translated • ')
                            : (language === 'km' ? 'ភាសាដើម • ' : 'Original • ')}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSharedTranslated(!isSharedTranslated)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        {isSharedTranslated
                          ? (language === 'km' ? 'មើលអត្ថបទដើម' : 'See original')
                          : (language === 'km' ? 'មើលការបកប្រែ' : 'See translation')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {post.sharedPost.images && post.sharedPost.images.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-gray-200/80 max-h-60 bg-gray-100">
                  <img
                    src={api.getMediaUrl(post.sharedPost.images[0])}
                    alt="Shared post thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Post Image & Video Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-xl overflow-hidden shadow-xs border border-gray-100 space-y-2">
              {post.images.map((img, idx) => (
                <div 
                  key={idx}
                  className="w-full overflow-hidden group bg-black rounded-xl"
                  onClick={() => !isVideoFile(img) && setLightboxImage(api.getMediaUrl(img))}
                >
                  {isVideoFile(img) ? (
                    <video
                      src={api.getMediaUrl(img)}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[500px] object-contain mx-auto"
                    />
                  ) : (
                    <img
                      src={api.getMediaUrl(img)}
                      alt={`Post image ${idx + 1}`}
                      className="w-full max-h-96 object-cover group-hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              {totalReactions > 0 && (
                <>
                  <div className="flex -space-x-1">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">👍</span>
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">❤️</span>
                  </div>
                  <span className="font-semibold text-gray-700">{totalReactions}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 font-medium">
              <span>{post.comments.length} {t('posts.comments')}</span>
              <span>•</span>
              <span>{post.sharesCount || 0} {language === 'km' ? 'ចែករំលែក' : 'shares'}</span>
            </div>
          </div>

          {/* Interactive Action Bar */}
          <div className="flex items-center justify-between gap-1 py-1 border-y border-gray-100 relative">
            {/* Reaction Button & Floating Picker */}
            <div
              className="relative flex-1"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {showReactionsPicker && (
                <div className="absolute -top-12 left-0 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full shadow-2xl border border-gray-200/80 flex items-center gap-1.5 z-30 animate-in fade-in zoom-in-90 duration-150">
                  {REACTIONS.map((reaction) => (
                    <button
                      key={reaction.type}
                      onClick={() => handleSelectReaction(reaction.type)}
                      className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer"
                      title={reaction.label}
                    >
                      {reaction.icon}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleQuickLike}
                className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-gray-50 ${
                  currentReactionMeta ? currentReactionMeta.color : 'text-gray-600'
                }`}
              >
                {currentReactionMeta ? (
                  <span>{currentReactionMeta.icon}</span>
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                <span>{currentReactionMeta ? currentReactionMeta.label : t('posts.like')}</span>
              </button>
            </div>

            {/* Comment Focus Button */}
            <button
              onClick={() => document.getElementById(`post-modal-comment-${post.id}`)?.focus()}
              className="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('posts.comment')}</span>
            </button>

            {/* Share to Profile Button */}
            <button
              onClick={() => onShare?.(post)}
              className="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('posts.share')}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => onSaveToggle?.(post.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                post.isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={post.isSaved ? t('posts.unsavePost') : t('posts.savePost')}
            >
              <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-blue-600' : ''}`} />
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-gray-700">
              {language === 'km' ? 'មតិយោបល់ទាំងអស់' : 'Comments'} ({post.comments.length})
            </h4>

            {post.comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                {language === 'km' ? 'មិនទាន់មានមតិយោបល់នៅឡើយទេ។ ក្លាយជាអ្នកដំបូងដែលបញ្ចេញមតិ!' : 'No comments yet. Be the first to comment!'}
              </p>
            ) : (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    currentUser={currentUser}
                    onViewProfile={onViewProfile}
                    onAddReply={handleAddReply}
                  />
                ))}
              </div>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
              <img
                src={api.getMediaUrl(currentUser.avatar)}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <input
                  id={`post-modal-comment-${post.id}`}
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={language === 'km' ? 'សរសេរមតិយោបល់...' : 'Write a comment...'}
                  className="w-full text-xs outline-none bg-transparent"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="text-blue-600 disabled:text-gray-300 p-1 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImage} alt="Fullscreen" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
};

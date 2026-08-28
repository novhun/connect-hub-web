import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Lock, 
  Users, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Heart, 
  Smile, 
  Send, 
  Bookmark, 
  Link, 
  EyeOff, 
  Check, 
  X, 
  Edit3, 
  Trash2
} from 'lucide-react';
import { Post, ReactionType, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onReact: (postId: string, reaction: ReactionType | null) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onShare: (post: Post) => void;
  onSaveToggle: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onReact,
  onAddComment,
  onShare,
  onSaveToggle,
  onEditPost,
  onDeletePost,
  onViewProfile,
}) => {
  const { t, language } = useLanguage();
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (post.userReaction) {
      onReact(post.id, null);
    } else {
      onReact(post.id, 'like');
    }
  };

  const handleSelectReaction = (reaction: ReactionType) => {
    onReact(post.id, reaction);
    setShowReactionsPicker(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setShowMenu(false);
  };

  // Compute total reactions
  const totalReactions = 
    Object.values(post.reactionCounts).reduce<number>((sum, count) => sum + (Number(count) || 0), 0) + 
    (post.userReaction ? 1 : 0);

  // Determine active reaction details
  const currentReactionMeta = REACTIONS.find((r) => r.type === post.userReaction);

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-100/70 relative w-full overflow-hidden"
    >
      {/* BEGIN: Post Header */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src={api.getMediaUrl(post.author.avatar)}
            alt={post.author.name}
            onClick={() => onViewProfile?.(post.author.id)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-100 object-cover shrink-0 cursor-pointer"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3
                onClick={() => onViewProfile?.(post.author.id)}
                className="text-sm font-bold text-gray-900 leading-none hover:underline cursor-pointer"
              >
                {post.author.name}
              </h3>
              {post.taggedGroup && (
                <span className="text-xs text-gray-500">
                  {language === 'km' ? 'ក្នុងក្រុម ' : 'in '} 
                  <span className="font-semibold text-blue-600 hover:underline cursor-pointer">{post.taggedGroup}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span>{post.timestamp}</span>
              <span>•</span>
              {post.privacy === 'public' ? (
                <Globe className="w-3.5 h-3.5 text-gray-400" />
              ) : post.privacy === 'friends' ? (
                <Users className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-gray-400" />
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

        {/* Post Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-40 text-sm animate-in fade-in duration-100">
              <button
                onClick={() => {
                  onSaveToggle(post.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium text-left"
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-blue-600 text-blue-600' : 'text-gray-500'}`} />
                <span>{post.isSaved ? t('posts.unsavePost') : t('posts.savePost')}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium text-left"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4 text-gray-500" />}
                <span>{copiedLink ? t('modals.linkCopied') : t('posts.copyLink')}</span>
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium text-left"
              >
                <EyeOff className="w-4 h-4 text-gray-500" />
                <span>{language === 'km' ? 'លាក់ការបង្ហោះ' : 'Hide Post'}</span>
              </button>
              {currentUser.id === post.author.id && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  {onEditPost && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditPost(post);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 text-blue-600 font-medium text-left cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-blue-500" />
                      <span>{language === 'km' ? 'កែសម្រួលការបង្ហោះ' : 'Edit Post'}</span>
                    </button>
                  )}
                  {onDeletePost && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-red-50 text-red-600 font-medium text-left cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>{language === 'km' ? 'លុបការបង្ហោះ' : 'Delete Post'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* END: Post Header */}

      {/* BEGIN: Post Content */}
      <div className="mb-3">
        <p className="text-sm text-gray-800 mb-3 whitespace-pre-line leading-relaxed font-normal">
          {post.content}
        </p>

        {/* Dynamic Image Gallery Grid */}
        {post.images && post.images.length > 0 && (
          <div className="rounded-xl overflow-hidden shadow-xs border border-gray-100">
            {post.images.length === 1 && (
              <div 
                className="h-80 w-full cursor-pointer overflow-hidden group bg-gray-100"
                onClick={() => setLightboxImage(api.getMediaUrl(post.images![0]))}
              >
                <img
                  src={api.getMediaUrl(post.images[0])}
                  alt="Post image"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            )}

            {post.images.length === 2 && (
              <div className="grid grid-cols-2 gap-1 h-72">
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="h-full cursor-pointer overflow-hidden group bg-gray-100"
                    onClick={() => setLightboxImage(api.getMediaUrl(img))}
                  >
                    <img
                      src={api.getMediaUrl(img)}
                      alt={`Post visual ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Exactly matches design: 1 large on left, 2 stacked on right */}
            {post.images.length === 3 && (
              <div className="grid grid-cols-2 gap-1 h-64 sm:h-72">
                <div 
                  className="h-full cursor-pointer overflow-hidden group bg-gray-100"
                  onClick={() => setLightboxImage(api.getMediaUrl(post.images![0]))}
                >
                  <img
                    src={api.getMediaUrl(post.images[0])}
                    alt="Hike image 1"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="grid grid-rows-2 gap-1 h-full">
                  <div 
                    className="h-full cursor-pointer overflow-hidden group bg-gray-100"
                    onClick={() => setLightboxImage(api.getMediaUrl(post.images![1]))}
                  >
                    <img
                      src={api.getMediaUrl(post.images[1])}
                      alt="Hike image 2"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div 
                    className="h-full cursor-pointer overflow-hidden group bg-gray-100"
                    onClick={() => setLightboxImage(api.getMediaUrl(post.images![2]))}
                  >
                    <img
                      src={api.getMediaUrl(post.images[2])}
                      alt="Hike image 3"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {post.images.length > 3 && (
              <div className="grid grid-cols-2 gap-1 h-72">
                <div 
                  className="h-full cursor-pointer overflow-hidden group bg-gray-100"
                  onClick={() => setLightboxImage(api.getMediaUrl(post.images![0]))}
                >
                  <img
                    src={api.getMediaUrl(post.images[0])}
                    alt="Visual 1"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="grid grid-rows-2 gap-1 h-full">
                  <div 
                    className="h-full cursor-pointer overflow-hidden group bg-gray-100"
                    onClick={() => setLightboxImage(api.getMediaUrl(post.images![1]))}
                  >
                    <img
                      src={api.getMediaUrl(post.images[1])}
                      alt="Visual 2"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div 
                    className="h-full cursor-pointer overflow-hidden relative group bg-gray-100"
                    onClick={() => setLightboxImage(api.getMediaUrl(post.images![2]))}
                  >
                    <img
                      src={api.getMediaUrl(post.images[2])}
                      alt="Visual 3"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {post.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
                        +{post.images.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* END: Post Content */}

      {/* BEGIN: Post Stats Bar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <div className="flex -space-x-1 mr-1">
            <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[10px] border border-white z-20 shadow-xs">
              <ThumbsUp className="w-2.5 h-2.5 fill-white" />
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] border border-white z-10 shadow-xs">
              <Heart className="w-2.5 h-2.5 fill-white" />
            </div>
            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white text-[10px] border border-white z-0 shadow-xs">
              <Smile className="w-2.5 h-2.5 fill-white text-yellow-600" />
            </div>
          </div>
          <span className="text-xs sm:text-sm font-normal">
            {post.userReaction 
              ? (language === 'km' ? 'អ្នក, វិរៈ និង ' : 'You, Vireak and ') 
              : ''}
            {totalReactions > 0 
              ? (language === 'km' ? `${totalReactions} នាក់ផ្សេងទៀត` : `${totalReactions} others`) 
              : (language === 'km' ? 'ក្លាយជាអ្នកដំបូងដែលបង្ហាញអារម្មណ៍' : 'Be the first to react')}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 flex gap-3">
          <span 
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {post.comments.length} {t('posts.comments')}
          </span>
          <span 
            onClick={() => onShare(post)}
            className="hover:underline cursor-pointer"
          >
            {post.sharesCount} {language === 'km' ? 'ការចែករំលែក' : 'Shares'}
          </span>
        </div>
      </div>
      {/* END: Post Stats Bar */}

      {/* BEGIN: Post Actions */}
      <div className="flex items-center justify-between px-1 pt-0.5 relative">
        {/* Hover Reaction Popup */}
        {showReactionsPicker && (
          <div
            onMouseEnter={() => setShowReactionsPicker(true)}
            onMouseLeave={handleMouseLeave}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-full px-3 py-1.5 shadow-xl border border-gray-100 flex items-center gap-2 z-30 animate-in fade-in zoom-in-95 duration-150"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleSelectReaction(r.type)}
                className="text-2xl hover:scale-125 active:scale-95 transition-transform p-1 rounded-full hover:bg-gray-100 flex flex-col items-center cursor-pointer"
                title={r.label}
              >
                <span>{r.icon}</span>
              </button>
            ))}
          </div>
        )}

        {/* Like Button */}
        <button
          id={`post-like-btn-${post.id}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleQuickLike}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer select-none ${
            post.userReaction
              ? currentReactionMeta?.color || 'text-[#2563eb]'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {post.userReaction ? (
            <span>{currentReactionMeta?.icon || '👍'}</span>
          ) : (
            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
          <span>{currentReactionMeta ? currentReactionMeta.label : t('posts.like')}</span>
        </button>

        {/* Comment Button */}
        <button
          id={`post-comment-btn-${post.id}`}
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer select-none"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{t('posts.comment')}</span>
        </button>

        {/* Share Button */}
        <button
          id={`post-share-btn-${post.id}`}
          onClick={() => onShare(post)}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer select-none"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{t('posts.share')}</span>
        </button>
      </div>
      {/* END: Post Actions */}

      {/* BEGIN: Comments Section */}
      {showComments && (
        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-gray-100 space-y-2.5 sm:space-y-3">
          {/* Add New Comment */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 object-cover shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`${t('posts.writeComment')}...`}
                className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] focus:bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-500 rounded-full py-1.5 sm:py-2 pl-3 sm:pl-3.5 pr-8 sm:pr-9 border-none outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1 text-[#2563eb] disabled:text-gray-400 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                aria-label="Send comment"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </form>

          {/* List Comments */}
          {post.comments.length > 0 && (
            <div className="space-y-2.5 pt-1">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 items-start group">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    onClick={() => onViewProfile?.(comment.user.id)}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="bg-[#f0f2f5] rounded-2xl px-3.5 py-2 inline-block max-w-full">
                      <span
                        onClick={() => onViewProfile?.(comment.user.id)}
                        className="font-semibold text-xs text-gray-900 block hover:underline cursor-pointer"
                      >
                        {comment.user.name}
                      </span>
                      <p className="text-sm text-gray-800 mt-0.5 leading-snug break-words">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 ml-2 font-medium">
                      <span>{comment.timestamp}</span>
                      <button 
                        onClick={() => {}}
                        className="hover:underline font-semibold text-gray-600 hover:text-blue-600 cursor-pointer"
                      >
                        {t('posts.like')} {comment.likes > 0 && `(${comment.likes})`}
                      </button>
                      <button 
                        onClick={() => setNewCommentText(`@${comment.user.name} `)}
                        className="hover:underline font-semibold text-gray-600 hover:text-blue-600 cursor-pointer"
                      >
                        {t('posts.reply')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal for Image Zoom */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged preview"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base">
                  {language === 'km' ? 'លុបការបង្ហោះនេះ?' : 'Delete Post?'}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {language === 'km' 
                    ? 'តើអ្នកប្រាកដជាចង់លុបការបង្ហោះនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។' 
                    : 'Are you sure you want to delete this post? This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDeletePost) onDeletePost(post.id);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              >
                {language === 'km' ? 'លុប' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

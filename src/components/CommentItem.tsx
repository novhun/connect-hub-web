import React, { useState, useRef } from 'react';
import { Comment, User, ReactionType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { formatNotificationTimestamp } from '../utils/notificationHelpers';
import { Send, CornerDownRight } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUser: User;
  onViewProfile?: (userId: string) => void;
  onAddReply?: (parentId: string, content: string) => Promise<void> | void;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  currentUser,
  onViewProfile,
  onAddReply,
  depth = 0,
}) => {
  const { t, language } = useLanguage();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);

  const [localLikes, setLocalLikes] = useState(comment.likes || 0);
  const [localIsLiked, setLocalIsLiked] = useState(comment.isLiked || false);
  const [localUserReaction, setLocalUserReaction] = useState<ReactionType | null>(
    comment.userReaction || (comment.isLiked ? 'like' : null)
  );

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const replyInputRef = useRef<HTMLInputElement | null>(null);

  const REACTIONS: { type: ReactionType; label: string; icon: string; color: string }[] = [
    { type: 'like', label: t('posts.like'), icon: '👍', color: 'text-blue-600' },
    { type: 'love', label: t('posts.love'), icon: '❤️', color: 'text-red-500' },
    { type: 'care', label: t('posts.care'), icon: '🥰', color: 'text-amber-500' },
    { type: 'haha', label: t('posts.haha'), icon: '😆', color: 'text-yellow-500' },
    { type: 'wow', label: t('posts.wow'), icon: '😮', color: 'text-yellow-500' },
    { type: 'sad', label: t('posts.sad'), icon: '😢', color: 'text-yellow-600' },
    { type: 'angry', label: t('posts.angry'), icon: '😡', color: 'text-orange-600' },
  ];

  const currentReactionMeta = localUserReaction
    ? REACTIONS.find((r) => r.type === localUserReaction)
    : null;

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionsPicker(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowReactionsPicker(false);
  };

  const handleSelectReaction = async (type: ReactionType) => {
    setShowReactionsPicker(false);
    const wasLiked = localIsLiked;
    setLocalIsLiked(true);
    setLocalUserReaction(type);
    if (!wasLiked) {
      setLocalLikes((prev) => prev + 1);
    }

    try {
      await api.reactComment(comment.id, type);
    } catch (err) {
      console.warn('React to comment error:', err);
    }
  };

  const handleQuickLike = async () => {
    if (localIsLiked) {
      setLocalIsLiked(false);
      setLocalUserReaction(null);
      setLocalLikes((prev) => Math.max(0, prev - 1));
      try {
        await api.reactComment(comment.id, null);
      } catch (err) {
        console.warn('Unreact comment error:', err);
      }
    } else {
      setLocalIsLiked(true);
      setLocalUserReaction('like');
      setLocalLikes((prev) => prev + 1);
      try {
        await api.reactComment(comment.id, 'like');
      } catch (err) {
        console.warn('Like comment error:', err);
      }
    }
  };

  const handleOpenReply = () => {
    setIsReplying(true);
    setReplyText(`@${comment.user.name} `);
    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 50);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      if (onAddReply) {
        await onAddReply(comment.id, replyText.trim());
      } else {
        await api.addComment(postId, replyText.trim(), comment.id);
      }
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true);
    } catch (err) {
      console.warn('Submit reply error:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const replies = comment.replies || [];
  const isNested = depth > 0;

  return (
    <div className={`group/comment relative ${isNested ? 'ml-3 sm:ml-5 mt-2' : ''}`}>
      <div className="flex gap-2 sm:gap-2.5 items-start">
        {/* User Avatar */}
        <img
          src={api.getMediaUrl(comment.user.avatar)}
          alt={comment.user.name}
          onClick={() => onViewProfile?.(comment.user.id)}
          className={`${
            isNested ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-8 sm:h-8'
          } rounded-full object-cover border border-gray-200 shrink-0 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity`}
        />

        {/* Comment Bubble & Actions */}
        <div className="flex-1 min-w-0">
          <div className="relative inline-block max-w-[95%] sm:max-w-[85%]">
            <div className="bg-[#f0f2f5] hover:bg-[#ebedf0] transition-colors rounded-2xl px-3 sm:px-3.5 py-1.5 sm:py-2">
              <span
                onClick={() => onViewProfile?.(comment.user.id)}
                className="font-bold text-xs sm:text-[13px] text-gray-900 block hover:underline cursor-pointer truncate"
              >
                {comment.user.name}
              </span>
              <p className="text-xs sm:text-sm text-gray-800 mt-0.5 leading-snug break-words whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Reaction Badge Floating on Bubble */}
            {localLikes > 0 && (
              <div 
                onClick={handleQuickLike}
                className="absolute -bottom-2 right-2 bg-white px-1.5 py-0.5 rounded-full shadow-xs border border-gray-200 flex items-center gap-1 text-[11px] font-semibold text-gray-600 cursor-pointer hover:scale-105 transition-transform"
                title={`${localLikes} reactions`}
              >
                {localUserReaction === 'love' ? (
                  <span className="text-xs">❤️</span>
                ) : localUserReaction === 'care' ? (
                  <span className="text-xs">🥰</span>
                ) : localUserReaction === 'haha' ? (
                  <span className="text-xs">😆</span>
                ) : localUserReaction === 'wow' ? (
                  <span className="text-xs">😮</span>
                ) : localUserReaction === 'sad' ? (
                  <span className="text-xs">😢</span>
                ) : localUserReaction === 'angry' ? (
                  <span className="text-xs">😡</span>
                ) : (
                  <span className="text-xs">👍</span>
                )}
                <span>{localLikes}</span>
              </div>
            )}
          </div>

          {/* Comment Meta & Action Buttons */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-500 mt-1 ml-2 font-medium relative">
            <span className="text-gray-400">
              {formatNotificationTimestamp(comment.timestamp, language)}
            </span>

            {/* Like Button with Hover Reactions Picker */}
            <div
              className="relative inline-block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {showReactionsPicker && (
                <div className="absolute bottom-full left-0 mb-1.5 bg-white rounded-full px-2 py-1 shadow-xl border border-gray-200 flex items-center gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.type}
                      type="button"
                      onClick={() => handleSelectReaction(r.type)}
                      className="text-lg hover:scale-130 active:scale-95 transition-transform p-0.5 rounded-full cursor-pointer"
                      title={r.label}
                    >
                      {r.icon}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleQuickLike}
                className={`font-semibold hover:underline cursor-pointer transition-colors ${
                  localIsLiked
                    ? currentReactionMeta?.color || 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {currentReactionMeta ? currentReactionMeta.label : t('posts.like')}
              </button>
            </div>

            {/* Reply Button */}
            <button
              type="button"
              onClick={handleOpenReply}
              className="font-semibold text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
            >
              {t('posts.reply')}
            </button>
          </div>

          {/* Inline Reply Input */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2 ml-1 sm:ml-2">
              <img
                src={api.getMediaUrl(currentUser.avatar)}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div className="flex-1 relative flex items-center">
                <input
                  ref={replyInputRef}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`${t('posts.reply')} @${comment.user.name}...`}
                  className="w-full bg-[#f0f2f5] focus:bg-white text-xs text-gray-800 placeholder-gray-500 rounded-full py-1.5 pl-3 pr-8 border border-gray-200 focus:border-blue-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="absolute right-1 text-blue-600 disabled:text-gray-400 p-1 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                  title="Send reply"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer hover:underline px-1"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
            </form>
          )}

          {/* Nested Replies List */}
          {replies.length > 0 && (
            <div className="mt-1.5">
              {/* Toggle Replies Collapse if many */}
              {replies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer mb-1 ml-2"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>
                    {showReplies
                      ? (language === 'km' ? 'លាក់ការឆ្លើយតប' : 'Hide replies')
                      : (language === 'km'
                          ? `មើលការឆ្លើយតប (${replies.length})`
                          : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`)}
                  </span>
                </button>
              )}

              {/* Render Sub-replies */}
              {showReplies && (
                <div className="border-l-2 border-blue-100 pl-2.5 sm:pl-3 space-y-2 mt-1">
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      currentUser={currentUser}
                      onViewProfile={onViewProfile}
                      onAddReply={onAddReply}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CommentItem;

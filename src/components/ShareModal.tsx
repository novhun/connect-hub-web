import React, { useState } from 'react';
import { X, Share2, Link, Check, Loader2, Repeat, Copy, Video } from 'lucide-react';
import { Post, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { copyToClipboard } from '../utils/clipboard';
import { isVideoFile } from '../utils/mediaHelpers';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

interface ShareModalProps {
  post: Post;
  currentUser?: User;
  onClose: () => void;
  onShareToFeed?: (post: Post, caption: string, privacy: 'public' | 'friends' | 'only_me') => Promise<void> | void;
  onShare?: (post: Post, caption: string, privacy?: 'public' | 'friends' | 'only_me') => Promise<void> | void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  currentUser,
  onClose,
  onShareToFeed,
  onShare,
}) => {
  const { language } = useLanguage();
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const userAvatar = currentUser?.avatar || DEFAULT_AVATAR;
  const userName = currentUser?.name || (language === 'km' ? 'អ្នក' : 'You');

  const postAuthorAvatar = post?.author?.avatar || DEFAULT_AVATAR;
  const postAuthorName = post?.author?.name || (language === 'km' ? 'អ្នកប្រើប្រាស់' : 'User');

  const postPermalink = typeof window !== 'undefined' 
    ? `${window.location.origin}/posts/${post?.id || ''}`
    : `https://connecthub.kh/posts/${post?.id || ''}`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(postPermalink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareNow = async () => {
    setIsSharing(true);
    try {
      if (onShareToFeed) {
        await onShareToFeed(post, caption, privacy);
      } else if (onShare) {
        await onShare(post, caption, privacy);
      }
      onClose();
    } catch (e) {
      console.warn('Share error:', e);
    } finally {
      setIsSharing(false);
    }
  };

  const previewImages = post?.images?.length ? post.images : (post?.sharedPost?.images || []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">
              {language === 'km' ? 'ចែករំលែកការបង្ហោះ' : 'Share Post'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* User Info & Privacy Switcher */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <img
                src={api.getMediaUrl(userAvatar)}
                alt={userName}
                className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0 shadow-2xs"
              />
              <div>
                <span className="font-bold text-gray-900 text-sm block leading-tight">{userName}</span>
                <div className="flex items-center gap-1 mt-1">
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-lg border-0 outline-none cursor-pointer transition-colors"
                  >
                    <option value="public">🌐 {language === 'km' ? 'សាធារណៈ (Public)' : 'Public'}</option>
                    <option value="friends">👥 {language === 'km' ? 'មិត្តភក្តិ (Friends)' : 'Friends'}</option>
                    <option value="only_me">🔒 {language === 'km' ? 'តែខ្ញុំ (Only Me)' : 'Only Me'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={language === 'km' ? 'សរសេរគំនិតរបស់អ្នកអំពីការបង្ហោះនេះ...' : 'Say something about this post...'}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Copy Post Link Bar */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 flex-1 min-w-0 pl-2 text-xs text-gray-500">
              <Link className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate font-mono text-[11px] select-all">{postPermalink}</span>
            </div>
            <button
              onClick={handleCopyLink}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'km' ? 'បានចម្លង!' : 'Copied!') : (language === 'km' ? 'ចម្លងតំណ' : 'Copy Link')}</span>
            </button>
          </div>

          {/* Original Post Embedded Preview Card */}
          {post && (
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/60 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={api.getMediaUrl(postAuthorAvatar)}
                  alt={postAuthorName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-gray-900 block truncate">{postAuthorName}</span>
                  <span className="text-[11px] text-gray-400 block">{post.timestamp}</span>
                </div>
              </div>

              {post.content && (
                <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              )}

              {/* Original Post Media (Image or Video Thumbnail) */}
              {previewImages && previewImages.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-gray-200 max-h-56 bg-black relative shadow-inner">
                  {isVideoFile(previewImages[0]) ? (
                    <>
                      <video
                        src={api.getMediaUrl(previewImages[0])}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-56 object-contain bg-black"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs pointer-events-none border border-white/20">
                        <Video className="w-3 h-3 text-rose-400" />
                        <span>VIDEO</span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={api.getMediaUrl(previewImages[0])}
                      alt="Original post preview"
                      className="w-full max-h-56 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100">
            <button
              onClick={handleCopyLink}
              type="button"
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link className="w-4 h-4 text-gray-600" />}
              <span>
                {copied 
                  ? (language === 'km' ? 'បានចម្លងតំណ!' : 'Link Copied!') 
                  : (language === 'km' ? 'ចម្លងតំណ' : 'Copy Link')}
              </span>
            </button>

            <button
              onClick={handleShareNow}
              disabled={isSharing}
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>
                {isSharing
                  ? (language === 'km' ? 'កំពុងចែករំលែក...' : 'Sharing...')
                  : (language === 'km' ? 'ចែករំលែកទៅ Profile' : 'Share to Profile')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

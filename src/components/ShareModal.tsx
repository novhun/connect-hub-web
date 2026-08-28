import React, { useState } from 'react';
import { X, Share2, Link, Send, Check, MessageSquare, Globe } from 'lucide-react';
import { Post, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShareModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onShareToFeed: (post: Post, caption: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  currentUser,
  onClose,
  onShareToFeed,
}) => {
  const { t, language } = useLanguage();
  const [caption, setCaption] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNow = () => {
    onShareToFeed(post, caption);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">{language === 'km' ? 'ចែករំលែកការបង្ហោះ' : 'Share Post'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            />
            <div>
              <span className="font-semibold text-gray-900 text-sm">{currentUser.name}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Globe className="w-3 h-3" />
                <span>{language === 'km' ? 'ចែករំលែកជាសាធារណៈទៅកាន់ Feed' : 'Sharing publicly to Feed'}</span>
              </div>
            </div>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={language === 'km' ? 'និយាយអ្វីមួយអំពីការបង្ហោះនេះ...' : 'Say something about this...'}
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />

          {/* Original post preview */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/70 text-xs text-gray-700">
            <span className="font-semibold block mb-1">{language === 'km' ? 'ការបង្ហោះដោយ' : 'Post by'} {post.author.name}</span>
            <p className="line-clamp-2 text-gray-600">{post.content}</p>
          </div>

          {/* Share options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link className="w-4 h-4 text-gray-600" />}
              <span>{copied ? (language === 'km' ? 'បានចម្លងតំណ!' : 'Link Copied!') : (language === 'km' ? 'ចម្លងតំណ' : 'Copy Link')}</span>
            </button>
            <button
              onClick={handleShareNow}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'km' ? 'ចែករំលែកឥឡូវនេះ' : 'Share Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

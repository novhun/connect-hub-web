import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Edit3, 
  Camera, 
  Check, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  MessageSquare, 
  Phone, 
  Video, 
  Loader2, 
  Globe, 
  Image as ImageIcon 
} from 'lucide-react';
import { User, Post, FriendStatusInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { friendsApi } from '../modules/friends/api';
import { EditProfileModal } from './EditProfileModal';

interface UserProfileModalProps {
  userId: string;
  currentUser: User;
  onClose: () => void;
  onUpdateProfile?: (patch: Partial<User>) => void;
  onOpenChat?: (user: User) => void;
  onStartCall?: (user: User, type: 'audio' | 'video') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  currentUser,
  onClose,
  onUpdateProfile,
  onOpenChat,
  onStartCall,
}) => {
  const { t, language } = useLanguage();
  const isOwnProfile = userId === currentUser.id;

  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? currentUser : null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<FriendStatusInfo | null>(null);
  const [friendActionBusy, setFriendActionBusy] = useState(false);
  const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const loadProfile = isOwnProfile ? Promise.resolve(currentUser) : api.getUserProfile(userId);

    Promise.allSettled([
      loadProfile,
      api.getFeed({ authorId: userId }),
      isOwnProfile ? Promise.resolve(null) : friendsApi.getStatus(userId),
    ]).then(([userRes, postsRes, statusRes]) => {
      if (cancelled) return;
      if (userRes.status === 'fulfilled' && userRes.value) {
        setProfileUser(userRes.value);
      }
      if (postsRes.status === 'fulfilled') setPosts(postsRes.value || []);
      if (statusRes.status === 'fulfilled' && statusRes.value) setFriendStatus(statusRes.value);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId, currentUser]);

  const joinedLabel = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleProfileUpdated = (patch: Partial<User>) => {
    setProfileUser((prev) => (prev ? { ...prev, ...patch } : prev));
    onUpdateProfile?.(patch);
  };

  const handleSendRequest = async () => {
    setFriendActionBusy(true);
    try {
      const result = await friendsApi.sendRequest(userId);
      setFriendStatus(result);
    } catch (e) {
      console.warn('Send friend request API notice:', e);
    } finally {
      setFriendActionBusy(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!friendStatus?.requestId) return;
    setFriendActionBusy(true);
    try {
      await friendsApi.cancelRequest(friendStatus.requestId);
      setFriendStatus({ status: 'none' });
    } catch (e) {
      console.warn('Cancel friend request API notice:', e);
    } finally {
      setFriendActionBusy(false);
    }
  };

  const handleRespondRequest = async (accept: boolean) => {
    if (!friendStatus?.requestId) return;
    setFriendActionBusy(true);
    try {
      const result = await friendsApi.respondRequest(friendStatus.requestId, accept);
      setFriendStatus(result);
    } catch (e) {
      console.warn('Respond friend request API notice:', e);
    } finally {
      setFriendActionBusy(false);
    }
  };

  const handleUnfriend = async () => {
    setFriendActionBusy(true);
    try {
      await friendsApi.unfriend(userId);
      setFriendStatus({ status: 'none' });
    } catch (e) {
      console.warn('Unfriend API notice:', e);
    } finally {
      setFriendActionBusy(false);
    }
  };

  const renderFriendAction = () => {
    if (isOwnProfile || !friendStatus) return null;

    if (friendStatus.status === 'none') {
      return (
        <button
          onClick={handleSendRequest}
          disabled={friendActionBusy}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {friendActionBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>{t('friends.addFriend')}</span>
        </button>
      );
    }
    if (friendStatus.status === 'pending_sent') {
      return (
        <button
          onClick={handleCancelRequest}
          disabled={friendActionBusy}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('friends.cancelRequest')}</span>
        </button>
      );
    }
    if (friendStatus.status === 'pending_received') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespondRequest(true)}
            disabled={friendActionBusy}
            className="px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t('friends.confirm')}</span>
          </button>
          <button
            onClick={() => handleRespondRequest(false)}
            disabled={friendActionBusy}
            className="px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    // friends
    return (
      <button
        onClick={handleUnfriend}
        disabled={friendActionBusy}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 hover:bg-red-50 border border-green-200 hover:border-red-200 text-green-700 hover:text-red-600 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer group"
      >
        <UserCheck className="w-3.5 h-3.5 group-hover:hidden" />
        <UserX className="w-3.5 h-3.5 hidden group-hover:block" />
        <span className="group-hover:hidden">{language === 'km' ? 'មិត្តភក្តិ' : 'Friends'}</span>
        <span className="hidden group-hover:inline">{t('friends.unfriend')}</span>
      </button>
    );
  };

  if (isLoading || !profileUser) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-10 shadow-2xl">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cover image banner */}
          <div className="relative h-36 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shrink-0 overflow-hidden">
            {profileUser.coverImage ? (
              <img
                src={api.getMediaUrl(profileUser.coverImage)}
                alt="Profile Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            )}

            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 hover:bg-black/60 text-white p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Change Cover button on banner */}
            {isOwnProfile && (
              <button
                onClick={() => setIsFullEditModalOpen(true)}
                className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'កែប្រែរូបគម្រប' : 'Edit Cover'}</span>
              </button>
            )}
          </div>

          {/* Profile info header */}
          <div className="px-4 sm:px-6 pb-4 pt-0 relative border-b border-gray-100 bg-white shrink-0">
            <div className="flex items-end justify-between flex-wrap gap-2 -mt-10 sm:-mt-14 mb-3 sm:mb-4">
              <div className="relative">
                <img
                  src={api.getMediaUrl(profileUser.avatar)}
                  alt={profileUser.name}
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setIsFullEditModalOpen(true)}
                    className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-blue-600 text-white p-1 sm:p-1.5 rounded-full border-2 border-white cursor-pointer hover:bg-blue-700 shadow-xs"
                    title={language === 'km' ? 'កែប្រែរូបភាពគណនី' : 'Change Avatar'}
                  >
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsFullEditModalOpen(true)}
                    className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'កែប្រែគណនី' : 'Edit Profile'}</span>
                  </button>
                ) : (
                  <>
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(profileUser)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onStartCall && (
                      <>
                        <button
                          onClick={() => onStartCall(profileUser, 'audio')}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onStartCall(profileUser, 'video')}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {renderFriendAction()}
                  </>
                )}
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{profileUser.name}</h2>
            <p className="text-xs text-gray-500 font-medium">
              {profileUser.role || (language === 'km' ? 'សមាជិក' : 'Member')}
              {profileUser.isOnline ? ` • ${language === 'km' ? 'កំពុងអនឡាញ' : 'Online now'}` : ''}
            </p>

            {/* Bio text */}
            <div className="mt-2.5 sm:mt-3">
              {profileUser.bio ? (
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {profileUser.bio}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-400 italic leading-relaxed">
                  {language === 'km' ? 'មិនទាន់មានជីវប្រវត្តិនៅឡើយទេ។' : 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* Details metadata row */}
            {(profileUser.jobTitle || profileUser.location || profileUser.website || joinedLabel) && (
              <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-gray-100 flex-wrap">
                {profileUser.jobTitle && (
                  <div className="flex items-center gap-1 text-gray-700 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    <span>{profileUser.jobTitle}</span>
                  </div>
                )}
                {profileUser.location && (
                  <div className="flex items-center gap-1 text-gray-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <a
                    href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate max-w-[160px]">{profileUser.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {joinedLabel && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{language === 'km' ? `ចូលរួមតាំងពី ${joinedLabel}` : `Joined ${joinedLabel}`}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Posts Timeline */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">
                {isOwnProfile
                  ? (language === 'km' ? 'ការបង្ហោះរបស់ខ្ញុំ' : 'My Activity Posts')
                  : (language === 'km' ? 'ការបង្ហោះ' : 'Posts')}
              </h3>
              <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                {posts.length} {language === 'km' ? 'ការបង្ហោះ' : 'Posts'}
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                {language === 'km' ? 'មិនទាន់មានការបង្ហោះនៅឡើយទេ។' : 'No posts shared yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posts.map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <p className="text-xs text-gray-800 line-clamp-2">{p.content}</p>
                    {p.images && p.images.length > 0 && (
                      <img
                        src={api.getMediaUrl(p.images[0])}
                        alt="Post thumbnail"
                        className="h-28 w-full object-cover rounded-lg"
                      />
                    )}
                    <span className="text-[10px] text-gray-400 block">{p.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dedicated Edit Profile & Cover Modal */}
      {isFullEditModalOpen && (
        <EditProfileModal
          currentUser={profileUser || currentUser}
          onClose={() => setIsFullEditModalOpen(false)}
          onUpdateProfile={handleProfileUpdated}
        />
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Users, Search, Check, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { User, GroupChat } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { friendsApi } from '../modules/friends/api';

interface CreateGroupChatModalProps {
  currentUser: User;
  onClose: () => void;
  onGroupCreated: (group: GroupChat) => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/identicon/svg?seed=TechGuild',
  'https://api.dicebear.com/7.x/identicon/svg?seed=DesignCircle',
  'https://api.dicebear.com/7.x/identicon/svg?seed=FriendsVibes',
  'https://api.dicebear.com/7.x/identicon/svg?seed=GamersHQ',
  'https://api.dicebear.com/7.x/identicon/svg?seed=CryptoNexus',
  'https://api.dicebear.com/7.x/identicon/svg?seed=BookClub',
];

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
  currentUser,
  onClose,
  onGroupCreated,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoadingUsers(true);
        const [friendsRes, convsRes] = await Promise.allSettled([
          friendsApi.getFriends(),
          api.getConversations(),
        ]);
        const userMap = new Map<string, User>();

        if (friendsRes.status === 'fulfilled' && Array.isArray(friendsRes.value)) {
          friendsRes.value.forEach((u) => {
            if (u.id && u.id !== currentUser.id) userMap.set(u.id, u);
          });
        }
        if (convsRes.status === 'fulfilled' && Array.isArray(convsRes.value)) {
          convsRes.value.forEach((c) => {
            if (c.user?.id && c.user.id !== currentUser.id) userMap.set(c.user.id, c.user);
          });
        }

        setAvailableUsers(Array.from(userMap.values()));
      } catch (e) {
        console.warn('Failed to load friends for group create:', e);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchFriends();
  }, [currentUser.id]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះក្រុម' : 'Please provide a group name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newGroup = await api.createGroupChat({
        name: name.trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`,
        description: description.trim() || undefined,
        memberIds: Array.from(selectedUserIds),
      });

      onGroupCreated(newGroup);
      onClose();
    } catch (err: any) {
      console.error('Create group chat failed:', err);
      setError(err?.message || (language === 'km' ? 'ការបង្កើតក្រុមបានបរាជ័យ' : 'Failed to create group chat.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'km' ? 'បង្កើតក្រុមជជែកថ្មី' : 'New Group Chat'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'km' ? 'ជជែក ហៅជាសំឡេង និងវីដេអូជាមួយមិត្តភក្ដិជាក្រុម' : 'Chat and call with multiple friends'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Group Icon & Name */}
          <div className="flex items-start gap-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-blue-500/30 flex items-center justify-center shadow-md">
                <img src={avatar} alt="Group Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'km' ? 'ឈ្មោះក្រុមជជែក *' : 'Group Name *'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'km' ? 'ឧ. ក្រុមអ្នកអភិវឌ្ឍន៍ 🚀' : 'e.g. Design Ninjas 🎨'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'ជ្រើសរើសរូបតំណាង' : 'Choose Icon Preset'}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset)}
                      className={`w-8 h-8 rounded-xl overflow-hidden border-2 shrink-0 transition-transform cursor-pointer ${
                        avatar === preset ? 'border-blue-600 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'km' ? 'ការពិពណ៌នា (ជាជម្រើស)' : 'Description (Optional)'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'km' ? 'គោលបំណងនៃក្រុម...' : 'Topic, team focus, or guidelines...'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'km' ? 'អញ្ជើញសមាជិក' : 'Invite Members'}
              </label>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                {selectedUserIds.size} {language === 'km' ? 'នាក់បានជ្រើសរើស' : 'selected'}
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'km' ? 'ស្វែងរកមិត្តភក្ដិ...' : 'Search friends to invite...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Users List */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-50/30 dark:bg-slate-900/40">
              {loadingUsers ? (
                <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  {language === 'km' ? 'កំពុងផ្ទុកបញ្ជីមិត្តភក្ដិ...' : 'Loading contacts...'}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {language === 'km' ? 'រកមិនឃើញមិត្តភក្ដិទេ' : 'No friends found.'}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.has(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center justify-between p-2.5 px-3 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <img
                            src={api.getMediaUrl(u.avatar)}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover bg-slate-200"
                          />
                          {u.isOnline && (
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900 absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {u.role || u.jobTitle || 'Member'}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'km' ? 'កំពុងបង្កើត...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'km' ? 'បង្កើតក្រុម' : 'Create Group'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

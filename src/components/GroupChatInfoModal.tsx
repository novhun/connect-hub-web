import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  UserPlus,
  Phone,
  Video,
  LogOut,
  Shield,
  Search,
  Loader2,
  Share2,
} from 'lucide-react';
import { GroupChat, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { friendsApi } from '../modules/friends/api';

interface GroupChatInfoModalProps {
  group: GroupChat;
  currentUser: User;
  onClose: () => void;
  onGroupUpdated: (updated: GroupChat) => void;
  onLeaveGroup: (groupId: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
}

export const GroupChatInfoModal: React.FC<GroupChatInfoModalProps> = ({
  group,
  currentUser,
  onClose,
  onGroupUpdated,
  onLeaveGroup,
  onStartCall,
}) => {
  const { language } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [availableFriends, setAvailableFriends] = useState<User[]>([]);
  const [selectedInviteIds, setSelectedInviteIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  const currentMemberIds = new Set(group.members.map((m) => m.userId));
  const isAdmin = group.creatorId === currentUser.id || group.members.some((m) => m.userId === currentUser.id && m.role === 'admin');

  // Load friends who are not yet in the group
  const fetchAvailableFriends = async () => {
    try {
      setLoadingFriends(true);
      const friends = await friendsApi.getFriends();
      const notInGroup = (friends || []).filter((f) => !currentMemberIds.has(f.id) && f.id !== currentUser.id);
      setAvailableFriends(notInGroup);
    } catch (e) {
      console.warn('Failed to load friends for invite:', e);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}?join_chat=${group.inviteCode || group.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleInviteUser = (userId: string) => {
    setSelectedInviteIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSendInvites = async () => {
    if (selectedInviteIds.size === 0) return;
    try {
      setIsInviting(true);
      const updated = await api.inviteGroupChatMembers(group.id, Array.from(selectedInviteIds));
      onGroupUpdated(updated);
      setSelectedInviteIds(new Set());
      setShowInviteSection(false);
    } catch (e) {
      console.error('Invite members failed:', e);
    } finally {
      setIsInviting(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(language === 'km' ? 'តើអ្នកប្រាកដជាចង់ចាកចេញពីក្រុមនេះមែនទេ?' : 'Are you sure you want to leave this group chat?')) {
      return;
    }
    try {
      setIsLeaving(true);
      await api.leaveGroupChat(group.id);
      onLeaveGroup(group.id);
      onClose();
    } catch (e) {
      console.error('Leave group failed:', e);
    } finally {
      setIsLeaving(false);
    }
  };

  const filteredMembers = group.members.filter(
    (m) =>
      m.user.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      (m.user.role && m.user.role.toLowerCase().includes(searchMemberQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Cover / Gradient */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl mb-3">
              <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {group.name}
            </h2>
            {group.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs line-clamp-2">
                {group.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                👥 {group.membersCount} {language === 'km' ? 'សមាជិក' : 'members'}
              </span>
            </div>

            {/* Quick Call Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4 w-full">
              <button
                onClick={() => {
                  onClose();
                  onStartCall('audio');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                {language === 'km' ? 'ការហៅសំឡេង' : 'Audio Call'}
              </button>
              <button
                onClick={() => {
                  onClose();
                  onStartCall('video');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                {language === 'km' ? 'ការហៅវីដេអូ' : 'Video Call'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Invite Link Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                {language === 'km' ? 'តំណភ្ជាប់អញ្ជើញក្រុម' : 'Group Invite Link'}
              </span>
              {group.inviteCode && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {group.inviteCode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}?join_chat=${group.inviteCode || group.id}`}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-600 dark:text-slate-400 select-all"
              />
              <button
                onClick={handleCopyInviteLink}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? (language === 'km' ? 'បានចម្លង!' : 'Copied!') : (language === 'km' ? 'ចម្លង' : 'Copy')}
              </button>
            </div>
          </div>

          {/* Members Header & Add Member Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'km' ? 'សមាជិកក្រុម' : 'Group Members'} ({group.members.length})
              </h3>
              <button
                onClick={() => {
                  if (!showInviteSection) fetchAvailableFriends();
                  setShowInviteSection(!showInviteSection);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showInviteSection
                  ? (language === 'km' ? 'បិទ' : 'Done')
                  : (language === 'km' ? '+ អញ្ជើញមិត្តភក្ដិ' : '+ Add Members')}
              </button>
            </div>

            {/* Invite Section Drawer */}
            {showInviteSection && (
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-150">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {language === 'km' ? 'ជ្រើសរើសមិត្តភក្ដិដើម្បីបញ្ចូលទៅក្នុងក្រុម:' : 'Select friends to add to this group:'}
                </p>

                {loadingFriends ? (
                  <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    {language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading friends...'}
                  </div>
                ) : availableFriends.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    {language === 'km' ? 'មិត្តភក្ដិទាំងអស់បានចូលរួចហើយ។' : 'All available friends are already in this group.'}
                  </p>
                ) : (
                  <>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {availableFriends.map((f) => {
                        const isSelected = selectedInviteIds.has(f.id);
                        return (
                          <div
                            key={f.id}
                            onClick={() => toggleInviteUser(f.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-100/70 dark:bg-blue-900/40' : 'hover:bg-white/60 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={api.getMediaUrl(f.avatar)}
                                alt={f.name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {f.name}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleSendInvites}
                      disabled={isInviting || selectedInviteIds.size === 0}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      {isInviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {language === 'km'
                        ? `បញ្ចូល ${selectedInviteIds.size} នាក់`
                        : `Add ${selectedInviteIds.size} Members`}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Members Search & List */}
            <div className="space-y-1.5">
              {group.members.length > 5 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    placeholder={language === 'km' ? 'ស្វែងរកសមាជិក...' : 'Filter members...'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-48 overflow-y-auto">
                {filteredMembers.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={api.getMediaUrl(m.user.avatar)}
                          alt={m.user.name}
                          className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800"
                        />
                        {m.user.isOnline && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900 absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {m.user.name}
                          </p>
                          {m.userId === currentUser.id && (
                            <span className="text-[10px] text-slate-400">({language === 'km' ? 'ខ្ញុំ' : 'You'})</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {m.user.role || 'Member'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {m.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 px-2 py-0.5">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leave Group Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isLeaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              {language === 'km' ? 'ចាកចេញពីក្រុមជជែក' : 'Leave Group Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

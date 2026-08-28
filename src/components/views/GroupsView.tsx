import React, { useState } from 'react';
import { Users, Lock, Globe, Plus, Check, Edit3, Trash2, X, ImagePlus, Loader2, Search } from 'lucide-react';
import { Group, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { groupsApi } from '../../modules/groups/api';
import { EditGroupModal } from '../EditGroupModal';
import { GroupMembersModal } from '../GroupMembersModal';

interface GroupsViewProps {
  groups: Group[];
  currentUser: User;
  onSelectGroup: (group: Group) => void;
  onToggleJoinGroup: (groupId: string) => void;
  onViewProfile?: (userId: string) => void;
  onStartChat?: (user: User) => void;
  onGroupCreated?: (group: Group) => void;
  onGroupUpdated?: (group: Group) => void;
  onGroupDeleted?: (groupId: string) => void;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80';
const DEFAULT_ICON = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80';

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  currentUser,
  onSelectGroup,
  onToggleJoinGroup,
  onViewProfile,
  onStartChat,
  onGroupCreated,
  onGroupUpdated,
  onGroupDeleted,
}) => {
  const { t, language } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingMembersGroup, setViewingMembersGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [coverImage, setCoverImage] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    try {
      const res = await api.uploadMedia(file);
      setIcon(res.url);
    } catch (err) {
      console.warn('Icon upload notice:', err);
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await api.uploadMedia(file);
      setCoverImage(res.url);
    } catch (err) {
      console.warn('Cover upload notice:', err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const resetCreateForm = () => {
    setName('');
    setDescription('');
    setIsPrivate(false);
    setIcon(DEFAULT_ICON);
    setCoverImage('');
    setCreateError(null);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      const newGroup = await groupsApi.createGroup({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        icon,
        coverImage: coverImage || undefined,
      });
      onGroupCreated?.(newGroup);
      resetCreateForm();
      setShowCreateForm(false);
    } catch (err: any) {
      console.warn('Create group error:', err);
      setCreateError(err?.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    setIsDeleting(true);
    try {
      await groupsApi.deleteGroup(deletingGroup.id);
      onGroupDeleted?.(deletingGroup.id);
      setDeletingGroup(null);
    } catch (err) {
      console.warn('Delete group error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            {t('groups.title')}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
            {t('groups.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showCreateForm ? t('groups.cancel') : t('groups.newGroup')}</span>
        </button>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateGroup}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900 text-sm">{t('groups.newGroup')}</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {createError}
            </div>
          )}

          {/* Cover & Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {language === 'km' ? 'រូបគម្រប & រូបតំណាង' : 'Group Cover & Icon'}
            </label>
            <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
              <img
                src={coverImage ? api.getMediaUrl(coverImage) : DEFAULT_COVER}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white gap-0.5">
                {isUploadingCover ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[11px] font-medium">{language === 'km' ? 'ប្តូររូបគម្រប' : 'Change Cover'}</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>

              {/* Icon Overlay */}
              <div className="absolute -bottom-1 left-3 translate-y-1/4">
                <div className="relative group/icon w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                  <img src={api.getMediaUrl(icon)} alt="Icon" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                    {isUploadingIcon ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('groups.namePlaceholder')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('groups.namePlaceholder')}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('groups.descriptionPlaceholder')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('groups.descriptionPlaceholder')}
              rows={2}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Privacy Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('groups.privacy')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  !isPrivate
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900 font-semibold'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs">{t('groups.public')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isPrivate
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900 font-semibold'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs">{t('groups.private')}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('groups.cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isCreating ? t('groups.creating') : t('groups.publishGroup')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search Filter */}
      {groups.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('groups.searchMembers')}
            className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition-all"
          />
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-1">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
          <p className="text-gray-500 text-sm font-semibold">{t('groups.noGroups')}</p>
          <p className="text-gray-400 text-xs">{t('groups.noGroupsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              {/* Group Cover Thumbnail */}
              {group.coverImage && (
                <div className="h-20 w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={api.getMediaUrl(group.coverImage)}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                  {group.isManaged && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs rounded-lg p-1 shadow-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroup(group);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title={t('groups.editGroup')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingGroup(group);
                        }}
                        className="p-1 text-gray-600 hover:text-red-600 rounded transition-colors cursor-pointer"
                        title={t('groups.deleteGroup')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Group Info Body */}
              <div 
                className="p-4 sm:p-5 cursor-pointer flex-1"
                onClick={() => onSelectGroup(group)}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={api.getMediaUrl(group.icon)}
                      alt={group.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{group.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        {group.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        <span>
                          {group.isPrivate ? t('groups.private') : t('groups.public')} •
                        </span>
                        {/* Clickable members count */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingMembersGroup(group);
                          }}
                          className="text-blue-600 hover:underline font-medium cursor-pointer ml-0.5"
                        >
                          {group.membersCount}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!group.coverImage && group.isManaged && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroup(group);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                        title={t('groups.editGroup')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingGroup(group);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title={t('groups.deleteGroup')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{group.description}</p>
              </div>

              {/* Bottom Footer Action Bar */}
              <div className="px-4 sm:px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setViewingMembersGroup(group)}
                  className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>{t('groups.viewMembers')}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectGroup(group)}
                    className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 cursor-pointer transition-colors"
                  >
                    {t('groups.view')}
                  </button>
                  <button
                    onClick={() => onToggleJoinGroup(group.id)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      group.joined
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                    }`}
                  >
                    {group.joined ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{group.joined ? t('groups.joined') : t('groups.joinGroup')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onGroupUpdated={(updated) => {
            onGroupUpdated?.(updated);
            setEditingGroup(null);
          }}
        />
      )}

      {/* Group Members Modal */}
      {viewingMembersGroup && (
        <GroupMembersModal
          group={viewingMembersGroup}
          currentUser={currentUser}
          onClose={() => setViewingMembersGroup(null)}
          onSelectUser={(u) => onViewProfile?.(u.id)}
          onStartChat={onStartChat}
        />
      )}

      {/* Delete Group Confirmation Modal */}
      {deletingGroup && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDeletingGroup(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 text-center space-y-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{t('groups.confirmDeleteTitle')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('groups.confirmDeleteDesc')}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingGroup(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t('groups.cancel')}
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('groups.delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

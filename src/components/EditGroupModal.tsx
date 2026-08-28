import React, { useState } from 'react';
import { X, ImagePlus, Loader2, Lock, Globe, ShieldCheck } from 'lucide-react';
import { Group } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { groupsApi } from '../modules/groups/api';

interface EditGroupModalProps {
  group: Group;
  onClose: () => void;
  onGroupUpdated: (updated: Group) => void;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80';

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  group,
  onClose,
  onGroupUpdated,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [isPrivate, setIsPrivate] = useState(group.isPrivate);
  const [icon, setIcon] = useState(group.icon);
  const [coverImage, setCoverImage] = useState(group.coverImage || '');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await groupsApi.updateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        icon: icon || group.icon,
        coverImage: coverImage || undefined,
      });
      onGroupUpdated(updated);
      onClose();
    } catch (err: any) {
      console.warn('Update group error:', err);
      setError(err?.message || 'Failed to update group');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">{t('groups.editGroup')}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Cover & Icon */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {language === 'km' ? 'រូបគម្រប និងរូបតំណាងក្រុម' : 'Group Cover & Icon'}
            </label>
            <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
              <img 
                src={coverImage ? api.getMediaUrl(coverImage) : DEFAULT_COVER} 
                alt="Group cover" 
                className="w-full h-full object-cover" 
              />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white gap-1">
                {isUploadingCover ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs font-medium">{language === 'km' ? 'ប្តូររូបគម្រប' : 'Change Cover'}</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>

              {/* Group Icon */}
              <div className="absolute -bottom-1 left-4 translate-y-1/4">
                <div className="relative group/icon w-16 h-16 rounded-2xl overflow-hidden border-3 border-white shadow-md bg-white">
                  <img src={api.getMediaUrl(icon)} alt="Group icon" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                    {isUploadingIcon ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
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

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('groups.descriptionPlaceholder')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('groups.descriptionPlaceholder')}
              rows={3}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('groups.privacy')}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  !isPrivate
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Globe className={`w-4 h-4 mt-0.5 shrink-0 ${!isPrivate ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <div className="font-semibold text-xs">{t('groups.public')}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{t('groups.publicDesc')}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  isPrivate
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${isPrivate ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <div className="font-semibold text-xs">{t('groups.private')}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{t('groups.privateDesc')}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('groups.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? t('groups.editing') : t('groups.saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

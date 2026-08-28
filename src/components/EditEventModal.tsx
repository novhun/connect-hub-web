import React, { useState } from 'react';
import { X, ImagePlus, Loader2, Calendar, MapPin, Tag } from 'lucide-react';
import { EventItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { eventsApi } from '../modules/events/api';

interface EditEventModalProps {
  event: EventItem;
  onClose: () => void;
  onEventUpdated: (updated: EventItem) => void;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80';

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  onClose,
  onEventUpdated,
}) => {
  const { t, language } = useLanguage();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location);
  const [category, setCategory] = useState(event.category || '');
  
  // Format ISO startAt to datetime-local input string
  const formatForInput = (iso: string) => {
    try {
      const d = new Date(iso);
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [startAt, setStartAt] = useState(formatForInput(event.startAt));
  const [coverImage, setCoverImage] = useState(event.coverImage || '');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!title.trim() || !location.trim() || !startAt) return;

    setIsSaving(true);
    try {
      const updated = await eventsApi.updateEvent(event.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim(),
        category: category.trim() || undefined,
        coverImage: coverImage || undefined,
        startAt: new Date(startAt).toISOString(),
      });
      onEventUpdated(updated);
      onClose();
    } catch (err) {
      console.warn('Update event API notice:', err);
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
          <h2 className="font-bold text-gray-900 text-base">{t('events.editEvent')}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {language === 'km' ? 'រូបគម្របព្រឹត្តិការណ៍' : 'Event Cover Photo'}
            </label>
            <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
              <img 
                src={coverImage ? api.getMediaUrl(coverImage) : DEFAULT_COVER} 
                alt="Event cover preview" 
                className="w-full h-full object-cover" 
              />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white gap-1">
                {isUploadingCover ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs font-medium">{language === 'km' ? 'ប្តូររូបភាព' : 'Change Cover'}</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('events.titlePlaceholder')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('events.titlePlaceholder')}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('events.descriptionPlaceholder')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('events.descriptionPlaceholder')}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Location & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{t('events.locationPlaceholder')}</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('events.locationPlaceholder')}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('events.categoryPlaceholder')}</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('events.categoryPlaceholder')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-green-500" />
              <span>{language === 'km' ? 'កាលបរិច្ឆេទ & ពេលវេលា' : 'Date & Time'}</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('events.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? t('events.editing') : t('events.saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

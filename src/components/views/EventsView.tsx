import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Check, X, Trash2, Edit3, Loader2, ImagePlus, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { eventsApi } from '../../modules/events/api';
import { EventItem, User } from '../../types';
import { EditEventModal } from '../EditEventModal';
import { EventMembersModal } from '../EventMembersModal';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80';

function formatEventDate(isoString: string, language: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface EventsViewProps {
  currentUser?: User;
  onViewProfile?: (userId: string) => void;
  onStartChat?: (user: User) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  currentUser,
  onViewProfile,
  onStartChat,
}) => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Edit and View Members Modal States
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [viewingMembersEvent, setViewingMembersEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);

  // Create Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [startAt, setStartAt] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (e) {
      console.warn('Failed to load events:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const setBusy = (id: string, value: boolean) => {
    setBusyIds((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggleAttend = async (event: EventItem) => {
    setBusy(event.id, true);
    try {
      const updated = event.isAttending
        ? await eventsApi.leaveEvent(event.id)
        : await eventsApi.attendEvent(event.id);
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    } catch (e) {
      console.warn('Toggle attend API notice:', e);
    } finally {
      setBusy(event.id, false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    const targetId = deletingEvent.id;
    setBusy(targetId, true);
    try {
      await eventsApi.deleteEvent(targetId);
      setEvents((prev) => prev.filter((e) => e.id !== targetId));
      setDeletingEvent(null);
    } catch (e) {
      console.warn('Delete event API notice:', e);
    } finally {
      setBusy(targetId, false);
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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setStartAt('');
    setCoverImage('');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !startAt) return;

    setIsCreating(true);
    try {
      const created = await eventsApi.createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim(),
        category: category.trim() || undefined,
        coverImage: coverImage || undefined,
        startAt: new Date(startAt).toISOString(),
      });
      setEvents((prev) => [...prev, created].sort((a, b) => a.startAt.localeCompare(b.startAt)));
      resetForm();
      setShowCreateForm(false);
    } catch (err) {
      console.warn('Create event API notice:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('events.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('events.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showCreateForm ? t('events.cancel') : t('events.newEvent')}</span>
        </button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative group">
              <img src={coverImage ? api.getMediaUrl(coverImage) : DEFAULT_COVER} alt="Cover preview" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white">
                {isUploadingCover ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-medium mt-0.5">{language === 'km' ? 'ប្តូររូប' : 'Cover'}</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('events.titlePlaceholder')}
              required
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('events.descriptionPlaceholder')}
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('events.locationPlaceholder')}
              required
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t('events.categoryPlaceholder')}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isCreating ? t('events.creating') : t('events.publishEvent')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Event Cards Stream */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100/70 animate-pulse h-44" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-1">
            <p className="text-gray-500 text-sm">{t('events.noEvents')}</p>
            <p className="text-gray-400 text-xs">{t('events.noEventsHint')}</p>
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-sm transition-shadow flex flex-col sm:flex-row">
              {/* Event Cover Photo */}
              <div className="sm:w-60 h-44 sm:h-auto relative overflow-hidden bg-gray-100 shrink-0">
                <img src={ev.coverImage ? api.getMediaUrl(ev.coverImage) : DEFAULT_COVER} alt={ev.title} className="w-full h-full object-cover" />
                {ev.category && (
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-blue-700 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-2xs">
                    {ev.category}
                  </span>
                )}
              </div>

              {/* Event Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base mb-1.5">{ev.title}</h3>
                    {/* Creator Actions: Edit & Delete */}
                    {ev.isCreator && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          title={t('events.editEvent')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingEvent(ev)}
                          disabled={busyIds[ev.id]}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                          title={t('events.deleteEvent')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {ev.description && (
                    <p className="text-xs text-gray-500 mb-2.5 line-clamp-2">{ev.description}</p>
                  )}

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{formatEventDate(ev.startAt, language)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{ev.location}</span>
                    </div>
                    {/* Attendees Count / Clickable to view members */}
                    <div 
                      onClick={() => setViewingMembersEvent(ev)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors select-none group w-fit"
                      title={t('events.viewMembers')}
                    >
                      <Users className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="underline decoration-blue-200 underline-offset-2">
                        {ev.attendeesCount} {t('events.attendees')}
                      </span>
                      <span className="text-[10px] bg-blue-50 px-1.5 py-0.2 rounded text-blue-600 font-normal">
                        {t('events.viewMembers')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Attend Action */}
                <div className="pt-4 flex items-center justify-between gap-2 border-t border-gray-50 mt-3">
                  <button
                    onClick={() => setViewingMembersEvent(ev)}
                    className="text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('events.viewMembers')}</span>
                  </button>

                  <button
                    onClick={() => handleToggleAttend(ev)}
                    disabled={busyIds[ev.id]}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 ${
                      ev.isAttending
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                    }`}
                  >
                    {ev.isAttending ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{ev.isAttending ? t('events.attending') : t('events.attendEvent')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onEventUpdated={(updated) => {
            setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          }}
        />
      )}

      {/* Event Members / Attendees Modal */}
      {viewingMembersEvent && (
        <EventMembersModal
          event={viewingMembersEvent}
          currentUser={currentUser || { id: '', name: '', username: '', avatar: '' }}
          onClose={() => setViewingMembersEvent(null)}
          onSelectUser={(u) => onViewProfile?.(u.id)}
          onStartChat={onStartChat}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDeletingEvent(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-gray-100 text-center space-y-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{t('events.confirmDeleteTitle')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('events.confirmDeleteDesc')}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t('events.cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={busyIds[deletingEvent.id]}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                {busyIds[deletingEvent.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t('events.delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

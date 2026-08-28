import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Check, X, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { eventsApi } from '../../modules/events/api';
import { EventItem } from '../../types';

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

export const EventsView: React.FC = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

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

  const handleDelete = async (event: EventItem) => {
    setBusy(event.id, true);
    try {
      await eventsApi.deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (e) {
      console.warn('Delete event API notice:', e);
    } finally {
      setBusy(event.id, false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await api.uploadMedia(file);
      setCoverImage(api.getMediaUrl(res.url));
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('events.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('events.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showCreateForm ? t('events.cancel') : t('events.newEvent')}</span>
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
              <img src={coverImage || DEFAULT_COVER} alt="Cover preview" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                {isUploadingCover ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4 text-white" />
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
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('events.descriptionPlaceholder')}
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('events.locationPlaceholder')}
              required
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t('events.categoryPlaceholder')}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isCreating ? t('events.creating') : t('events.publishEvent')}
            </button>
          </div>
        </form>
      )}

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
            <div key={ev.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col sm:flex-row">
              <div className="sm:w-60 h-44 sm:h-auto relative overflow-hidden bg-gray-100 shrink-0">
                <img src={ev.coverImage ? api.getMediaUrl(ev.coverImage) : DEFAULT_COVER} alt={ev.title} className="w-full h-full object-cover" />
                {ev.category && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-blue-700 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-2xs">
                    {ev.category}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base mb-2">{ev.title}</h3>
                    {ev.isCreator && (
                      <button
                        onClick={() => handleDelete(ev)}
                        disabled={busyIds[ev.id]}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 cursor-pointer shrink-0"
                        title={t('events.deleteEvent')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{ev.description}</p>
                  )}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatEventDate(ev.startAt, language)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ev.attendeesCount} {t('events.attendees')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
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
    </div>
  );
};

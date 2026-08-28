import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const EventsView: React.FC = () => {
  const { t, language } = useLanguage();
  const [attending, setAttending] = useState<{ [key: string]: boolean }>({ 'ev-1': true });

  const events = [
    {
      id: 'ev-1',
      title: language === 'km' ? 'ការដើរឡើងភ្នំ និងថតរូបទេសភាពចុងសប្តាហ៍' : 'Weekend Mountain Trail & Photography Walk',
      date: language === 'km' ? 'សៅរ៍, 12 កញ្ញា • 07:00 ព្រឹក' : 'Sat, Sep 12 • 07:00 AM',
      location: language === 'km' ? 'ឧទ្យានជាតិ Mount Rainier, ច្រកចូលលេខ 4' : 'Mount Rainier National Park, Trailhead 4',
      attendees: 38,
      cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
      category: language === 'km' ? 'ក្រៅផ្ទះ & ឡើងភ្នំ' : 'Outdoor & Hiking',
    },
    {
      id: 'ev-2',
      title: language === 'km' ? 'ការវាយតម្លៃ UI/UX Design & ប្រព័ន្ធរចនា 2026' : 'UI/UX Design Critique & Design Systems 2026',
      date: language === 'km' ? 'ពុធ, 16 កញ្ញា • 06:30 ល្ងាច' : 'Wed, Sep 16 • 06:30 PM',
      location: language === 'km' ? 'បន្ទប់វីដេអូអនឡាញ (ConnectHub Live)' : 'Online Video Room (ConnectHub Live)',
      attendees: 124,
      cover: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      category: language === 'km' ? 'ការរចនា & បច្ចេកវិទ្យា' : 'Design & Tech',
    },
    {
      id: 'ev-3',
      title: language === 'km' ? 'React 19 & Next-Gen State Management Hackathon' : 'React 19 & Next-Gen State Management Hackathon',
      date: language === 'km' ? 'សុក្រ, 25 កញ្ញា • 09:00 ព្រឹក' : 'Fri, Sep 25 • 09:00 AM',
      location: language === 'km' ? 'មជ្ឈមណ្ឌលនវានុវត្តន៍បច្ចេកវិទ្យា, ភ្នំពេញ' : 'Tech Innovation Hub, Phnom Penh',
      attendees: 86,
      cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      category: 'Hackathon',
    },
  ];

  const toggleAttend = (id: string) => {
    setAttending((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('events.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('events.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col sm:flex-row">
            <div className="sm:w-60 h-44 sm:h-auto relative overflow-hidden bg-gray-100 shrink-0">
              <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-blue-700 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-2xs">
                {ev.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{ev.title}</h3>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{ev.attendees + (attending[ev.id] ? 1 : 0)} {t('events.attendees')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => toggleAttend(ev.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer ${
                    attending[ev.id]
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                  }`}
                >
                  {attending[ev.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{attending[ev.id] ? t('events.attending') : t('events.attendEvent')}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Compass, TrendingUp, Sparkles, Image as ImageIcon, Flame, Tag } from 'lucide-react';
import { Post, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ExploreViewProps {
  posts: Post[];
  currentUser: User;
  onPostClick: (post: Post) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  currentUser,
  onPostClick,
}) => {
  const { t, language } = useLanguage();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const trendingTopics = [
    { 
      tag: '#AlpineHiking', 
      posts: language === 'km' ? '42.8K ការបង្ហោះ' : '42.8K posts', 
      category: language === 'km' ? 'ក្រៅផ្ទះ & ធម្មជាតិ' : 'Outdoor & Nature' 
    },
    { 
      tag: '#TailwindCSS4', 
      posts: language === 'km' ? '18.2K ការបង្ហោះ' : '18.2K posts', 
      category: language === 'km' ? 'ប្រព័ន្ធរចនា' : 'Design Systems' 
    },
    { 
      tag: '#React19Features', 
      posts: language === 'km' ? '85.4K ការបង្ហោះ' : '85.4K posts', 
      category: language === 'km' ? 'ការអភិវឌ្ឍន៍គេហទំព័រ' : 'Web Development' 
    },
    { 
      tag: '#CleanArchitecture', 
      posts: language === 'km' ? '31.1K ការបង្ហោះ' : '31.1K posts', 
      category: language === 'km' ? 'វិស្វកម្មកម្មវិធី' : 'Software Engineering' 
    },
    { 
      tag: '#PhotographyGoldenHour', 
      posts: language === 'km' ? '64.9K ការបង្ហោះ' : '64.9K posts', 
      category: language === 'km' ? 'សិល្បៈរូបភាព' : 'Visual Arts' 
    },
  ];

  const exploreImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-blue-200" />
            <h1 className="text-xl font-bold">{t('explore.title')}</h1>
          </div>
          <p className="text-sm text-blue-100">
            {t('explore.subtitle')}
          </p>
        </div>
      </div>

      {/* Trending Tags */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="font-bold text-gray-900 text-sm">{t('explore.trendingTopics')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              onClick={() => setSelectedTag(selectedTag === topic.tag ? null : topic.tag)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedTag === topic.tag
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div>
                <span className="font-bold text-sm text-blue-600 block">{topic.tag}</span>
                <span className="text-xs text-gray-400">{topic.category}</span>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-2xs">
                {topic.posts}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Visual Gallery Grid */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm mb-4">{t('explore.trendingVisuals')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {exploreImages.map((img, idx) => (
            <div
              key={idx}
              className="h-44 rounded-xl overflow-hidden group relative cursor-pointer shadow-2xs"
            >
              <img
                src={img}
                alt={`Trending visual ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-xs font-medium">
                  {language === 'km' ? `វិចិត្រសាល #${idx + 1}` : `Explore Gallery #${idx + 1}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

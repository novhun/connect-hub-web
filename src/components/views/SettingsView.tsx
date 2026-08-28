import React, { useState } from 'react';
import { Shield, Bell, Lock, Globe, Moon, Eye, Smartphone, Check } from 'lucide-react';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SettingsViewProps {
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const { language, setLanguage, t } = useLanguage();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [callRinging, setCallRinging] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Language Preference Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 text-sm">{t('settings.languagePreference')}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-xl border-2 flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
              language === 'en'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-bold text-gray-900">🇺🇸 English</span>
              {language === 'en' && <Check className="w-4 h-4 text-blue-600" />}
            </div>
            <span className="text-xs text-gray-500">English (United States)</span>
          </button>

          <button
            onClick={() => setLanguage('km')}
            className={`p-4 rounded-xl border-2 flex flex-col items-start gap-1 text-left transition-all cursor-pointer font-khmer ${
              language === 'km'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-bold text-gray-900">🇰🇭 ភាសាខ្មែរ</span>
              {language === 'km' && <Check className="w-4 h-4 text-blue-600" />}
            </div>
            <span className="text-xs text-gray-500">Khmer (Kantumruy Pro font)</span>
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 text-sm">{t('settings.notificationsSounds')}</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-xl">
            <div>
              <span className="font-semibold text-sm text-gray-800 block">{t('settings.pushNotifications')}</span>
              <span className="text-xs text-gray-400">{t('settings.pushNotificationsDesc')}</span>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={() => setEmailNotifs(!emailNotifs)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-xl">
            <div>
              <span className="font-semibold text-sm text-gray-800 block">{t('settings.callRingtone')}</span>
              <span className="text-xs text-gray-400">{t('settings.callRingtoneDesc')}</span>
            </div>
            <input
              type="checkbox"
              checked={callRinging}
              onChange={() => setCallRinging(!callRinging)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 text-sm">{t('settings.privacyVisibility')}</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2">
            <div>
              <span className="font-semibold text-sm text-gray-800 block">{t('settings.defaultAudience')}</span>
              <span className="text-gray-400">{t('settings.defaultAudienceDesc')}</span>
            </div>
            <select className="bg-gray-100 rounded-lg p-2 font-semibold text-gray-700 outline-none">
              <option>{t('settings.publicEveryone')}</option>
              <option>{t('settings.friendsOnly')}</option>
              <option>{t('settings.onlyMeOption')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-2">
            <div>
              <span className="font-semibold text-sm text-gray-800 block">{t('settings.onlineStatus')}</span>
              <span className="text-gray-400">{t('settings.onlineStatusDesc')}</span>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-full border border-green-200">
              {t('settings.enabled')}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end items-center gap-3">
        {savedSuccess && (
          <span className="text-xs text-green-600 font-bold flex items-center gap-1 animate-in fade-in">
            <Check className="w-4 h-4" /> {t('settings.savedSuccess')}
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-transform"
        >
          {t('settings.saveChanges')}
        </button>
      </div>
    </div>
  );
};

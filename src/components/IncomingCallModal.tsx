import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { settingsApi } from '../modules/settings/api';
import { startIncomingRing, stopRingtone } from '../services/ringtone';

interface IncomingCallModalProps {
  fromUser: User;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  fromUser,
  callType,
  onAccept,
  onDecline,
}) => {
  const { language } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    settingsApi
      .getSettings()
      .then((s) => {
        if (!cancelled && s.callRingtone !== false) startIncomingRing();
      })
      .catch(() => {
        if (!cancelled) startIncomingRing();
      });
    return () => {
      cancelled = true;
      stopRingtone();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6">
        <div className="relative mx-auto w-fit">
          <div className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-2xl overflow-hidden bg-slate-800 relative z-10">
            <img
              src={api.getMediaUrl(fromUser.avatar)}
              alt={fromUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping duration-1000" />
          <div className="absolute -inset-6 rounded-full bg-blue-500/10 animate-pulse duration-1000" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">{fromUser.name}</h3>
          <p className="text-sm text-slate-400 mt-1 flex items-center justify-center gap-1.5">
            {callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            {callType === 'video'
              ? (language === 'km' ? 'ការហៅជាវីដេអូចូល...' : 'Incoming video call...')
              : (language === 'km' ? 'ការហៅជាសំឡេងចូល...' : 'Incoming audio call...')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xl shadow-red-600/30 flex items-center justify-center transition-all cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-xs text-slate-400">{language === 'km' ? 'បដិសេធ' : 'Decline'}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white shadow-xl shadow-green-600/30 flex items-center justify-center transition-all cursor-pointer animate-pulse"
            >
              {callType === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
            <span className="text-xs text-slate-400">{language === 'km' ? 'ទទួល' : 'Accept'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

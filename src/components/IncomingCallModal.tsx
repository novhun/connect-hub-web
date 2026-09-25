import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video, Users } from 'lucide-react';
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
  isGroupCall?: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  fromUser,
  callType,
  onAccept,
  onDecline,
  isGroupCall = false,
  groupName,
  groupAvatar,
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
    <div className="fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6">
        {/* Caller Avatar or Group Avatar */}
        <div className="relative mx-auto w-fit">
          <div className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-2xl overflow-hidden bg-slate-800 relative z-10 flex items-center justify-center text-4xl">
            {isGroupCall && groupAvatar ? (
              <img
                src={api.getMediaUrl(groupAvatar)}
                alt={groupName || 'Group'}
                className="w-full h-full object-cover"
              />
            ) : isGroupCall ? (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <Users className="w-12 h-12" />
              </div>
            ) : (
              <img
                src={api.getMediaUrl(fromUser.avatar)}
                alt={fromUser.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Caller badge on group call */}
          {isGroupCall && (
            <div className="absolute -bottom-1 -right-1 z-20 w-10 h-10 rounded-full border-2 border-slate-950 overflow-hidden bg-slate-800 shadow-lg">
              <img
                src={api.getMediaUrl(fromUser.avatar)}
                alt={fromUser.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping duration-1000" />
          <div className="absolute -inset-6 rounded-full bg-blue-500/10 animate-pulse duration-1000" />
        </div>

        <div>
          {isGroupCall && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-2 border border-blue-500/30">
              <Users className="w-3.5 h-3.5" />
              {language === 'km' ? 'ការហៅជាក្រុម' : 'Group Call'}
            </div>
          )}

          <h3 className="text-xl font-bold text-white">
            {isGroupCall ? groupName || 'Group Call' : fromUser.name}
          </h3>

          {isGroupCall && (
            <p className="text-xs text-blue-300 font-medium mt-0.5">
              {language === 'km' ? `អញ្ជើញដោយ ${fromUser.name}` : `Invited by ${fromUser.name}`}
            </p>
          )}

          <p className="text-sm text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
            {callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            {isGroupCall
              ? (callType === 'video'
                ? (language === 'km' ? 'ការហៅវីដេអូជាក្រុមចូល...' : 'Incoming group video call...')
                : (language === 'km' ? 'ការហៅសំឡេងជាក្រុមចូល...' : 'Incoming group audio call...'))
              : (callType === 'video'
                ? (language === 'km' ? 'ការហៅជាវីដេអូចូល...' : 'Incoming video call...')
                : (language === 'km' ? 'ការហៅជាសំឡេងចូល...' : 'Incoming audio call...'))}
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
            <span className="text-xs text-slate-400">{language === 'km' ? 'ចូលរួម' : isGroupCall ? 'Join' : 'Accept'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


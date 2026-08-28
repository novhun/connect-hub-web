import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, Plus, Clock, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CallsViewProps {
  onlineMembers: UserType[];
  onStartCall: (user: UserType, type: 'audio' | 'video') => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  onlineMembers,
  onStartCall,
}) => {
  const { t, language } = useLanguage();
  const callLogs = [
    { 
      user: onlineMembers[0], 
      type: 'incoming', 
      date: language === 'km' ? 'ថ្ងៃនេះ, 1:15 PM' : 'Today, 1:15 PM', 
      status: 'missed', 
      callType: 'video' 
    },
    { 
      user: onlineMembers[1], 
      type: 'outgoing', 
      date: language === 'km' ? 'ម្សិលមិញ, 4:20 PM' : 'Yesterday, 4:20 PM', 
      status: 'completed', 
      duration: language === 'km' ? '14 នាទី 20 វិនាទី' : '14m 20s', 
      callType: 'audio' 
    },
    { 
      user: onlineMembers[2], 
      type: 'incoming', 
      date: language === 'km' ? '24 សីហា, 11:00 AM' : 'Aug 24, 11:00 AM', 
      status: 'completed', 
      duration: language === 'km' ? '32 នាទី 05 វិនាទី' : '32m 05s', 
      callType: 'video' 
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('calls.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('calls.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onStartCall(onlineMembers[0], 'audio')}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('calls.newAudioCall')}</span>
          </button>
          <button
            onClick={() => onStartCall(onlineMembers[0], 'video')}
            className="px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{t('calls.newVideoRoom')}</span>
          </button>
        </div>
      </div>

      {/* Online contacts quick dial */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 mb-3">{t('calls.quickConnect')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {onlineMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-xl border border-gray-200 flex items-center justify-between bg-gray-50/60"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                  <span className="text-[10px] text-green-600 font-medium">{t('calls.available')}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onStartCall(member, 'audio')}
                  className="p-2 bg-white hover:bg-green-50 text-green-600 rounded-lg border border-gray-200 shadow-2xs cursor-pointer"
                  title="Audio call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCall(member, 'video')}
                  className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg border border-gray-200 shadow-2xs cursor-pointer"
                  title="Video call"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Calls History */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 mb-3">{t('calls.callHistory')}</h2>
        <div className="divide-y divide-gray-100">
          {callLogs.map((log, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={log.user.avatar}
                  alt={log.user.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{log.user.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    {log.type === 'incoming' ? (
                      <PhoneIncoming className={`w-3.5 h-3.5 ${log.status === 'missed' ? 'text-red-500' : 'text-green-500'}`} />
                    ) : (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>{log.date}</span>
                    {log.duration && <span>• {log.duration}</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onStartCall(log.user, log.callType as any)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {log.callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                  <span>{t('calls.callback')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { User as UserType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

interface CallsViewProps {
  onlineMembers: UserType[];
  onStartCall: (user: UserType, type: 'audio' | 'video') => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  onlineMembers,
  onStartCall,
}) => {
  const { t } = useLanguage();
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCallLogs = async () => {
    try {
      const logs = await api.getCallHistory();
      setCallLogs(logs || []);
    } catch (e) {
      console.warn('Fetch call history API notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const handleStartCallWithApi = (user: UserType, type: 'audio' | 'video') => {
    onStartCall(user, type);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">{t('calls.title')}</h1>
          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{t('calls.subtitle')}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {onlineMembers.length > 0 && (
            <>
              <button
                onClick={() => handleStartCallWithApi(onlineMembers[0], 'audio')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('calls.newAudioCall')}</span>
              </button>
              <button
                onClick={() => handleStartCallWithApi(onlineMembers[0], 'video')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{t('calls.newVideoRoom')}</span>
              </button>
            </>
          )}
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
                  src={api.getMediaUrl(member.avatar)}
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
                  onClick={() => handleStartCallWithApi(member, 'audio')}
                  className="p-2 bg-white hover:bg-green-50 text-green-600 rounded-lg border border-gray-200 shadow-2xs cursor-pointer"
                  title="Audio call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStartCallWithApi(member, 'video')}
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
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">{t('calls.loadingHistory')}</div>
        ) : callLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">{t('calls.noCallHistory')}</div>
        ) : (
        <div className="divide-y divide-gray-100">
          {callLogs.map((log, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={api.getMediaUrl(log.user?.avatar)}
                  alt={log.user?.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{log.user?.name}</h4>
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
                  onClick={() => handleStartCallWithApi(log.user, log.callType || 'audio')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {log.callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                  <span>{t('calls.callback')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

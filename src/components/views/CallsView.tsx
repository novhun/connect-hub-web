import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, Users, UserPlus, Loader2 } from 'lucide-react';
import { User as UserType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { friendsApi } from '../../modules/friends/api';

interface CallsViewProps {
  onlineMembers?: UserType[];
  onStartCall: (user: UserType, type: 'audio' | 'video') => void;
  onNavigate?: (tab: string) => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  onStartCall,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [friends, setFriends] = useState<UserType[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchFriendsAndLogs = async () => {
    try {
      setLoadingFriends(true);
      const friendsData = await friendsApi.getFriends();
      setFriends(friendsData || []);
    } catch (e) {
      console.warn('Fetch friends for calls notice:', e);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }

    try {
      setLoadingLogs(true);
      const logs = await api.getCallHistory();
      setCallLogs(logs || []);
    } catch (e) {
      console.warn('Fetch call history API notice:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchFriendsAndLogs();
  }, []);

  const handleStartCallWithApi = (user: UserType, type: 'audio' | 'video') => {
    onStartCall(user, type);
  };

  // Sort friends: online friends first
  const sortedFriends = [...friends].sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
  const firstAvailable = sortedFriends.find((f) => f.isOnline) || sortedFriends[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">{t('calls.title')}</h1>
          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{t('calls.subtitle')}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {firstAvailable && (
            <>
              <button
                onClick={() => handleStartCallWithApi(firstAvailable, 'audio')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('calls.newAudioCall')}</span>
              </button>
              <button
                onClick={() => handleStartCallWithApi(firstAvailable, 'video')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{t('calls.newVideoRoom')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Friends Contacts Quick Dial (Strictly friends only) */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{t('calls.friendsContacts')}</span>
          </h2>
          {friends.length > 0 && (
            <span className="text-xs font-semibold text-gray-500">
              {friends.filter((f) => f.isOnline).length} {language === 'km' ? 'សកម្ម' : 'Online'} / {friends.length} {language === 'km' ? 'មិត្តភក្តិ' : 'Friends'}
            </span>
          )}
        </div>

        {loadingFriends ? (
          <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">{language === 'km' ? 'កំពុងផ្ទុកទំនាក់ទំនង...' : 'Loading contacts...'}</span>
          </div>
        ) : friends.length === 0 ? (
          /* Empty state when no friends connected */
          <div className="py-8 px-4 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {language === 'km'
                ? 'មិនទាន់មានមិត្តភក្តិសម្រាប់ការហៅទូរស័ព្ទទេ។ សូមស្វែងរកនិងបន្ថែមមិត្តភក្តិជាមុនសិន!'
                : 'No friends to call yet. Connect and add friends to start audio or video calls!'}
            </p>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('friends')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'ស្វែងរកមិត្តភក្តិ' : 'Find Friends'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedFriends.map((member) => (
              <div
                key={member.id}
                className="p-3 bg-gray-50/70 hover:bg-gray-100/70 rounded-xl border border-gray-200/80 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={api.getMediaUrl(member.avatar)}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        member.isOnline ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{member.name}</h4>
                    <span
                      className={`text-[10px] font-medium block truncate ${
                        member.isOnline ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {member.isOnline
                        ? (language === 'km' ? 'សកម្ម (Online)' : 'Online')
                        : (language === 'km' ? 'អសកម្ម (Offline)' : 'Offline')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleStartCallWithApi(member, 'audio')}
                    className="p-2 bg-white hover:bg-green-50 text-green-600 rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                    title={language === 'km' ? `ហៅសំឡេងទៅ ${member.name}` : `Audio call with ${member.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartCallWithApi(member, 'video')}
                    className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                    title={language === 'km' ? `ហៅវីដេអូទៅ ${member.name}` : `Video call with ${member.name}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Calls History */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 mb-3">{t('calls.callHistory')}</h2>
        {loadingLogs ? (
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
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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

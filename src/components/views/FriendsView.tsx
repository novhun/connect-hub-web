import React, { useEffect, useState } from 'react';
import { UserPlus, UserCheck, UserX, Users, Check, X, Loader2 } from 'lucide-react';
import { User, FriendRequestItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { friendsApi } from '../../modules/friends/api';

interface FriendsViewProps {
  onViewProfile: (userId: string) => void;
}

type Tab = 'friends' | 'requests' | 'suggestions';

export const FriendsView: React.FC<FriendsViewProps> = ({ onViewProfile }) => {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<Tab>('friends');
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<User[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const setBusy = (id: string, value: boolean) => setBusyIds((prev) => ({ ...prev, [id]: value }));

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [friendsRes, incomingRes, outgoingRes, suggestionsRes] = await Promise.allSettled([
        friendsApi.getFriends(),
        friendsApi.getRequests('incoming'),
        friendsApi.getRequests('outgoing'),
        friendsApi.getSuggestions(),
      ]);
      if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value);
      if (incomingRes.status === 'fulfilled') setIncoming(incomingRes.value);
      if (outgoingRes.status === 'fulfilled') setOutgoing(outgoingRes.value);
      if (suggestionsRes.status === 'fulfilled') setSuggestions(suggestionsRes.value);
    } catch (e) {
      console.warn('Load friends API notice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAccept = async (req: FriendRequestItem) => {
    setBusy(req.id, true);
    try {
      await friendsApi.respondRequest(req.id, true);
      setIncoming((prev) => prev.filter((r) => r.id !== req.id));
      setFriends((prev) => [req.user, ...prev]);
    } catch (e) {
      console.warn('Accept friend request API notice:', e);
    } finally {
      setBusy(req.id, false);
    }
  };

  const handleDecline = async (req: FriendRequestItem) => {
    setBusy(req.id, true);
    try {
      await friendsApi.respondRequest(req.id, false);
      setIncoming((prev) => prev.filter((r) => r.id !== req.id));
      setSuggestions((prev) => (prev.some((u) => u.id === req.user.id) ? prev : [req.user, ...prev]));
    } catch (e) {
      console.warn('Decline friend request API notice:', e);
    } finally {
      setBusy(req.id, false);
    }
  };

  const handleCancel = async (req: FriendRequestItem) => {
    setBusy(req.id, true);
    try {
      await friendsApi.cancelRequest(req.id);
      setOutgoing((prev) => prev.filter((r) => r.id !== req.id));
      setSuggestions((prev) => (prev.some((u) => u.id === req.user.id) ? prev : [req.user, ...prev]));
    } catch (e) {
      console.warn('Cancel friend request API notice:', e);
    } finally {
      setBusy(req.id, false);
    }
  };

  const handleAddFriend = async (user: User) => {
    setBusy(user.id, true);
    try {
      const result = await friendsApi.sendRequest(user.id);
      setSuggestions((prev) => prev.filter((u) => u.id !== user.id));
      if (result.status === 'friends') {
        setFriends((prev) => [user, ...prev]);
      } else {
        setOutgoing((prev) => [
          { id: result.requestId || `${user.id}-pending`, user, status: 'pending', direction: 'outgoing', createdAt: '' },
          ...prev,
        ]);
      }
    } catch (e) {
      console.warn('Send friend request API notice:', e);
    } finally {
      setBusy(user.id, false);
    }
  };

  const handleUnfriend = async (user: User) => {
    setBusy(user.id, true);
    try {
      await friendsApi.unfriend(user.id);
      setFriends((prev) => prev.filter((u) => u.id !== user.id));
      setSuggestions((prev) => (prev.some((u) => u.id === user.id) ? prev : [user, ...prev]));
    } catch (e) {
      console.warn('Unfriend API notice:', e);
    } finally {
      setBusy(user.id, false);
    }
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'friends', label: t('friends.allFriends'), count: friends.length },
    { id: 'requests', label: t('friends.requests'), count: incoming.length },
    { id: 'suggestions', label: t('friends.suggestions') },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">{t('friends.title')}</h1>
        <p className="text-xs text-gray-500 mt-1">{t('friends.subtitle')}</p>

        <div className="flex gap-1.5 mt-4 border-b border-gray-100">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
                tab === tb.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{tb.label}</span>
              {!!tb.count && (
                <span className="text-[11px] font-bold bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
                  {tb.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'friends' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {friends.length === 0 ? (
                <EmptyState icon={Users} text={t('friends.noFriends')} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((user) => (
                    <div key={user.id} className="p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:border-gray-300 transition-colors">
                      <div className="relative shrink-0">
                        <img
                          src={api.getMediaUrl(user.avatar)}
                          alt={user.name}
                          onClick={() => onViewProfile(user.id)}
                          className="w-11 h-11 rounded-full object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                            user.isOnline ? 'bg-emerald-500 ring-1 ring-emerald-300/40' : 'bg-gray-300'
                          }`}
                          title={user.isOnline ? (language === 'km' ? 'សកម្ម' : 'Online') : (language === 'km' ? 'អសកម្ម' : 'Offline')}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          onClick={() => onViewProfile(user.id)}
                          className="text-sm font-bold text-gray-900 truncate cursor-pointer hover:underline"
                        >
                          {user.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              user.isOnline ? 'text-emerald-600' : 'text-gray-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                              }`}
                            />
                            <span>
                              {user.isOnline
                                ? (language === 'km' ? 'សកម្ម' : 'Online')
                                : (language === 'km' ? 'អសកម្ម' : 'Offline')}
                            </span>
                          </span>
                          {user.role && <span className="text-xs text-gray-300">•</span>}
                          {user.role && <span className="text-xs text-gray-400 truncate">{user.role}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnfriend(user)}
                        disabled={busyIds[user.id]}
                        title={t('friends.unfriend')}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer shrink-0"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'requests' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 mb-3">{t('friends.incomingRequests')}</h2>
                {incoming.length === 0 ? (
                  <EmptyState icon={UserCheck} text={t('friends.noIncomingRequests')} />
                ) : (
                  <div className="space-y-2">
                    {incoming.map((req) => (
                      <div key={req.id} className="p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                        <img
                          src={api.getMediaUrl(req.user.avatar)}
                          alt={req.user.name}
                          onClick={() => onViewProfile(req.user.id)}
                          className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => onViewProfile(req.user.id)}
                            className="text-sm font-bold text-gray-900 truncate cursor-pointer hover:underline"
                          >
                            {req.user.name}
                          </h4>
                          <span className="text-xs text-gray-400 truncate block">{req.user.role}</span>
                        </div>
                        <button
                          onClick={() => handleAccept(req)}
                          disabled={busyIds[req.id]}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> {t('friends.confirm')}
                        </button>
                        <button
                          onClick={() => handleDecline(req)}
                          disabled={busyIds[req.id]}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> {t('friends.delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 mb-3">{t('friends.outgoingRequests')}</h2>
                {outgoing.length === 0 ? (
                  <EmptyState icon={UserPlus} text={t('friends.noOutgoingRequests')} />
                ) : (
                  <div className="space-y-2">
                    {outgoing.map((req) => (
                      <div key={req.id} className="p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                        <img
                          src={api.getMediaUrl(req.user.avatar)}
                          alt={req.user.name}
                          onClick={() => onViewProfile(req.user.id)}
                          className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => onViewProfile(req.user.id)}
                            className="text-sm font-bold text-gray-900 truncate cursor-pointer hover:underline"
                          >
                            {req.user.name}
                          </h4>
                          <span className="text-xs text-gray-400">{t('friends.requestSent')}</span>
                        </div>
                        <button
                          onClick={() => handleCancel(req)}
                          disabled={busyIds[req.id]}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          {t('friends.cancelRequest')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'suggestions' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {suggestions.length === 0 ? (
                <EmptyState icon={UserPlus} text={t('friends.noSuggestions')} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((user) => (
                    <div key={user.id} className="p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                      <img
                        src={api.getMediaUrl(user.avatar)}
                        alt={user.name}
                        onClick={() => onViewProfile(user.id)}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4
                          onClick={() => onViewProfile(user.id)}
                          className="text-sm font-bold text-gray-900 truncate cursor-pointer hover:underline"
                        >
                          {user.name}
                        </h4>
                        <span className="text-xs text-gray-400 truncate block">{user.role}</span>
                      </div>
                      <button
                        onClick={() => handleAddFriend(user)}
                        disabled={busyIds[user.id]}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> {t('friends.addFriend')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.FC<any>; text: string }> = ({ icon: Icon, text }) => (
  <div className="text-center py-10 text-gray-400">
    <Icon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
    <p className="text-sm">{text}</p>
  </div>
);

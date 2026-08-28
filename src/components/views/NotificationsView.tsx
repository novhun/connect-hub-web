import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  Phone, 
  Users, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Check,
  Clock,
  Filter,
  User as UserIcon,
  Video
} from 'lucide-react';
import { NotificationItem, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { realtime, RealtimeMessage } from '../../services/realtime';
import { formatNotificationContent, formatNotificationTimestamp } from '../../utils/notificationHelpers';

interface NotificationsViewProps {
  currentUser?: User;
  onViewProfile?: (userId: string) => void;
  onStartCall?: (user: User, type: 'audio' | 'video') => void;
}

type NotificationFilter = 'all' | 'unread' | 'like' | 'comment' | 'call' | 'group';

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  onViewProfile,
  onStartCall,
}) => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Fetch real notifications from FastAPI backend
  const fetchNotifications = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.warn('Failed to load notifications from API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for realtime WebSocket notifications
  useEffect(() => {
    const unsubscribe = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === 'NOTIFICATION' && msg.notification) {
        setNotifications((prev) => [msg.notification, ...prev]);
      }
    });
    return unsubscribe;
  }, []);

  const handleMarkAsRead = async (notif: NotificationItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (notif.isRead) return;

    setBusyId(notif.id);
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );

    try {
      await api.markNotificationRead(notif.id);
    } catch (err) {
      console.warn('Mark notification read API notice:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.warn('Mark all notifications read API notice:', err);
    }
  };

  const handleItemClick = (notif: NotificationItem) => {
    handleMarkAsRead(notif);
    if (notif.type === 'call' && onStartCall && notif.user) {
      onStartCall(notif.user, 'audio');
    } else if (notif.user?.id && onViewProfile) {
      onViewProfile(notif.user.id);
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500 fill-blue-500" />;
      case 'call':
        return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'group':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {language === 'km' ? 'ការជូនដំណឹង' : 'Notifications'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'km'
                ? `អ្នកមានការជូនដំណឹងមិនទាន់អានចំនួន ${unreadCount}`
                : `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing || loading}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title={language === 'km' ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'km' ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'សម្គាល់ទាំងអស់ថាបានអាន' : 'Mark all as read'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {language === 'km' ? 'ទាំងអស់' : 'All'} ({notifications.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {language === 'km' ? 'មិនទាន់អាន' : 'Unread'} ({unreadCount})
        </button>

        <button
          onClick={() => setFilter('like')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'like'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {language === 'km' ? 'ប្រតិកម្ម & Likes' : 'Likes'}
        </button>

        <button
          onClick={() => setFilter('comment')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'comment'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {language === 'km' ? 'មតិយោបល់' : 'Comments'}
        </button>

        <button
          onClick={() => setFilter('call')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'call'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {language === 'km' ? 'ការហៅ & សំឡេង' : 'Calls'}
        </button>

        <button
          onClick={() => setFilter('group')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'group'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {language === 'km' ? 'ក្រុម & សហគមន៍' : 'Groups'}
        </button>
      </div>

      {/* Notifications List Stream */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3 animate-pulse"
              >
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              {language === 'km' ? 'គ្មានការជូនដំណឹងនៅឡើយទេ' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {language === 'km'
                ? 'នៅពេលដែលនរណាម្នាក់ Like, Comment, ហៅទូរស័ព្ទ ឬអញ្ជើញអ្នកចូលរួមក្រុម ការជូនដំណឹងនឹងបង្ហាញនៅទីនេះ។'
                : 'When someone likes your post, leaves a comment, or calls you, notifications will appear here in real-time.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                notif.isRead
                  ? 'bg-white hover:bg-gray-50 border-gray-100 shadow-2xs'
                  : 'bg-blue-50/50 hover:bg-blue-50 border-blue-200/70 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Avatar with Type Icon Badge */}
                <div className="relative shrink-0">
                  <img
                    src={api.getMediaUrl(notif.user?.avatar || '')}
                    alt={notif.user?.name || 'User'}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200 bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center border border-gray-100">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 space-y-1">
                  <p className="text-xs sm:text-sm text-gray-800 leading-snug">
                    <span className="font-bold text-gray-900">{notif.user?.name} </span>
                    <span>{formatNotificationContent(notif.content, language)}</span>
                    {notif.target && (
                      <span className="font-semibold text-blue-600"> "{notif.target}"</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatNotificationTimestamp(notif.timestamp, language)}</span>
                  </div>
                </div>
              </div>

              {/* Action Side */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 shrink-0" />
                )}

                {notif.type === 'call' && onStartCall && notif.user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif);
                      onStartCall(notif.user, 'audio');
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span className="hidden sm:inline">{language === 'km' ? 'ហៅត្រឡប់' : 'Call back'}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

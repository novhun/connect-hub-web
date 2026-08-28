import React from 'react';
import { X, Check, Bell, MessageSquare, ThumbsUp, Users, Phone } from 'lucide-react';
import { NotificationItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onNotificationClick,
}) => {
  const { t, language } = useLanguage();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-green-500 fill-green-500" />;
      case 'group':
        return <Users className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div 
      className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center sm:justify-end pt-14 sm:pt-16 sm:pr-16 md:pr-20 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="bg-white w-[calc(100vw-24px)] sm:w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col m-2 sm:m-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">{t('modals.notificationsTitle')}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} {language === 'km' ? 'ថ្មី' : 'New'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              {t('modals.markAllRead')}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick(notif)}
              className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                !notif.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={api.getMediaUrl(notif.user.avatar)}
                  alt={notif.user.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
                />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 text-xs">
                <p className="text-gray-800 leading-snug">
                  <span className="font-bold text-gray-900">{notif.user.name}</span>{' '}
                  {notif.content}
                </p>
                <span className="text-gray-400 text-[10px] mt-1 block">{notif.timestamp}</span>
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

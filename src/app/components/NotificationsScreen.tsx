import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, UserPlus, AtSign, Bell, Share2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationsScreen = ({ onBack, onNavigateToPost, onNavigateToProfile }) => {
  const { t } = useLocale();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    getNotificationMessage
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');

  // Filtrar notificações baseado no filtro ativo
  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    return notif.type === activeFilter;
  });

  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'like', label: 'Likes', icon: Heart },
    { id: 'comment', label: 'Comments', icon: MessageCircle },
    { id: 'follow', label: 'Followers', icon: UserPlus },
    { id: 'share', label: 'Shares', icon: Share2 }
  ];

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navegar baseado no tipo de notificação
    if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'share' || notification.type === 'mention') {
      // Ir para o post
      if (notification.post_id && onNavigateToPost) {
        onNavigateToPost(notification.post_id);
      }
    } else if (notification.type === 'follow') {
      // Ir para o perfil de quem seguiu
      if (notification.actor_id && onNavigateToProfile) {
        const profileData = {
          id: notification.actor_id,
          name: notification.actor?.name,
          username: notification.actor?.username,
          type: 'other'
        };
        onNavigateToProfile(profileData);
      }
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white font-bold text-lg">Notifications</h1>
          </div>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-white text-sm font-semibold hover:text-white/80"
            >
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 overflow-x-auto flex-shrink-0">
        <div className="flex gap-2 min-w-max">
          {filters.map(filter => {
            const FilterIcon = filter.icon;
            const count = filter.id === 'all'
              ? notifications.length
              : notifications.filter(n => n.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition flex items-center gap-2 ${
                  activeFilter === filter.id
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                {filter.label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeFilter === filter.id
                      ? 'bg-white text-green-600'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Notifications */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando notificações...</p>
            </div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full rounded-xl p-4 flex gap-3 transition ${
                notif.read ? 'bg-white' : 'bg-green-50 border border-green-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                notif.type === 'like' ? 'bg-red-500' :
                notif.type === 'comment' ? 'bg-blue-500' :
                notif.type === 'follow' ? 'bg-green-600' :
                notif.type === 'share' ? 'bg-orange-500' :
                notif.type === 'mention' ? 'bg-purple-500' :
                'bg-slate-500'
              }`}>
                {notif.type === 'like' && <Heart className="w-5 h-5 fill-white" />}
                {notif.type === 'comment' && <MessageCircle className="w-5 h-5" />}
                {notif.type === 'follow' && <UserPlus className="w-5 h-5" />}
                {notif.type === 'share' && <Share2 className="w-5 h-5" />}
                {notif.type === 'mention' && <AtSign className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-slate-900">
                  {getNotificationMessage(notif)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(notif.created_at).toLocaleString('en-IE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-center font-semibold">Nenhuma notificação</p>
            <p className="text-slate-400 text-sm text-center mt-1">
              Você está em dia com tudo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, UserPlus, AtSign, Bell, Share2, CheckCheck, Trash2, Radio } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationsScreen = ({ onBack, onNavigateToPost, onNavigateToProfile, onNavigateToLive }) => {
  const { t } = useLocale();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationMessage,
    getTimeAgo,
    unreadCount,
    refreshNotifications,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // O hook só busca a contagem de não lidas no mount (rápido, usado no sino do feed).
  // Esta tela precisa da lista completa, então busca explicitamente ao abrir.
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    return notif.type === activeFilter;
  });

  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'like', label: 'Likes', icon: Heart },
    { id: 'comment', label: 'Comments', icon: MessageCircle },
    { id: 'follow', label: 'Followers', icon: UserPlus },
    { id: 'share', label: 'Shares', icon: Share2 },
    { id: 'live_started', label: 'Lives', icon: Radio },
  ];

  const typeConfig = {
    like:         { bg: 'bg-red-500',    icon: Heart,          label: 'liked your post' },
    comment:      { bg: 'bg-blue-500',   icon: MessageCircle,  label: 'commented' },
    follow:       { bg: 'bg-green-600',  icon: UserPlus,       label: 'followed you' },
    share:        { bg: 'bg-orange-500', icon: Share2,         label: 'shared' },
    mention:      { bg: 'bg-purple-500', icon: AtSign,         label: 'mentioned you' },
    live_started: { bg: 'bg-emerald-600', icon: Radio,         label: 'started a live' },
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) markAsRead(notification.id);

    if (['like', 'comment', 'share', 'mention'].includes(notification.type)) {
      if (notification.post_id && onNavigateToPost) onNavigateToPost(notification.post_id);
    } else if (notification.type === 'follow') {
      if (notification.actor_id && onNavigateToProfile) {
        onNavigateToProfile({
          id: notification.actor_id,
          name: notification.actor?.name,
          username: notification.actor?.username,
          type: 'other',
        });
      }
    } else if (notification.type === 'live_started') {
      if (notification.live_id && onNavigateToLive) onNavigateToLive(notification.live_id);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await deleteNotification(id);
    setDeletingId(null);
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
            <div>
              <h1 className="text-white font-bold text-lg">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-green-100 text-xs">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition"
            >
              <CheckCheck className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-semibold">Read all</span>
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100 flex-shrink-0">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {filters.map(filter => {
              const Icon = filter.icon;
              const count = filter.id === 'all'
                ? notifications.filter(n => !n.read).length
                : notifications.filter(n => n.type === filter.id && !n.read).length;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition flex items-center gap-2 ${
                    activeFilter === filter.id
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {filter.label}
                  {count > 0 && (
                    <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                      activeFilter === filter.id ? 'bg-white text-green-600' : 'bg-green-600 text-white'
                    }`}>
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-700 font-bold text-lg mb-1">All caught up!</p>
            <p className="text-slate-400 text-sm text-center">No notifications here yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(notif => {
              const config = typeConfig[notif.type] || typeConfig.mention;
              const Icon = config.icon;
              const isDeleting = deletingId === notif.id;

              return (
                <div
                  key={notif.id}
                  className={`relative flex items-start gap-3 px-4 py-4 transition cursor-pointer ${
                    notif.read ? 'bg-white hover:bg-slate-50' : 'bg-green-50 hover:bg-green-100/60'
                  } ${isDeleting ? 'opacity-50' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Unread indicator */}
                  {!notif.read && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-600 rounded-full" />
                  )}

                  {/* Avatar with type icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                      {notif.actor?.avatar_url ? (
                        <img src={notif.actor.avatar_url} alt={notif.actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 font-bold text-lg">
                          {notif.actor?.name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${config.bg} rounded-full flex items-center justify-center border-2 border-white`}>
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.read ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                      <span className="font-bold">{notif.actor?.name || 'Someone'}</span>
                      {' '}{getNotificationMessage(notif).replace(notif.actor?.name || 'Someone', '').trim()}
                    </p>

                    {/* Post preview */}
                    {notif.post?.content && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        "{notif.post.content}"
                      </p>
                    )}

                    <p className="text-xs text-slate-400 mt-1">{getTimeAgo(notif.created_at)}</p>
                  </div>

                  {/* Post thumbnail */}
                  {notif.post?.media?.[0] && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                      <img src={notif.post.media[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    style={{ opacity: 0.4 }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

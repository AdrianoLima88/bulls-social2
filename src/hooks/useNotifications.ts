import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  actor_id: string;
  post_id?: string;
  comment_id?: string;
  content?: string;
  read: boolean;
  created_at: string;
  // Joined data
  actor?: {
    id: string;
    username: string;
    name: string;
    avatar_url: string;
    verified: boolean;
  };
  post?: {
    id: string;
    content: string;
    media: any;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Search notificações
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (
            id,
            username,
            name,
            avatar_url,
            verified
          ),
          post:post_id (
            id,
            content,
            media
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);

      // Accountr não lidas
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('mark_all_notifications_as_read');

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notificação
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Formatar mensagem da notificação
  const getNotificationMessage = (notification: Notification): string => {
    const actorName = notification.actor?.name || 'Alguém';

    switch (notification.type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'comment':
        return `${actorName} commented: "${notification.content}";`
      case 'follow':
        return `${actorName} started following you`;
      case 'share':
        return `${actorName} shared your post`;
      case 'mention':
        return `${actorName} mencionou você`;
      default:
        return `${actorName} interagiu com você`;
    }
  };

  // Carregar ao montar
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Nova notificação:', payload);
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationMessage,
    refreshNotifications: fetchNotifications,
  };
};

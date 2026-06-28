import { useState, useEffect, useCallback } from 'react';
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
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          actor_id,
          post_id,
          content,
          read,
          created_at,
          actor:actor_id (id, username, name, avatar_url, verified),
          post:post_id (id, content)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await supabase.rpc('mark_all_notifications_as_read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationMessage = (notification: Notification): string => {
    const actorName = notification.actor?.name || 'Someone';
    switch (notification.type) {
      case 'like': return `${actorName} liked your post`;
      case 'comment': return `${actorName} commented on your post`;
      case 'follow': return `${actorName} started following you`;
      case 'share': return `${actorName} shared your post`;
      case 'mention': return `${actorName} mentioned you`;
      default: return `${actorName} interacted with you`;
    }
  };

  const getTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-IE', { day: '2-digit', month: 'short' });
  };

  // Fetch only unread count on mount — fast!
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count || 0);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Only fetch unread count on mount — much faster than full fetch
    fetchUnreadCount();

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev =>
            prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationMessage,
    getTimeAgo,
    refreshNotifications: fetchNotifications,
  };
};

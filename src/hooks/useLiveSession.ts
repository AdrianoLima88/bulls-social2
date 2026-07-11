import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface LiveMessage {
  id: string;
  live_id: string;
  user_id: string;
  message: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
  };
}

const MESSAGE_SELECT = `
  id, live_id, user_id, message, created_at,
  author:user_id (id, username, name, avatar_url)
`;

// Real-time chat + viewer presence + likes for a single live, used by WatchLiveScreen.
export const useLiveSession = (liveId: string | null | undefined) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const profileRef = useRef(profile);
  const joinedRef = useRef(false);

  useEffect(() => { profileRef.current = profile; }, [profile]);

  // Chat history + realtime messages
  useEffect(() => {
    if (!liveId) return;
    let active = true;
    setMessages([]);

    (async () => {
      const { data } = await supabase
        .from('live_messages')
        .select(MESSAGE_SELECT)
        .eq('live_id', liveId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (active) setMessages((data as LiveMessage[]) || []);
    })();

    const channel = supabase
      .channel(`live_messages_${liveId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_messages', filter: `live_id=eq.${liveId}` },
        async (payload) => {
          const row = payload.new as LiveMessage;
          if (row.user_id === user?.id && profileRef.current) {
            const p = profileRef.current;
            setMessages(prev => [...prev, { ...row, author: { id: p.id, username: p.username, name: p.name, avatar_url: p.avatar_url } }]);
          } else {
            const { data: author } = await supabase
              .from('profiles')
              .select('id, username, name, avatar_url')
              .eq('id', row.user_id)
              .maybeSingle();
            setMessages(prev => [...prev, { ...row, author: author || undefined }]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'live_messages', filter: `live_id=eq.${liveId}` },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [liveId, user?.id]);

  // Viewer count + likes count, kept in sync with the lives row
  useEffect(() => {
    if (!liveId) return;

    (async () => {
      const { data } = await supabase.from('lives').select('viewer_count, likes_count').eq('id', liveId).maybeSingle();
      if (data) { setViewerCount(data.viewer_count || 0); setLikesCount(data.likes_count || 0); }
    })();

    const channel = supabase
      .channel(`live_row_${liveId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lives', filter: `id=eq.${liveId}` },
        (payload) => {
          const row = payload.new as any;
          setViewerCount(row.viewer_count || 0);
          setLikesCount(row.likes_count || 0);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveId]);

  // Join / leave presence (real concurrent viewer tracking)
  useEffect(() => {
    if (!liveId || !user) return;
    joinedRef.current = true;

    supabase
      .from('live_viewers')
      .upsert(
        { live_id: liveId, user_id: user.id, joined_at: new Date().toISOString(), left_at: null },
        { onConflict: 'live_id,user_id' }
      )
      .then(({ error }) => { if (error) console.error('Error joining live:', error); });

    return () => {
      if (joinedRef.current) {
        supabase
          .from('live_viewers')
          .update({ left_at: new Date().toISOString() })
          .eq('live_id', liveId)
          .eq('user_id', user.id)
          .then(({ error }) => { if (error) console.error('Error leaving live:', error); });
      }
    };
  }, [liveId, user?.id]);

  const sendMessage = async (text: string) => {
    if (!liveId || !user || !text.trim()) return { error: null };
    try {
      const { error } = await supabase.from('live_messages').insert({ live_id: liveId, user_id: user.id, message: text.trim() });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error sending live message:', error);
      return { error };
    }
  };

  const sendLike = async () => {
    if (!liveId) return;
    try {
      const { error } = await supabase.rpc('increment_live_likes', { live_id_param: liveId });
      if (error) throw error;
    } catch (error) {
      console.error('Error liking live:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('live_messages').delete().eq('id', messageId);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error deleting live message:', error);
    }
  };

  return { messages, viewerCount, likesCount, sendMessage, sendLike, deleteMessage };
};

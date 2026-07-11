import { useState, useEffect, useCallback, useId } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Live {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  category: string | null;
  privacy: 'public' | 'followers' | 'premium';
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  peak_viewer_count: number;
  likes_count: number;
  created_at: string;
  host?: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
    verified: boolean;
  };
}

const LIVE_SELECT = `
  id, host_id, title, description, category, privacy, status,
  scheduled_at, started_at, ended_at, viewer_count, peak_viewer_count, likes_count, created_at,
  host:host_id (id, username, name, avatar_url, verified)
`;

export const useLives = () => {
  const { user } = useAuth();
  // Unique per hook instance — this hook is called from several components at once
  // (App.tsx root + whichever Live screen is open), so a shared literal channel
  // name would crash with "cannot add postgres_changes callbacks ... after subscribe()".
  const instanceId = useId();
  const [activeLives, setActiveLives] = useState<Live[]>([]);
  const [upcomingLives, setUpcomingLives] = useState<Live[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLives = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: live, error: liveError }, { data: scheduled, error: scheduledError }] = await Promise.all([
        supabase.from('lives').select(LIVE_SELECT).eq('status', 'live').order('viewer_count', { ascending: false }),
        supabase.from('lives').select(LIVE_SELECT).eq('status', 'scheduled').order('scheduled_at', { ascending: true }),
      ]);
      if (liveError) throw liveError;
      if (scheduledError) throw scheduledError;
      setActiveLives(live || []);
      setUpcomingLives(scheduled || []);

      if (user) {
        const { data: subs } = await supabase.from('live_subscribers').select('live_id').eq('user_id', user.id);
        setSubscribedIds((subs || []).map((s: any) => s.live_id));
      } else {
        setSubscribedIds([]);
      }
    } catch (error) {
      console.error('Error fetching lives:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLives();

    const channel = supabase
      .channel(`lives_changes_${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lives' }, () => {
        fetchLives();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLives, instanceId]);

  const createLive = async (payload: {
    title: string;
    description?: string;
    category?: string;
    privacy: 'public' | 'followers' | 'premium';
    status: 'scheduled' | 'live';
    scheduled_at?: string | null;
  }) => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } };
    try {
      const insertData: any = {
        host_id: user.id,
        title: payload.title,
        description: payload.description || null,
        category: payload.category || null,
        privacy: payload.privacy,
        status: payload.status,
        scheduled_at: payload.scheduled_at || null,
      };
      if (payload.status === 'live') insertData.started_at = new Date().toISOString();

      const { data, error } = await supabase.from('lives').insert(insertData).select(LIVE_SELECT).single();
      if (error) throw error;
      return { data: data as Live, error: null };
    } catch (error) {
      console.error('Error creating live:', error);
      return { data: null, error };
    }
  };

  const goLive = async (liveId: string) => {
    try {
      const { error } = await supabase
        .from('lives')
        .update({ status: 'live', started_at: new Date().toISOString() })
        .eq('id', liveId);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error starting live:', error);
      return { error };
    }
  };

  const endLive = async (liveId: string) => {
    try {
      const { error } = await supabase
        .from('lives')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', liveId);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error ending live:', error);
      return { error };
    }
  };

  const isSubscribed = (liveId: string) => subscribedIds.includes(liveId);

  const toggleSubscribe = async (liveId: string) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    try {
      if (isSubscribed(liveId)) {
        await supabase.from('live_subscribers').delete().eq('live_id', liveId).eq('user_id', user.id);
        setSubscribedIds(prev => prev.filter(id => id !== liveId));
      } else {
        const { error } = await supabase.from('live_subscribers').insert({ live_id: liveId, user_id: user.id });
        if (error && error.code !== '23505') throw error;
        setSubscribedIds(prev => [...prev, liveId]);
      }
      return { error: null };
    } catch (error) {
      console.error('Error toggling live subscription:', error);
      return { error };
    }
  };

  const getLiveById = async (liveId: string): Promise<Live | null> => {
    const { data, error } = await supabase.from('lives').select(LIVE_SELECT).eq('id', liveId).maybeSingle();
    if (error) { console.error('Error fetching live:', error); return null; }
    return data as Live | null;
  };

  return {
    activeLives,
    upcomingLives,
    loading,
    createLive,
    goLive,
    endLive,
    isSubscribed,
    toggleSubscribe,
    getLiveById,
    refreshLives: fetchLives,
  };
};

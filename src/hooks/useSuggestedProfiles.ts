import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

// Returns only users that the current user invited AND who have already joined
export const useSuggestedProfiles = (limit: number = 5) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSuggested = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get IDs already followed
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = new Set((followingData || []).map((f: any) => f.following_id));

      // Get accepted invites (invited user joined)
      const { data: inviteData } = await supabase
        .from('invites')
        .select(`
          invited_user:profiles!invites_invited_user_id_fkey(id, name, username, avatar_url, bio, verified, followers_count)
        `)
        .eq('inviter_id', user.id)
        .eq('status', 'accepted')
        .limit(limit);

      const joined = (inviteData || [])
        .map((row: any) => row.invited_user)
        .filter((p: any) => p && !followingIds.has(p.id));

      setProfiles(joined);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggested();
  }, [user]);

  return { profiles, loading, refetch: fetchSuggested };
};

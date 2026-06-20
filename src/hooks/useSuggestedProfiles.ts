import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

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

      // Search IDs das pessoas que o usuário já segue
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = followingData?.map(f => f.following_id) || [];

      // Search perfis que o usuário não segue, ordenados por seguidores
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, bio, verified, followers_count')
        .neq('id', user.id) // Não incluir o próprio usuário
        .not('id', 'in', `(${followingIds.join(',') || 'null'})`) // Não incluir quem já segue
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching suggested profiles:', error);
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

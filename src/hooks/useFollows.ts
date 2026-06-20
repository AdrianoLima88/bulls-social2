import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useFollows = () => {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Search quem o usuário está seguindo
  const fetchFollowing = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;

      const map: Record<string, boolean> = {};
      data?.forEach(follow => {
        map[follow.following_id] = true;
      });
      setFollowingMap(map);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se está seguindo um usuário
  const isFollowing = (userId: string) => {
    return followingMap[userId] || false;
  };

  // Follow/deixar de seguir
  const toggleFollow = async (userId: string) => {
    if (!user) return { error: 'Not authenticated' };

    // Não permitir seguir a si mesmo
    if (user.id === userId) {
      return { error: 'Cannot follow yourself' };
    }

    try {
      const following = followingMap[userId];

      if (following) {
        // Deixar de seguir
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;
      }

      // Atualizar estado local imediatamente
      setFollowingMap(prev => ({
        ...prev,
        [userId]: !following
      }));

      return { error: null };
    } catch (error) {
      console.error('Error toggling follow:', error);
      return { error };
    }
  };

  // Search seguidores de um usuário
  const getFollowers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles:follower_id (
            id,
            username,
            name,
            avatar_url,
            verified,
            bio
          )
        `)
        .eq('following_id', userId);

      if (error) throw error;
      return { data: data?.map(f => f.profiles), error: null };
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { data: null, error };
    }
  };

  // Search quem um usuário está seguindo
  const getFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles:following_id (
            id,
            username,
            name,
            avatar_url,
            verified,
            bio
          )
        `)
        .eq('follower_id', userId);

      if (error) throw error;
      return { data: data?.map(f => f.profiles), error: null };
    } catch (error) {
      console.error('Error fetching following:', error);
      return { data: null, error };
    }
  };

  // Carregar ao montar
  useEffect(() => {
    if (user) {
      fetchFollowing();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('follows_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `follower_id=eq.${user.id}`
          },
          () => {
            fetchFollowing();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    followingMap,
    isFollowing,
    toggleFollow,
    getFollowers,
    getFollowing,
    loading,
    refreshFollowing: fetchFollowing,
  };
};

import { useState, useEffect, useId } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useFollow = () => {
  const instanceId = useId();
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch users that current user is following
  const fetchFollowing = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowing(data?.map(f => f.following_id) || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  // Fetch users that follow current user
  const fetchFollowers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (error) throw error;
      setFollowers(data?.map(f => f.follower_id) || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  // Toggle follow/unfollow
  const toggleFollow = async (targetUserId: string) => {
    if (!user) return { error: 'Not authenticated' };
    if (user.id === targetUserId) return { error: 'Cannot follow yourself' };

    try {
      const isFollowing = following.includes(targetUserId);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error) throw error;
      }

      // Refresh following list
      await fetchFollowing();
      return { error: null };
    } catch (error) {
      console.error('Error toggling follow:', error);
      return { error };
    }
  };

  // Check if following a specific user
  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  // Get follower/following counts for a user
  const getUserCounts = async (userId: string) => {
    try {
      const [followingResult, followersResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
      ]);

      return {
        following: followingResult.count || 0,
        followers: followersResult.count || 0,
      };
    } catch (error) {
      console.error('Error getting user counts:', error);
      return { following: 0, followers: 0 };
    }
  };

  // Fetch on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFollowing(), fetchFollowers()]);
      setLoading(false);
    };

    if (user) {
      loadData();

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`follow_changes_${instanceId}`)
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
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `following_id=eq.${user.id}`
          },
          () => {
            fetchFollowers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, instanceId]);

  return {
    following,
    followers,
    loading,
    toggleFollow,
    isFollowing,
    getUserCounts,
    refresh: () => Promise.all([fetchFollowing(), fetchFollowers()]),
  };
};

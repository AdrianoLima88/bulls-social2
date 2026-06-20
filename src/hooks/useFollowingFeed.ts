import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Post } from './usePosts';

export const useFollowingFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFollowingPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Search IDs das pessoas que o usuário segue
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      const followingIds = followingData?.map(f => f.following_id) || [];

      // Se não segue ninguém, retornar array vazio
      if (followingIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Search posts das pessoas que segue
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            username,
            name,
            avatar_url,
            verified,
            user_type
          )
        `)
        .in('author_id', followingIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching following feed:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowingPosts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('following_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchFollowingPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { posts, loading, refetch: fetchFollowingPosts };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Post } from './usePosts';

const POST_SELECT = `
  id,
  author_id,
  type,
  content,
  media,
  charts,
  documents,
  tags,
  likes_count,
  comments_count,
  shares_count,
  views_count,
  is_pinned,
  is_premium,
  created_at,
  updated_at,
  profiles:author_id (
    username,
    name,
    avatar_url,
    verified,
    user_type
  )
`;

const PAGE_SIZE = 20;

export const useFollowingFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const followingIdsRef = useRef<string[]>([]);
  const { user } = useAuth();

  // Fetch following IDs once
  const fetchFollowingIds = useCallback(async () => {
    if (!user) return [];
    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      return data?.map(f => f.following_id) || [];
    } catch {
      return [];
    }
  }, [user]);

  const fetchFollowingPosts = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      setLoading(true);

      const ids = await fetchFollowingIds();
      setFollowingIds(ids);
      followingIdsRef.current = ids;

      if (ids.length === 0) {
        setPosts([]);
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .in('author_id', ids)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching following feed:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchFollowingIds]);

  useEffect(() => {
    if (!user) return;

    fetchFollowingPosts();

    // Realtime: only update single post, don't refetch all
    const channel = supabase
      .channel('following_posts_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          if (!followingIdsRef.current.includes(payload.new.author_id)) return;
          const { data } = await supabase
            .from('posts')
            .select(POST_SELECT)
            .eq('id', payload.new.id)
            .single();
          if (data) setPosts(prev => [data, ...prev.filter(p => p.id !== data.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts(prev =>
            prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { posts, loading, refetch: fetchFollowingPosts };
};

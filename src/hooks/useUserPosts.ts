import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';

const USER_POST_SELECT = `
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
  is_featured,
  created_at,
  profiles:author_id (
    username,
    name,
    avatar_url,
    verified,
    user_type
  )
`;

const PAGE_SIZE = 20;

const formatPost = (post: any) => ({
  id: post.id,
  authorId: post.author_id,
  authorName: post.profiles?.name || 'User',
  authorUsername: post.profiles?.username || '@user',
  authorRole: post.profiles?.user_type || 'investor',
  authorAvatar: post.profiles?.avatar_url || null,
  verified: post.profiles?.verified || false,
  type: post.type,
  content: post.content,
  media: post.media,
  charts: post.charts,
  documents: post.documents,
  ticker: post.tags?.[0] || null,
  tags: post.tags || [],
  likes: post.likes_count ?? 0,
  comments: post.comments_count ?? 0,
  shares: post.shares_count ?? 0,
  views: post.views_count ?? 0,
  time: new Date(post.created_at).toLocaleString('pt-BR'),
  timestamp: new Date(post.created_at).getTime(),
  likedBy: [],
  savedBy: [],
  isPinned: post.is_pinned,
  isPremiumContent: post.is_premium,
  isFeatured: post.is_featured,
});

export const useUserPosts = (userId?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPosts = useCallback(async (targetUserId?: string) => {
    const id = targetUserId || userId;
    if (!id) { setLoading(false); return; }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(USER_POST_SELECT)
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      setPosts((data || []).map(formatPost));
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setLoading(false); setPosts([]); return; }

    fetchUserPosts(userId);

    const channel = supabase
      .channel(`user_posts_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `author_id=eq.${userId}` },
        async (payload) => {
          const { data } = await supabase
            .from('posts')
            .select(USER_POST_SELECT)
            .eq('id', payload.new.id)
            .single();
          if (data) setPosts(prev => [formatPost(data), ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts', filter: `author_id=eq.${userId}` },
        (payload) => {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...formatPost({ ...p, ...payload.new }) } : p));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts', filter: `author_id=eq.${userId}` },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { posts, loading, refresh: () => fetchUserPosts(userId) };
};

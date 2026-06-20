import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export const useUserPosts = (userId?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPosts = async (targetUserId?: string) => {
    const id = targetUserId || userId;

    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
        .eq('author_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Converter para o formato esperado
      const formattedPosts = (data || []).map(post => ({
        id: post.id,
        authorId: post.author_id,
        authorName: post.profiles?.name || 'Usuário',
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
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`user_posts_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: `author_id=eq.${userId}`
          },
          () => {
            fetchUserPosts(userId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
      setPosts([]);
    }
  }, [userId]);

  return {
    posts,
    loading,
    refresh: () => fetchUserPosts(userId),
  };
};

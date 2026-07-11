import { useState, useEffect, useCallback, useId } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Post {
  id: string;
  author_id: string;
  type: 'analysis' | 'news' | 'education' | 'company' | 'generic';
  content: string;
  media?: any;
  charts?: any;
  documents?: any;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_pinned: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    name: string;
    avatar_url: string;
    verified: boolean;
    user_type: string;
    plan: string;
  };
}

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
    user_type,
    plan
  )
`;

const PAGE_SIZE = 20;

export const usePosts = () => {
  const instanceId = useId();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // Fetch posts with pagination
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch likes only for current user
  const fetchLikes = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .not('post_id', 'is', null);

      const map: Record<string, boolean> = {};
      data?.forEach(like => {
        if (like.post_id) map[like.post_id] = true;
      });
      setLikesMap(map);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  }, [user]);

  // Update a single post in state without refetching all
  const updatePostInState = useCallback((updatedPost: Partial<Post> & { id: string }) => {
    setPosts(prev =>
      prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p)
    );
  }, []);

  // Create a new post
  const createPost = async (postData: {
    type: string;
    content: string;
    media?: any;
    charts?: any;
    documents?: any;
    tags?: string[];
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          type: postData.type,
          content: postData.content,
          media: postData.media,
          charts: postData.charts,
          documents: postData.documents,
          tags: postData.tags,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          views_count: 0,
        })
        .select(POST_SELECT)
        .single();

      if (error) throw error;

      // Add new post to top of list without full refetch
      setPosts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating post:', error);
      return { error };
    }
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      // Remove from state without refetch
      setPosts(prev => prev.filter(p => p.id !== postId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { error };
    }
  };

  // Toggle like - optimistic update, no refetch
  const toggleLike = async (postId: string) => {
    if (!user) return { error: 'Not authenticated' };

    const isLiked = likesMap[postId];

    // Optimistic update — update UI immediately
    setLikesMap(prev => ({ ...prev, [postId]: !isLiked }));
    updatePostInState({
      id: postId,
      likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + (isLiked ? -1 : 1),
    });

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
      return { error: null };
    } catch (error) {
      // Revert on error
      setLikesMap(prev => ({ ...prev, [postId]: isLiked }));
      updatePostInState({
        id: postId,
        likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + (isLiked ? 1 : -1),
      });
      console.error('Error toggling like:', error);
      return { error };
    }
  };

  const hasLiked = (postId: string) => likesMap[postId] || false;

  useEffect(() => {
    if (!user) return;

    fetchPosts();
    fetchLikes();

    // Realtime: update single post instead of refetching all
    const channel = supabase
      .channel(`posts_changes_${instanceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          // Fetch full post with profile data
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
          // Only update the changed post
          updatePostInState(payload.new as Post);
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPosts, fetchLikes, instanceId]);

  return {
    posts,
    loading,
    createPost,
    deletePost,
    toggleLike,
    hasLiked,
    likesMap,
    refreshPosts: fetchPosts,
  };
};

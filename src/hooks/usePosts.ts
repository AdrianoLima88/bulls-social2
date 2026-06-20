import { useState, useEffect } from 'react';
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
  // Joined data from profiles
  profiles?: {
    username: string;
    name: string;
    avatar_url: string;
    verified: boolean;
    user_type: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all posts
  const fetchPosts = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData: {
    type: string;
    content: string;
    media?: any;
    charts?: any;
    documents?: any;
    tags?: string[];
  }) => {
    if (!user) {
      console.error('User not authenticated');
      return { error: 'Not authenticated' };
    }

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
        .single();

      if (error) throw error;

      console.log('✅ Post criado com contadores:', {
        id: data.id,
        likes_count: data.likes_count,
        comments_count: data.comments_count,
        shares_count: data.shares_count,
        views_count: data.views_count
      });

      // Refresh posts after creating
      await fetchPosts();
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
        .eq('author_id', user.id); // Only allow deleting own posts

      if (error) throw error;

      // Refresh posts after deleting
      await fetchPosts();
      return { error: null };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { error };
    }
  };

  // Toggle like on a post
  const toggleLike = async (postId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const isLiked = likesMap[postId];
      const newLikeState = !isLiked;

      // Update local state FIRST for immediate UI feedback
      setLikesMap(prev => ({
        ...prev,
        [postId]: newLikeState
      }));

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          // Revert on error
          setLikesMap(prev => ({
            ...prev,
            [postId]: isLiked
          }));
          throw error;
        }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) {
          // Revert on error
          setLikesMap(prev => ({
            ...prev,
            [postId]: isLiked
          }));
          throw error;
        }
      }

      // Refresh posts in background (don't wait)
      fetchPosts();

      return { error: null };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { error };
    }
  };

  // Get likes for all posts
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});

  const fetchLikes = async () => {
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
  };

  // Check if user has liked a post
  const hasLiked = (postId: string) => {
    return likesMap[postId] || false;
  };

  // Fetch posts on mount
  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchLikes();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('posts_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            fetchPosts();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'likes' },
          () => {
            fetchLikes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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

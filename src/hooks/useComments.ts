import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  profiles?: {
    username: string;
    name: string;
    avatar_url: string;
    verified: boolean;
  };
}

export const useComments = (postId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLikesMap, setCommentLikesMap] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // Fetch comments for a specific post
  const fetchComments = async (targetPostId?: string) => {
    const id = targetPostId || postId;
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id (
            username,
            name,
            avatar_url,
            verified
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a comment
  const addComment = async (postId: string, content: string) => {
    if (!user) {
      console.error('User not authenticated');
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh comments after adding
      await fetchComments(postId);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { error };
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id); // Only allow deleting own comments

      if (error) throw error;

      // Refresh comments after deleting
      if (postId) await fetchComments(postId);
      return { error: null };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { error };
    }
  };

  // Fetch likes for comments
  const fetchCommentLikes = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .not('comment_id', 'is', null);

      const map: Record<string, boolean> = {};
      data?.forEach(like => {
        if (like.comment_id) map[like.comment_id] = true;
      });
      setCommentLikesMap(map);
    } catch (error) {
      console.error('Error fetching comment likes:', error);
    }
  };

  // Check if user has liked a comment
  const hasLikedComment = (commentId: string) => {
    return commentLikesMap[commentId] || false;
  };

  // Toggle like on a comment
  const toggleLike = async (commentId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const isLiked = commentLikesMap[commentId];

      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });
      }

      // Update local state immediately
      setCommentLikesMap(prev => ({
        ...prev,
        [commentId]: !isLiked
      }));

      // Refresh comments and likes
      await Promise.all([
        postId ? fetchComments(postId) : Promise.resolve(),
        fetchCommentLikes()
      ]);
      return { error: null };
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return { error };
    }
  };

  // Fetch comments on mount if postId is provided
  useEffect(() => {
    if (postId && user) {
      fetchComments(postId);
      fetchCommentLikes();

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`comments_${postId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          },
          () => {
            fetchComments(postId);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'likes'
          },
          () => {
            fetchCommentLikes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [postId, user]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    toggleLike,
    hasLikedComment,
    refreshComments: fetchComments,
  };
};

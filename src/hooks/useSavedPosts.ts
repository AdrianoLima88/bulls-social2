import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface SavedPost {
  id: string;
  post_id: string;
  created_at: string;
  post: {
    id: string;
    content: string;
    type: string;
    media: any[];
    charts: any[];
    tags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: {
      id: string;
      name: string;
      username: string;
      avatar_url: string | null;
      verified: boolean;
    };
  };
}

export function useSavedPosts() {
  const { user } = useAuth();
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedIds = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);
      setSavedPostIds(new Set(data?.map(s => s.post_id) || []));
    } catch {}
    setLoading(false);
  }, [user]);

  const fetchSavedPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('saved_posts')
        .select(`
          id, post_id, created_at,
          post:posts (
            id, content, type, media, charts, tags,
            likes_count, comments_count, created_at,
            profiles:author_id (id, name, username, avatar_url, verified)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSavedPosts((data as any) || []);
    } catch {}
    setLoading(false);
  }, [user]);

  const toggleSave = useCallback(async (postId: string) => {
    if (!user) return;
    const isSavedNow = savedPostIds.has(postId);

    // Optimistic update
    setSavedPostIds(prev => {
      const next = new Set(prev);
      if (isSavedNow) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      if (isSavedNow) {
        await supabase.from('saved_posts').delete()
          .eq('user_id', user.id).eq('post_id', postId);
        setSavedPosts(prev => prev.filter(s => s.post_id !== postId));
      } else {
        await supabase.from('saved_posts')
          .insert({ user_id: user.id, post_id: postId });
      }
    } catch {
      setSavedPostIds(prev => {
        const next = new Set(prev);
        if (isSavedNow) next.add(postId);
        else next.delete(postId);
        return next;
      });
    }
  }, [user, savedPostIds]);

  const isSaved = useCallback((postId: string) => savedPostIds.has(postId), [savedPostIds]);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds]);

  return { savedPosts, loading, isSaved, toggleSave, fetchSavedPosts, savedCount: savedPostIds.size };
}

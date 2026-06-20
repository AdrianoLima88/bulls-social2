import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export const useSearch = (query: string, filter: 'all' | 'posts' | 'users' | 'hashtags') => {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setPosts([]);
      setUsers([]);
      setHashtags([]);
      return;
    }

    const searchAll = async () => {
      setLoading(true);

      try {
        const searchTerm = query.toLowerCase().trim();

        // Search posts
        if (filter === 'all' || filter === 'posts') {
          const { data: postsData } = await supabase
            .from('posts')
            .select(`
              *,
              profiles:author_id (
                username,
                name,
                avatar_url,
                verified
              )
            `)
            .ilike('content', `%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(20);

          setPosts(postsData || []);
        }

        // Search usuários
        if (filter === 'all' || filter === 'users') {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, name, username, bio, avatar_url, verified, followers_count')
            .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
            .order('followers_count', { ascending: false })
            .limit(20);

          setUsers(usersData || []);
        }

        // Search hashtags (extrair do conteúdo dos posts)
        if (filter === 'all' || filter === 'hashtags') {
          const { data: hashtagPosts } = await supabase
            .from('posts')
            .select('content')
            .ilike('content', `%#${searchTerm}%`)
            .limit(50);

          // Extrair hashtags dos posts
          const foundHashtags = new Set<string>();
          hashtagPosts?.forEach(post => {
            const matches = post.content.match(/#\w+/g);
            matches?.forEach(tag => {
              const cleanTag = tag.toLowerCase();
              if (cleanTag.includes(searchTerm.toLowerCase())) {
                foundHashtags.add(tag.slice(1)); // Remove #
              }
            });
          });

          setHashtags(Array.from(foundHashtags).slice(0, 10));
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchAll, 300);
    return () => clearTimeout(timeoutId);
  }, [query, filter]);

  return { posts, users, hashtags, loading };
};

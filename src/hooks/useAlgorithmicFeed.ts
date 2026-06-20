import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Post } from './usePosts';

export const useAlgorithmicFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlgorithmicFeed = async () => {
    try {
      setLoading(true);

      // Search posts com todas as métricas de engajamento
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
        .order('created_at', { ascending: false })
        .limit(100); // Limitar para melhor performance

      if (error) throw error;

      // Calcular score de engajamento para cada post
      const postsWithScore = (data || []).map(post => {
        // Score algorítmico:
        // - Curtidas: peso 1
        // - Comentários: peso 2 (engajamento mais valioso)
        // - Compartilhamentos: peso 3 (maior indicador de viralidade)
        // - Views: peso 0.01 (indicador de alcance)
        // - Tempo: posts recentes ganham boost

        const engagementScore =
          (post.likes_count * 1) +
          (post.comments_count * 2) +
          (post.shares_count * 3) +
          (post.views_count * 0.01);

        // Boost de recência (posts mais novos ganham pontos extras)
        const postAge = Date.now() - new Date(post.created_at).getTime();
        const hoursOld = postAge / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 100 - hoursOld); // Boost diminui com o tempo

        const totalScore = engagementScore + recencyBoost;

        return {
          ...post,
          algorithmicScore: totalScore
        };
      });

      // Ordenar por score (maior para menor)
      const sortedPosts = postsWithScore.sort((a, b) =>
        b.algorithmicScore - a.algorithmicScore
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching algorithmic feed:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlgorithmicFeed();

    // Atualizar feed a cada 2 minutos
    const interval = setInterval(fetchAlgorithmicFeed, 2 * 60 * 1000);

    // Subscribe to realtime changes
    const channel = supabase
      .channel('algorithmic_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchAlgorithmicFeed();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading, refetch: fetchAlgorithmicFeed };
};

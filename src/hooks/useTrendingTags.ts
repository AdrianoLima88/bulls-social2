import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';

export interface TrendingTag {
  tag: string;
  count: number;
  change: 'up' | 'down' | 'new';
}

/**
 * Trending hashtags ranqueados por engajamento real (compartilhamentos + visualizações),
 * comparando a janela atual (7 dias) com a janela anterior (7 dias) pra saber se está
 * subindo, caindo ou é novo. Sem dados fake: se não houver posts com tags, retorna lista vazia.
 */
export const useTrendingTags = (limit: number = 20) => {
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      const now = Date.now();
      const since14d = new Date(now - 14 * 86400000).toISOString();
      const since7d = new Date(now - 7 * 86400000).toISOString();

      const { data } = await supabase
        .from('posts')
        .select('tags, created_at, shares_count, views_count')
        .gte('created_at', since14d)
        .not('tags', 'is', null);

      type Stats = { mentions: number; score: number; prevScore: number };
      const tagStats: Record<string, Stats> = {};

      data?.forEach(post => {
        const isCurrentWindow = post.created_at >= since7d;
        // Compartilhamentos pesam mais que visualizações como sinal de engajamento
        const engagement = (post.shares_count || 0) * 5 + (post.views_count || 0);

        post.tags?.forEach((tag: string) => {
          const clean = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!clean) return;
          if (!tagStats[clean]) tagStats[clean] = { mentions: 0, score: 0, prevScore: 0 };
          if (isCurrentWindow) {
            tagStats[clean].mentions += 1;
            tagStats[clean].score += engagement;
          } else {
            tagStats[clean].prevScore += engagement;
          }
        });
      });

      const sorted = Object.entries(tagStats)
        .filter(([, s]) => s.mentions > 0) // só tópicos com posts nos últimos 7 dias
        .sort(([, a], [, b]) => b.score - a.score)
        .slice(0, limit)
        .map(([tag, s]) => ({
          tag,
          count: s.mentions,
          change: s.prevScore === 0 ? 'new' : s.score > s.prevScore ? 'up' : 'down',
        })) as TrendingTag[];

      setTrendingTags(sorted);
    } catch {
      setTrendingTags([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { trendingTags, loading, refetch: fetchTrending };
};

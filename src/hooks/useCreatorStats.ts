import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface PeriodStats {
  posts: number;
  views: number;
  likes: number;
  comments: number;
  revenue: number;
  lives: number;
  liveViewers: number;
}

export interface TopPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
}

export interface TopLive {
  id: string;
  title: string;
  viewer_count: number;
  peak_viewer_count: number;
  likes_count: number;
  started_at: string | null;
}

export interface CreatorStats {
  // Totais gerais
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  // Lives
  totalLives: number;
  totalLiveViewers: number;
  peakLiveViewers: number;
  // Receita (tips recebidas)
  totalRevenue: number;
  tipsCount: number;
  // Seguidores
  followersCount: number;
  // Conteúdo destaque
  topPosts: TopPost[];
  topLives: TopLive[];
  // Por período
  stats7d: PeriodStats;
  stats30d: PeriodStats;
  stats90d: PeriodStats;
  // Fontes de receita
  tipsRevenue: number;
}

const emptyPeriod = (): PeriodStats => ({
  posts: 0, views: 0, likes: 0, comments: 0,
  revenue: 0, lives: 0, liveViewers: 0,
});

export const useCreatorStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const since7d  = new Date(now.getTime() - 7  * 86400000).toISOString();
      const since30d = new Date(now.getTime() - 30 * 86400000).toISOString();
      const since90d = new Date(now.getTime() - 90 * 86400000).toISOString();

      // Todos os posts do utilizador
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, likes_count, comments_count, shares_count, views_count, created_at')
        .eq('author_id', user.id)
        .order('likes_count', { ascending: false });
      if (postsError) throw postsError;

      // Todas as lives terminadas do utilizador
      const { data: lives, error: livesError } = await supabase
        .from('lives')
        .select('id, title, viewer_count, peak_viewer_count, likes_count, started_at')
        .eq('host_id', user.id)
        .eq('status', 'ended')
        .order('viewer_count', { ascending: false });
      if (livesError) throw livesError;

      // Tips recebidas (completadas)
      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('amount, created_at')
        .eq('receiver_id', user.id)
        .eq('status', 'completed');
      if (tipsError && tipsError.code !== 'PGRST116') throw tipsError;

      // Perfil (seguidores)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      const allPosts = posts || [];
      const allLives = lives || [];
      const allTips  = tips  || [];

      // Helpers de período
      const filterSince = (arr: any[], since: string) =>
        arr.filter(item => item.created_at >= since);

      const sumPosts = (arr: any[]): Omit<PeriodStats, 'revenue' | 'lives' | 'liveViewers'> => ({
        posts:    arr.length,
        views:    arr.reduce((s, p) => s + (p.views_count    || 0), 0),
        likes:    arr.reduce((s, p) => s + (p.likes_count    || 0), 0),
        comments: arr.reduce((s, p) => s + (p.comments_count || 0), 0),
      });

      const sumLives = (arr: any[]) => ({
        lives:       arr.length,
        liveViewers: arr.reduce((s, l) => s + (l.viewer_count || 0), 0),
      });

      const sumTips = (arr: any[]) => ({
        revenue: arr.reduce((s, t) => s + Number(t.amount), 0),
      });

      const buildPeriod = (since: string): PeriodStats => ({
        ...sumPosts(filterSince(allPosts, since)),
        ...sumLives(filterSince(allLives, since)),
        ...sumTips(filterSince(allTips, since)),
      });

      setStats({
        totalPosts:      allPosts.length,
        totalViews:      allPosts.reduce((s, p) => s + (p.views_count    || 0), 0),
        totalLikes:      allPosts.reduce((s, p) => s + (p.likes_count    || 0), 0),
        totalComments:   allPosts.reduce((s, p) => s + (p.comments_count || 0), 0),
        totalShares:     allPosts.reduce((s, p) => s + (p.shares_count   || 0), 0),
        totalLives:      allLives.length,
        totalLiveViewers: allLives.reduce((s, l) => s + (l.viewer_count  || 0), 0),
        peakLiveViewers: Math.max(...allLives.map(l => l.peak_viewer_count || 0), 0),
        totalRevenue:    allTips.reduce((s, t) => s + Number(t.amount), 0),
        tipsRevenue:     allTips.reduce((s, t) => s + Number(t.amount), 0),
        tipsCount:       allTips.length,
        followersCount:  profileData?.followers_count || 0,
        topPosts:        allPosts.slice(0, 5),
        topLives:        allLives.slice(0, 5),
        stats7d:         buildPeriod(since7d),
        stats30d:        buildPeriod(since30d),
        stats90d:        buildPeriod(since90d),
      });
    } catch (err: any) {
      console.error('useCreatorStats error:', err);
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};

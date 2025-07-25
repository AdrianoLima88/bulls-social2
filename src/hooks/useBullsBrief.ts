import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { usePortfolio } from './usePortfolio';
import { useSubscription } from './useSubscription';
import { useAuth } from '../contexts/AuthContext';

export interface BriefSection {
  title: string;
  bullets: string[];
}

export interface DailyBrief {
  raw: string;           // Full markdown from AI
  date: string;
  generatedAt: string;
  cachedAt?: number;     // localStorage timestamp
}

const CACHE_KEY = 'bulls_brief_cache';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export const useBullsBrief = () => {
  const { assets } = usePortfolio();
  const { currentPlan } = useSubscription() as any;
  const { user, profile } = useAuth() as any;

  const [brief, setBrief] = useState<DailyBrief | null>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as DailyBrief;
        const age = Date.now() - (parsed.cachedAt ?? 0);
        if (age < CACHE_TTL_MS) return parsed;
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async (force = false) => {
    // Return cache if fresh
    if (!force && brief) {
      const age = Date.now() - (brief.cachedAt ?? 0);
      if (age < CACHE_TTL_MS) return;
    }

    if (!user?.id) { setError('Login required'); return; }
    setLoading(true);
    setError('');

    try {
      // Fetch top signals from BullsSignal
      const { data: signalRows } = await supabase
        .from('ticker_sentiment')
        .select('ticker,bull_pct,total_votes')
        .order('total_votes', { ascending: false })
        .limit(8);

      const signals = (signalRows ?? []).map((s: any) => ({
        ticker: s.ticker,
        bullPct: Number(s.bull_pct ?? 50),
        totalVotes: Number(s.total_votes ?? 0),
      }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('bullsbrief-generate', {
        body: {
          portfolio: assets.map(a => ({
            code: a.code,
            type: a.type,
            quantity: a.quantity,
            avg_price: a.avg_price,
            current_price: a.current_price,
          })),
          signals,
          plan: currentPlan || 'free',
          username: profile?.name || profile?.username || 'Investor',
          date: new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
        },
      });

      if (res.error) throw new Error(res.error.message || 'Brief generation failed');

      const data = res.data as { brief: string; date: string; generated_at: string };
      const newBrief: DailyBrief = {
        raw: data.brief,
        date: data.date,
        generatedAt: data.generated_at,
        cachedAt: Date.now(),
      };

      setBrief(newBrief);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(newBrief)); } catch {}
    } catch (e: any) {
      setError(e.message || 'Failed to generate brief');
    } finally {
      setLoading(false);
    }
  }, [brief, user?.id, assets, currentPlan, profile]);

  const clearCache = useCallback(() => {
    try { sessionStorage.removeItem(CACHE_KEY); } catch {}
    setBrief(null);
    setError('');
  }, []);

  return { brief, loading, error, generate, clearCache };
};

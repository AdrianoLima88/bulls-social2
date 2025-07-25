import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface TickerSentiment {
  ticker: string;
  totalVotes: number;
  bullVotes: number;
  bearVotes: number;
  bullPct: number;       // 0-100
  bearPct: number;       // 0-100
  userSignal: 'bull' | 'bear' | null;
  lastVoteAt: string | null;
}

export interface TrendingSignal extends TickerSentiment {
  rank: number;
}

export const useBullsSignal = (ticker?: string) => {
  const { user } = useAuth() as any;
  const [sentiment, setSentiment] = useState<TickerSentiment | null>(null);
  const [trending, setTrending] = useState<TrendingSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  // ── Fetch sentiment for a specific ticker ──────────────────
  const fetchSentiment = useCallback(async (t: string) => {
    if (!t) return;
    setLoading(true);
    setError('');
    try {
      // Aggregate from view
      const { data: agg } = await supabase
        .from('ticker_sentiment')
        .select('*')
        .eq('ticker', t.toUpperCase())
        .maybeSingle();

      // User's own signal
      let userSignal: 'bull' | 'bear' | null = null;
      if (user?.id) {
        const { data: own } = await supabase
          .from('bull_bear_signals')
          .select('signal')
          .eq('user_id', user.id)
          .eq('ticker', t.toUpperCase())
          .maybeSingle();
        userSignal = (own?.signal as 'bull' | 'bear') ?? null;
      }

      const total  = Number(agg?.total_votes ?? 0);
      const bull   = Number(agg?.bull_votes  ?? 0);
      const bear   = Number(agg?.bear_votes  ?? 0);
      const bullPct = total > 0 ? Math.round((bull / total) * 100) : 50;

      setSentiment({
        ticker: t.toUpperCase(),
        totalVotes: total,
        bullVotes: bull,
        bearVotes: bear,
        bullPct,
        bearPct: 100 - bullPct,
        userSignal,
        lastVoteAt: agg?.last_vote_at ?? null,
      });
    } catch (e: any) {
      setError(e.message || 'Error loading signal');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ── Fetch trending tickers (most votes, last 7 days) ───────
  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      // Get top 20 tickers by total votes
      const { data: aggList } = await supabase
        .from('ticker_sentiment')
        .select('*')
        .order('total_votes', { ascending: false })
        .limit(20);

      if (!aggList || aggList.length === 0) {
        setTrending([]);
        setLoading(false);
        return;
      }

      // Get user's votes for these tickers
      const tickers = aggList.map((a: any) => a.ticker);
      let userVotes: Record<string, 'bull' | 'bear'> = {};
      if (user?.id) {
        const { data: votes } = await supabase
          .from('bull_bear_signals')
          .select('ticker, signal')
          .eq('user_id', user.id)
          .in('ticker', tickers);
        if (votes) {
          for (const v of votes) {
            userVotes[v.ticker] = v.signal;
          }
        }
      }

      const result: TrendingSignal[] = aggList.map((a: any, idx: number) => {
        const total  = Number(a.total_votes ?? 0);
        const bull   = Number(a.bull_votes  ?? 0);
        const bullPct = total > 0 ? Math.round((bull / total) * 100) : 50;
        return {
          rank: idx + 1,
          ticker: a.ticker,
          totalVotes: total,
          bullVotes: bull,
          bearVotes: Number(a.bear_votes ?? 0),
          bullPct,
          bearPct: 100 - bullPct,
          userSignal: userVotes[a.ticker] ?? null,
          lastVoteAt: a.last_vote_at ?? null,
        };
      });

      setTrending(result);
    } catch (e: any) {
      setError(e.message || 'Error loading trending');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ── Vote (upsert) ──────────────────────────────────────────
  const vote = useCallback(async (t: string, signal: 'bull' | 'bear') => {
    if (!user?.id) { setError('Login required to vote'); return; }
    setVoting(true);
    try {
      const { error: err } = await supabase
        .from('bull_bear_signals')
        .upsert(
          { user_id: user.id, ticker: t.toUpperCase(), signal },
          { onConflict: 'user_id,ticker' }
        );
      if (err) throw err;
      // Refresh sentiment
      if (ticker && t.toUpperCase() === ticker.toUpperCase()) {
        await fetchSentiment(t);
      }
    } catch (e: any) {
      setError(e.message || 'Vote failed');
    } finally {
      setVoting(false);
    }
  }, [user?.id, ticker, fetchSentiment]);

  // ── Remove vote ────────────────────────────────────────────
  const removeVote = useCallback(async (t: string) => {
    if (!user?.id) return;
    setVoting(true);
    try {
      await supabase
        .from('bull_bear_signals')
        .delete()
        .eq('user_id', user.id)
        .eq('ticker', t.toUpperCase());
      if (ticker && t.toUpperCase() === ticker.toUpperCase()) {
        await fetchSentiment(t);
      }
    } catch (e: any) {
      setError(e.message || 'Remove vote failed');
    } finally {
      setVoting(false);
    }
  }, [user?.id, ticker, fetchSentiment]);

  // Auto-fetch on ticker change
  useEffect(() => {
    if (ticker) fetchSentiment(ticker);
  }, [ticker, fetchSentiment]);

  return {
    sentiment,
    trending,
    loading,
    voting,
    error,
    vote,
    removeVote,
    fetchSentiment,
    fetchTrending,
  };
};

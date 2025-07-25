import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, TrendingUp, TrendingDown, Zap, RefreshCw,
  AlertCircle, Users, BarChart2, Search, X,
} from 'lucide-react';
import { useBullsSignal, TrendingSignal } from '../../hooks/useBullsSignal';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Mini signal bar (reusable export) ───────────────────────
export const BullsSignalBar = ({
  ticker,
  compact = false,
}: {
  ticker: string;
  compact?: boolean;
}) => {
  const { sentiment, loading, vote, voting } = useBullsSignal(ticker);
  const { isDark } = useTheme();

  if (loading || !sentiment) {
    return (
      <div className={`h-1.5 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
    );
  }

  const { bullPct, bearPct, totalVotes, userSignal } = sentiment;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-red-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${bullPct}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-green-600">{bullPct}%</span>
        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {totalVotes}v
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        <div
          className="bg-green-500 transition-all duration-500 rounded-l-full"
          style={{ width: `${bullPct}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-500 rounded-r-full"
          style={{ width: `${bearPct}%` }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-[10px] font-semibold">
        <span className="text-green-600">🐂 {bullPct}% Bull</span>
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{totalVotes} votes</span>
        <span className="text-red-500">Bear {bearPct}% 🐻</span>
      </div>
      {/* Vote buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => vote(ticker, 'bull')}
          disabled={voting}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition border ${
            userSignal === 'bull'
              ? 'bg-green-600 text-white border-green-600'
              : isDark
                ? 'border-green-700/50 text-green-500 hover:bg-green-900/30'
                : 'border-green-300 text-green-700 hover:bg-green-50'
          }`}
        >
          🐂 Bullish
        </button>
        <button
          onClick={() => vote(ticker, 'bear')}
          disabled={voting}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition border ${
            userSignal === 'bear'
              ? 'bg-red-500 text-white border-red-500'
              : isDark
                ? 'border-red-900/50 text-red-400 hover:bg-red-900/20'
                : 'border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          Bearish 🐻
        </button>
      </div>
    </div>
  );
};

// ─── Ticker sentiment card ────────────────────────────────────
const SignalCard = ({
  signal,
  onVote,
  voting,
  isDark,
}: {
  signal: TrendingSignal;
  onVote: (ticker: string, s: 'bull' | 'bear') => void;
  voting: boolean;
  isDark: boolean;
}) => {
  const isBull = signal.bullPct >= 50;
  const cardBg = isDark ? 'bg-[#0f1923] border-white/6' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`border rounded-2xl p-4 ${cardBg}`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold w-5 text-center ${textSub}`}>#{signal.rank}</span>
          <div>
            <p className={`font-bold text-sm ${textPrimary}`}>{signal.ticker}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Users className={`w-3 h-3 ${textSub}`} />
              <span className={`text-[10px] ${textSub}`}>{signal.totalVotes} votes</span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          isBull ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'
        }`}>
          {isBull ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isBull ? `${signal.bullPct}% Bull` : `${signal.bearPct}% Bear`}
        </div>
      </div>

      {/* Bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
        <div
          className="bg-green-500 transition-all duration-700 rounded-l-full"
          style={{ width: `${signal.bullPct}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-700 rounded-r-full flex-1"
        />
      </div>
      <div className="flex justify-between text-[10px] font-semibold mb-3">
        <span className="text-green-600">🐂 {signal.bullVotes} bullish</span>
        <span className="text-red-500">{signal.bearVotes} bearish 🐻</span>
      </div>

      {/* Vote buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onVote(signal.ticker, 'bull')}
          disabled={voting}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            signal.userSignal === 'bull'
              ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
              : isDark
                ? 'bg-white/5 text-green-500 hover:bg-green-900/30 border border-white/8'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          }`}
        >
          🐂 Bullish
        </button>
        <button
          onClick={() => onVote(signal.ticker, 'bear')}
          disabled={voting}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            signal.userSignal === 'bear'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : isDark
                ? 'bg-white/5 text-red-400 hover:bg-red-900/20 border border-white/8'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          }`}
        >
          Bearish 🐻
        </button>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const CardSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className={`border rounded-2xl p-4 animate-pulse ${isDark ? 'bg-[#0f1923] border-white/6' : 'bg-white border-slate-200'}`}>
    <div className="flex justify-between mb-3">
      <div className={`h-4 w-16 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
      <div className={`h-4 w-20 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
    </div>
    <div className={`h-2.5 rounded-full mb-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
    <div className="flex gap-2">
      <div className={`flex-1 h-8 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
      <div className={`flex-1 h-8 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
    </div>
  </div>
);

// ─── Filter chips ─────────────────────────────────────────────
type Filter = 'all' | 'bullish' | 'bearish' | 'voted';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',     label: 'All'     },
  { id: 'bullish', label: '🐂 Most Bullish' },
  { id: 'bearish', label: '🐻 Most Bearish' },
  { id: 'voted',   label: 'My Votes' },
];

// ─── Search modal ─────────────────────────────────────────────
const SearchModal = ({
  onClose,
  onSearch,
  isDark,
}: {
  onClose: () => void;
  onSearch: (ticker: string) => void;
  isDark: boolean;
}) => {
  const [q, setQ] = useState('');
  const bg = isDark ? 'bg-[#0a1220]' : 'bg-white';
  const inputBg = isDark ? 'bg-[#111c2b] border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className={`w-full rounded-t-3xl p-6 ${bg}`}>
        <p className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Search ticker signal</p>
        <div className="flex gap-2">
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter' && q.trim()) { onSearch(q.trim()); onClose(); } }}
            placeholder="e.g. AAPL, BTC, PETR4..."
            className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition ${inputBg}`}
          />
          <button
            onClick={() => { if (q.trim()) { onSearch(q.trim()); onClose(); } }}
            className="px-5 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-500 transition"
          >
            Search
          </button>
        </div>
        <button onClick={onClose} className={`mt-3 text-sm w-full py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cancel</button>
      </div>
    </div>
  );
};

// ─── Main screen ──────────────────────────────────────────────
export const BullsSignalScreen = ({ onBack }: { onBack: () => void }) => {
  const { trending, loading, voting, error, vote, fetchTrending } = useBullsSignal();
  const { isDark } = useTheme();

  const [filter, setFilter] = useState<Filter>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchTicker, setSearchTicker] = useState('');

  const { sentiment: searchResult, loading: searchLoading, vote: searchVote, voting: searchVoting, fetchSentiment } = useBullsSignal(searchTicker || undefined);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const handleVote = async (ticker: string, signal: 'bull' | 'bear') => {
    await vote(ticker, signal);
    // Update local trending list optimistically
    fetchTrending();
  };

  const filtered = (() => {
    if (filter === 'bullish') return [...trending].sort((a, b) => b.bullPct - a.bullPct);
    if (filter === 'bearish') return [...trending].sort((a, b) => b.bearPct - a.bearPct);
    if (filter === 'voted')   return trending.filter(t => t.userSignal !== null);
    return trending;
  })();

  const bg = isDark ? 'bg-[#080f1a]' : 'bg-slate-50';
  const headerBg = isDark ? 'bg-[#0a1220] border-white/6' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const chipActive = 'bg-green-600 text-white';
  const chipInactive = isDark ? 'bg-white/5 text-slate-400 border border-white/8' : 'bg-white text-slate-600 border border-slate-200';

  // Network stats
  const totalVoters = trending.reduce((s, t) => s + t.totalVotes, 0);
  const avgBull = trending.length > 0
    ? Math.round(trending.reduce((s, t) => s + t.bullPct, 0) / trending.length)
    : 0;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg}`}>

      {/* ── Header ── */}
      <div className={`flex-shrink-0 border-b ${headerBg}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${textSub}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className={`font-bold text-sm ${textPrimary}`}>BullsSignal</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className={`text-[10px] ${textSub}`}>Network Sentiment</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setShowSearch(true)} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${textSub}`}>
              <Search className="w-4 h-4" />
            </button>
            <button onClick={fetchTrending} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${textSub}`}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Network stats bar */}
        <div className={`flex items-center justify-around px-4 pb-3 text-xs ${textSub}`}>
          <div className="text-center">
            <p className={`font-bold text-base ${textPrimary}`}>{trending.length}</p>
            <p>tickers tracked</p>
          </div>
          <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className="text-center">
            <p className={`font-bold text-base ${textPrimary}`}>{totalVoters.toLocaleString()}</p>
            <p>total votes</p>
          </div>
          <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className="text-center">
            <p className={`font-bold text-base ${avgBull >= 50 ? 'text-green-600' : 'text-red-500'}`}>{avgBull}%</p>
            <p>network bull</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Search result ── */}
        {searchTicker && searchResult && (
          <div className="px-4 pt-4">
            <div className={`flex items-center justify-between mb-2`}>
              <p className={`text-xs font-bold uppercase tracking-wide ${textSub}`}>Signal for {searchTicker}</p>
              <button onClick={() => setSearchTicker('')} className={textSub}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <SignalCard
              signal={{
                rank: 0,
                ...searchResult,
                userSignal: searchResult.userSignal,
              }}
              onVote={async (t, s) => { await searchVote(t, s); fetchSentiment(t); }}
              voting={searchVoting}
              isDark={isDark}
            />
            <div className={`my-4 border-t ${isDark ? 'border-white/6' : 'border-slate-200'}`} />
          </div>
        )}

        {/* ── Filter chips ── */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f.id ? chipActive : chipInactive
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className={`mx-4 flex items-center gap-2 p-3 rounded-xl border ${
            isDark ? 'bg-red-900/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ── Cards ── */}
        <div className="px-4 pb-6 space-y-3">
          {loading && trending.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} isDark={isDark} />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BarChart2 className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              <p className={`font-semibold ${textSub}`}>
                {filter === 'voted' ? 'You haven\'t voted yet' : 'No signals yet'}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
                {filter === 'voted'
                  ? 'Search for a ticker and cast your first vote'
                  : 'Be the first to signal on a ticker'}
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-full text-sm font-bold hover:bg-amber-400 transition"
              >
                Search ticker
              </button>
            </div>
          ) : (
            filtered.map(s => (
              <SignalCard
                key={s.ticker}
                signal={s}
                onVote={handleVote}
                voting={voting}
                isDark={isDark}
              />
            ))
          )}
        </div>
      </div>

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onSearch={t => { setSearchTicker(t); setFilter('all'); }}
          isDark={isDark}
        />
      )}
    </div>
  );
};

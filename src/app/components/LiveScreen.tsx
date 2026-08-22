import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, Clock, Eye, Lock, Play, Search, Bell, BellOff, Trash2, TrendingUp } from 'lucide-react';
import { useLives, type Live } from '../../hooks/useLives';
import { useAuth } from '../../contexts/AuthContext';
import { ScheduleLiveModal } from './ScheduleLiveModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatElapsed = (startedAt: string | null) => {
  if (!startedAt) return '';
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const formatViewers = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

const useCountdown = (scheduledAt: string | null) => {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      if (!scheduledAt) { setLabel('Soon'); return; }
      const diff = new Date(scheduledAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('Starting now'); return; }
      const totalMins = Math.floor(diff / 60000);
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const date = new Date(scheduledAt);
      const now = new Date();
      const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      if (date.toDateString() === now.toDateString()) {
        setLabel(hours > 0 ? `Today · ${timeStr} (${hours}h ${mins}m)` : `Today · ${timeStr} (${mins}m)`);
      } else if (date.toDateString() === tomorrow.toDateString()) {
        setLabel(`Tomorrow · ${timeStr}`);
      } else {
        setLabel(date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ` · ${timeStr}`);
      }
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [scheduledAt]);
  return label;
};

const ScheduledCountdown: React.FC<{ scheduledAt: string | null }> = ({ scheduledAt }) => {
  const label = useCountdown(scheduledAt);
  return (
    <span className="text-[#9ea3b0] text-xs font-semibold flex items-center gap-1">
      <Clock className="w-3 h-3" />{label}
    </span>
  );
};

// ─── Category chips ────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Stock Analysis', 'Crypto', 'Options', 'Earnings', 'Forex', 'Education'];

// ─── Avatar fallback ──────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 10 }: { src?: string | null; name?: string; size?: number }) => (
  <div className={`w-${size} h-${size} rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center`}>
    {src
      ? <img src={src} alt={name || ''} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      : <span className="text-white font-bold text-sm">{name?.[0]?.toUpperCase() || '?'}</span>
    }
  </div>
);

// ─── Featured live card (large) ────────────────────────────────────────────────
const FeaturedCard = ({ live, onWatch }: { live: Live; onWatch: () => void }) => (
  <div
    onClick={onWatch}
    className="relative rounded-2xl overflow-hidden cursor-pointer group"
    style={{ aspectRatio: '16/9' }}
  >
    {/* Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
      {live.host?.avatar_url && (
        <img
          src={live.host.avatar_url}
          alt=""
          className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition duration-300 scale-105 group-hover:scale-110 blur-sm"
        />
      )}
    </div>
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

    {/* Top badges */}
    <div className="absolute top-3 left-3 flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full shadow-lg">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <span className="text-white text-xs font-black tracking-wider">LIVE</span>
      </div>
      {live.privacy === 'premium' && (
        <div className="flex items-center gap-1 bg-amber-500/90 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
          <Lock className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-bold">Premium</span>
        </div>
      )}
    </div>
    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
      <Eye className="w-3.5 h-3.5 text-white/80" />
      <span className="text-white text-sm font-bold">{formatViewers(live.viewer_count)}</span>
    </div>

    {/* Bottom info */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Avatar src={live.host?.avatar_url} name={live.host?.name} size={9} />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-sm truncate">{live.host?.name}</span>
            {live.host?.verified && <span className="text-blue-400 text-xs flex-shrink-0">✓</span>}
          </div>
          <span className="text-white/60 text-xs">@{live.host?.username}</span>
        </div>
        <span className="ml-auto text-white/50 text-xs font-semibold flex-shrink-0">{formatElapsed(live.started_at)}</span>
      </div>
      <h3 className="text-white font-black text-lg leading-snug mb-2 line-clamp-2">{live.title}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {live.category && (
            <span className="px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-full">{live.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl group-hover:bg-white/25 transition">
          <Play className="w-4 h-4 text-white fill-white" />
          <span className="text-white text-sm font-bold">Watch</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Compact live card (grid item) ────────────────────────────────────────────
const LiveCard = ({ live, onWatch }: { live: Live; onWatch: () => void }) => (
  <div onClick={onWatch} className="cursor-pointer group">
    {/* Thumbnail */}
    <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '16/9' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800">
        {live.host?.avatar_url && (
          <img src={live.host.avatar_url} alt="" className="w-full h-full object-cover opacity-50 blur-sm group-hover:opacity-60 transition" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      {/* LIVE + viewers */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded-full">
        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
        <span className="text-white text-[9px] font-black">LIVE</span>
      </div>
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full">
        <Eye className="w-2.5 h-2.5 text-white/80" />
        <span className="text-white text-[9px] font-bold">{formatViewers(live.viewer_count)}</span>
      </div>
      {live.privacy === 'premium' && (
        <div className="absolute top-1.5 right-1.5 bg-amber-500 p-0.5 rounded-full">
          <Lock className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
    {/* Info row */}
    <div className="flex gap-2">
      <Avatar src={live.host?.avatar_url} name={live.host?.name} size={8} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-xs line-clamp-2 leading-tight mb-0.5">{live.title}</p>
        <p className="text-[#9ea3b0] text-[10px] truncate">{live.host?.name}</p>
        {live.category && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-900/60 text-green-400 text-[9px] font-bold rounded-full">{live.category}</span>
        )}
      </div>
    </div>
  </div>
);

// ─── Scheduled card ───────────────────────────────────────────────────────────
const ScheduledCard = ({ live, isOwn, isSubscribed, onStartScheduled, onToggleSubscribe, onDelete }: {
  live: Live; isOwn: boolean; isSubscribed: boolean;
  onStartScheduled: () => void; onToggleSubscribe: () => void; onDelete: () => void;
}) => (
  <div className="bg-[#18181b] border border-white/8 rounded-2xl overflow-hidden">
    <div className="flex gap-3 p-4">
      <Avatar src={live.host?.avatar_url} name={live.host?.name} size={12} />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">{live.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[#9ea3b0] text-xs">{live.host?.name}</span>
          {live.host?.verified && <span className="text-blue-400 text-xs">✓</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScheduledCountdown scheduledAt={live.scheduled_at} />
          {live.category && (
            <span className="px-2 py-0.5 bg-green-900/60 text-green-400 text-[10px] font-bold rounded-full">{live.category}</span>
          )}
          {live.privacy === 'premium' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-900/50 text-amber-400 text-[10px] font-bold rounded-full">
              <Lock className="w-2.5 h-2.5" /> Premium
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="border-t border-white/5 px-4 py-3 flex gap-2">
      {isOwn ? (
        <>
          <button
            onClick={onStartScheduled}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" /> Start Now
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={onToggleSubscribe}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
            isSubscribed
              ? 'bg-green-900/40 text-green-400 border border-green-700'
              : 'bg-[#9147ff]/20 text-[#9147ff] border border-[#9147ff]/40 hover:bg-[#9147ff]/30'
          }`}
        >
          {isSubscribed
            ? <><BellOff className="w-4 h-4" /> Notification set</>
            : <><Bell className="w-4 h-4" /> Notify me</>
          }
        </button>
      )}
    </div>
  </div>
);

// ─── Empty states ─────────────────────────────────────────────────────────────
const EmptyLive = ({ onSchedule }: { onSchedule: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-900/40 to-emerald-900/20 flex items-center justify-center border border-green-800/30">
        <Radio className="w-12 h-12 text-green-600/60" />
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
    <p className="text-white font-black text-xl mb-2">No one is live right now</p>
    <p className="text-[#9ea3b0] text-sm">Use the <span className="text-red-400 font-bold">Go Live</span> button above to start broadcasting</p>
  </div>
);

const EmptyScheduled = ({ onSchedule }: { onSchedule: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
    <div className="w-24 h-24 rounded-full bg-[#18181b] border border-white/8 flex items-center justify-center mb-6">
      <Clock className="w-12 h-12 text-[#9ea3b0]" />
    </div>
    <p className="text-white font-black text-xl mb-2">No scheduled streams</p>
    <p className="text-[#9ea3b0] text-sm mb-6">Schedule a live session and notify your followers in advance</p>
    <button
      onClick={onSchedule}
      className="px-8 py-3 bg-[#9147ff] hover:bg-[#7d3bdb] text-white font-bold rounded-full text-sm flex items-center gap-2 transition"
    >
      <Clock className="w-4 h-4" /> Schedule a Stream
    </button>
  </div>
);

// ─── Main screen ───────────────────────────────────────────────────────────────
interface LiveScreenProps {
  onBack: () => void;
  onStartLive: () => void;
  onWatchLive: (live: Live) => void;
  onStartScheduled: (live: Live) => void;
}

export const LiveScreen: React.FC<LiveScreenProps> = ({ onBack, onStartLive, onWatchLive, onStartScheduled }) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming'>('active');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { activeLives, upcomingLives, loading, isSubscribed, toggleSubscribe, refreshLives, deleteLive } = useLives();

  const filterByCategory = (lives: Live[]) =>
    selectedCategory === 'All' ? lives : lives.filter(l => l.category === selectedCategory);

  const filteredActive = filterByCategory(activeLives);
  const featured = filteredActive[0];
  const restOfActive = filteredActive.slice(1);
  const filteredUpcoming = filterByCategory(upcomingLives);

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0e0e10' }}>

      {/* ── Header ── */}
      <header className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-5 h-5 text-green-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-white font-black text-lg">BullsGo Live</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white text-xs font-bold hover:bg-white/15 transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#9147ff]" /> Schedule
            </button>
            <button
              onClick={onStartLive}
              className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-red-900/40"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Go Live
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-3">
          <button
            onClick={() => setSelectedTab('active')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              selectedTab === 'active'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-[#9ea3b0] hover:text-white/70'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${selectedTab === 'active' ? 'bg-red-500 animate-pulse' : 'bg-[#9ea3b0]'}`} />
            Live {activeLives.length > 0 && <span className="bg-red-600 text-white text-[10px] font-black px-1.5 rounded-full">{activeLives.length}</span>}
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              selectedTab === 'upcoming'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-[#9ea3b0] hover:text-white/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Scheduled {upcomingLives.length > 0 && <span className="bg-[#9147ff]/80 text-white text-[10px] font-black px-1.5 rounded-full">{upcomingLives.length}</span>}
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-white/8 text-[#9ea3b0] hover:bg-white/15 hover:text-white border border-white/8'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedTab === 'active' ? (
          filteredActive.length === 0 ? (
            <EmptyLive onSchedule={() => setShowScheduleModal(true)} />
          ) : (
            <>
              {/* Featured */}
              <FeaturedCard live={featured} onWatch={() => onWatchLive(featured)} />

              {/* 2-column grid for the rest */}
              {restOfActive.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-white font-bold text-sm">More Live Streams</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {restOfActive.map(live => (
                      <LiveCard key={live.id} live={live} onWatch={() => onWatchLive(live)} />
                    ))}
                  </div>
                </>
              )}
            </>
          )
        ) : filteredUpcoming.length === 0 ? (
          <EmptyScheduled onSchedule={() => setShowScheduleModal(true)} />
        ) : (
          <div className="space-y-3">
            {filteredUpcoming.map(live => {
              const isOwn = user?.id === live.host_id;
              return (
                <ScheduledCard
                  key={live.id}
                  live={live}
                  isOwn={isOwn}
                  isSubscribed={isSubscribed(live.id)}
                  onStartScheduled={() => onStartScheduled(live)}
                  onToggleSubscribe={() => toggleSubscribe(live.id)}
                  onDelete={async () => {
                    if (!confirm('Cancel this scheduled live?')) return;
                    await deleteLive(live.id);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {showScheduleModal && (
        <ScheduleLiveModal
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => {
            refreshLives();
            setSelectedTab('upcoming');
          }}
        />
      )}
    </div>
  );
};

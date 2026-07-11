import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, Clock, Eye, Lock, Play } from 'lucide-react';
import { useLives, type Live } from '../../hooks/useLives';
import { useAuth } from '../../contexts/AuthContext';
import { ScheduleLiveModal } from './ScheduleLiveModal';

interface LiveScreenProps {
  onBack: () => void;
  onStartLive: () => void;
  onWatchLive: (live: Live) => void;
  onStartScheduled: (live: Live) => void;
}

const formatElapsed = (startedAt: string | null) => {
  if (!startedAt) return '';
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

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
        setLabel(hours > 0 ? `Today at ${timeStr} (${hours}h ${mins}m)` : `Today at ${timeStr} (${mins}m)`);
      } else if (date.toDateString() === tomorrow.toDateString()) {
        setLabel(`Tomorrow at ${timeStr}`);
      } else {
        setLabel(date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ` at ${timeStr}`);
      }
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [scheduledAt]);

  return label;
};

// Small component so each scheduled card gets its own countdown hook
const ScheduledCountdown: React.FC<{ scheduledAt: string | null }> = ({ scheduledAt }) => {
  const label = useCountdown(scheduledAt);
  return (
    <p className="text-blue-600 text-xs font-bold flex items-center gap-1">
      <Clock className="w-3 h-3 flex-shrink-0" />
      {label}
    </p>
  );
};

export const LiveScreen: React.FC<LiveScreenProps> = ({ onBack, onStartLive, onWatchLive, onStartScheduled }) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming'>('active');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { activeLives, upcomingLives, loading, isSubscribed, toggleSubscribe, refreshLives, deleteLive } = useLives();

  const featured = activeLives[0];
  const restOfActive = activeLives.slice(1);

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50 shadow-lg flex-shrink-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></span>
            </div>
            <h1 className="text-xl font-black">Bulls Live</h1>
          </div>
          {/* Two action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-2 bg-white/20 text-white rounded-full font-bold text-xs hover:bg-white/30 transition border border-white/40"
            >
              📅 Schedule
            </button>
            <button
              onClick={onStartLive}
              className="px-3 py-2 bg-white text-green-600 rounded-full font-bold text-xs hover:bg-green-50 transition shadow-lg"
            >
              🔴 Go Live
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/20">
          <button
            onClick={() => setSelectedTab('active')}
            className={`flex-1 py-3 text-sm font-bold transition relative ${selectedTab === 'active' ? 'text-white' : 'text-white/60'}`}
          >
            🔴 Live ({activeLives.length})
            {selectedTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />}
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`flex-1 py-3 text-sm font-bold transition relative ${selectedTab === 'upcoming' ? 'text-white' : 'text-white/60'}`}
          >
            📅 Scheduled ({upcomingLives.length})
            {selectedTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : selectedTab === 'active' ? (
          activeLives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Radio className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-700 font-bold text-lg mb-1">No one is live right now</p>
              <p className="text-slate-400 text-sm">Be the first — tap "Go Live" above.</p>
            </div>
          ) : (
            <>
              {/* Featured live */}
              <div onClick={() => onWatchLive(featured)} className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
                <img
                  src={featured.host?.avatar_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'}
                  alt={featured.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">{featured.viewer_count.toLocaleString()}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={featured.host?.avatar_url || 'https://i.pravatar.cc/150'} alt={featured.host?.name} className="w-10 h-10 rounded-full border-2 border-white" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-white font-bold text-sm">{featured.host?.name}</p>
                        {featured.host?.verified && <span className="text-blue-400 text-xs">✓</span>}
                      </div>
                      <p className="text-white/80 text-xs">@{featured.host?.username}</p>
                    </div>
                    <p className="text-white text-xs font-semibold">{formatElapsed(featured.started_at)}</p>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{featured.title}</h3>
                  <div className="flex items-center gap-2">
                    {featured.category && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">{featured.category}</span>
                    )}
                    {featured.privacy === 'premium' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Other active lives */}
              {restOfActive.length > 0 && (
                <div className="space-y-3">
                  {restOfActive.map(live => (
                    <div key={live.id} onClick={() => onWatchLive(live)} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                      <div className="flex gap-3 p-3">
                        <div className="relative flex-shrink-0">
                          <img src={live.host?.avatar_url || 'https://i.pravatar.cc/150'} alt={live.title} className="w-32 h-20 object-cover rounded-lg" />
                          <div className="absolute top-1 left-1 flex items-center gap-1 bg-green-600 px-2 py-0.5 rounded-full shadow-md">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-white text-[10px] font-bold">LIVE</span>
                          </div>
                          <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <Eye className="w-3 h-3 text-white" />
                            <span className="text-white text-[10px] font-bold">
                              {live.viewer_count > 1000 ? `${(live.viewer_count / 1000).toFixed(1)}k` : live.viewer_count}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">{live.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <img src={live.host?.avatar_url || 'https://i.pravatar.cc/150'} alt={live.host?.name} className="w-5 h-5 rounded-full" />
                            <p className="text-slate-600 text-xs font-medium">{live.host?.name}</p>
                            {live.host?.verified && <span className="text-blue-500 text-xs">✓</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {live.category && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">{live.category}</span>
                            )}
                            {live.privacy === 'premium' && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded-full">
                                <Lock className="w-2.5 h-2.5" /> Premium
                              </span>
                            )}
                            <span className="text-slate-500 text-[10px]">{formatElapsed(live.started_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        ) : upcomingLives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-700 font-bold text-lg mb-1">No scheduled lives</p>
            <p className="text-slate-400 text-sm">Tap "📅 Schedule" above to plan one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingLives.map(live => {
              const isOwn = user?.id === live.host_id;
              return (
                <div key={live.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="flex gap-3 p-3">
                    <div className="relative flex-shrink-0">
                      <img src={live.host?.avatar_url || 'https://i.pravatar.cc/150'} alt={live.title} className="w-32 h-20 object-cover rounded-lg opacity-90" />
                      <div className="absolute top-1 left-1 flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded-full shadow-md">
                        <Clock className="w-3 h-3 text-white" />
                        <span className="text-white text-[10px] font-bold">SOON</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">{live.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <img src={live.host?.avatar_url || 'https://i.pravatar.cc/150'} alt={live.host?.name} className="w-5 h-5 rounded-full" />
                        <p className="text-slate-600 text-xs font-medium">{live.host?.name}</p>
                        {live.host?.verified && <span className="text-blue-500 text-xs">✓</span>}
                      </div>
                      <div className="space-y-1">
                        <ScheduledCountdown scheduledAt={live.scheduled_at} />
                        <div className="flex items-center gap-2 flex-wrap">
                          {live.category && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">{live.category}</span>
                          )}
                          {live.privacy === 'premium' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded-full">
                              <Lock className="w-2.5 h-2.5" /> Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="border-t border-slate-100 px-3 py-2 space-y-2">
                    {isOwn ? (
                      /* Host: Start Now + Cancel */
                      <>
                        <button
                          onClick={() => onStartScheduled(live)}
                          className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition"
                        >
                          <Play className="w-4 h-4" /> Start Now
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Cancel this scheduled live? This cannot be undone.')) return;
                            await deleteLive(live.id);
                          }}
                          className="w-full py-2 text-red-500 font-semibold rounded-xl text-sm hover:bg-red-50 transition"
                        >
                          🗑 Cancel Live
                        </button>
                      </>
                    ) : (
                      /* Follower: Notify me toggle */
                      <button
                        onClick={() => toggleSubscribe(live.id)}
                        className={`w-full py-2 font-semibold rounded-lg text-sm transition ${
                          isSubscribed(live.id)
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {isSubscribed(live.id) ? '✅ Notification set' : '🔔 Notify me'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Live Modal */}
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

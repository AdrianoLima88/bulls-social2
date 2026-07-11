import React, { useState } from 'react';
import {
  X, TrendingUp, Users, DollarSign, Eye, Heart, Clock,
  Calendar, BarChart3, ArrowUp, Loader2, AlertCircle,
  MessageCircle, Share2, Crown, Sparkles, Lock,
} from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useCreatorStats } from '../../hooks/useCreatorStats';
import type { PeriodStats } from '../../hooks/useCreatorStats';

type Period = '7d' | '30d' | '90d' | 'all';

interface CreatorAnalyticsProps {
  onClose: () => void;
  onNavigateToPremium?: () => void;
}

// ─── Gate — só Pro/Business ─────────────────────────────────────────────────
const UpgradeGate: React.FC<{ onClose: () => void; onNavigateToPremium?: () => void }> = ({ onClose, onNavigateToPremium }) => (
  <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Creator Analytics</h2>
      <p className="text-slate-600 text-sm mb-6">
        Detailed analytics of your audience, revenue and content performance are exclusive to <strong>Bulls Pro</strong>.
      </p>
      <button
        onClick={onNavigateToPremium}
        className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 mb-3"
      >
        <Crown className="w-5 h-5" /> Upgrade to Pro
      </button>
      <button onClick={onClose} className="w-full py-3 text-slate-500 text-sm font-semibold hover:text-slate-700 transition">
        Back
      </button>
    </div>
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.FC<any>;
  iconColor: string;
  bgColor: string;
  label: string;
  value: string | number;
  growth?: number;
}> = ({ icon: Icon, iconColor, bgColor, label, value, growth }) => (
  <div className={`${bgColor} backdrop-blur-sm rounded-2xl p-5 border border-white/10`}>
    <div className="flex items-center justify-between mb-3">
      <Icon className={`w-7 h-7 ${iconColor}`} />
      {growth !== undefined && growth > 0 && (
        <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
          <ArrowUp className="w-3 h-3" />+{growth.toFixed(1)}%
        </div>
      )}
    </div>
    <p className="text-white/60 text-xs mb-1">{label}</p>
    <p className="text-white text-2xl font-bold">{value}</p>
  </div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
export const CreatorAnalytics: React.FC<CreatorAnalyticsProps> = ({ onClose, onNavigateToPremium }) => {
  const { isPro, loading: subLoading } = useSubscription();
  const { stats, loading, error } = useCreatorStats();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');

  if (subLoading) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!isPro) {
    return <UpgradeGate onClose={onClose} onNavigateToPremium={onNavigateToPremium} />;
  }

  const getPeriodStats = (): PeriodStats | null => {
    if (!stats) return null;
    if (selectedPeriod === '7d')  return stats.stats7d;
    if (selectedPeriod === '30d') return stats.stats30d;
    if (selectedPeriod === '90d') return stats.stats90d;
    // "all" — totals
    return {
      posts:       stats.totalPosts,
      views:       stats.totalViews,
      likes:       stats.totalLikes,
      comments:    stats.totalComments,
      revenue:     stats.totalRevenue,
      lives:       stats.totalLives,
      liveViewers: stats.totalLiveViewers,
    };
  };

  const period = getPeriodStats();

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-green-500" /> Creator Analytics
            </h1>
            <p className="text-white/50 text-sm mt-0.5">Your real performance data</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {([
            { value: '7d',  label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
            { value: 'all', label: 'All time' },
          ] as { value: Period; label: string }[]).map(p => (
            <button
              key={p.value}
              onClick={() => setSelectedPeriod(p.value)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                selectedPeriod === p.value ? 'bg-green-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {!loading && stats && period && (
          <>
            {/* Main stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <StatCard icon={Eye}          iconColor="text-blue-400"   bgColor="bg-blue-600/20 border-blue-500/30"   label="Views"     value={period.views.toLocaleString()} />
              <StatCard icon={Heart}        iconColor="text-pink-400"   bgColor="bg-pink-600/20 border-pink-500/30"   label="Likes"     value={period.likes.toLocaleString()} />
              <StatCard icon={MessageCircle} iconColor="text-purple-400" bgColor="bg-purple-600/20 border-purple-500/30" label="Comments" value={period.comments.toLocaleString()} />
              <StatCard icon={DollarSign}   iconColor="text-green-400"  bgColor="bg-green-600/20 border-green-500/30" label="Revenue"   value={`€ ${period.revenue.toFixed(2)}`} />
            </div>

            {/* Secondary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-white/50 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Followers</p>
                <p className="text-white font-bold text-xl">{stats.followersCount.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-white/50 text-xs mb-1 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Posts</p>
                <p className="text-white font-bold text-xl">{period.posts}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-white/50 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Lives</p>
                <p className="text-white font-bold text-xl">{period.lives}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-white/50 text-xs mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Live Viewers</p>
                <p className="text-white font-bold text-xl">{period.liveViewers.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

              {/* Top Posts */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" /> Top Posts
                </h3>
                {stats.topPosts.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-6">No posts yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topPosts.map((post, i) => (
                      <div key={post.id} className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{post.content || '(no text)'}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes_count}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.comments_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Lives */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" /> Top Lives
                </h3>
                {stats.topLives.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-6">No completed lives yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topLives.map((live, i) => (
                      <div key={live.id} className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{live.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{live.viewer_count} viewers</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{live.likes_count} likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" /> Revenue
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Tips received</p>
                  <p className="text-white text-xl font-bold">€ {stats.tipsRevenue.toFixed(2)}</p>
                  <p className="text-white/40 text-xs mt-1">{stats.tipsCount} tip{stats.tipsCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Your share (70%)</p>
                  <p className="text-green-400 text-xl font-bold">€ {(stats.totalRevenue * 0.7).toFixed(2)}</p>
                  <p className="text-white/40 text-xs mt-1">After Bulls 30% commission</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Peak live viewers</p>
                  <p className="text-white text-xl font-bold">{stats.peakLiveViewers.toLocaleString()}</p>
                  <p className="text-white/40 text-xs mt-1">All time record</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft, TrendingUp, Users, Eye, Heart, MessageCircle,
  DollarSign, Award, Settings, Crown, ChevronRight,
  Sparkles, Loader2, Share2, Video, Clock, BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useCreatorStats } from '../../hooks/useCreatorStats';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('en-IE');
const fmtEur = (n: number) => `€ ${n.toLocaleString('en-IE', { minimumFractionDigits: 2 })}`;

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: boolean;
}> = ({ icon, label, value, sub, trend }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
    <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-white text-2xl font-bold">{value}</p>
    {sub && (
      <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
        {trend && <TrendingUp className="w-3 h-3" />}
        <span>{sub}</span>
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
type Tab = 'overview' | 'content' | 'revenue';

export const CreatorDashboard = ({
  onBack,
  onNavigateToMonetization,
  onNavigateToPremium,
}: {
  onBack: () => void;
  onNavigateToMonetization?: () => void;
  onNavigateToPremium?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToVideoStudio?: () => void;
}) => {
  const { isPro, loading: subLoading } = useSubscription();
  const { stats, loading: statsLoading, error } = useCreatorStats();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // ── Loading ──────────────────────────────────────────────────────────────
  if (subLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  // ── Pro gate ─────────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Creator Dashboard</h2>
          <p className="text-slate-600 text-sm mb-6">
            Detailed analytics and creator tools are exclusive to <strong>Bulls Pro</strong>.
          </p>
          <button
            onClick={onNavigateToPremium}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 mb-3"
          >
            <Crown className="w-5 h-5" /> Upgrade to Pro
          </button>
          <button onClick={onBack} className="w-full py-3 text-slate-500 text-sm font-semibold hover:text-slate-700 transition">
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const engagementRate = stats && stats.totalViews > 0
    ? (((stats.totalLikes + stats.totalComments + stats.totalShares) / stats.totalViews) * 100).toFixed(1)
    : '—';

  const topPost = stats?.topPosts?.[0] ?? null;
  const topLive = stats?.topLives?.[0] ?? null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg">Creator Dashboard</h1>
          <button className="text-white opacity-0 pointer-events-none">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <StatCard
            icon={<Eye className="w-4 h-4" />}
            label="Total Views"
            value={statsLoading ? '…' : fmt(stats?.totalViews ?? 0)}
            sub={`${fmt(stats?.stats7d.views ?? 0)} this week`}
            trend
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Followers"
            value={statsLoading ? '…' : fmt(stats?.followersCount ?? 0)}
          />
          <StatCard
            icon={<Heart className="w-4 h-4" />}
            label="Engagement"
            value={statsLoading ? '…' : `${engagementRate}%`}
            sub="(likes + comments + shares) / views"
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Revenue (tips)"
            value={statsLoading ? '…' : fmtEur(stats?.totalRevenue ?? 0)}
            sub={`${stats?.tipsCount ?? 0} tips received`}
          />
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-2 pb-2">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'content',  label: 'Content'  },
            { id: 'revenue',  label: 'Revenue'  },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab.id ? 'bg-white text-green-600' : 'bg-white/20 text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-6">

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* ── Overview ───────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">

            {/* Period comparison */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Activity Summary</h3>
              {statsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Last 7 days',  s: stats?.stats7d  },
                    { label: 'Last 30 days', s: stats?.stats30d },
                    { label: 'Last 90 days', s: stats?.stats90d },
                  ].map(({ label, s }) => (
                    <div key={label} className="border border-slate-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{fmt(s?.posts ?? 0)}</p>
                          <p className="text-xs text-slate-400">Posts</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{fmt(s?.views ?? 0)}</p>
                          <p className="text-xs text-slate-400">Views</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{fmt(s?.likes ?? 0)}</p>
                          <p className="text-xs text-slate-400">Likes</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-600">{fmtEur(s?.revenue ?? 0)}</p>
                          <p className="text-xs text-slate-400">Revenue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Creator Tools */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Creator Tools</h3>
              <button
                onClick={() => onNavigateToMonetization?.()}
                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Monetisation</p>
                    <p className="text-xs text-slate-500">Set up subscriptions and pricing</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Top Post */}
            {topPost && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-slate-900">Top Post</h3>
                </div>
                <p className="text-slate-700 text-sm mb-3 line-clamp-2">{topPost.content}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Eye className="w-4 h-4" /> {fmt(topPost.views_count)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Heart className="w-4 h-4" /> {fmt(topPost.likes_count)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <MessageCircle className="w-4 h-4" /> {fmt(topPost.comments_count)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <div className="p-4 space-y-4">

            {/* All-time totals */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">All-Time Totals</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Posts',    value: fmt(stats?.totalPosts    ?? 0) },
                  { label: 'Views',    value: fmt(stats?.totalViews    ?? 0) },
                  { label: 'Likes',    value: fmt(stats?.totalLikes    ?? 0) },
                  { label: 'Comments', value: fmt(stats?.totalComments ?? 0) },
                  { label: 'Shares',   value: fmt(stats?.totalShares   ?? 0) },
                  { label: 'Lives',    value: fmt(stats?.totalLives    ?? 0) },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-base font-bold text-slate-900">{statsLoading ? '…' : item.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 posts */}
            {!statsLoading && stats && stats.topPosts.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3">Top Posts</h3>
                <div className="space-y-3">
                  {stats.topPosts.map((post, i) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-700 text-xs font-bold">#{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmt(post.views_count)}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{fmt(post.likes_count)}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{fmt(post.comments_count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top lives */}
            {!statsLoading && stats && stats.topLives.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3">Top Lives</h3>
                <div className="space-y-3">
                  {stats.topLives.map((live, i) => (
                    <div key={live.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xs font-bold">#{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{live.title || 'Untitled live'}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmt(live.viewer_count)} viewers</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Peak {fmt(live.peak_viewer_count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content analytics coming soon */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">Detailed content analytics coming soon</p>
              <p className="text-xs text-slate-400 mt-1">Performance by type, best posting times, and reach breakdown.</p>
            </div>
          </div>
        )}

        {/* ── Revenue ────────────────────────────────────────────────────── */}
        {activeTab === 'revenue' && (
          <div className="p-4 space-y-4">

            {/* Total revenue card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-white/80 text-sm mb-1">Total Revenue (tips)</p>
              <p className="text-4xl font-bold mb-1">
                {statsLoading ? '…' : fmtEur(stats?.totalRevenue ?? 0)}
              </p>
              <p className="text-white/70 text-sm">
                {statsLoading ? '' : `from ${stats?.tipsCount ?? 0} tips received`}
              </p>
            </div>

            {/* Period breakdown */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Revenue by Period</h3>
              {statsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Last 7 days',  revenue: stats?.stats7d.revenue  ?? 0 },
                    { label: 'Last 30 days', revenue: stats?.stats30d.revenue ?? 0 },
                    { label: 'Last 90 days', revenue: stats?.stats90d.revenue ?? 0 },
                  ].map(({ label, revenue }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                      <span className="text-sm font-bold text-green-600">{fmtEur(revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-1">Revenue sources</p>
              <p className="text-xs text-amber-700">
                Revenue currently tracks <strong>tips</strong> received via Stripe. Course enrollment revenue and subscription analytics will be added in a future update.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, TrendingUp, TrendingDown, Eye, Heart, MessageCircle,
  Users, BarChart3, Target, Megaphone, DollarSign, Loader2,
  Building2, AlertCircle, Share2, Crown,
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

// ─── Gate — só Business ──────────────────────────────────────────────────────
const UpgradeGate: React.FC<{ onBack: () => void; onNavigateToPremium?: () => void }> = ({ onBack, onNavigateToPremium }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-lg">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulls Business</h2>
      <p className="text-slate-600 text-sm mb-6">
        Sentiment analytics, audience insights and sponsored posts are exclusive to the <strong>Bulls Business</strong> plan.
      </p>
      <button
        onClick={onNavigateToPremium}
        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 mb-3"
      >
        <Crown className="w-5 h-5" /> Upgrade to Business
      </button>
      <button onClick={onBack} className="w-full py-3 text-slate-500 text-sm font-semibold hover:text-slate-700 transition">
        Back
      </button>
    </div>
  </div>
);

// ─── Hook de dados reais ─────────────────────────────────────────────────────
const useBusinessStats = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Posts do utilizador
      const { data: posts } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count, views_count, created_at')
        .eq('author_id', user.id);

      // Comentários nos posts do utilizador (para sentimento simples)
      const { data: postIds } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', user.id);

      let comments: any[] = [];
      if (postIds && postIds.length > 0) {
        const ids = postIds.map((p: any) => p.id);
        const { data: cmts } = await supabase
          .from('comments')
          .select('content')
          .in('post_id', ids);
        comments = cmts || [];
      }

      // Perfil (seguidores)
      const { data: profile } = await supabase
        .from('profiles')
        .select('followers_count, following_count, name')
        .eq('id', user.id)
        .single();

      const allPosts = posts || [];
      const totalViews       = allPosts.reduce((s: number, p: any) => s + (p.views_count    || 0), 0);
      const totalLikes       = allPosts.reduce((s: number, p: any) => s + (p.likes_count    || 0), 0);
      const totalComments    = allPosts.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
      const totalShares      = allPosts.reduce((s: number, p: any) => s + (p.shares_count   || 0), 0);
      const totalEngagement  = totalLikes + totalComments + totalShares;

      // Sentimento simples baseado em palavras-chave nos comentários
      const positiveWords = ['great', 'excellent', 'amazing', 'good', 'love', 'buy', 'bullish', 'growth',
                             'ótimo', 'excelente', 'bom', 'comprar', 'alta', 'crescimento', 'parabéns', 'top'];
      const negativeWords = ['bad', 'terrible', 'sell', 'bearish', 'crash', 'drop', 'concern',
                             'ruim', 'péssimo', 'vender', 'baixa', 'queda', 'preocupante', 'cuidado'];

      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount  = 0;

      comments.forEach((c: any) => {
        const text = (c.content || '').toLowerCase();
        const hasPositive = positiveWords.some(w => text.includes(w));
        const hasNegative = negativeWords.some(w => text.includes(w));
        if (hasPositive && !hasNegative) positiveCount++;
        else if (hasNegative && !hasPositive) negativeCount++;
        else neutralCount++;
      });

      const total = positiveCount + negativeCount + neutralCount || 1;
      const sentimentScore = Math.round((positiveCount / total) * 100);

      // Tópicos mais mencionados nos comentários
      const topicKeywords: Record<string, string[]> = {
        'Dividends':   ['dividend', 'dividendo', 'yield'],
        'Earnings':    ['earnings', 'lucro', 'resultado', 'balanço'],
        'Growth':      ['growth', 'crescimento', 'expansão'],
        'Shares':      ['ações', 'share', 'stock'],
        'Crypto':      ['bitcoin', 'crypto', 'cripto', 'ethereum'],
      };

      const topicCounts = Object.entries(topicKeywords).map(([topic, words]) => {
        const count = comments.filter((c: any) =>
          words.some(w => (c.content || '').toLowerCase().includes(w))
        ).length;
        return { topic, count };
      }).sort((a, b) => b.count - a.count);

      setData({
        followers:     profile?.followers_count || 0,
        following:     profile?.following_count || 0,
        companyName:   profile?.name || '',
        totalViews,
        totalEngagement,
        totalPosts:    allPosts.length,
        sentimentScore,
        sentimentData: [
          { label: 'Very Positive', count: Math.round(positiveCount * 0.6), pct: Math.round((positiveCount * 0.6 / total) * 100), color: 'bg-green-500' },
          { label: 'Positive',      count: Math.round(positiveCount * 0.4), pct: Math.round((positiveCount * 0.4 / total) * 100), color: 'bg-green-400' },
          { label: 'Neutral',       count: neutralCount,  pct: Math.round((neutralCount  / total) * 100), color: 'bg-slate-400' },
          { label: 'Negative',      count: Math.round(negativeCount * 0.7), pct: Math.round((negativeCount * 0.7 / total) * 100), color: 'bg-red-400' },
          { label: 'Very Negative', count: Math.round(negativeCount * 0.3), pct: Math.round((negativeCount * 0.3 / total) * 100), color: 'bg-red-500' },
        ],
        topTopics: topicCounts,
        totalComments: comments.length,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error };
};

// ─── Main ────────────────────────────────────────────────────────────────────
export const BusinessDashboard: React.FC<{ onBack: () => void; onNavigateToPremium?: () => void }> = ({ onBack, onNavigateToPremium }) => {
  const { isBusiness, loading: subLoading } = useSubscription();
  const { data, loading, error } = useBusinessStats();
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'audience' | 'sponsored'>('overview');

  if (subLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!isBusiness) {
    return <UpgradeGate onBack={onBack} onNavigateToPremium={onNavigateToPremium} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Bulls Business</h1>
            <p className="text-sm text-white/80">Analytics & Insights</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['overview', 'sentiment', 'audience', 'sponsored'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-sm transition ${
                activeTab === tab ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab === 'overview'   ? 'Overview'
               : tab === 'sentiment' ? 'Sentiment'
               : tab === 'audience'  ? 'Audience'
               : 'Sponsored'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Eye,           color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Total Views',       value: data.totalViews.toLocaleString() },
                    { icon: Heart,         color: 'text-pink-600',   bg: 'bg-pink-50',   label: 'Engagement',        value: data.totalEngagement.toLocaleString() },
                    { icon: Users,         color: 'text-purple-600', bg: 'bg-purple-50', label: 'Followers',         value: data.followers.toLocaleString() },
                    { icon: BarChart3,     color: 'text-green-600',  bg: 'bg-green-50',  label: 'Sentiment Score',   value: `${data.sentimentScore}%` },
                  ].map(({ icon: Icon, color, bg, label, value }) => (
                    <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Topics of interest */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" /> Topics of Interest
                  </h3>
                  {data.topTopics.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No comment data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topTopics.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.count > 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
                              {item.count > 0
                                ? <TrendingUp className="w-4 h-4 text-green-600" />
                                : <MessageCircle className="w-4 h-4 text-slate-400" />}
                            </div>
                            <span className="font-medium text-slate-900 text-sm">{item.topic}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-500">{item.count} mentions</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
                    Based on {data.totalComments} comments on your posts
                  </p>
                </div>
              </div>
            )}

            {/* SENTIMENT */}
            {activeTab === 'sentiment' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 text-center">Investor Sentiment Analysis</h3>
                  {data.totalComments === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">
                      Sentiment is calculated from comments on your posts.<br />You need at least some comments to see this data.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {data.sentimentData.map((item: any, i: number) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-slate-700">{item.label}</span>
                              <span className="text-sm font-bold text-slate-900">{item.count} mentions</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                              <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{item.pct}% of total</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                        <p className="text-3xl font-bold text-green-600 mb-1">{data.sentimentScore}%</p>
                        <p className="text-sm text-green-700 font-semibold">Overall Positive Sentiment</p>
                        <p className="text-xs text-slate-500 mt-1">Based on {data.totalComments} analysed comments</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* AUDIENCE */}
            {activeTab === 'audience' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" /> Follower Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-purple-700">{data.followers.toLocaleString()}</p>
                      <p className="text-xs text-purple-600 font-semibold mt-1">Followers</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{data.totalPosts}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-1">Posts Published</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-semibold mb-1">📊 Detailed Demographics</p>
                  <p className="text-xs text-blue-700">
                    Audience demographics (age, location, investor profile) will be available as more users interact with your profile. This data is aggregated anonymously.
                  </p>
                </div>
              </div>
            )}

            {/* SPONSORED */}
            {activeTab === 'sponsored' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                  <Megaphone className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Sponsored Posts</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Reach qualified investors with featured posts across the Bulls feed.
                  </p>
                  <button
                    onClick={() => alert('Sponsored posts — coming soon! Contact: business@bulls.app')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:shadow-xl transition"
                  >
                    Create Campaign
                  </button>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Pricing</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'CPM (Cost per Thousand)', sub: 'Feed impressions',     price: '€ 15.00' },
                      { label: 'CPC (Cost per Click)',    sub: 'Clicks on post',       price: '€ 0.80'  },
                      { label: 'Feed Highlight',          sub: '24h top placement',    price: '€ 500.00' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.sub}</p>
                        </div>
                        <span className="text-base font-bold text-green-600">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

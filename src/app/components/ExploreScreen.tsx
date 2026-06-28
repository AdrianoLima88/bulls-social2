import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, TrendingUp, Hash, Users, BarChart3, Loader2, X } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTrendingTags } from '../../hooks/useTrendingTags';
import { MediaCarousel } from './MediaCarousel';

// ─── Types ──────────────────────────────────────────────────
interface FeaturedPost {
  id: string;
  content: string;
  author_name: string;
  author_username: string;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  type: string;
  media: any[];
  created_at: string;
}

interface SuggestedProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  followers_count: number;
}

// ─── Helpers ────────────────────────────────────────────────
const typeColors: Record<string, string> = {
  analysis:  'bg-blue-100 text-blue-700',
  news:      'bg-purple-100 text-purple-700',
  education: 'bg-orange-100 text-orange-700',
  company:   'bg-indigo-100 text-indigo-700',
  generic:   'bg-slate-100 text-slate-700',
};

// ─── Main Component ─────────────────────────────────────────
export const ExploreScreen = ({
  onBack,
  onNavigateToPost,
  onNavigateToProfile,
  onNavigateToHashtag,
}: {
  onBack: () => void;
  onNavigateToPost?: (post: any) => void;
  onNavigateToProfile?: (profile: any) => void;
  onNavigateToHashtag?: (tag: string) => void;
}) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'trending' | 'posts' | 'people'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { trendingTags } = useTrendingTags(20);
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  // ── Fetch top posts (most liked) ──────────────────────────
  const fetchFeaturedPosts = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select(`
          id, content, type, media, likes_count, comments_count, created_at, tags,
          profiles:author_id (name, username, avatar_url, verified)
        `)
        .order('likes_count', { ascending: false })
        .limit(10);

      setFeaturedPosts(
        (data || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          author_name: p.profiles?.name || 'User',
          author_username: p.profiles?.username || 'user',
          avatar_url: p.profiles?.avatar_url || null,
          likes_count: p.likes_count || 0,
          comments_count: p.comments_count || 0,
          type: p.type || 'generic',
          media: p.media || [],
          created_at: p.created_at,
        }))
      );
    } catch {
      setFeaturedPosts([]);
    }
  }, []);

  // ── Fetch suggested profiles (not already following) ──────
  const fetchSuggestedProfiles = useCallback(async () => {
    if (!user) return;
    try {
      // Get who current user follows
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingSet = new Set(follows?.map(f => f.following_id) || []);
      setFollowingIds(Array.from(followingSet) as string[]);

      // Get profiles not followed, not self
      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, bio, verified')
        .neq('id', user.id)
        .limit(20);

      const suggestions = (data || [])
        .filter(p => !followingSet.has(p.id))
        .slice(0, 10)
        .map(p => ({ ...p, followers_count: Math.floor(Math.random() * 500) + 10 }));

      setSuggestedProfiles(suggestions);
    } catch {
      setSuggestedProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeaturedPosts();
    fetchSuggestedProfiles();
  }, [fetchFeaturedPosts, fetchSuggestedProfiles]);

  // ── Follow / Unfollow ─────────────────────────────────────
  const handleFollow = async (profileId: string) => {
    if (!user || followLoading) return;
    setFollowLoading(profileId);
    try {
      const isFollowing = followingIds.includes(profileId);
      if (isFollowing) {
        await supabase.from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);
        setFollowingIds(prev => prev.filter(id => id !== profileId));
      } else {
        await supabase.from('follows')
          .insert({ follower_id: user.id, following_id: profileId });
        setFollowingIds(prev => [...prev, profileId]);
      }
    } catch {}
    setFollowLoading(null);
  };

  // ── Search filter ──────────────────────────────────────────
  const filteredTags = trendingTags.filter(t =>
    !searchQuery || t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPosts = featuredPosts.filter(p =>
    !searchQuery ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author_username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProfiles = suggestedProfiles.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg flex-1">Explore</h1>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hashtags, posts or people..."
              className="w-full pl-9 pr-8 py-2.5 bg-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/20">
          {[
            { key: 'trending', label: '🔥 Trending', },
            { key: 'posts',    label: '📊 Top Posts' },
            { key: 'people',   label: '👥 People' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${
                tab === t.key
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        ) : (

          <>
            {/* ── TRENDING HASHTAGS ── */}
            {tab === 'trending' && (
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Trending this week · {filteredTags.length} hashtags
                </p>
                {filteredTags.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No hashtags found</p>
                ) : (
                  filteredTags.map((item, i) => (
                    <button
                      key={item.tag}
                      onClick={() => onNavigateToHashtag?.(item.tag)}
                      className="w-full bg-white rounded-xl px-4 py-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition active:scale-[0.99]"
                    >
                      {/* Rank */}
                      <div className="w-8 text-center">
                        {i < 3
                          ? <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                          : <span className="text-sm font-bold text-slate-400">{i + 1}</span>
                        }
                      </div>

                      {/* Tag info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="font-bold text-slate-900 text-sm">{item.tag}</span>
                          {item.change === 'new' && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.count} posts</p>
                      </div>

                      {/* Trend indicator */}
                      <div className={`flex items-center gap-1 text-xs font-semibold ${
                        item.change === 'up' ? 'text-green-600'
                        : item.change === 'down' ? 'text-red-500'
                        : 'text-blue-600'
                      }`}>
                        {item.change === 'up' && '↑ Rising'}
                        {item.change === 'down' && '↓ Falling'}
                        {item.change === 'new' && '✦ New'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ── TOP POSTS ── */}
            {tab === 'posts' && (
              <div className="p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Most liked posts
                </p>
                {filteredPosts.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No posts found</p>
                ) : (
                  filteredPosts.map(post => (
                    <button
                      key={post.id}
                      onClick={() => onNavigateToPost?.(post)}
                      className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition text-left active:scale-[0.99]"
                    >
                      {/* Author */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                          {post.avatar_url
                            ? <img src={post.avatar_url} alt={post.author_name} className="w-full h-full object-cover" />
                            : post.author_name[0]
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{post.author_name}</p>
                          <p className="text-xs text-slate-500">@{post.author_username}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${typeColors[post.type] || typeColors.generic}`}>
                          {post.type}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-slate-700 text-sm leading-relaxed mb-3 line-clamp-3">{post.content}</p>

                      {/* Media preview */}
                      {post.media?.length > 0 && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img src={post.media[0].url} alt="" className="w-full h-32 object-cover" />
                          {post.media.length > 1 && (
                            <div className="text-xs text-slate-500 mt-1">+{post.media.length - 1} more</div>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>❤️ {post.likes_count}</span>
                        <span>💬 {post.comments_count}</span>
                        <span className="ml-auto text-slate-400">
                          {new Date(post.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ── PEOPLE ── */}
            {tab === 'people' && (
              <div className="p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Suggested for you
                </p>
                {filteredProfiles.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No profiles found</p>
                ) : (
                  filteredProfiles.map(profile => {
                    const isFollowing = followingIds.includes(profile.id);
                    return (
                      <div key={profile.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                        <button
                          onClick={() => onNavigateToProfile?.(profile)}
                          className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden"
                        >
                          {profile.avatar_url
                            ? <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                            : profile.name[0]
                          }
                        </button>
                        <button
                          onClick={() => onNavigateToProfile?.(profile)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-sm truncate">{profile.name}</p>
                            {profile.verified && <span className="text-blue-500 text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-slate-500">@{profile.username}</p>
                          {profile.bio && (
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{profile.bio}</p>
                          )}
                        </button>
                        <button
                          onClick={() => handleFollow(profile.id)}
                          disabled={followLoading === profile.id}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${
                            isFollowing
                              ? 'border border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-500'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {followLoading === profile.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : isFollowing ? 'Following' : 'Follow'
                          }
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

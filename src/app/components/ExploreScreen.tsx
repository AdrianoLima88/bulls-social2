import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, Search, TrendingUp, Hash, Users,
  Loader2, X, UserCheck, UserPlus,
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTrendingTags } from '../../hooks/useTrendingTags';

// ─── Types ────────────────────────────────────────────────────
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

interface Profile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
}

interface SearchPost {
  id: string;
  author_id: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  profiles?: {
    name: string;
    username: string;
    avatar_url: string | null;
    verified: boolean;
  };
}

const typeColors: Record<string, string> = {
  analysis:  'bg-blue-100 text-blue-700',
  news:      'bg-purple-100 text-purple-700',
  education: 'bg-orange-100 text-orange-700',
  company:   'bg-indigo-100 text-indigo-700',
  generic:   'bg-slate-100 text-slate-700',
};

// ─── Avatar helper ────────────────────────────────────────────
const Avatar = ({ url, name, size = 10 }: { url: string | null; name: string; size?: number }) => (
  <div className={`w-${size} h-${size} rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden`}>
    {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : (name?.[0] || 'U')}
  </div>
);

// ─── Main Component ───────────────────────────────────────────
export const ExploreScreen = ({
  onBack,
  onNavigateToPost,
  onNavigateToProfile,
}: {
  onBack: () => void;
  onNavigateToPost?: (post: any) => void;
  onNavigateToProfile?: (profile: any) => void;
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'trending' | 'posts' | 'people'>('trending');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Explore data
  const { trendingTags } = useTrendingTags(20);
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  // Search data
  const [allPosts, setAllPosts] = useState<SearchPost[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [searchPostsLoading, setSearchPostsLoading] = useState(true);

  // ── Fetch explore data ─────────────────────────────────────
  const fetchExplore = useCallback(async () => {
    if (!user) return;
    try {
      const [postsRes, followsRes, profilesRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, content, type, media, likes_count, comments_count, created_at, profiles:author_id (name, username, avatar_url)')
          .order('likes_count', { ascending: false })
          .limit(10),
        supabase.from('follows').select('following_id').eq('follower_id', user.id),
        supabase.from('profiles').select('id, name, username, avatar_url, bio, verified').neq('id', user.id).limit(30),
      ]);

      const followingSet = new Set(followsRes.data?.map((f: any) => f.following_id) || []);
      setFollowingIds(Array.from(followingSet) as string[]);

      setFeaturedPosts(
        (postsRes.data || []).map((p: any) => ({
          id: p.id, content: p.content, type: p.type || 'generic',
          media: p.media || [], likes_count: p.likes_count || 0,
          comments_count: p.comments_count || 0, created_at: p.created_at,
          author_name: p.profiles?.name || 'User',
          author_username: p.profiles?.username || 'user',
          avatar_url: p.profiles?.avatar_url || null,
        }))
      );

      setProfiles(
        (profilesRes.data || []).filter((p: any) => !followingSet.has(p.id)).slice(0, 15)
      );
    } catch {}
    finally { setLoading(false); }
  }, [user]);

  // ── Fetch all posts for local search ───────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('posts')
          .select('id, author_id, content, tags, created_at, profiles:author_id (name, username, avatar_url, verified)')
          .order('created_at', { ascending: false })
          .limit(300);
        setAllPosts((data || []) as unknown as SearchPost[]);

        const { data: pData } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, bio, verified')
          .limit(200);
        setAllProfiles((pData || []) as Profile[]);
      } catch {}
      finally { setSearchPostsLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => { fetchExplore(); }, [fetchExplore]);

  // ── Follow / Unfollow ─────────────────────────────────────
  const handleFollow = async (profileId: string) => {
    if (!user || followLoading) return;
    setFollowLoading(profileId);
    try {
      const isFollowing = followingIds.includes(profileId);
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileId);
        setFollowingIds(prev => prev.filter(id => id !== profileId));
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId });
        setFollowingIds(prev => [...prev, profileId]);
      }
    } catch {}
    setFollowLoading(null);
  };

  // ── Search results ────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const searchedPosts = isSearching
    ? allPosts.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.profiles?.name?.toLowerCase().includes(q) ||
        p.profiles?.username?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      ).slice(0, 20)
    : [];

  const searchedProfiles = isSearching
    ? allProfiles.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
      ).slice(0, 10)
    : [];

  // ── Filtered explore data ──────────────────────────────────
  const filteredTags = trendingTags.filter(t => !q || t.tag.toLowerCase().includes(q));
  const filteredPosts = featuredPosts.filter(p =>
    !q || p.content.toLowerCase().includes(q) || p.author_username.toLowerCase().includes(q)
  );
  const filteredProfiles = profiles.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts, people, hashtags…"
              autoFocus
              className="w-full pl-9 pr-9 py-2.5 bg-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition"
            />
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs — only when not searching */}
        {!isSearching && (
          <div className="flex border-t border-white/20">
            {([
              { key: 'trending', label: '🔥 Trending' },
              { key: 'posts',    label: '📊 Top Posts' },
              { key: 'people',   label: '👥 People' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 text-sm font-semibold transition ${
                  tab === t.key ? 'text-white border-b-2 border-white' : 'text-white/60 hover:text-white/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ═══ SEARCH RESULTS ═══ */}
        {isSearching && (
          <div className="p-4 space-y-4">
            {searchPostsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-green-600 animate-spin" /></div>
            ) : (
              <>
                {/* Profiles */}
                {searchedProfiles.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">People</p>
                    <div className="space-y-2">
                      {searchedProfiles.map(p => (
                        <div key={p.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                          <button onClick={() => onNavigateToProfile?.(p)}>
                            <Avatar url={p.avatar_url} name={p.name} size={10} />
                          </button>
                          <button onClick={() => onNavigateToProfile?.(p)} className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-900 text-sm truncate">{p.name}</span>
                              {p.verified && <span className="text-blue-500 text-xs flex-shrink-0">✓</span>}
                            </div>
                            <p className="text-xs text-slate-500">@{p.username}</p>
                          </button>
                          <button
                            onClick={() => handleFollow(p.id)}
                            disabled={followLoading === p.id}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                              followingIds.includes(p.id)
                                ? 'border border-slate-300 text-slate-600'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {followLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" />
                              : followingIds.includes(p.id) ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts */}
                {searchedPosts.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Posts · {searchedPosts.length} results
                    </p>
                    <div className="space-y-2">
                      {searchedPosts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar url={post.profiles?.avatar_url ?? null} name={post.profiles?.name || 'U'} size={9} />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{post.profiles?.name || 'User'}</p>
                              <p className="text-xs text-slate-500">@{post.profiles?.username || 'user'}</p>
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm line-clamp-3">{post.content}</p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {searchedPosts.length === 0 && searchedProfiles.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-600">No results for "{query}"</p>
                    <p className="text-sm text-slate-400 mt-1">Try a different term or hashtag</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ EXPLORE TABS ═══ */}
        {!isSearching && (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* ── TRENDING ── */}
                {tab === 'trending' && (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Trending this week · {filteredTags.length} hashtags
                    </p>
                    {filteredTags.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No hashtags found</p>
                    ) : filteredTags.map((item, i) => (
                      <button
                        key={item.tag}
                        onClick={() => setQuery(item.tag)}
                        className="w-full bg-white rounded-xl px-4 py-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition active:scale-[0.99]"
                      >
                        <div className="w-8 text-center">
                          {i < 3
                            ? <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                            : <span className="text-sm font-bold text-slate-400">{i + 1}</span>}
                        </div>
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
                        <span className={`text-xs font-semibold ${
                          item.change === 'up' ? 'text-green-600' : item.change === 'down' ? 'text-red-500' : 'text-blue-600'
                        }`}>
                          {item.change === 'up' && '↑ Rising'}
                          {item.change === 'down' && '↓ Falling'}
                          {item.change === 'new' && '✦ New'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* ── TOP POSTS ── */}
                {tab === 'posts' && (
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Most liked posts</p>
                    {filteredPosts.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No posts found</p>
                    ) : filteredPosts.map(post => (
                      <button
                        key={post.id}
                        onClick={() => onNavigateToPost?.(post)}
                        className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition text-left active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar url={post.avatar_url} name={post.author_name} size={10} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{post.author_name}</p>
                            <p className="text-xs text-slate-500">@{post.author_username}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${typeColors[post.type] || typeColors.generic}`}>
                            {post.type}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3 line-clamp-3">{post.content}</p>
                        {post.media?.length > 0 && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <img src={post.media[0].url} alt="" className="w-full h-32 object-cover" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>❤️ {post.likes_count}</span>
                          <span>💬 {post.comments_count}</span>
                          <span className="ml-auto text-slate-400">
                            {new Date(post.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* ── PEOPLE ── */}
                {tab === 'people' && (
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Suggested for you</p>
                    {filteredProfiles.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No profiles found</p>
                    ) : filteredProfiles.map(profile => {
                      const isFollowing = followingIds.includes(profile.id);
                      return (
                        <div key={profile.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                          <button onClick={() => onNavigateToProfile?.(profile)}>
                            <Avatar url={profile.avatar_url} name={profile.name} size={12} />
                          </button>
                          <button onClick={() => onNavigateToProfile?.(profile)} className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-sm truncate">{profile.name}</p>
                              {profile.verified && <span className="text-blue-500 text-xs">✓</span>}
                            </div>
                            <p className="text-xs text-slate-500">@{profile.username}</p>
                            {profile.bio && <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{profile.bio}</p>}
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
                              : isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

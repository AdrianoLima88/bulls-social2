import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, TrendingUp, Hash, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useLocale } from '../contexts/LocaleContext';
import { useTrendingTags } from '../../hooks/useTrendingTags';

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

export const SearchScreen = ({ onBack, onNavigateToProfile }: {
  onBack: () => void;
  onNavigateToProfile?: (profile: any) => void;
}) => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState<SearchPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Trending real: engajamento (shares×5 + views) dos últimos 7 dias vs 7 dias anteriores
  const { trendingTags, loading: trendingLoading } = useTrendingTags(10);

  // Busca posts reais do Supabase uma vez; a digitação filtra localmente (sem fake data)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await supabase
          .from('posts')
          .select(`
            id, author_id, content, tags, created_at,
            profiles:author_id ( name, username, avatar_url, verified )
          `)
          .order('created_at', { ascending: false })
          .limit(200);
        setAllPosts((data || []) as unknown as SearchPost[]);
      } catch {
        setAllPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? allPosts.filter(post =>
        post.content?.toLowerCase().includes(query) ||
        post.profiles?.name?.toLowerCase().includes(query) ||
        post.profiles?.username?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    : [];

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-full px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {query ? (
          // Resultados da busca (posts reais do Supabase)
          <div className="p-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {t('search.searching')}
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="font-bold text-lg mb-3 text-slate-900">
                  {searchResults.length} {searchResults.length === 1 ? t('search.result') : t('search.results')}
                </h2>
                <div className="space-y-2">
                  {searchResults.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                          {post.profiles?.avatar_url
                            ? <img src={post.profiles.avatar_url} alt={post.profiles?.name || ''} className="w-full h-full object-cover" />
                            : (post.profiles?.name?.[0] || 'U')
                          }
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{post.profiles?.name || 'User'}</p>
                          <p className="text-xs text-slate-500">@{post.profiles?.username || 'user'}</p>
                        </div>
                      </div>
                      <p className="text-slate-700 text-sm line-clamp-3">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 text-center font-semibold">{t('search.noResults')}</p>
                <p className="text-slate-400 text-sm text-center mt-1">{t('search.tryAnotherTerm')}</p>
              </div>
            )}
          </div>
        ) : (
          // Assuntos do momento — ranqueado por engajamento real (shares/views), sem dados fake
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {t('search.trending')}
            </h2>
            <div className="space-y-2">
              {trendingLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : trendingTags.length > 0 ? (
                trendingTags.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(item.tag)}
                    className="w-full bg-white p-4 rounded-xl shadow-sm text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Hash className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">#{item.tag}</p>
                        <p className="text-sm text-slate-500">
                          {item.count} {item.count === 1 ? t('search.post') : t('search.posts')}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 ${
                        item.change === 'up' ? 'text-green-600'
                        : item.change === 'down' ? 'text-red-500'
                        : 'text-blue-600'
                      }`}>
                        {item.change === 'up' && `↑ ${t('search.rising')}`}
                        {item.change === 'down' && `↓ ${t('search.falling')}`}
                        {item.change === 'new' && `✦ ${t('search.new')}`}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  {t('search.noTrending')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

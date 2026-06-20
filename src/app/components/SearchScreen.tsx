import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Hash } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';

export const SearchScreen = ({ onBack, onNavigateToProfile }) => {
  const { posts } = useApp();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState('all');

  // Extrair trending tags dos posts
  const getTrendingTags = () => {
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  };

  const trendingTags = getTrendingTags();

  // Filtrar posts baseado na busca
  const searchResults = searchQuery.trim() 
    ? posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
                placeholder="Search people, posts, topics..."
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
        {searchQuery.trim() ? (
          // Returns da busca
          <div className="p-4">
            {searchResults.length > 0 ? (
              <>
                <h2 className="font-bold text-lg mb-3 text-slate-900">
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                </h2>
                <div className="space-y-2">
                  {searchResults.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {post.authorName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{post.authorName}</p>
                          <p className="text-xs text-slate-500">{post.authorUsername}</p>
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
                <p className="text-slate-500 text-center font-semibold">Nenhum resultado encontrado</p>
                <p className="text-slate-400 text-sm text-center mt-1">
                  Tente buscar por outro termo
                </p>
              </div>
            )}
          </div>
        ) : (
          // Trending topics
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Assuntos do momento
            </h2>
            <div className="space-y-2">
              {trendingTags.length > 0 ? (
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
                          {item.count} {item.count === 1 ? 'post' : 'posts'}
                        </p>
                      </div>
                      <div className="text-slate-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhum tópico em alta no momento
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
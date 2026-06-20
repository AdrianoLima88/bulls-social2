import React, { useState, useEffect } from 'react';
import { Search, Bell, TrendingUp, ChevronRight, Heart, MessageCircle, Share2, Bookmark, MoreVertical, X, Copy, Link as LinkIcon, Send, Trash2, BarChart3, Building2, Newspaper, GraduationCap, Sparkles, Globe, Languages, UserPlus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';
import { ShareModal } from './ShareModal';
import { MediaViewModal } from './MediaViewModal';
import { ChartPreview } from './ChartPreview';
import { DocumentPreview } from './DocumentPreview';
import { MediaCarousel } from './MediaCarousel';
import { PostTypeBadge } from './UserTypeBadge';
import { getPostsByLocale, getNewsByLanguage, getIndexByRegion } from '../data/regionalData';
import { translateText, LANGUAGE_NAMES } from '../utils/translator';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useFollowingFeed } from '../../hooks/useFollowingFeed';
import { SuggestedProfiles } from './SuggestedProfiles';

export const FeedScreen = ({
  onNavigateToSearch,
  onNavigateToNotifications,
  onNavigateToMarket,
  onNavigateToProfile,
  onNavigateToPost,
  feedFilter = 'all',
  setFeedFilter,
  onNavigateToLive
}) => {
  // Supabase hooks
  const { posts: supabasePosts, loading: postsLoading, toggleLike, deletePost: deleteSupabasePost, hasLiked } = usePosts();
  const { posts: followingPosts, loading: followingLoading } = useFollowingFeed();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();

  // Estado para alternar entre "For You" e "Following"
  const [feedMode, setFeedMode] = useState<'foryou' | 'following'>('foryou');

  // Context (mantido para compatibilidade com outras funcionalidades)
  const { currentUser } = useApp();

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [showMediaViewModal, setShowMediaViewModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const { locale, t } = useLocale();
  const [showRegionalFilter, setShowRegionalFilter] = useState(false);
  const [regionalPosts, setRegionalPosts] = useState([]);
  const [regionalNews, setRegionalNews] = useState([]);

  // Determinar qual fonte de posts usar baseado no feedMode
  const sourcePosts = feedMode === 'following' ? followingPosts : supabasePosts;
  const isLoading = feedMode === 'following' ? followingLoading : postsLoading;

  // Converter posts do Supabase para o formato esperado pelo componente
  const posts = sourcePosts.map(post => {
    const mapped = {
      id: post.id,
      authorId: post.author_id,
      authorName: post.profiles?.name || 'Usuário',
      authorUsername: post.profiles?.username || '@user',
      authorRole: post.profiles?.user_type || 'investor',
      authorAvatar: post.profiles?.avatar_url || null,
      verified: post.profiles?.verified || false,
      type: post.type,
      content: post.content,
      media: post.media,
      charts: post.charts,
      documents: post.documents,
      ticker: post.tags?.[0] || null,
      tags: post.tags || [],
      likes: post.likes_count ?? 0,
      comments: post.comments_count ?? 0,
      shares: post.shares_count ?? 0,
      views: post.views_count ?? 0,
      time: new Date(post.created_at).toLocaleString('en-IE'),
      timestamp: new Date(post.created_at).getTime(),
      likedBy: [], // Será verificado separadamente
      savedBy: [], // Será verificado separadamente
      isPinned: post.is_pinned,
      isPremiumContent: post.is_premium,
    };

    // Debug: log dos contadores
    console.log(`📊 Post ${post.id} - DB: likes=${post.likes_count}, comments=${post.comments_count} → Mapped: likes=${mapped.likes}, comments=${mapped.comments}`);

    return mapped;
  });
  
  // Carregar posts e notícias regionalizadas
  useEffect(() => {
    const loadedPosts = getPostsByLocale(locale.region, locale.language);
    const loadedNews = getNewsByLanguage(locale.language);
    const marketIndex = getIndexByRegion(locale.region);
    
    setRegionalPosts(loadedPosts);
    setRegionalNews(loadedNews);
    
    console.log('🌍 Região:', locale.region);
    console.log('🗣️ Language:', locale.language);
    console.log('📰 Posts regionalizados:', loadedPosts.length);
    console.log('📊 Índice do mercado:', marketIndex);
  }, [locale.region, locale.language]);

  // Filtrar posts baseado no filtro selecionado
  const filteredPosts = feedFilter === 'all' 
    ? posts 
    : posts.filter(post => post.type === feedFilter);

  // Debug: Verificar quantos posts existem
  console.log('📊 Total de posts:', posts.length);
  console.log('📊 Posts filtrados:', filteredPosts.length);
  console.log('📊 Filtro atual:', feedFilter);

  const handleShare = (post) => {
    setSelectedPostForShare(post);
    setShowShareModal(true);
  };

  const handleMediaView = (media, post) => {
    setSelectedMedia({ media, post });
    setShowMediaViewModal(true);
  };

  // Categorias no estilo Stories
  const categories = [
    { id: 'all', label: t('feed.all'), icon: Sparkles, gradient: 'from-green-400 to-emerald-600' },
    { id: 'analysis', label: t('feed.analyses'), icon: BarChart3, gradient: 'from-blue-400 to-blue-600' },
    { id: 'company', label: t('feed.companies'), icon: Building2, gradient: 'from-purple-400 to-purple-600' },
    { id: 'news', label: t('feed.news'), icon: Newspaper, gradient: 'from-red-400 to-red-600' },
    { id: 'education', label: t('feed.education'), icon: GraduationCap, gradient: 'from-yellow-400 to-orange-600' },
  ];
  
  console.log('📊 Posts por tipo:', posts.map(p => ({ id: p.id, type: p.type, content: p.content.substring(0, 30) })));

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header Fixo */}
      <header className="bg-green-600 px-4 py-3 flex items-center justify-between z-50 flex-shrink-0 shadow-md">
        <h1 className="text-white font-bold text-2xl">Bulls</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToSearch}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={onNavigateToNotifications}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition relative"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Abas: For You / Following */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setFeedMode('foryou')}
            className={`flex-1 py-3 font-semibold text-sm transition relative ${
              feedMode === 'foryou'
                ? 'text-green-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For You
            {feedMode === 'foryou' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setFeedMode('following')}
            className={`flex-1 py-3 font-semibold text-sm transition relative ${
              feedMode === 'following'
                ? 'text-green-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Following
            {feedMode === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Categorias Estilo Stories */}
      <div className="bg-white shadow-sm flex-shrink-0 border-b border-slate-100">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 py-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = feedFilter === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setFeedFilter(category.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  {/* Círculo com Gradiente - Estilo Instagram Stories */}
                  <div className={`relative ${isActive ? 'p-0.5' : ''} rounded-full bg-gradient-to-br ${category.gradient}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
                      isActive 
                        ? 'bg-white' 
                        : 'bg-slate-50'
                    }`}>
                      <Icon className={`w-7 h-7 transition ${
                        isActive 
                          ? 'text-green-600' 
                          : 'text-slate-600'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-semibold transition ${
                    isActive 
                      ? 'text-green-600' 
                      : 'text-slate-600'
                  }`}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Atalho para Market */}
      <div className="px-4 pt-4 flex-shrink-0">
        <button 
          onClick={onNavigateToMarket}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">{t('market.liveQuotes')}</h3>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/80">IBOV</span>
              <span className="font-bold text-white">+1.24%</span>
            </div>
            <div className="h-4 w-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/80">USD</span>
              <span className="font-bold text-red-200">-0.45%</span>
            </div>
            <div className="h-4 w-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/80">BTC</span>
              <span className="font-bold text-white">+2.18%</span>
            </div>
          </div>
        </button>
      </div>

      {/* Feed de Posts */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
        {/* Sugestões de pessoas para seguir - mostrar apenas no "For You" */}
        {feedMode === 'foryou' && !isLoading && (
          <SuggestedProfiles onNavigateToProfile={onNavigateToProfile} />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando posts...</p>
            </div>
          </div>
        ) : feedMode === 'following' && filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum post ainda</h3>
            <p className="text-slate-600 text-center mb-4">
              Você ainda não segue ninguém. Comece a seguir pessoas para ver os posts delas aqui!
            </p>
            <button
              onClick={() => setFeedMode('foryou')}
              className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition"
            >
              Explorar Posts
            </button>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onNavigateToProfile={onNavigateToProfile}
              onNavigateToPost={onNavigateToPost}
              onLike={() => toggleLike(post.id)}
              onSave={() => {}} // TODO: Implementar save
              onShare={handleShare}
              onDelete={() => deleteSupabasePost(post.id)}
              isLiked={hasLiked(post.id)}
              isSaved={false} // TODO: Implementar verificação de save
              isOwnPost={post.authorId === user?.id}
              onMediaView={handleMediaView}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-center">
              Nenhum post encontrado nesta categoria
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedPostForShare && (
        <ShareModal
          post={selectedPostForShare}
          onClose={() => {
            setShowShareModal(false);
            setSelectedPostForShare(null);
          }}
        />
      )}

      {/* Media View Modal */}
      {showMediaViewModal && selectedMedia && (
        <MediaViewModal 
          onClose={() => {
            setShowMediaViewModal(false);
            setSelectedMedia(null);
          }}
          media={selectedMedia.media}
          post={selectedMedia.post}
          onLike={() => toggleLikePost(selectedMedia.post.id)}
          onComment={() => onNavigateToPost(selectedMedia.post)}
          onShare={() => handleShare(selectedMedia.post)}
          isLiked={selectedMedia.post.likedBy.includes(currentUser.id)}
        />
      )}
    </div>
  );
};

const PostCard = ({ post, onNavigateToProfile, onNavigateToPost, onLike, onSave, onShare, onDelete, isLiked, isSaved, isOwnPost, onMediaView }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleProfileClick = () => {
    // Criar dados de perfil baseados no autor do post
    const profileData = {
      id: post.authorId,
      name: post.authorName,
      username: post.authorUsername,
      role: post.authorRole,
      type: 'other'
    };
    onNavigateToProfile(profileData);
  };
  
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      onDelete(post.id);
      setShowMenu(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition ${
      post.isSponsored ? 'border-2 border-yellow-200' : ''
    }`}>
      {/* Sponsored Badge */}
      {post.isSponsored && (
        <div className="mb-3 flex items-center justify-between bg-yellow-50 -mx-4 -mt-4 px-4 py-2 rounded-t-xl border-b border-yellow-100">
          <span className="text-xs font-bold text-yellow-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Patrocinado
          </span>
          <span className="text-xs text-yellow-600">{post.sponsorName}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button 
          onClick={handleProfileClick}
          className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold"
        >
          {post.authorName[0]}
        </button>
        <button
          onClick={handleProfileClick}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-slate-900 truncate">{post.authorName}</h4>
            {post.verified && <span className="text-blue-500 text-sm flex-shrink-0">✓</span>}
            {/* Badge do tipo de post */}
            {!post.isSponsored && <PostTypeBadge postType={post.type} size="sm" />}
          </div>
          <p className="text-xs text-slate-500 truncate">{post.authorUsername} • {post.time}</p>
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {/* Menu Dropdown */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-200 py-2 w-48 z-50">
                <button
                  onClick={() => {
                    onSave();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition text-left"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-600' : ''} text-slate-600`} />
                  <span className="text-sm text-slate-900">
                    {isSaved ? 'Remove dos salvos' : 'Save post'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href + '/post/' + post.id);
                    alert('Link copiado!');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition text-left"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-900">Copiar link</span>
                </button>
                <button
                  onClick={() => {
                    alert('Post reportado aos moderadores');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition text-left"
                >
                  <span className="text-sm text-red-600 font-semibold">Reportar post</span>
                </button>
                {isOwnPost && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition text-left"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-semibold">Delete post</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <button 
        onClick={() => onNavigateToPost(post)}
        className="w-full text-left"
      >
        <p className="text-slate-800 mb-3">{post.content}</p>
      </button>

      {/* Media — Carousel */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3">
          <MediaCarousel
            media={post.media}
            onMediaView={(item) => onMediaView(item, post)}
          />
        </div>
      )}

      {/* Charts */}
      {post.charts && post.charts.length > 0 && (
        <div className="mb-3">
          {post.charts.map((chart, index) => (
            <ChartPreview key={`${post.id}-chart-${index}`} chart={chart} uniqueId={`${post.id}-chart-${index}`} />
          ))}
        </div>
      )}

      {/* Documentos */}
      {post.documents && post.documents.length > 0 && (
        <div className="mb-3">
          {post.documents.map((doc, index) => (
            <DocumentPreview key={index} document={doc} />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
          <span className="text-sm font-semibold">{isLiked ? (post.likes || 0) + 1 : (post.likes || 0)}</span>
        </button>
        <button
          onClick={() => onNavigateToPost(post)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{post.comments || 0}</span>
        </button>
        <button
          onClick={() => onShare(post)}
          className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{post.shares || 0}</span>
        </button>
        <button 
          onClick={onSave}
          className={`flex items-center gap-2 transition ml-auto ${
            isSaved ? 'text-green-600' : 'text-slate-500 hover:text-green-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-green-600' : ''}`} />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Settings, Edit3, MapPin, Link as LinkIcon, Calendar, Heart, MessageCircle, Share2, BarChart3, Play, Mail, MoreVertical, Image as ImageIcon, Trash2, UserX, Flag, Eye, EyeOff, Copy, Send, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ShareModal } from './ShareModal';
import { MediaViewModal } from './MediaViewModal';
import { ChartPreview } from './ChartPreview';
import { MediaCarousel } from './MediaCarousel';
import { DocumentPreview } from './DocumentPreview';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUserPosts } from '../../hooks/useUserPosts';
import { usePosts } from '../../hooks/usePosts';
import { useFollows } from '../../hooks/useFollows';
import { useProfile } from '../../hooks/useProfile';
import { PlanBadge } from './PlanBadge';

export const ProfileScreen = ({ profileData, userProfileData, onBack, onSettings, onEditProfile, onNavigateToCreatePost, onNavigateToComments, onSendMessage, onNavigateToFollowers, onNavigateToFollowing }) => {
  const { currentUser, toggleLikePost, deletePost } = useApp();
  const { user: authUser, profile: authProfile } = useAuth();
  const { hasLiked, toggleLike, deletePost: deleteSupabasePost, likesMap } = usePosts();
  const { isFollowing: checkIsFollowing, toggleFollow } = useFollows();
  const { t } = useLocale();
  const isOwnProfile = !profileData || profileData.type === 'own';

  // Search dados completos do perfil se não for o próprio perfil
  const { profile: fullProfileData, loading: profileLoading } = useProfile(
    !isOwnProfile ? profileData?.id : null
  );

  const [activeTab, setActiveTab] = useState('posts');
  const [likedPosts, setLikedPosts] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [showShareProfileModal, setShowShareProfileModal] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [showMediaViewModal, setShowMediaViewModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Pegar posts do usuário (próprio ou de outro)
  const userId = isOwnProfile ? (authUser?.id || currentUser.id) : profileData?.id;
  const { posts: userPosts, loading: postsLoading } = useUserPosts(userId);

  // Filtrar posts por tipo
  const allPosts = userPosts;
  const analysesPosts = userPosts.filter(post => post.type === 'analysis');
  const mediaPosts = userPosts.filter(post => post.media && post.media.length > 0);

  // Dados do perfil sendo visualizado
  // Se for o próprio perfil (isOwnProfile) e temos userProfileData, usar esses dados
  // Caso contrário, usar dados de outro usuário (fullProfileData do Supabase)
  const profile = isOwnProfile
    ? {
        ...currentUser,
        name: userProfileData?.name || authProfile?.name || currentUser.name,
        username: userProfileData?.username || authProfile?.username || currentUser.username,
        bio: userProfileData?.bio || authProfile?.bio || currentUser.bio,
        location: userProfileData?.location || authProfile?.location || currentUser.location,
        website: userProfileData?.website || authProfile?.website || currentUser.website,
        email: userProfileData?.email || authProfile?.email || currentUser.email,
        jobTitle: userProfileData?.jobTitle || authProfile?.job_title,
        company: userProfileData?.company || authProfile?.company,
        education: userProfileData?.education || authProfile?.education,
        selectedBanner: userProfileData?.selectedBanner || authProfile?.banner_url,
        selectedProfilePic: userProfileData?.selectedProfilePic || authProfile?.avatar_url,
        certifications: userProfileData?.certifications || authProfile?.certifications,
        joinDate: currentUser.joinDate,
        following: authProfile?.following_count || 0,
        followers: authProfile?.followers_count || 0,
        verified: authProfile?.verified || currentUser.verified,
        plan: authProfile?.plan || 'free',
      }
    : {
        name: fullProfileData?.name || profileData?.name || 'Usuário',
        username: fullProfileData?.username || profileData?.username || 'usuario',
        bio: fullProfileData?.bio || profileData?.bio || profileData?.role || 'Investor',
        location: fullProfileData?.location || profileData?.location || 'São Paulo, SP',
        website: fullProfileData?.website || profileData?.website || 'exemplo.com',
        joinDate: fullProfileData?.created_at ? new Date(fullProfileData.created_at).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' }) : 'Jan 2024',
        following: fullProfileData?.following_count || 0,
        followers: fullProfileData?.followers_count || 0,
        verified: fullProfileData?.verified || false,
        avatar_url: fullProfileData?.avatar_url,
        banner_url: fullProfileData?.banner_url,
        plan: fullProfileData?.plan || 'free',
      };

  const handleLike = async (postId) => {
    await toggleLike(postId);
  };

  const handleShare = (post) => {
    setSelectedPostForShare(post);
    setShowShareModal(true);
  };

  const handleDeletePost = async (postId) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      await deleteSupabasePost(postId);
      setShowPostMenu(null);
    }
  };

  // Renderizar post individual
  const renderPost = (post) => (
    <div key={post.id} className="border-b border-slate-200 bg-white hover:bg-slate-50 transition">
      <div className="p-4">
        {/* Header do Post */}
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {post.authorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-bold text-slate-900 truncate">{post.authorName}</span>
                  {post.verified && <span className="text-blue-500 flex-shrink-0">✓</span>}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-slate-500 truncate">{post.authorUsername}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 flex-shrink-0">{post.time}</span>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Menu Dropdown */}
                {showPostMenu === post.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowPostMenu(null)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      {isOwnProfile && (
                        <>
                          <button
                            onClick={() => {
                              handleDeletePost(post.id);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition text-left text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="font-semibold">Delete post</span>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                        </>
                      )}
                      {!isOwnProfile && (
                        <>
                          <button
                            onClick={() => {
                              alert('User blocked');
                              setShowPostMenu(null);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition text-left"
                          >
                            <UserX className="w-4 h-4" />
                            <span className="font-semibold">Bloquear {post.authorUsername}</span>
                          </button>
                          <button
                            onClick={() => {
                              alert('Post denunciado');
                              setShowPostMenu(null);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition text-left text-red-600"
                          >
                            <Flag className="w-4 h-4" />
                            <span className="font-semibold">Denunciar post</span>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://bulls.com/${post.authorUsername}/status/${post.id}`);
                          alert('Link copiado!');
                          setShowPostMenu(null);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition text-left"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="font-semibold">Copiar link do post</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-slate-900 mb-3 leading-relaxed">{post.content}</p>

            {/* Media — Carousel */}
            {post.media && post.media.length > 0 && (
              <div className="mb-3">
                <MediaCarousel
                  media={post.media}
                  onMediaView={(item) => {
                    setSelectedMedia({ media: item, post });
                    setShowMediaViewModal(true);
                  }}
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
              <div className="mb-3 space-y-2">
                {post.documents.map((doc, index) => (
                  <DocumentPreview key={`${post.id}-doc-${index}`} document={doc} />
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Statistics */}
            {post.views && (
              <div className="text-slate-500 text-sm mb-2">
                {post.views.toLocaleString('en-IE')} views
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between max-w-md">
              <button
                onClick={() => onNavigateToComments && onNavigateToComments(post)}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">{post.comments || 0}</span>
              </button>

              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 transition group ${
                  hasLiked(post.id) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                }`}
              >
                <div className={`p-2 rounded-full transition ${
                  hasLiked(post.id) ? 'bg-red-50' : 'group-hover:bg-red-50'
                }`}>
                  <Heart className={`w-4 h-4 ${hasLiked(post.id) ? 'fill-red-500' : ''}`} />
                </div>
                <span className="text-sm">{hasLiked(post.id) ? (post.likes || 0) + 1 : (post.likes || 0)}</span>
              </button>

              <button
                onClick={() => handleShare(post)}
                className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition group"
              >
                <div className="p-2 rounded-full group-hover:bg-green-50 transition">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-sm">{post.shares}</span>
              </button>

              <button className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition group">
                <div className="p-2 rounded-full group-hover:bg-green-50 transition">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar grid de mídia (estilo X/Twitter)
  const renderMediaGrid = () => {
    if (mediaPosts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-center">
            Nenhuma mídia publicada ainda
          </p>
        </div>
      );
    }

    // Extrair todas as mídias dos posts
    const allMedia = mediaPosts.flatMap(post => 
      post.media.map(mediaItem => ({ media: mediaItem, post }))
    );

    // Renderizar grid compacto de mídia (estilo Instagram)
    return (
      <div className="grid grid-cols-3 gap-0.5 pb-20">
        {allMedia.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedMedia(item);
              setShowMediaViewModal(true);
            }}
            className="relative w-full bg-slate-900 overflow-hidden group"
            style={{ aspectRatio: '1/1' }}
          >
            {item.media.type === 'video' ? (
              <>
                <video
                  src={item.media.url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                {item.media.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {item.media.duration}
                  </span>
                )}
              </>
            ) : (
              <img
                src={item.media.url}
                alt="Media"
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay ao hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>
    );
  };

  // Proteção contra crash
  if (!profile) {
    return (
      <div className="h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">Erro ao carregar perfil</p>
          <button onClick={onBack} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">
            Back
          </button>
        </div>
      </div>
    );
  }

  // Loading enquanto busca dados do perfil
  if (!isOwnProfile && profileLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                }
              }}
              className="text-slate-900 hover:bg-slate-100 rounded-full p-2 transition flex items-center justify-center z-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-500">{allPosts.length} posts</p>
            </div>
          </div>
          {isOwnProfile && (
            <button onClick={onSettings} className="text-slate-900 hover:bg-slate-100 rounded-full p-2 transition">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Banner */}
        <div 
          className={`h-40 ${
            !profile.selectedBanner || (typeof profile.selectedBanner === 'string' && !profile.selectedBanner.startsWith('data:')) 
              ? profile.selectedBanner 
                ? (() => {
                    const gradients = {
                      green: 'bg-gradient-to-br from-green-500 to-emerald-600',
                      blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
                      purple: 'bg-gradient-to-br from-purple-500 to-purple-700',
                      orange: 'bg-gradient-to-br from-orange-500 to-orange-700',
                      pink: 'bg-gradient-to-br from-pink-500 to-pink-700',
                      slate: 'bg-gradient-to-br from-slate-600 to-slate-800'
                    };
                    return gradients[profile.selectedBanner] || 'bg-gradient-to-r from-green-500 to-emerald-600';
                  })()
                : 'bg-gradient-to-r from-green-500 to-emerald-600'
              : ''
          }`}
          style={profile.selectedBanner && typeof profile.selectedBanner === 'string' && 
            (profile.selectedBanner.startsWith('data:') || profile.selectedBanner.startsWith('http')) ? {
            backgroundImage: `url(${profile.selectedBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        ></div>

        {/* Profile Info */}
        <div className="px-4">
          <div className="flex items-start justify-between -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
              {(profile.selectedProfilePic && typeof profile.selectedProfilePic === 'string' && 
                (profile.selectedProfilePic.startsWith('http') || profile.selectedProfilePic.startsWith('data:'))) ? (
                <img
                  src={profile.selectedProfilePic}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'U'}
                </div>
              )}
            </div>
            <div className="mt-20 flex gap-2 flex-wrap">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onEditProfile}
                    className="border-2 border-slate-300 text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-100 transition flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => setShowShareProfileModal(true)}
                    className="border-2 border-slate-300 text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-slate-100 transition flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      const profileUserId = profileData?.id;
                      if (profileUserId) {
                        toggleFollow(profileUserId);
                      }
                    }}
                    className={`px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                      checkIsFollowing(profileData?.id)
                        ? 'border-2 border-slate-300 text-slate-900 hover:border-red-300 hover:text-red-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {checkIsFollowing(profileData?.id) ? (
                      <>
                        <span>✓</span>
                        {t('common.following')}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {t('common.follow')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={onSendMessage}
                    className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t('common.message')}
                  </button>
                  <button
                    onClick={() => setShowShareProfileModal(true)}
                    className="border-2 border-slate-300 text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-slate-100 transition flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Nome e Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              {profile.verified && <span className="text-blue-500 text-lg">✓</span>}
              <PlanBadge plan={profile.plan} size="md" />
            </div>
            <p className="text-slate-500 mb-3">{profile.username}</p>
            <p className="text-slate-900 mb-3">
              {profile.bio}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mb-3">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <a href="#" className="text-green-600 hover:underline">{profile.website}</a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Entrou em {profile.joinDate}
              </div>
            </div>

            {/* Followers */}
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => onNavigateToFollowing?.(userId)}
                className="hover:underline cursor-pointer"
              >
                <span className="font-bold text-slate-900">{profile.following?.toLocaleString('en-IE') || 0}</span>{' '}
                <span className="text-slate-500">Following</span>
              </button>
              <button
                onClick={() => onNavigateToFollowers?.(userId)}
                className="hover:underline cursor-pointer"
              >
                <span className="font-bold text-slate-900">{profile.followers?.toLocaleString('en-IE') || 0}</span>{' '}
                <span className="text-slate-500">Followers</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 font-semibold text-sm relative ${
                activeTab === 'posts'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Posts
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analyses')}
              className={`flex-1 py-4 font-semibold text-sm relative ${
                activeTab === 'analyses'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Analyses
              {activeTab === 'analyses' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-4 font-semibold text-sm relative ${
                activeTab === 'media'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Mídia
              {activeTab === 'media' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content das Tabs */}
        {activeTab === 'posts' && (
          <div className="pb-20">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando posts...</p>
                </div>
              </div>
            ) : allPosts.length > 0 ? (
              allPosts.map(post => renderPost(post))
            ) : (
              <div className="p-8 text-center text-slate-500">
                Nenhum post publicado ainda
              </div>
            )}
          </div>
        )}

        {activeTab === 'analyses' && (
          <div className="pb-20">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando análises...</p>
                </div>
              </div>
            ) : analysesPosts.length > 0 ? (
              analysesPosts.map(post => renderPost(post))
            ) : (
              <div className="p-8 text-center text-slate-500">
                Nenhuma análise publicada ainda
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && renderMediaGrid()}
      </div>

      {/* Botão Flutuante de New Post */}
      {isOwnProfile && (
        <button
          onClick={onNavigateToCreatePost}
          className="fixed bottom-20 right-6 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition z-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}

      {/* Modal de Compartilhamento de Post */}
      {showShareModal && (
        <ShareModal
          post={selectedPostForShare}
          userName={profile.name}
          userHandle={profile.username}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Modal de Compartilhamento de Profile */}
      {showShareProfileModal && (
        <ShareModal
          userName={profile.name}
          userHandle={profile.username}
          onClose={() => setShowShareProfileModal(false)}
        />
      )}

      {/* Modal de Visualização de Mídia */}
      {showMediaViewModal && selectedMedia && (
        <MediaViewModal
          media={selectedMedia.media}
          post={selectedMedia.post}
          onClose={() => {
            setShowMediaViewModal(false);
            setSelectedMedia(null);
          }}
          onLike={() => handleLike(selectedMedia.post.id)}
          onComment={() => onNavigateToComments && onNavigateToComments(selectedMedia.post)}
          onShare={() => handleShare(selectedMedia.post)}
          isLiked={hasLiked(selectedMedia.post.id)}
        />
      )}
    </div>
  );
};
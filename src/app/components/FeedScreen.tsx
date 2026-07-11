import React, { useState } from 'react';
import { Search, Bell, Compass, Heart, MessageCircle, Share2, Bookmark, MoreVertical, Copy, Trash2, BarChart3, Building2, Newspaper, GraduationCap, Sparkles, Flag, Users, Lock, UserPlus, Crown } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { ShareModal } from './ShareModal';
import { MediaViewModal } from './MediaViewModal';
import { ChartPreview } from './ChartPreview';
import { DocumentPreview } from './DocumentPreview';
import { MediaCarousel } from './MediaCarousel';
import { PostTypeBadge } from './UserTypeBadge';
import { PlanBadge } from './PlanBadge';
import { PaywallModal } from './PaywallModal';
import { ReportModal } from './ReportModal';
import { usePosts } from '../../hooks/usePosts';
import { useFollowingFeed } from '../../hooks/useFollowingFeed';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSavedPosts } from '../../hooks/useSavedPosts';
import { useSubscription } from '../../hooks/useSubscription';
import { StockTicker } from './StockTicker';
import { SuggestedProfiles } from './SuggestedProfiles';
import { InviteModal } from './InviteModal';

export const FeedScreen = ({
  onNavigateToSearch,
  onNavigateToNotifications,
  onNavigateToMarket,
  onNavigateToProfile,
  onNavigateToPost,
  onNavigateToExplore,
  feedFilter = 'all',
  setFeedFilter,
  onNavigateToLive,
  onNavigateToPremium
}) => {
  const { posts: supabasePosts, loading: postsLoading, toggleLike, deletePost: deleteSupabasePost, hasLiked } = usePosts();
  const { posts: followingSupabasePosts, loading: followingLoading } = useFollowingFeed();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { isSaved, toggleSave } = useSavedPosts();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [showMediaViewModal, setShowMediaViewModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const { t } = useLocale();

  const mapPost = (post) => ({
    id: post.id,
    authorId: post.author_id,
    authorName: post.profiles?.name || 'User',
    authorUsername: post.profiles?.username || '@user',
    authorRole: post.profiles?.user_type || 'investor',
    authorAvatar: post.profiles?.avatar_url || null,
    verified: post.profiles?.verified || false,
    authorPlan: post.profiles?.plan || 'free',
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
    likedBy: [],
    savedBy: [],
    isPinned: post.is_pinned,
    isPremiumContent: post.is_premium,
    isFeatured: post.is_featured,
  });

  const posts = supabasePosts.map(mapPost);
  const followingPosts = followingSupabasePosts.map(mapPost);

  const isFollowingTab = feedFilter === 'following';
  const activeLoading = isFollowingTab ? followingLoading : postsLoading;

  const filteredPosts = isFollowingTab
    ? followingPosts
    : feedFilter === 'all'
      ? posts
      : posts.filter(post => post.type === feedFilter);

  const handleShare = (post) => { setSelectedPostForShare(post); setShowShareModal(true); };
  const handleMediaView = (media, post) => { setSelectedMedia({ media, post }); setShowMediaViewModal(true); };

  const categories = [
    { id: 'all',       label: t('feed.all'),               icon: Sparkles,      gradient: 'from-green-400 to-emerald-600' },
    { id: 'following', label: t('feed.filter.following'),  icon: Users,         gradient: 'from-teal-400 to-cyan-600' },
    { id: 'analysis',  label: t('feed.analyses'),  icon: BarChart3,     gradient: 'from-blue-400 to-blue-600' },
    { id: 'company',   label: t('feed.companies'), icon: Building2,     gradient: 'from-purple-400 to-purple-600' },
    { id: 'news',      label: t('feed.news'),      icon: Newspaper,     gradient: 'from-red-400 to-red-600' },
    { id: 'education', label: t('feed.education'), icon: GraduationCap, gradient: 'from-yellow-400 to-orange-600' },
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-green-600 px-4 py-3 flex items-center justify-between z-50 flex-shrink-0 shadow-md">
        <h1 className="text-white font-bold text-lg">Bulls</h1>
        <div className="flex items-center gap-2">
          <button onClick={onNavigateToExplore} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <Compass className="w-5 h-5 text-white" />
          </button>
          <button onClick={onNavigateToSearch} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <Search className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => setShowInviteModal(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <UserPlus className="w-5 h-5 text-white" />
          </button>
          <button onClick={onNavigateToNotifications} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition relative">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <StockTicker />

      <div className="bg-white shadow-sm flex-shrink-0 border-b border-slate-100">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 py-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = feedFilter === category.id;
              return (
                <button key={category.id} onClick={() => setFeedFilter(category.id)} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={`relative ${isActive ? 'p-0.5' : ''} rounded-full bg-gradient-to-br ${category.gradient}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isActive ? 'bg-white' : 'bg-slate-50'}`}>
                      <Icon className={`w-7 h-7 transition ${isActive ? 'text-green-600' : 'text-slate-600'}`} />
                    </div>
                  </div>
                  <span className={`text-xs font-semibold transition ${isActive ? 'text-green-600' : 'text-slate-600'}`}>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">

        {/* Who to follow — only shows invited users who have joined */}
        {!isFollowingTab && <SuggestedProfiles onNavigateToProfile={onNavigateToProfile} />}

        {activeLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              {isFollowingTab ? <Users className="w-10 h-10 text-slate-400" /> : <Search className="w-10 h-10 text-slate-400" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{isFollowingTab ? 'No posts here yet' : 'No posts yet'}</h3>
            <p className="text-slate-600 text-center mb-4">
              {isFollowingTab ? 'Follow other investors to see their posts here.' : 'No posts found in this category.'}
            </p>
            <button onClick={onNavigateToExplore} className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition flex items-center gap-2">
              <Compass className="w-4 h-4" />
              {isFollowingTab ? 'Explore profiles' : 'Explore trending content'}
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onNavigateToProfile={onNavigateToProfile}
              onNavigateToPost={onNavigateToPost}
              onLike={() => toggleLike(post.id)}
              onSave={() => toggleSave(post.id)}
              onShare={handleShare}
              onDelete={() => deleteSupabasePost(post.id)}
              isLiked={hasLiked(post.id)}
              isSaved={isSaved(post.id)}
              isOwnPost={post.authorId === user?.id}
              onMediaView={handleMediaView}
              onNavigateToPremium={onNavigateToPremium}
            />
          ))
        )}
      </div>

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onNavigateToProfile={onNavigateToProfile}
        />
      )}

      {showShareModal && selectedPostForShare && (
        <ShareModal post={selectedPostForShare} onClose={() => { setShowShareModal(false); setSelectedPostForShare(null); }} />
      )}

      {showMediaViewModal && selectedMedia && (
        <MediaViewModal
          onClose={() => { setShowMediaViewModal(false); setSelectedMedia(null); }}
          media={selectedMedia.media}
          post={selectedMedia.post}
          onLike={() => toggleLike(selectedMedia.post.id)}
          onComment={() => onNavigateToPost(selectedMedia.post)}
          onShare={() => handleShare(selectedMedia.post)}
          isLiked={false}
        />
      )}
    </div>
  );
};

const PostCard = ({ post, onNavigateToProfile, onNavigateToPost, onLike, onSave, onShare, onDelete, isLiked, isSaved, isOwnPost, onMediaView, onNavigateToPremium }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { isPremium } = useSubscription();

  const isLocked = post.isPremiumContent && !isPremium && !isOwnPost;

  const handleProfileClick = () => {
    onNavigateToProfile({ id: post.authorId, name: post.authorName, username: post.authorUsername, role: post.authorRole, type: 'other' });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) { onDelete(post.id); setShowMenu(false); }
  };

  const handleCopyLink = () => {
    try { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); }
    catch { const el = document.createElement('input'); el.value = `${window.location.origin}/post/${post.id}`; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setShowMenu(false);
  };

  const extraTags = post.tags?.filter(tag => !post.content?.includes(`#${tag}`)) || [];

  return (
    <div className={`bg-white rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition ${
      post.isSponsored ? 'border-2 border-yellow-200' :
      post.isFeatured ? 'border-2 border-amber-300 ring-1 ring-amber-100' : ''
    }`}>
      {post.isFeatured && !post.isSponsored && (
        <div className="mb-3 flex items-center justify-between bg-amber-50 -mx-4 -mt-4 px-4 py-2 rounded-t-xl border-b border-amber-100">
          <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
            <Crown className="w-3 h-3" /> Featured Publication
          </span>
        </div>
      )}
      {post.isSponsored && (
        <div className="mb-3 flex items-center justify-between bg-yellow-50 -mx-4 -mt-4 px-4 py-2 rounded-t-xl border-b border-yellow-100">
          <span className="text-xs font-bold text-yellow-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Sponsored</span>
          <span className="text-xs text-yellow-600">{post.sponsorName}</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <button onClick={handleProfileClick} className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
          {post.authorAvatar
            ? <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover rounded-full" />
            : post.authorName[0]
          }
        </button>
        <button onClick={handleProfileClick} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-slate-900 truncate">{post.authorName}</h4>
            {post.verified && <span className="text-blue-500 text-sm flex-shrink-0">✓</span>}
            <PlanBadge plan={post.authorPlan} size="sm" />
            {!post.isSponsored && <PostTypeBadge postType={post.type} size="sm" />}
          </div>
          <p className="text-xs text-slate-500 truncate">{post.authorUsername} • {post.time}</p>
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition">
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-200 py-2 w-48 z-50">
                <button onClick={() => { onSave(); setShowMenu(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition text-left">
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-green-600 text-green-600' : 'text-slate-600'}`} />
                  <span className="text-sm text-slate-900">{isSaved ? 'Unsave post' : 'Save post'}</span>
                </button>
                <button onClick={handleCopyLink} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition text-left">
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-900">Copy link</span>
                </button>
                <button onClick={() => { setShowMenu(false); setShowReport(true); }} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition text-left">
                  <Flag className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-semibold">Report post</span>
                </button>
                {isOwnPost && (
                  <button onClick={handleDelete} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition text-left">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-semibold">Delete post</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <div className={isLocked ? 'blur-md select-none pointer-events-none' : ''}>
          <button onClick={() => onNavigateToPost(post)} className="w-full text-left">
            <p className="text-slate-800 mb-3">{post.content}</p>
          </button>

          {post.media && post.media.length > 0 && (
            <div className="mb-3">
              <MediaCarousel media={post.media} onMediaView={(item) => onMediaView(item, post)} />
            </div>
          )}

          {post.charts && post.charts.length > 0 && (
            <div className="mb-3">
              {post.charts.map((chart, index) => (
                <ChartPreview key={`${post.id}-chart-${index}`} chart={chart} uniqueId={`${post.id}-chart-${index}`} />
              ))}
            </div>
          )}

          {post.documents && post.documents.length > 0 && (
            <div className="mb-3">
              {post.documents.map((doc, index) => <DocumentPreview key={index} document={doc} />)}
            </div>
          )}

          {extraTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {extraTags.map((tag, index) => (
                <span key={index} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setShowPaywall(true)}
              className="flex flex-col items-center gap-2 bg-white/95 rounded-2xl px-6 py-4 shadow-lg border border-slate-200 hover:bg-white transition"
            >
              <Lock className="w-6 h-6 text-yellow-600" />
              <span className="text-sm font-bold text-slate-900">Premium content</span>
              <span className="text-xs text-green-700 font-semibold underline">Upgrade to unlock</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
        <button onClick={onLike} className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
          <span className="text-sm font-semibold">{post.likes || 0}</span>
        </button>
        <button onClick={() => (isLocked ? setShowPaywall(true) : onNavigateToPost(post))} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{post.comments || 0}</span>
        </button>
        <button onClick={() => onShare(post)} className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{post.shares || 0}</span>
        </button>
        <button onClick={onSave} className={`flex items-center gap-2 transition ml-auto ${isSaved ? 'text-green-600' : 'text-slate-500 hover:text-green-600'}`}>
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-green-600' : ''}`} />
        </button>
      </div>

      {showReport && (
        <ReportModal targetType="post" targetId={post.id} targetName={`@${post.authorUsername}'s post`} onClose={() => setShowReport(false)} />
      )}

      {showPaywall && (
        <PaywallModal
          featureName="Este post"
          onUpgrade={() => { setShowPaywall(false); onNavigateToPremium && onNavigateToPremium(); }}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
};

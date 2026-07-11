import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LocaleProvider, useLocale } from './contexts/LocaleContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase/client';
import { usePortfolio } from '../hooks/usePortfolio';
import { useLives } from '../hooks/useLives';
import { Home, TrendingUp, Building2, User, Radio } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { identifyUser, logoutOneSignal } from '../utils/OneSignalInit';

// Critical screens — loaded immediately
import { LoginScreen } from './components/LoginScreen';
import { FeedScreen } from './components/FeedScreen';
import { MFAVerifyScreen } from './components/MFAVerifyScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { PlanSelectionScreen } from './components/PlanSelectionScreen';

// Lazy loaded screens
const ProfileScreen = lazy(() => import('./components/ProfileScreenNew').then(m => ({ default: m.ProfileScreen })));
const AddAssetToPortfolio = lazy(() => import('./components/AddAssetToPortfolio').then(m => ({ default: m.AddAssetToPortfolio })));
const AssetDetailScreen = lazy(() => import('./components/AssetDetailScreen').then(m => ({ default: m.AssetDetailScreen })));
const EditProfileScreen = lazy(() => import('./components/EditProfileScreen').then(m => ({ default: m.EditProfileScreen })));
const DirectMessageScreen = lazy(() => import('./components/DirectMessageScreen').then(m => ({ default: m.DirectMessageScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const MarketScreen = lazy(() => import('./components/MarketScreen').then(m => ({ default: m.MarketScreen })));
const CreatePostScreen = lazy(() => import('./components/CreatePostScreen').then(m => ({ default: m.CreatePostScreen })));
const CommentsScreen = lazy(() => import('./components/CommentsScreen').then(m => ({ default: m.CommentsScreen })));
const NotificationsScreen = lazy(() => import('./components/NotificationsScreen').then(m => ({ default: m.NotificationsScreen })));
const SearchScreen = lazy(() => import('./components/SearchScreen').then(m => ({ default: m.SearchScreen })));
const PortfolioScreen = lazy(() => import('./components/PortfolioScreen').then(m => ({ default: m.PortfolioScreen })));
const PremiumScreen = lazy(() => import('./components/PremiumScreen').then(m => ({ default: m.PremiumScreen })));
const BusinessDashboard = lazy(() => import('./components/BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const CommunityGuidelinesScreen = lazy(() => import('./components/CommunityGuidelinesScreen').then(m => ({ default: m.CommunityGuidelinesScreen })));
const CurrencyScreen = lazy(() => import('./components/CurrencyScreen').then(m => ({ default: m.CurrencyScreen })));
const LanguageRegionScreen = lazy(() => import('./components/LanguageRegionScreen').then(m => ({ default: m.LanguageRegionScreen })));
const CreatorDashboard = lazy(() => import('./components/CreatorDashboard').then(m => ({ default: m.CreatorDashboard })));
const VideoStudio = lazy(() => import('./components/VideoStudio').then(m => ({ default: m.VideoStudio })));
const LiveScreen = lazy(() => import('./components/LiveScreen').then(m => ({ default: m.LiveScreen })));
const WatchLiveScreen = lazy(() => import('./components/WatchLiveScreen').then(m => ({ default: m.WatchLiveScreen })));
const StartLiveScreen = lazy(() => import('./components/StartLiveScreen').then(m => ({ default: m.StartLiveScreen })));
const FollowersListScreen = lazy(() => import('./components/FollowersListScreen').then(m => ({ default: m.FollowersListScreen })));
const FollowingListScreen = lazy(() => import('./components/FollowingListScreen').then(m => ({ default: m.FollowingListScreen })));
const ExploreScreen = lazy(() => import('./components/ExploreScreen').then(m => ({ default: m.ExploreScreen })));
const SavedPostsScreen = lazy(() => import('./components/SavedPostsScreen').then(m => ({ default: m.SavedPostsScreen })));

// Preload most used screens after login
const preloadScreens = () => {
  setTimeout(() => {
    import('./components/ProfileScreenNew');
    import('./components/NotificationsScreen');
    import('./components/SearchScreen');
    import('./components/CommentsScreen');
    import('./components/SettingsScreen');
    import('./components/MarketScreen');
    import('./components/PortfolioScreen');
    import('./components/CreatePostScreen');
  }, 1000);
};

// Loading fallback
const ScreenLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
  </div>
);

// Bottom Navigation Component
const BottomNav = ({ currentScreen, onNavigate, activeLivesCount = 0 }) => {
  const { t } = useLocale();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex items-center justify-around py-2">
        <button onClick={() => onNavigate('feed')} className={`flex flex-col items-center gap-1 px-3 py-2 transition ${currentScreen === 'feed' ? 'text-green-600' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.feed')}</span>
        </button>
        <button onClick={() => onNavigate('market')} className={`flex flex-col items-center gap-1 px-3 py-2 transition ${currentScreen === 'market' ? 'text-green-600' : 'text-slate-500'}`}>
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.market')}</span>
        </button>
        <button onClick={() => onNavigate('live')} className="relative flex flex-col items-center gap-1 -mt-4">
          {activeLivesCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center z-10 animate-pulse shadow-md">
              <span className="text-white text-[10px] font-bold">{activeLivesCount}</span>
            </div>
          )}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${currentScreen === 'live' ? 'bg-green-600 scale-105' : 'bg-green-600'}`}>
            <Radio className="w-7 h-7 text-white" />
          </div>
          <span className={`text-[10px] font-bold mt-0.5 ${currentScreen === 'live' ? 'text-green-600' : 'text-slate-700'}`}>LIVE</span>
        </button>
        <button onClick={() => onNavigate('portfolio')} className={`flex flex-col items-center gap-1 px-3 py-2 transition ${currentScreen === 'portfolio' ? 'text-green-600' : 'text-slate-500'}`}>
          <Building2 className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.portfolio')}</span>
        </button>
        <button onClick={() => onNavigate('myProfile')} className={`flex flex-col items-center gap-1 px-3 py-2 transition ${currentScreen === 'myProfile' ? 'text-green-600' : 'text-slate-500'}`}>
          <User className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.profile')}</span>
        </button>
      </div>
    </nav>
  );
};

// Main App
const AppContent = () => {
  const { removeAsset: removeAssetLocal, updateCurrentUser } = useApp();
  const { removeAssetByCode } = usePortfolio();
  const { user, profile, loading, updateProfile, signOut, mfaRequired, completeMFAVerification, passwordRecovery } = useAuth();
  const { activeLives, getLiveById } = useLives();
  const [currentScreen, setCurrentScreen] = useState('feed');
  const [navigationStack, setNavigationStack] = useState(['feed']);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [feedFilter, setFeedFilter] = useState('all');
  const [messageContact, setMessageContact] = useState(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile && !mfaRequired) {
      // Preload screens immediately after login
      preloadScreens();

      // Identify user in OneSignal
      identifyUser(user.id, user.email, profile.name);

      // Request notification permission if not yet decided
      // Guard: Notification API not available on all mobile browsers (e.g. Brave iOS)
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        setTimeout(async () => {
          const { subscribeUser } = await import('../utils/OneSignalInit');
          subscribeUser(user.id);
        }, 3000);
      }
    }
  }, [user, profile, mfaRequired]);

  const userProfile = {
    ...profile,
    profileVisibility: 'public',
    showEmail: false,
    allowMessages: true,
    showInvestments: true,
    selectedBanner: profile?.banner_url || null,
    selectedProfilePic: profile?.avatar_url || null,
    certifications: []
  };

  const navigateTo = (screen) => { setNavigationStack(prev => [...prev, currentScreen]); setCurrentScreen(screen); };
  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      const prev = newStack.pop();
      setNavigationStack(newStack);
      setCurrentScreen(prev);
    } else { setCurrentScreen('feed'); }
  };

  const handleNavigateToProfile = (profileData) => { setSelectedProfile(profileData); navigateTo('profile'); };
  const handleNavigateToPost = (post) => { setSelectedPost(post); navigateTo('comments'); };

  const handleNavigateToPostById = async (postId) => {
    const { data: postData, error } = await supabase
      .from('posts')
      .select(`*, profiles:author_id (id, name, username, avatar_url, verified)`)
      .eq('id', postId).single();
    if (!error && postData) {
      setSelectedPost({
        id: postData.id, authorId: postData.author_id,
        authorName: postData.profiles?.name || 'User', authorUsername: postData.profiles?.username || 'user',
        authorRole: 'Investor', content: postData.content, media: postData.media || [],
        likes: postData.likes_count || 0, comments: postData.comments_count || 0,
        shares: postData.shares_count || 0, views: postData.views_count || 0,
        timestamp: postData.created_at, type: postData.type || 'text',
        charts: postData.charts, documents: postData.documents, video: postData.video
      });
      navigateTo('comments');
    }
  };

  const handleSendMessage = (profileData) => { setMessageContact(profileData); navigateTo('directMessage'); };

  const handleNavigateToLiveById = async (liveId) => {
    const live = await getLiveById(liveId);
    if (live) { setSelectedPost(live); navigateTo('watchLive'); }
  };

  const handleGoLive = (live) => {
    setSelectedPost(live);
    if (live.status === 'live') {
      navigateTo('watchLive');
    } else {
      navigateBack();
    }
  };

  const handleSaveProfile = async (profileData: any) => {
    const updates: any = {};
    if (profileData.name) updates.name = profileData.name;
    if (profileData.username) updates.username = profileData.username;
    if (profileData.bio !== undefined) updates.bio = profileData.bio;
    if (profileData.location !== undefined) updates.location = profileData.location;
    if (profileData.website !== undefined) updates.website = profileData.website;
    if (profileData.email !== undefined) updates.email = profileData.email;
    if (profileData.jobTitle !== undefined) updates.job_title = profileData.jobTitle;
    if (profileData.company !== undefined) updates.company = profileData.company;
    if (profileData.education !== undefined) updates.education = profileData.education;
    if (profileData.selectedProfilePic !== undefined) updates.avatar_url = profileData.selectedProfilePic;
    if (profileData.selectedBanner !== undefined) updates.banner_url = profileData.selectedBanner;
    const { error } = await updateProfile(updates);
    if (error) { alert('Failed to update profile: ' + error.message); }
    else { updateCurrentUser({ name: updates.name || profile.name, username: updates.username || profile.username, bio: updates.bio || profile.bio, location: updates.location || profile.location, website: updates.website || profile.website, email: updates.email || profile.email }); }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && mfaRequired) {
    return (
      <MFAVerifyScreen
        onVerified={completeMFAVerification}
        onBack={async () => { await supabase.auth.signOut(); }}
      />
    );
  }

  if (user && passwordRecovery) {
    return <ResetPasswordScreen />;
  }

  if (!user || !profile) return <LoginScreen />;

  if (profile.onboarding_completed === false) {
    return <PlanSelectionScreen />;
  }

  const showBottomNav = ['feed', 'market', 'portfolio', 'myProfile', 'live'].includes(currentScreen);

  return (
    <div className="relative">
      <Suspense fallback={<ScreenLoader />}>
        {currentScreen === 'feed' && (
          <FeedScreen
            onNavigateToSearch={() => navigateTo('search')}
            onNavigateToNotifications={() => navigateTo('notifications')}
            onNavigateToMarket={() => navigateTo('market')}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToPost={handleNavigateToPost}
            onNavigateToExplore={() => navigateTo('explore')}
            feedFilter={feedFilter}
            setFeedFilter={setFeedFilter}
            onNavigateToLive={() => navigateTo('live')}
            onNavigateToPremium={() => navigateTo('premium')}
          />
        )}
        {currentScreen === 'explore' && <ExploreScreen onBack={navigateBack} onNavigateToPost={handleNavigateToPost} onNavigateToProfile={handleNavigateToProfile} />}
        {currentScreen === 'savedPosts' && <SavedPostsScreen onBack={navigateBack} onNavigateToPost={handleNavigateToPost} onNavigateToProfile={handleNavigateToProfile} />}
        {currentScreen === 'search' && <SearchScreen onBack={navigateBack} onNavigateToProfile={handleNavigateToProfile} />}
        {currentScreen === 'notifications' && <NotificationsScreen onBack={navigateBack} onNavigateToPost={handleNavigateToPostById} onNavigateToProfile={handleNavigateToProfile} onNavigateToLive={handleNavigateToLiveById} />}
        {currentScreen === 'market' && <MarketScreen onBack={navigateBack} onNavigateToCurrencies={() => navigateTo('currency')} />}
        {currentScreen === 'portfolio' && <PortfolioScreen onBack={navigateBack} onAddAsset={() => navigateTo('addAsset')} onViewAsset={(asset) => { setSelectedAsset(asset); navigateTo('assetDetail'); }} />}
        {currentScreen === 'myProfile' && (
          <ProfileScreen
            profileData={null} userProfileData={userProfile} onBack={navigateBack}
            onSendMessage={() => navigateTo('directMessage')} onSettings={() => navigateTo('settings')}
            onEditProfile={() => navigateTo('editProfile')} onNavigateToCreatePost={() => navigateTo('createPost')}
            onNavigateToSavedPosts={() => navigateTo('savedPosts')}
            onNavigateToComments={(postData) => { setSelectedPost(postData); navigateTo('comments'); }}
            onNavigateToFollowers={(userId) => { setViewedUserId(userId); navigateTo('followersList'); }}
            onNavigateToFollowing={(userId) => { setViewedUserId(userId); navigateTo('followingList'); }}
          />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen
            profileData={selectedProfile} onBack={navigateBack} onSendMessage={() => handleSendMessage(selectedProfile)}
            onNavigateToComments={(postData) => { setSelectedPost(postData); navigateTo('comments'); }}
            onNavigateToFollowers={(userId) => { setViewedUserId(userId); navigateTo('followersList'); }}
            onNavigateToFollowing={(userId) => { setViewedUserId(userId); navigateTo('followingList'); }}
          />
        )}
        {currentScreen === 'followersList' && viewedUserId && <FollowersListScreen userId={viewedUserId} onBack={navigateBack} onNavigateToProfile={(p) => { setSelectedProfile(p); navigateTo('profile'); }} />}
        {currentScreen === 'followingList' && viewedUserId && <FollowingListScreen userId={viewedUserId} onBack={navigateBack} onNavigateToProfile={(p) => { setSelectedProfile(p); navigateTo('profile'); }} />}
        {currentScreen === 'comments' && selectedPost && <CommentsScreen postData={selectedPost} onBack={navigateBack} />}
        {currentScreen === 'createPost' && <CreatePostScreen onBack={navigateBack} onViewGuidelines={() => navigateTo('communityGuidelines')} />}
        {currentScreen === 'addAsset' && <AddAssetToPortfolio onBack={navigateBack} onNavigateToPremium={() => navigateTo('premium')} />}
        {currentScreen === 'directMessage' && <DirectMessageScreen onBack={navigateBack} userName={messageContact?.name} userAvatar={messageContact?.name ? messageContact.name.split(' ').map(n => n[0]).join('').substring(0, 2) : null} />}
        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={navigateBack}
            onLogout={async () => { await logoutOneSignal(); await signOut(); setCurrentScreen('feed'); }}
            onNavigateToPremium={() => navigateTo('premium')}
            onNavigateToGuidelines={() => navigateTo('communityGuidelines')}
            onNavigateToLanguageRegion={() => navigateTo('languageRegion')}
            onNavigateToCreatorDashboard={() => navigateTo('creatorDashboard')}
          />
        )}
        {currentScreen === 'editProfile' && <EditProfileScreen onBack={navigateBack} onSave={handleSaveProfile} initialData={userProfile} />}
        {currentScreen === 'assetDetail' && selectedAsset && (
          <AssetDetailScreen asset={selectedAsset} onBack={navigateBack} onAddMore={() => navigateTo('addAsset')}
            onSell={async (asset) => {
              try { if (asset.id) { const { error } = await removeAssetByCode(asset.code); if (!error) { navigateBack(); return; } } await removeAssetByCode(asset.code); }
              catch (e) { console.error('Remove asset error:', e); removeAssetLocal(asset.code); }
              navigateBack();
            }}
          />
        )}
        {currentScreen === 'premium' && <PremiumScreen onClose={navigateBack} onUpgrade={(plan, cycle) => { alert(`Subscription ${plan} (${cycle}) activated!`); navigateBack(); }} />}
        {currentScreen === 'businessDashboard' && <BusinessDashboard onBack={navigateBack} />}
        {currentScreen === 'communityGuidelines' && <CommunityGuidelinesScreen onBack={navigateBack} />}
        {currentScreen === 'currency' && <CurrencyScreen onBack={navigateBack} />}
        {currentScreen === 'languageRegion' && <LanguageRegionScreen onBack={navigateBack} />}
        {currentScreen === 'creatorDashboard' && <CreatorDashboard onBack={navigateBack} onNavigateToSchedule={() => alert('Post scheduling coming soon!')} onNavigateToMonetization={() => alert('Monetisation settings coming soon!')} onNavigateToVideoStudio={() => navigateTo('videoStudio')} />}
        {currentScreen === 'videoStudio' && <VideoStudio onBack={navigateBack} />}
        {currentScreen === 'live' && <LiveScreen onBack={navigateBack} onStartLive={() => navigateTo('startLive')} onWatchLive={(live) => { setSelectedPost(live); navigateTo('watchLive'); }} />}
        {currentScreen === 'watchLive' && selectedPost && <WatchLiveScreen live={selectedPost} onClose={navigateBack} />}
        {currentScreen === 'startLive' && <StartLiveScreen onBack={navigateBack} onGoLive={handleGoLive} />}
      </Suspense>

      {showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} activeLivesCount={activeLives.length} />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <LocaleProvider>
            <AppContent />
          </LocaleProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

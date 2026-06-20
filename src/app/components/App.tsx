import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LocaleProvider, useLocale } from './contexts/LocaleContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase/client';
import { Home, TrendingUp, Building2, User, Plus, Radio } from 'lucide-react';
import { ProfileScreen } from './components/ProfileScreenNew';
import { LoginScreen } from './components/LoginScreen';
import { AddAssetToPortfolio } from './components/AddAssetToPortfolio';
import { AssetDetailScreen } from './components/AssetDetailScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { DirectMessageScreen } from './components/DirectMessageScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { MarketScreen } from './components/MarketScreen';
import { FeedScreen } from './components/FeedScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { CommentsScreen } from './components/CommentsScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { SearchScreen } from './components/SearchScreen';
import { PortfolioScreen } from './components/PortfolioScreen';
import { PremiumScreen } from './components/PremiumScreen';
import { PaywallModal } from './components/PaywallModal';
import { TipModal } from './components/TipModal';
import { BusinessDashboard } from './components/BusinessDashboard';
import { CommunityGuidelinesScreen } from './components/CommunityGuidelinesScreen';
import { CurrencyScreen } from './components/CurrencyScreen';
import { LanguageRegionScreen } from './components/LanguageRegionScreen';
import { CreatorDashboard } from './components/CreatorDashboard';
import { VideoStudio } from './components/VideoStudio';
import { LiveScreen } from './components/LiveScreen';
import { WatchLiveScreen } from './components/WatchLiveScreen';
import { StartLiveScreen } from './components/StartLiveScreen';
import { SimpleFeedTest } from './components/SimpleFeedTest';
import { FollowersListScreen } from './components/FollowersListScreen';
import { FollowingListScreen } from './components/FollowingListScreen';

// Bottom Navigation Component
const BottomNav = ({ currentScreen, onNavigate, activeLivesCount = 3 }) => {
  const { t } = useLocale();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => onNavigate('feed')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'feed' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.feed')}</span>
        </button>
        <button
          onClick={() => onNavigate('market')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'market' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.market')}</span>
        </button>
        
        {/* BULLS LIVE - Botão Central */}
        <button
          onClick={() => onNavigate('live')}
          className="relative flex flex-col items-center gap-1 -mt-4"
        >
          {/* Badge com número de lives ativas */}
          {activeLivesCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center z-10 animate-pulse shadow-md">
              <span className="text-white text-[10px] font-bold">{activeLivesCount}</span>
            </div>
          )}

          {/* Ícone maior e destacado */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            currentScreen === 'live'
              ? 'bg-green-600 scale-105'
              : activeLivesCount > 0
                ? 'bg-green-600 animate-pulse-slow'
                : 'bg-green-600'
          }`}>
            <Radio className="w-7 h-7 text-white" />
          </div>
          <span className={`text-[10px] font-bold mt-0.5 ${
            currentScreen === 'live' ? 'text-green-600' : 'text-slate-700'
          }`}>
            LIVE
          </span>
        </button>
        
        <button
          onClick={() => onNavigate('portfolio')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'portfolio' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.portfolio')}</span>
        </button>
        <button
          onClick={() => onNavigate('myProfile')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'myProfile' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-semibold">{t('nav.profile')}</span>
        </button>
      </div>
    </nav>
  );
};

// Bulls Social Network - Main App
const AppContent = () => {
  const { removeAsset, updateCurrentUser } = useApp();
  const { user, profile, loading, updateProfile, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('feed');
  const [navigationStack, setNavigationStack] = useState(['feed']);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipRecipient, setTipRecipient] = useState(null);
  const [feedFilter, setFeedFilter] = useState('all');
  const [messageContact, setMessageContact] = useState(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);

  // User profile from Supabase (with fallback for non-Supabase fields)
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

  // Função para navegar para uma nova tela
  const navigateTo = (screen) => {
    setNavigationStack(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  // Função para voltar
  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      const previousScreen = newStack.pop();
      setNavigationStack(newStack);
      setCurrentScreen(previousScreen);
    } else {
      // Se não há histórico, volta para o feed
      setCurrentScreen('feed');
    }
  };

  const handleNavigateToProfile = (profileData) => {
    setSelectedProfile(profileData);
    navigateTo('profile');
  };

  const handleNavigateToPost = (post) => {
    setSelectedPost(post);
    navigateTo('comments');
  };

  const handleNavigateToPostById = async (postId) => {
    // Search dados do post do Supabase
    const { data: postData, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          name,
          username,
          avatar_url,
          verified
        )
      `)
      .eq('id', postId)
      .single();

    if (!error && postData) {
      const formattedPost = {
        id: postData.id,
        authorId: postData.author_id,
        authorName: postData.profiles?.name || 'Usuário',
        authorUsername: postData.profiles?.username || 'usuario',
        authorRole: 'Investor',
        content: postData.content,
        media: postData.media || [],
        likes: postData.likes_count || 0,
        comments: postData.comments_count || 0,
        shares: postData.shares_count || 0,
        views: postData.views_count || 0,
        timestamp: postData.created_at,
        type: postData.type || 'text',
        charts: postData.charts,
        documents: postData.documents,
        video: postData.video
      };
      setSelectedPost(formattedPost);
      navigateTo('comments');
    }
  };

  const handleUpgrade = (plan, billingCycle) => {
    alert(`Assinatura ${plan} (${billingCycle}) ativada! Em produção, isso integraria com Stripe/PagSeguro.`);
    navigateBack();
  };

  const handleSendTip = (amount, message) => {
    alert(`Gorjeta de R$ ${amount.toFixed(2)} enviada! Mensagem: "${message}"\n\nEm produção, processaria pagamento via Stripe.`);
    setShowTipModal(false);
    setTipRecipient(null);
  };

  const handleSendMessage = (profileData) => {
    setMessageContact(profileData);
    navigateTo('directMessage');
  };

  // Função para salvar o perfil do usuário
  const handleSaveProfile = async (profileData: any) => {
    // Map form fields to Supabase profile fields
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

    if (error) {
      alert('Erro ao atualizar perfil: ' + error.message);
    } else {
      // Update currentUser in context for new posts
      updateCurrentUser({
        name: updates.name || profile.name,
        username: updates.username || profile.username,
        bio: updates.bio || profile.bio,
        location: updates.location || profile.location,
        website: updates.website || profile.website,
        email: updates.email || profile.email
      });
    }
  };

  // Show loading while auth is initializing
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

  // Show login if not authenticated
  if (!user || !profile) {
    return <LoginScreen />;
  }

  // Definir quais telas mostram o bottom nav
  const showBottomNav = ['feed', 'market', 'portfolio', 'myProfile', 'live'].includes(currentScreen);

  return (
    <div className="relative">
      {currentScreen === 'testFeed' && (
        <SimpleFeedTest />
      )}

      {currentScreen === 'feed' && (
        <FeedScreen
          onNavigateToSearch={() => navigateTo('search')}
          onNavigateToNotifications={() => navigateTo('notifications')}
          onNavigateToMarket={() => navigateTo('market')}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToPost={handleNavigateToPost}
          feedFilter={feedFilter}
          setFeedFilter={setFeedFilter}
          onNavigateToLive={() => navigateTo('live')}
        />
      )}

      {currentScreen === 'search' && (
        <SearchScreen 
          onBack={navigateBack}
          onNavigateToProfile={handleNavigateToProfile}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen
          onBack={navigateBack}
          onNavigateToPost={handleNavigateToPostById}
          onNavigateToProfile={handleNavigateToProfile}
        />
      )}

      {currentScreen === 'market' && (
        <MarketScreen 
          onBack={navigateBack} 
          onNavigateToCurrencies={() => navigateTo('currency')}
        />
      )}

      {currentScreen === 'portfolio' && (
        <PortfolioScreen 
          onBack={navigateBack}
          onAddAsset={() => navigateTo('addAsset')}
          onViewAsset={(asset) => {
            setSelectedAsset(asset);
            navigateTo('assetDetail');
          }}
        />
      )}

      {currentScreen === 'myProfile' && (
        <ProfileScreen
          profileData={null}
          userProfileData={userProfile}
          onBack={navigateBack}
          onSendMessage={() => navigateTo('directMessage')}
          onSettings={() => navigateTo('settings')}
          onEditProfile={() => navigateTo('editProfile')}
          onNavigateToCreatePost={() => navigateTo('createPost')}
          onNavigateToComments={(postData) => {
            setSelectedPost(postData);
            navigateTo('comments');
          }}
          onNavigateToFollowers={(userId) => {
            setViewedUserId(userId);
            navigateTo('followersList');
          }}
          onNavigateToFollowing={(userId) => {
            setViewedUserId(userId);
            navigateTo('followingList');
          }}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          profileData={selectedProfile}
          onBack={navigateBack}
          onSendMessage={() => handleSendMessage(selectedProfile)}
          onNavigateToComments={(postData) => {
            setSelectedPost(postData);
            navigateTo('comments');
          }}
          onNavigateToFollowers={(userId) => {
            setViewedUserId(userId);
            navigateTo('followersList');
          }}
          onNavigateToFollowing={(userId) => {
            setViewedUserId(userId);
            navigateTo('followingList');
          }}
        />
      )}

      {currentScreen === 'followersList' && viewedUserId && (
        <FollowersListScreen
          userId={viewedUserId}
          onBack={navigateBack}
          onNavigateToProfile={(profileData) => {
            setSelectedProfile(profileData);
            navigateTo('profile');
          }}
        />
      )}

      {currentScreen === 'followingList' && viewedUserId && (
        <FollowingListScreen
          userId={viewedUserId}
          onBack={navigateBack}
          onNavigateToProfile={(profileData) => {
            setSelectedProfile(profileData);
            navigateTo('profile');
          }}
        />
      )}

      {currentScreen === 'comments' && selectedPost && (
        <CommentsScreen 
          postData={selectedPost}
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'createPost' && (
        <CreatePostScreen 
          onBack={navigateBack}
          onViewGuidelines={() => navigateTo('communityGuidelines')}
        />
      )}

      {currentScreen === 'addAsset' && (
        <AddAssetToPortfolio 
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'directMessage' && (
        <DirectMessageScreen 
          onBack={navigateBack} 
          userName={messageContact?.name}
          userAvatar={messageContact?.name ? messageContact.name.split(' ').map(n => n[0]).join('').substring(0, 2) : null}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={navigateBack}
          onLogout={async () => {
            await signOut();
            setCurrentScreen('feed');
          }}
          onNavigateToPremium={() => navigateTo('premium')}
          onNavigateToGuidelines={() => navigateTo('communityGuidelines')}
          onNavigateToLanguageRegion={() => navigateTo('languageRegion')}
          onNavigateToCreatorDashboard={() => navigateTo('creatorDashboard')}
        />
      )}

      {currentScreen === 'editProfile' && (
        <EditProfileScreen 
          onBack={navigateBack} 
          onSave={handleSaveProfile}
          initialData={userProfile}
        />
      )}

      {currentScreen === 'assetDetail' && selectedAsset && (
        <AssetDetailScreen 
          asset={selectedAsset}
          onBack={navigateBack}
          onAddMore={() => navigateTo('addAsset')}
          onSell={(asset) => {
            removeAsset(asset.code);
            navigateBack();
          }}
        />
      )}

      {currentScreen === 'premium' && (
        <PremiumScreen 
          onClose={navigateBack}
          onUpgrade={handleUpgrade}
        />
      )}

      {currentScreen === 'businessDashboard' && (
        <BusinessDashboard 
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'communityGuidelines' && (
        <CommunityGuidelinesScreen 
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'currency' && (
        <CurrencyScreen 
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'languageRegion' && (
        <LanguageRegionScreen 
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'creatorDashboard' && (
        <CreatorDashboard 
          onBack={navigateBack}
          onNavigateToSchedule={() => {
            // TODO: Implementar tela de agendamento
            alert('Agendamento de posts será implementado em breve!');
          }}
          onNavigateToMonetization={() => {
            // TODO: Implementar tela de monetização
            alert('Settings de monetização serão implementadas em breve!');
          }}
          onNavigateToVideoStudio={() => navigateTo('videoStudio')}
        />
      )}

      {currentScreen === 'videoStudio' && (
        <VideoStudio 
          onBack={navigateBack}
        />
      )}

      {currentScreen === 'live' && (
        <LiveScreen 
          onBack={navigateBack}
          onStartLive={() => navigateTo('startLive')}
          onWatchLive={(live) => {
            // Save dados da live selecionada
            setSelectedPost(live); // Reutilizando o estado
            navigateTo('watchLive');
          }}
        />
      )}

      {currentScreen === 'watchLive' && selectedPost && (
        <WatchLiveScreen 
          live={selectedPost}
          onClose={navigateBack}
        />
      )}

      {currentScreen === 'startLive' && (
        <StartLiveScreen 
          onBack={navigateBack}
          onGoLive={() => {
            alert('Live iniciada! 🎥🔴\n\nEm produção, aqui você estaria transmitindo ao vivo.');
            navigateBack();
          }}
        />
      )}

      {/* Bottom Navigation - Mostrar apenas nas telas principais */}
      {showBottomNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}
    </div>
  );
};

export default function App() {
  // Bulls Social Network v2.0
  return (
    <AuthProvider>
      <AppProvider>
        <LocaleProvider>
          <AppContent />
        </LocaleProvider>
      </AppProvider>
    </AuthProvider>
  );
}
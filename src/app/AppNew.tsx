import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Home, TrendingUp, Building2, Bell, User, Plus } from 'lucide-react';
import { ProfileScreen } from './components/ProfileScreenNew';
import { AuthScreen } from './components/AuthScreen';
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

// Bottom Navigation Component
const BottomNav = ({ currentScreen, onNavigate }) => {
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
          <span className="text-xs font-semibold">Feed</span>
        </button>
        <button
          onClick={() => onNavigate('market')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'market' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-semibold">Market</span>
        </button>
        <button
          onClick={() => onNavigate('portfolio')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'portfolio' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-6 h-6" />
          <span className="text-xs font-semibold">Portfolio</span>
        </button>
        <button
          onClick={() => onNavigate('myProfile')}
          className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
            currentScreen === 'myProfile' ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { isAuthenticated, setIsAuthenticated, removeAsset } = useApp();
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [previousScreen, setPreviousScreen] = useState('feed');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('feed');
  };

  const handleNavigateToProfile = (profileData) => {
    setSelectedProfile(profileData);
    setPreviousScreen(currentScreen);
    setCurrentScreen('profile');
  };

  const handleNavigateToPost = (post) => {
    setSelectedPost(post);
    setPreviousScreen(currentScreen);
    setCurrentScreen('comments');
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="relative">
      {currentScreen === 'feed' && (
        <FeedScreen 
          onNavigateToSearch={() => setCurrentScreen('search')}
          onNavigateToNotifications={() => setCurrentScreen('notifications')}
          onNavigateToMarket={() => setCurrentScreen('market')}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToPost={handleNavigateToPost}
        />
      )}

      {currentScreen === 'search' && (
        <SearchScreen 
          onBack={() => setCurrentScreen('feed')}
          onNavigateToProfile={handleNavigateToProfile}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen onBack={() => setCurrentScreen('feed')} />
      )}

      {currentScreen === 'market' && (
        <MarketScreen onBack={() => setCurrentScreen('feed')} />
      )}

      {currentScreen === 'portfolio' && (
        <PortfolioScreen 
          onBack={() => setCurrentScreen('feed')}
          onAddAsset={() => setCurrentScreen('addAsset')}
          onViewAsset={(asset) => {
            setSelectedAsset(asset);
            setCurrentScreen('assetDetail');
          }}
        />
      )}

      {currentScreen === 'myProfile' && (
        <ProfileScreen 
          profileData={null} 
          onBack={() => setCurrentScreen('feed')}
          onSendMessage={() => setCurrentScreen('directMessage')}
          onSettings={() => setCurrentScreen('settings')}
          onEditProfile={() => setCurrentScreen('editProfile')}
          onNavigateToCreatePost={() => setCurrentScreen('createPost')}
          onNavigateToComments={(postData) => {
            setSelectedPost(postData);
            setCurrentScreen('comments');
          }}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen 
          profileData={selectedProfile}
          onBack={() => setCurrentScreen(previousScreen)}
          onSendMessage={() => setCurrentScreen('directMessage')}
        />
      )}

      {currentScreen === 'comments' && selectedPost && (
        <CommentsScreen 
          postData={selectedPost}
          onBack={() => setCurrentScreen(previousScreen)}
        />
      )}

      {currentScreen === 'createPost' && (
        <CreatePostScreen 
          onBack={() => {
            if (previousScreen === 'myProfile') {
              setCurrentScreen('myProfile');
            } else {
              setCurrentScreen('feed');
            }
          }} 
        />
      )}

      {currentScreen === 'addAsset' && (
        <AddAssetToPortfolio 
          onBack={() => setCurrentScreen('portfolio')}
        />
      )}

      {currentScreen === 'directMessage' && (
        <DirectMessageScreen onBack={() => setCurrentScreen(previousScreen)} />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen onBack={() => setCurrentScreen('myProfile')} />
      )}

      {currentScreen === 'editProfile' && (
        <EditProfileScreen onBack={() => setCurrentScreen('myProfile')} />
      )}

      {currentScreen === 'assetDetail' && selectedAsset && (
        <AssetDetailScreen 
          asset={selectedAsset}
          onBack={() => setCurrentScreen('portfolio')}
          onAddMore={() => setCurrentScreen('addAsset')}
          onSell={(asset) => {
            removeAsset(asset.code);
            setCurrentScreen('portfolio');
          }}
        />
      )}

      {/* Bottom Navigation - Apenas para telas principais */}
      {['feed', 'market', 'portfolio', 'myProfile'].includes(currentScreen) && (
        <BottomNav 
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            setPreviousScreen(currentScreen);
            setCurrentScreen(screen);
          }}
        />
      )}

      {/* Botão Flutuante de New Post */}
      {currentScreen === 'feed' && (
        <button
          onClick={() => {
            setPreviousScreen('feed');
            setCurrentScreen('createPost');
          }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition z-50"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
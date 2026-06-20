import React from 'react';
import { Home, TrendingUp, DollarSign, User } from 'lucide-react';

export const BottomNavigation = ({ 
  activeTab, 
  onNavigateToHome,
  onNavigateToMarket, 
  onNavigateToCreate, 
  onNavigateToPortfolio, 
  onNavigateToProfile 
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-3">
        <button 
          onClick={onNavigateToHome}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-green-600' : 'text-slate-400'}`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-green-600' : ''}`} />
          <span className="text-xs font-semibold">Home</span>
        </button>
        
        <button 
          onClick={onNavigateToMarket}
          className={`flex flex-col items-center gap-1 ${activeTab === 'market' ? 'text-green-600' : 'text-slate-400'}`}
        >
          <TrendingUp className={`w-6 h-6 ${activeTab === 'market' ? 'fill-green-600' : ''}`} />
          <span className="text-xs font-semibold">Market</span>
        </button>
        
        <button 
          onClick={onNavigateToCreate}
          className="w-14 h-14 -mt-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition"
        >
          <span className="text-white text-3xl font-light">+</span>
        </button>
        
        <button 
          onClick={onNavigateToPortfolio}
          className={`flex flex-col items-center gap-1 ${activeTab === 'portfolio' ? 'text-green-600' : 'text-slate-400'}`}
        >
          <DollarSign className={`w-6 h-6 ${activeTab === 'portfolio' ? 'fill-green-600' : ''}`} />
          <span className="text-xs font-semibold">Portfolio</span>
        </button>
        
        <button 
          onClick={onNavigateToProfile}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-green-600' : 'text-slate-400'}`}
        >
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-green-600' : ''}`} />
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
};

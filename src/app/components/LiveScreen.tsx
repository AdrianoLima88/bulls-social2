import React, { useState } from 'react';
import { ArrowLeft, Radio, Users, Clock, TrendingUp, Play, Eye, MessageCircle, Heart, DollarSign, Share2, MoreVertical } from 'lucide-react';

interface LiveScreenProps {
  onBack: () => void;
  onStartLive: () => void;
  onWatchLive: (live: any) => void;
}

export const LiveScreen: React.FC<LiveScreenProps> = ({ onBack, onStartLive, onWatchLive }) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'ended'>('active');
  const [notifiedLives, setNotifiedLives] = useState<number[]>([]);

  const handleNotifyMe = (liveId: number) => {
    if (!notifiedLives.includes(liveId)) {
      setNotifiedLives([...notifiedLives, liveId]);
      alert('🔔 Notificação ativada!\n\nVocê receberá um aviso quando esta live começar.');
    } else {
      setNotifiedLives(notifiedLives.filter(id => id !== liveId));
      alert('🔕 Notificação desativada.\n\nVocê não receberá mais avisos sobre esta live.');
    }
  };

  // Mock de lives ativas
  const activeLives = [
    {
      id: 1,
      title: '📊 Analysis do Pregão - IBOV, PETR4, VALE3',
      host: {
        name: 'Carlos Trader',
        username: '@carlostrader',
        avatar: 'https://i.pravatar.cc/150?img=12',
        verified: true,
        premium: true,
      },
      viewers: 2847,
      startedAt: '14:30',
      duration: '1h 23m',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      category: 'Technical Analysis',
      language: 'pt-BR',
      isPaid: false,
    },
    {
      id: 2,
      title: '🚨 BREAKING: Fed just announced new interest rate!',
      host: {
        name: 'InfoMoney',
        username: '@infomoney',
        avatar: 'https://i.pravatar.cc/150?img=20',
        verified: true,
        premium: false,
      },
      viewers: 5124,
      startedAt: '15:00',
      duration: '45m',
      thumbnail: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&q=80',
      category: 'News',
      language: 'pt-BR',
      isPaid: false,
    },
    {
      id: 3,
      title: '💰 How to Start Investing with €100 - Free Class',
      host: {
        name: 'Raquel Investments',
        username: '@raquelinveste',
        avatar: 'https://i.pravatar.cc/150?img=45',
        verified: true,
        premium: true,
      },
      viewers: 1632,
      startedAt: '14:00',
      duration: '2h 15m',
      thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
      category: 'Education',
      language: 'pt-BR',
      isPaid: false,
    },
    {
      id: 4,
      title: '🏦 Q1 2024 Results Presentation',
      host: {
        name: 'Petrobras Official',
        username: '@petrobras',
        avatar: 'https://i.pravatar.cc/150?img=60',
        verified: true,
        premium: false,
      },
      viewers: 8932,
      startedAt: '16:00',
      duration: '1h 05m',
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      category: 'Corporate',
      language: 'pt-BR',
      isPaid: false,
    },
    {
      id: 5,
      title: '📈 Options Strategies to Protect Your Portfolio',
      host: {
        name: 'Prof. André Moraes',
        username: '@andremoraes',
        avatar: 'https://i.pravatar.cc/150?img=33',
        verified: true,
        premium: true,
      },
      viewers: 456,
      startedAt: '15:30',
      duration: '30m',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      category: 'Education Premium',
      language: 'pt-BR',
      isPaid: true,
      price: '€ 29,90',
    },
  ];

  const upcomingLives = [
    {
      id: 6,
      title: '🔥 TOP 5 Ações para Maio - Portfolio Recomendada',
      host: {
        name: 'Bruno Analyst',
        username: '@brunoanalista',
        avatar: 'https://i.pravatar.cc/150?img=15',
        verified: true,
      },
      scheduledFor: 'Today às 18:00',
      estimatedDuration: '1h',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      category: 'Recommendations',
      isPaid: true,
      price: '€ 19,90',
      subscribers: 234,
    },
    {
      id: 7,
      title: '💸 How to Declare Crypto for Tax 2024',
      host: {
        name: 'Digital Creator',
        username: '@contadordigital',
        avatar: 'https://i.pravatar.cc/150?img=28',
        verified: true,
      },
      scheduledFor: 'Tomorrow at 10:00',
      estimatedDuration: '2h',
      thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
      category: 'Education',
      isPaid: false,
      subscribers: 892,
    },
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50 shadow-lg flex-shrink-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></span>
            </div>
            <h1 className="text-xl font-black">Bulls Live</h1>
          </div>
          <button onClick={onStartLive} className="px-4 py-2 bg-white text-green-600 rounded-full font-bold text-sm hover:bg-green-50 transition shadow-lg">
            Start Live
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/20">
          <button
            onClick={() => setSelectedTab('active')}
            className={`flex-1 py-3 text-sm font-bold transition relative ${
              selectedTab === 'active' ? 'text-white' : 'text-white/60'
            }`}
          >
            🔴 Live ({activeLives.length})
            {selectedTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`flex-1 py-3 text-sm font-bold transition relative ${
              selectedTab === 'upcoming' ? 'text-white' : 'text-white/60'
            }`}
          >
            📅 Scheduled ({upcomingLives.length})
            {selectedTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {selectedTab === 'active' && (
          <>
            {/* Destaque - Live Principal */}
            <div 
              onClick={() => onWatchLive(activeLives[0])}
              className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
            >
              <img 
                src={activeLives[0].thumbnail} 
                alt={activeLives[0].title}
                className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Badge AO VIVO */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white text-xs font-bold">AO VIVO</span>
              </div>

              {/* Viewers */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Eye className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">
                  {activeLives[0].viewers.toLocaleString()}
                </span>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={activeLives[0].host.avatar} 
                    alt={activeLives[0].host.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-white font-bold text-sm">{activeLives[0].host.name}</p>
                      {activeLives[0].host.verified && (
                        <span className="text-blue-400 text-xs">✓</span>
                      )}
                      {activeLives[0].host.premium && (
                        <span className="text-yellow-400 text-xs">⭐</span>
                      )}
                    </div>
                    <p className="text-white/80 text-xs">{activeLives[0].host.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xs font-semibold">{activeLives[0].duration}</p>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                  {activeLives[0].title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    {activeLives[0].category}
                  </span>
                </div>
              </div>
            </div>

            {/* Outras Lives */}
            <div className="space-y-3">
              {activeLives.slice(1).map((live) => (
                <div
                  key={live.id}
                  onClick={() => onWatchLive(live)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={live.thumbnail} 
                        alt={live.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      {/* Badge AO VIVO pequeno */}
                      <div className="absolute top-1 left-1 flex items-center gap-1 bg-green-600 px-2 py-0.5 rounded-full shadow-md">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-[10px] font-bold">LIVE</span>
                      </div>
                      {/* Viewers */}
                      <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        <Eye className="w-3 h-3 text-white" />
                        <span className="text-white text-[10px] font-bold">
                          {live.viewers > 1000 ? `${(live.viewers / 1000).toFixed(1)}k` : live.viewers}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">
                        {live.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={live.host.avatar} 
                          alt={live.host.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <p className="text-slate-600 text-xs font-medium">{live.host.name}</p>
                        {live.host.verified && (
                          <span className="text-blue-500 text-xs">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                          {live.category}
                        </span>
                        {live.isPaid && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded-full">
                            💰 {live.price}
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">{live.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedTab === 'upcoming' && (
          <div className="space-y-3">
            {upcomingLives.map((live) => (
              <div
                key={live.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={live.thumbnail} 
                      alt={live.title}
                      className="w-32 h-20 object-cover rounded-lg opacity-90"
                    />
                    {/* Badge Agendada */}
                    <div className="absolute top-1 left-1 flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded-full shadow-md">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-white text-[10px] font-bold">AGENDADA</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">
                      {live.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={live.host.avatar} 
                        alt={live.host.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <p className="text-slate-600 text-xs font-medium">{live.host.name}</p>
                      {live.host.verified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-blue-600 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {live.scheduledFor}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                          {live.category}
                        </span>
                        {live.isPaid && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded-full">
                            💰 {live.price}
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          {live.subscribers} subscribers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão de Notificar */}
                <div className="border-t border-slate-100 px-3 py-2">
                  <button
                    className={`w-full py-2 font-semibold rounded-lg text-sm transition ${
                      notifiedLives.includes(live.id)
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                    onClick={() => handleNotifyMe(live.id)}
                  >
                    {notifiedLives.includes(live.id) ? '✅ Notification set' : '🔔 Notify me'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { X, TrendingUp, Users, DollarSign, Eye, Heart, Clock, Calendar, Download, BarChart3, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

interface CreatorAnalyticsProps {
  onClose: () => void;
}

export const CreatorAnalytics: React.FC<CreatorAnalyticsProps> = ({ onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const analyticsData = {
    '7d': {
      totalViews: 125400,
      totalRevenue: 3240.50,
      totalLikes: 8920,
      avgViewers: 450,
      peakViewers: 1250,
      watchTime: '12.5h',
      engagement: 7.1,
      growth: { views: 12.3, revenue: 8.5, likes: 15.2 }
    },
    '30d': {
      totalViews: 487300,
      totalRevenue: 12840.75,
      totalLikes: 34280,
      avgViewers: 520,
      peakViewers: 2100,
      watchTime: '48.3h',
      engagement: 7.0,
      growth: { views: 18.7, revenue: 22.4, likes: 19.8 }
    },
    '90d': {
      totalViews: 1523000,
      totalRevenue: 38920.20,
      totalLikes: 105600,
      avgViewers: 580,
      peakViewers: 3400,
      watchTime: '152.7h',
      engagement: 6.9,
      growth: { views: 24.5, revenue: 31.2, likes: 28.3 }
    },
    all: {
      totalViews: 3847000,
      totalRevenue: 94250.80,
      totalLikes: 268400,
      avgViewers: 610,
      peakViewers: 5200,
      watchTime: '387.2h',
      engagement: 7.0,
      growth: { views: 0, revenue: 0, likes: 0 }
    }
  };

  const data = analyticsData[selectedPeriod];

  const topLives = [
    { id: 1, title: 'Análise Completa: PETR4 e VALE3', viewers: 2100, revenue: 1240.50, date: '15 Abr' },
    { id: 2, title: 'Day Trade: Estratégias que funcionam', viewers: 1850, revenue: 980.30, date: '12 Abr' },
    { id: 3, title: 'Portfolio Recomendada Abril 2026', viewers: 1620, revenue: 850.20, date: '08 Abr' },
    { id: 4, title: 'Criptomoedas: Bitcoin vai a $150k?', viewers: 1480, revenue: 720.40, date: '05 Abr' },
    { id: 5, title: 'Fundos Imobiliários: Onde investir', viewers: 1320, revenue: 680.10, date: '01 Abr' },
  ];

  const revenueBreakdown = [
    { source: 'Super Chats', value: 8240.50, percentage: 64.2 },
    { source: 'Lives Pagas', value: 3200.00, percentage: 24.9 },
    { source: 'Assinaturas', value: 1400.25, percentage: 10.9 },
  ];

  const audienceData = {
    countries: [
      { name: 'Brasil', percentage: 78.5 },
      { name: 'Portugal', percentage: 12.3 },
      { name: 'EUA', percentage: 5.2 },
      { name: 'Outros', percentage: 4.0 },
    ],
    ageGroups: [
      { range: '18-24', percentage: 18.2 },
      { range: '25-34', percentage: 42.8 },
      { range: '35-44', percentage: 24.5 },
      { range: '45+', percentage: 14.5 },
    ],
    gender: [
      { type: 'Masculino', percentage: 68.3 },
      { type: 'Feminino', percentage: 29.2 },
      { type: 'Outros', percentage: 2.5 },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-500" />
              Creator Analytics
            </h1>
            <p className="text-white/60 text-sm mt-1">Dashboard completo de métricas e desempenho</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-white/60 text-sm mr-2">Período:</span>
          {[
            { value: '7d' as const, label: 'Últimos 7 dias' },
            { value: '30d' as const, label: 'Últimos 30 dias' },
            { value: '90d' as const, label: 'Últimos 90 dias' },
            { value: 'all' as const, label: 'Todo período' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                selectedPeriod === period.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Views */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-blue-400" />
              {selectedPeriod !== 'all' && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-bold">+{data.growth.views}%</span>
                </div>
              )}
            </div>
            <h3 className="text-white/60 text-sm mb-1">Views</h3>
            <p className="text-white text-3xl font-bold">{data.totalViews.toLocaleString()}</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              {selectedPeriod !== 'all' && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-bold">+{data.growth.revenue}%</span>
                </div>
              )}
            </div>
            <h3 className="text-white/60 text-sm mb-1">Receita Total</h3>
            <p className="text-white text-3xl font-bold">€ {data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          {/* Total Likes */}
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-pink-400" />
              {selectedPeriod !== 'all' && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-bold">+{data.growth.likes}%</span>
                </div>
              )}
            </div>
            <h3 className="text-white/60 text-sm mb-1">Total de Likes</h3>
            <p className="text-white text-3xl font-bold">{data.totalLikes.toLocaleString()}</p>
          </div>

          {/* Peak Viewers */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-white/60 text-sm mb-1">Pico de Viewers</h3>
            <p className="text-white text-3xl font-bold">{data.peakViewers.toLocaleString()}</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-white/60" />
              <h3 className="text-white/60 text-sm">Média de Viewers</h3>
            </div>
            <p className="text-white text-2xl font-bold">{data.avgViewers.toLocaleString()}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-white/60" />
              <h3 className="text-white/60 text-sm">Tempo Total de Watch</h3>
            </div>
            <p className="text-white text-2xl font-bold">{data.watchTime}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-white/60" />
              <h3 className="text-white/60 text-sm">Taxa de Engajamento</h3>
            </div>
            <p className="text-white text-2xl font-bold">{data.engagement}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Lives */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Top 5 Lives
            </h3>
            <div className="space-y-3">
              {topLives.map((live, index) => (
                <div key={live.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm mb-1 truncate">{live.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {live.viewers.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          € {live.revenue.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {live.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              Fontes de Receita
            </h3>
            <div className="space-y-4">
              {revenueBreakdown.map(source => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm">{source.source}</span>
                    <span className="text-white/60 text-sm">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-600 h-full rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-white text-sm font-bold">
                      € {source.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Revenue Share (70%)</span>
                <span className="text-green-400 text-xl font-bold">
                  € {(data.totalRevenue * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-white/40 text-xs mt-1">Valor que você recebe (Bulls fica com 30%)</p>
            </div>
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Countries */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-bold mb-4">📍 Países</h3>
            <div className="space-y-3">
              {audienceData.countries.map(country => (
                <div key={country.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{country.name}</span>
                    <span className="text-white/60 text-sm">{country.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Groups */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-bold mb-4">🎂 Faixa Etária</h3>
            <div className="space-y-3">
              {audienceData.ageGroups.map(age => (
                <div key={age.range}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{age.range} anos</span>
                    <span className="text-white/60 text-sm">{age.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${age.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-bold mb-4">👥 Gênero</h3>
            <div className="space-y-3">
              {audienceData.gender.map(gender => (
                <div key={gender.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{gender.type}</span>
                    <span className="text-white/60 text-sm">{gender.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-full rounded-full"
                      style={{ width: `${gender.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Production Note */}
        <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h4 className="text-yellow-400 font-bold mb-2">🚀 Em Produção - Backend Real</h4>
              <ul className="text-yellow-400/80 text-sm space-y-1">
                <li>• <strong>Database:</strong> PostgreSQL + Redis for caching</li>
                <li>• <strong>Analytics Engine:</strong> Real-time processing with Stream Processing</li>
                <li>• <strong>Export:</strong> PDF/Excel reports via API</li>
                <li>• <strong>Notifications:</strong> Milestone and goal alerts</li>
                <li>• <strong>Comparison:</strong> Benchmark against other creators in the category</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

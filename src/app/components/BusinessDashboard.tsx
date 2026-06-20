import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Users, BarChart3, Target, Megaphone, DollarSign } from 'lucide-react';

export const BusinessDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'audience' | 'sponsored'>('overview');

  // Mock data
  const metrics = {
    totalViews: 125340,
    totalEngagement: 8934,
    followers: 45623,
    avgSentiment: 78, // 0-100
    reachGrowth: 12.5,
    sentimentTrend: 5.3,
  };

  const sentimentData = [
    { sentiment: 'Muito Positivo', count: 234, percentage: 45, color: 'bg-green-500' },
    { sentiment: 'Positivo', count: 156, percentage: 30, color: 'bg-green-400' },
    { sentiment: 'Neutro', count: 89, percentage: 17, color: 'bg-slate-400' },
    { sentiment: 'Negativo', count: 34, percentage: 6, color: 'bg-red-400' },
    { sentiment: 'Muito Negativo', count: 10, percentage: 2, color: 'bg-red-500' },
  ];

  const topicsOfInterest = [
    { topic: 'Dividendos', mentions: 456, trend: 'up' },
    { topic: 'Balanço Q1', mentions: 389, trend: 'up' },
    { topic: 'Ações', mentions: 267, trend: 'neutral' },
    { topic: 'Lucros', mentions: 234, trend: 'up' },
    { topic: 'Return', mentions: 198, trend: 'down' },
  ];

  const audienceProfile = {
    ageGroups: [
      { range: '18-24', percentage: 15 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 28 },
      { range: '45-54', percentage: 15 },
      { range: '55+', percentage: 7 },
    ],
    investorTypes: [
      { type: 'Iniciante', percentage: 25 },
      { type: 'Intermediário', percentage: 45 },
      { type: 'Avançado', percentage: 30 },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Bulls Business</h1>
            <p className="text-sm text-white/80">Analytics e Insights</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'overview' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'sentiment' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Sentimento
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'audience' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Audience
          </button>
          <button
            onClick={() => setActiveTab('sponsored')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'sponsored' 
                ? 'bg-white text-blue-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Patrocinados
          </button>
        </div>
      </header>

      <div className="p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{metrics.reachGrowth}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.totalViews.toLocaleString()}</p>
                <p className="text-xs text-slate-600">Views</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8.2%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.totalEngagement.toLocaleString()}</p>
                <p className="text-xs text-slate-600">Engajamento</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +15.7%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.followers.toLocaleString()}</p>
                <p className="text-xs text-slate-600">Followers</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{metrics.sentimentTrend}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metrics.avgSentiment}%</p>
                <p className="text-xs text-slate-600">Sentimento Positivo</p>
              </div>
            </div>

            {/* Topics of Interest */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Tópicos de Interesse
              </h3>
              <div className="space-y-3">
                {topicsOfInterest.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        topic.trend === 'up' ? 'bg-green-100' :
                        topic.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        {topic.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : topic.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{topic.topic}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{topic.mentions} menções</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sentiment Tab */}
        {activeTab === 'sentiment' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 text-center">
                Investor Sentiment Analysis
              </h3>
              
              <div className="space-y-4">
                {sentimentData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{item.sentiment}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count} menções</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.percentage}% do total</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{metrics.avgSentiment}%</p>
                  <p className="text-sm text-green-700 font-semibold">Sentimento Geral Positivo</p>
                  <p className="text-xs text-slate-600 mt-2">
                    Based on {sentimentData.reduce((acc, item) => acc + item.count, 0)} analysed mentions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <div className="space-y-4">
            {/* Age Groups */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Faixa Etária</h3>
              <div className="space-y-3">
                {audienceProfile.ageGroups.map((group, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{group.range} anos</span>
                      <span className="text-sm font-bold text-slate-900">{group.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investor Types */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Profile de Investor</h3>
              <div className="space-y-3">
                {audienceProfile.investorTypes.map((type, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{type.type}</span>
                      <span className="text-sm font-bold text-slate-900">{type.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Principais Localizações</h3>
              <div className="space-y-2">
                {[
                  { city: 'São Paulo', percentage: 35 },
                  { city: 'Rio de Janeiro', percentage: 18 },
                  { city: 'Brasília', percentage: 12 },
                  { city: 'Belo Horizonte', percentage: 8 },
                  { city: 'Outros', percentage: 27 },
                ].map((location, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700">{location.city}</span>
                    <span className="text-sm font-bold text-slate-900">{location.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sponsored Tab */}
        {activeTab === 'sponsored' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <Megaphone className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Posts Patrocinados</h3>
              <p className="text-white/90 text-sm mb-4">
                Alcance investidores qualificados com posts destacados
              </p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:shadow-xl transition">
                Criar Campanha
              </button>
            </div>

            {/* Active Campaigns */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Campanhas Ativas</h3>
              
              <div className="space-y-3">
                <div className="border-2 border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">Balanço Q1 2024</h4>
                      <p className="text-xs text-slate-600">Criado em 15 Mar 2024</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Ativa
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-slate-600">Alcance</p>
                      <p className="text-lg font-bold text-slate-900">45.2k</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Cliques</p>
                      <p className="text-lg font-bold text-slate-900">3.4k</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">CPC</p>
                      <p className="text-lg font-bold text-slate-900">€ 0.85</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Orçamento gasto</span>
                      <span className="text-sm font-bold text-slate-900">€ 2.890 / € 5.000</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Precificação</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">CPM (Custo por Mil)</p>
                    <p className="text-xs text-slate-600">Exibições no feed</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">€ 15,00</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">CPC (Custo por Clique)</p>
                    <p className="text-xs text-slate-600">Clicks no post</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">€ 0,80</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-900">Destaque no Feed</p>
                    <p className="text-xs text-slate-600">24 horas no topo</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">€ 500,00</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, DollarSign, Calendar, Clock, Target, Award, BarChart3, Download, Settings, Zap, Crown, ChevronRight, TrendingDown, Globe, MapPin, Filter, Video } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';

export const CreatorDashboard = ({ onBack, onNavigateToSchedule, onNavigateToMonetization, onNavigateToVideoStudio }) => {
  const { currentUser, getUserPosts } = useApp();
  const { t, formatCurrency } = useLocale();
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, year
  const [activeTab, setActiveTab] = useState('overview'); // overview, audience, content, earnings

  // Dados mockados do criador
  const creatorStats = {
    totalViews: 1245678,
    totalFollowers: 45234,
    totalLikes: 98543,
    totalComments: 12453,
    totalShares: 8932,
    totalEarnings: 12450.80,
    engagementRate: 8.5,
    avgViewsPerPost: 15234,
    followerGrowth: 12.5, // %
    topPost: {
      id: 'post-123',
      content: 'Análise completa sobre PETR4...',
      views: 125432,
      likes: 8543,
      comments: 432
    }
  };

  // Dados de crescimento por dia
  const growthData = [
    { id: 'day-1', date: '01/04', views: 12000, followers: 200, engagement: 1200, earnings: 450 },
    { id: 'day-2', date: '02/04', views: 15000, followers: 250, engagement: 1500, earnings: 520 },
    { id: 'day-3', date: '03/04', views: 18000, followers: 300, engagement: 1800, earnings: 680 },
    { id: 'day-4', date: '04/04', views: 22000, followers: 350, engagement: 2100, earnings: 750 },
    { id: 'day-5', date: '05/04', views: 19000, followers: 280, engagement: 1900, earnings: 640 },
    { id: 'day-6', date: '06/04', views: 25000, followers: 420, engagement: 2400, earnings: 890 },
    { id: 'day-7', date: '07/04', views: 28000, followers: 480, engagement: 2800, earnings: 950 },
  ];

  // Dados de audiência por localização
  const audienceByLocation = [
    { id: 'loc-1', name: 'São Paulo', value: 35, count: 15832 },
    { id: 'loc-2', name: 'Rio de Janeiro', value: 22, count: 9951 },
    { id: 'loc-3', name: 'Minas Gerais', value: 15, count: 6785 },
    { id: 'loc-4', name: 'Paraná', value: 12, count: 5428 },
    { id: 'loc-5', name: 'Outros', value: 16, count: 7238 },
  ];

  // Dados de audiência por interesse
  const audienceByInterest = [
    { id: 'int-1', name: 'Ações', value: 40 },
    { id: 'int-2', name: 'Cripto', value: 25 },
    { id: 'int-3', name: 'FIIs', value: 20 },
    { id: 'int-4', name: 'Renda Fixa', value: 15 },
  ];

  // Performance de conteúdo
  const contentPerformance = [
    { id: 'perf-1', type: 'Analyses', posts: 45, avgViews: 18500, avgEngagement: 9.2 },
    { id: 'perf-2', type: 'Notícias', posts: 32, avgViews: 12300, avgEngagement: 6.5 },
    { id: 'perf-3', type: 'Education', posts: 28, avgViews: 15800, avgEngagement: 11.3 },
    { id: 'perf-4', type: 'Opinião', posts: 19, avgViews: 9500, avgEngagement: 5.8 },
  ];

  // Dados de receita
  const earningsData = [
    { id: 'earn-1', source: 'Assinaturas', amount: 6500, percentage: 52 },
    { id: 'earn-2', source: 'Gorjetas', amount: 3200, percentage: 26 },
    { id: 'earn-3', source: 'Anúncios', amount: 1800, percentage: 14 },
    { id: 'earn-4', source: 'Content Premium', amount: 950, percentage: 8 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg">Creator Dashboard</h1>
          <button className="text-white">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Eye className="w-4 h-4" />
              <span>Views</span>
            </div>
            <p className="text-white text-2xl font-bold">{creatorStats.totalViews.toLocaleString('pt-BR')}</p>
            <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% esta semana</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Users className="w-4 h-4" />
              <span>Followers</span>
            </div>
            <p className="text-white text-2xl font-bold">{creatorStats.totalFollowers.toLocaleString('pt-BR')}</p>
            <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{creatorStats.followerGrowth}% this month</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Heart className="w-4 h-4" />
              <span>Engajamento</span>
            </div>
            <p className="text-white text-2xl font-bold">{creatorStats.engagementRate}%</p>
            <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Above average</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Receita (30d)</span>
            </div>
            <p className="text-white text-2xl font-bold">€ {creatorStats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.3% vs last month</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'overview' ? 'bg-white text-green-600' : 'bg-white/20 text-white'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'audience' ? 'bg-white text-green-600' : 'bg-white/20 text-white'
            }`}
          >
            Audience
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'content' ? 'bg-white text-green-600' : 'bg-white/20 text-white'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              activeTab === 'earnings' ? 'bg-white text-green-600' : 'bg-white/20 text-white'
            }`}
          >
            Receitas
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            {/* Crescimento */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Crescimento (7 dias)</h3>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1"
                >
                  <option value="7days">7 dias</option>
                  <option value="30days">30 dias</option>
                  <option value="90days">90 dias</option>
                  <option value="year">1 ano</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={200} key={`overview-container-${timeRange}`}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorViews-overview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid-overview" strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis key="xaxis-overview" dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis key="yaxis-overview" tick={{ fontSize: 12 }} />
                  <Tooltip key="tooltip-overview" />
                  <Area key="area-overview" type="monotone" dataKey="views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews-overview)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Ferramentas Rápidas */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Ferramentas de Criador</h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigateToSchedule?.()}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Agendar Posts</p>
                      <p className="text-xs text-slate-500">3 posts agendados</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigateToMonetization?.()}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Monetização</p>
                      <p className="text-xs text-slate-500">Configurar assinaturas e preços</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigateToVideoStudio?.()}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Estúdio de Vídeos</p>
                      <p className="text-xs text-slate-500">Criar e editar vídeos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Ranking & Badges</p>
                      <p className="text-xs text-slate-500">Ver ranking e conquistas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Boost de Posts</p>
                      <p className="text-xs text-slate-500">Aumentar alcance com anúncios</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Melhor Post */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Melhor Post da Semana</h3>
              </div>
              <p className="text-slate-700 mb-3">{creatorStats.topPost.content}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-slate-600">
                  <Eye className="w-4 h-4" />
                  {creatorStats.topPost.views.toLocaleString('pt-BR')}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Heart className="w-4 h-4" />
                  {creatorStats.topPost.likes.toLocaleString('pt-BR')}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MessageCircle className="w-4 h-4" />
                  {creatorStats.topPost.comments.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Audience */}
        {activeTab === 'audience' && (
          <div className="p-4 space-y-4">
            {/* Crescimento de Followers */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Crescimento de Followers</h3>
              <ResponsiveContainer width="100%" height={200} key={`followers-container-${timeRange}`}>
                <LineChart data={growthData}>
                  <CartesianGrid key="grid-followers" strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis key="xaxis-followers" dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis key="yaxis-followers" tick={{ fontSize: 12 }} />
                  <Tooltip key="tooltip-followers" />
                  <Line key="line-followers" type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Location da Audience */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Audience por Location</h3>
              <div className="space-y-3">
                {audienceByLocation.map((location) => (
                  <div key={location.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">{location.name}</span>
                      </div>
                      <span className="text-sm text-slate-600">{location.count.toLocaleString('pt-BR')} ({location.value}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${location.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interesses da Audience */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Interesses da Audience</h3>
              <ResponsiveContainer width="100%" height={200} key={`interests-container-${timeRange}`}>
                <PieChart>
                  <Pie
                    key="pie-interests"
                    data={audienceByInterest}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {audienceByInterest.map((entry, index) => (
                      <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip key="tooltip-interests" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Demografia */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Demografia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Idade Média</p>
                  <p className="text-2xl font-bold text-slate-900">32 anos</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Gênero</p>
                  <p className="text-2xl font-bold text-slate-900">65% M</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Investores</p>
                  <p className="text-2xl font-bold text-slate-900">78%</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Iniciantes</p>
                  <p className="text-2xl font-bold text-slate-900">22%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance de Content */}
        {activeTab === 'content' && (
          <div className="p-4 space-y-4">
            {/* Engajamento por Tipo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Performance por Tipo de Content</h3>
              <ResponsiveContainer width="100%" height={250} key={`content-container-${timeRange}`}>
                <BarChart data={contentPerformance}>
                  <CartesianGrid key="grid-content" strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis key="xaxis-content" dataKey="type" tick={{ fontSize: 12 }} />
                  <YAxis key="yaxis-content" tick={{ fontSize: 12 }} />
                  <Tooltip key="tooltip-content" />
                  <Legend key="legend-content" />
                  <Bar key="bar-views" dataKey="avgViews" fill="#10b981" name="Average Views" />
                  <Bar key="bar-engagement" dataKey="avgEngagement" fill="#3b82f6" name="Engajamento %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Performance */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Detalhes por Tipo</h3>
              <div className="space-y-3">
                {contentPerformance.map((item) => (
                  <div key={item.id} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{item.type}</span>
                      <span className="text-xs text-slate-500">{item.posts} posts</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Média de Views</p>
                        <p className="font-semibold text-slate-900">{item.avgViews.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Engajamento</p>
                        <p className="font-semibold text-green-600">{item.avgEngagement}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Melhores Horários */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Melhores Horários para Postar</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">08:00 - 10:00</p>
                      <p className="text-xs text-slate-500">Segunda a Sexta</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Alto</p>
                    <p className="text-xs text-slate-500">Engajamento</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-900">18:00 - 20:00</p>
                      <p className="text-xs text-slate-500">Todos os dias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">Médio-Alto</p>
                    <p className="text-xs text-slate-500">Engajamento</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-900">12:00 - 14:00</p>
                      <p className="text-xs text-slate-500">Segunda a Sexta</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-600">Médio</p>
                    <p className="text-xs text-slate-500">Engajamento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receitas */}
        {activeTab === 'earnings' && (
          <div className="p-4 space-y-4">
            {/* Receita Total */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-white/80 text-sm mb-1">Receita Total (30 dias)</p>
              <p className="text-4xl font-bold mb-3">€ {creatorStats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full inline-flex">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+18.3% vs last month</span>
              </div>
            </div>

            {/* Crescimento de Receita */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Crescimento de Receita</h3>
              <ResponsiveContainer width="100%" height={200} key={`earnings-container-${timeRange}`}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorEarnings-earnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid-earnings" strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis key="xaxis-earnings" dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis key="yaxis-earnings" tick={{ fontSize: 12 }} />
                  <Tooltip key="tooltip-earnings" />
                  <Area key="area-earnings" type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings-earnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Receita por Fonte */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Receita por Fonte</h3>
              <div className="space-y-3 mb-4">
                {earningsData.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-900">{item.source}</span>
                      <span className="text-sm text-slate-600">
                        € {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200} key={`earnings-pie-container-${timeRange}`}>
                <PieChart>
                  <Pie
                    key="pie-earnings"
                    data={earningsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {earningsData.map((entry, index) => (
                      <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip key="tooltip-earnings-pie" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Assinantes */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Assinantes Ativos</h3>
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">1.2K</p>
                  <p className="text-xs text-slate-500 mt-1">Total</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <p className="text-2xl font-bold text-green-600">+184</p>
                  <p className="text-xs text-slate-500 mt-1">Este mês</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                  <p className="text-2xl font-bold text-red-600">-23</p>
                  <p className="text-xs text-slate-500 mt-1">Cancelados</p>
                </div>
              </div>
            </div>

            {/* Sacar Fundos */}
            <button className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Sacar € {creatorStats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </button>
            <p className="text-center text-xs text-slate-500">Saldo disponível para saque via PIX ou transferência</p>
          </div>
        )}
      </div>
    </div>
  );
};
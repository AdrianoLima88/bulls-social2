import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, Upload, Scissors, Type, Music, Sparkles, Image, Layers, Download, ChevronRight, Clock, TrendingUp, DollarSign, BarChart3, Zap, Plus, X, Check } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

interface VideoStudioProps {
  onBack: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ onBack }) => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<'templates' | 'editor' | 'library'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Templates focados em mercado financeiro
  const templates = [
    {
      id: 1,
      name: 'Análise Diária',
      category: 'Análise',
      duration: '15-30s',
      description: 'Template rápido para análise diária de ativos',
      thumbnail: '📊',
      color: 'from-blue-500 to-blue-600',
      features: ['Gráfico animado', 'Ticker ao vivo', 'Legendas automáticas']
    },
    {
      id: 2,
      name: 'Notícia Express',
      category: 'Notícias',
      duration: '10-20s',
      description: 'Breaking news do mercado financeiro',
      thumbnail: '⚡',
      color: 'from-red-500 to-red-600',
      features: ['Banner de urgência', 'Countdown timer', 'Logo marca d\'água']
    },
    {
      id: 3,
      name: 'Tutorial Investimentos',
      category: 'Education',
      duration: '30-60s',
      description: 'Ensine estratégias e conceitos',
      thumbnail: '🎓',
      color: 'from-purple-500 to-purple-600',
      features: ['Animações didáticas', 'Infográficos', 'Call-to-action']
    },
    {
      id: 4,
      name: 'Portfolio em Destaque',
      category: 'Portfolio',
      duration: '20-40s',
      description: 'Mostre seus investimentos e performance',
      thumbnail: '💼',
      color: 'from-green-500 to-green-600',
      features: ['Gráfico de pizza', 'Rentabilidade', 'Comparação']
    },
    {
      id: 5,
      name: 'Top 5 Ações',
      category: 'Ranking',
      duration: '25-45s',
      description: 'Lista com as melhores do dia/semana',
      thumbnail: '🏆',
      color: 'from-yellow-500 to-orange-600',
      features: ['Animação de ranking', 'Logos empresas', 'Variação %']
    },
    {
      id: 6,
      name: 'Comparação de Ativos',
      category: 'Análise',
      duration: '20-35s',
      description: 'Compare dois ativos lado a lado',
      thumbnail: '⚖️',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Split screen', 'Charts sincronizados', 'Métricas']
    }
  ];

  // Biblioteca de assets
  const musicLibrary = [
    { id: 1, name: 'Upbeat Market', duration: '30s', mood: 'Energético', genre: 'Electronic' },
    { id: 2, name: 'Professional Flow', duration: '45s', mood: 'Profissional', genre: 'Corporate' },
    { id: 3, name: 'Success Vibes', duration: '30s', mood: 'Motivacional', genre: 'Pop' },
    { id: 4, name: 'Tech Insights', duration: '60s', mood: 'Moderno', genre: 'Tech House' }
  ];

  const textStyles = [
    { id: 1, name: 'Bold Impact', style: 'font-black text-4xl', example: 'BOLD' },
    { id: 2, name: 'Clean Modern', style: 'font-medium text-2xl', example: 'Modern' },
    { id: 3, name: 'Elegant Serif', style: 'font-serif text-3xl', example: 'Elegant' },
    { id: 4, name: 'Tech Mono', style: 'font-mono text-xl', example: 'Tech' }
  ];

  const filterEffects = [
    { id: 1, name: 'Vibrant', color: 'saturate-150' },
    { id: 2, name: 'Warm', color: 'sepia' },
    { id: 3, name: 'Cool', color: 'hue-rotate-180' },
    { id: 4, name: 'B&W', color: 'grayscale' }
  ];

  const transitions = [
    { id: 1, name: 'Fade', icon: '○' },
    { id: 2, name: 'Slide', icon: '→' },
    { id: 3, name: 'Zoom', icon: '⊕' },
    { id: 4, name: 'Wipe', icon: '▭' }
  ];

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Bulls Video Studio</h1>
              <p className="text-slate-400 text-xs">Crie vídeos profissionais em minutos</p>
            </div>
          </div>
          {selectedTemplate && (
            <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-700">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'templates'
                ? 'text-green-400 border-b-2 border-green-400 bg-slate-700/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'editor'
                ? 'text-green-400 border-b-2 border-green-400 bg-slate-700/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Scissors className="w-4 h-4 inline mr-2" />
            Editor
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'library'
                ? 'text-green-400 border-b-2 border-green-400 bg-slate-700/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Biblioteca
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Templates Pro</h2>
                  <p className="text-white/90 text-sm">Especialmente criados para mercado financeiro</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                Each template is optimised for engagement and comes with animations, charts and effects ready.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setActiveTab('editor');
                  }}
                  className="bg-slate-800 rounded-2xl overflow-hidden hover:ring-2 ring-green-500 transition group"
                >
                  <div className={`h-32 bg-gradient-to-br ${template.color} flex items-center justify-center relative`}>
                    <span className="text-6xl">{template.thumbnail}</span>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-white text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">{template.name}</h3>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-slate-700 text-green-400 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Video */}
            <button
              onClick={() => {
                setSelectedTemplate({ id: 'custom', name: 'Vídeo Customizado' });
                setActiveTab('editor');
              }}
              className="w-full bg-slate-800 border-2 border-dashed border-slate-600 rounded-2xl p-6 hover:border-green-500 hover:bg-slate-700 transition group"
            >
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-green-500 mx-auto mb-2" />
              <p className="text-white font-semibold mb-1">Começar do Zero</p>
              <p className="text-slate-400 text-sm">Faça upload do seu vídeo e edite livremente</p>
            </button>
          </div>
        )}

        {/* Editor Tab */}
        {activeTab === 'editor' && (
          <div className="h-full flex flex-col">
            {/* Preview Area */}
            <div className="bg-black aspect-video flex items-center justify-center relative">
              {selectedTemplate ? (
                <div className={`w-full h-full bg-gradient-to-br ${selectedTemplate.color || 'from-slate-700 to-slate-800'} flex items-center justify-center`}>
                  <span className="text-8xl">{selectedTemplate.thumbnail || '🎬'}</span>
                  
                  {/* Sample overlays */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-xl">
                    <p className="text-white font-bold text-sm">PETR4</p>
                    <p className="text-green-400 font-bold text-lg">+2.34%</p>
                  </div>

                  <div className="absolute bottom-20 left-0 right-0 text-center">
                    <p className="text-white font-bold text-2xl drop-shadow-lg">Análise Completa</p>
                    <p className="text-white/90 text-sm drop-shadow-lg">Assista até o final!</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 font-semibold">Selecione um template ou faça upload</p>
                </div>
              )}

              {/* Play button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-slate-900" />
                ) : (
                  <Play className="w-8 h-8 text-slate-900 ml-1" />
                )}
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-slate-800 border-t border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{Math.floor(currentTime)}s</span>
                    <span>{duration}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Timeline tracks */}
              <div className="space-y-2">
                <div className="bg-slate-700 rounded-lg p-2 flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-400" />
                  <div className="flex-1 h-8 bg-blue-600/30 border border-blue-500 rounded"></div>
                </div>
                <div className="bg-slate-700 rounded-lg p-2 flex items-center gap-2">
                  <Type className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 h-8 bg-yellow-600/30 border border-yellow-500 rounded"></div>
                </div>
                <div className="bg-slate-700 rounded-lg p-2 flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <div className="flex-1 h-8 bg-purple-600/30 border border-purple-500 rounded"></div>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="bg-slate-800 border-t border-slate-700 p-4 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                <button className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Cortar
                </button>
                <button className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Texto
                </button>
                <button className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Música
                </button>
                <button className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Filtros
                </button>
                <button className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Charts
                </button>
                <button className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Tickers
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="p-4 space-y-6">
            {/* Música */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  Music Library
                </h3>
                <button className="text-green-400 text-sm font-semibold">Ver todas</button>
              </div>
              <div className="space-y-2">
                {musicLibrary.map((music) => (
                  <div
                    key={music.id}
                    className="w-full bg-slate-800 rounded-xl p-3 hover:bg-slate-700 transition group flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold">{music.name}</p>
                      <p className="text-slate-400 text-xs">{music.mood} • {music.genre} • {music.duration}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center transition">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Estilos de Texto */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Type className="w-5 h-5 text-yellow-400" />
                  Estilos de Texto
                </h3>
                <button className="text-green-400 text-sm font-semibold">Ver todos</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {textStyles.map((style) => (
                  <button
                    key={style.id}
                    className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition hover:ring-2 ring-green-500"
                  >
                    <p className={`text-white ${style.style} mb-2`}>{style.example}</p>
                    <p className="text-slate-400 text-xs">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  Filtros & Efeitos
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {filterEffects.map((filter) => (
                  <button
                    key={filter.id}
                    className="aspect-square bg-slate-800 rounded-xl hover:ring-2 ring-green-500 transition relative overflow-hidden group"
                  >
                    <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 ${filter.color}`}></div>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <p className="text-white text-xs font-semibold">{filter.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transições */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Transições
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {transitions.map((transition) => (
                  <button
                    key={transition.id}
                    className="aspect-square bg-slate-800 rounded-xl hover:ring-2 ring-green-500 transition flex flex-col items-center justify-center"
                  >
                    <span className="text-3xl mb-1">{transition.icon}</span>
                    <p className="text-white text-xs font-semibold">{transition.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Elements especiais para mercado */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Elementos Financeiros
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition hover:ring-2 ring-green-500">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Gráfico de Linha</p>
                </button>
                <button className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition hover:ring-2 ring-green-500">
                  <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Gráfico de Barras</p>
                </button>
                <button className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition hover:ring-2 ring-green-500">
                  <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Ticker Animado</p>
                </button>
                <button className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition hover:ring-2 ring-green-500">
                  <Zap className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Alerta Flash</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions (when template selected) */}
      {selectedTemplate && (
        <div className="bg-slate-800 border-t border-slate-700 p-4 flex gap-2">
          <button className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-slate-600 transition">
            Save Rascunho
          </button>
          <button className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Export Video
          </button>
        </div>
      )}
    </div>
  );
};

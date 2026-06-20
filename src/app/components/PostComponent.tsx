import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, BarChart3, TrendingUp, TrendingDown, ChevronRight, Eye, DollarSign, Target, Activity, Award, Building2, Briefcase } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

export const Post = ({ 
  author, 
  role, 
  time, 
  content, 
  image, 
  likes, 
  comments, 
  type = 'analysis',
  companyLogo,
  onAuthorClick,
  onCommentClick,
  onShareClick,
  onCompanyDetailsClick,
  onNewsReadMoreClick,
  onEducationStartClick,
  // Props para notícias
  newsTitle,
  category,
  readTime,
  // Props para educação
  eduTopic,
  eduLevel,
  eduCategory,
  // Props para análises
  ticker,
  recommendation,
  targetPrice,
  currentPrice,
  // Props para empresas
  companyName,
  companyMetrics,
  announcement
}) => {
  const { t } = useLocale();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Post de News
  if (type === 'news') {
    return (
      <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border-l-4 border-purple-600">
        {/* Header do Post */}
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-purple-50 to-purple-100/50">
          <button 
            onClick={onAuthorClick}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-purple-600 shadow-md"
          >
            {companyLogo || author[0]}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">🔴 {t('post.news_badge')}</span>
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded border border-purple-200">{category}</span>
              <span className="bg-white text-purple-600 text-xs font-semibold px-2 py-1 rounded">✓ {t('post.verified')}</span>
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-500">{time} • {readTime} {t('post.readingTime')} • 📰 {t('post.press')}</p>
          </div>
          <button 
            onClick={() => setSaved(!saved)}
            className="text-slate-400 hover:text-purple-600 transition"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-purple-600 text-purple-600' : ''}`} />
          </button>
        </div>

        {/* Título da News */}
        <div className="px-4 pt-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{newsTitle}</h2>
        </div>

        {/* Resumo */}
        <div className="px-4 pb-3">
          <p className="text-slate-700 leading-relaxed text-base">{content}</p>
        </div>

        {/* Imagem (se houver) */}
        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden relative shadow-md">
              <img
                src={image}
                alt={newsTitle}
                className="w-full h-auto object-cover"
              />
              <button
                onClick={onNewsReadMoreClick}
                className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-bold text-purple-700 shadow-md flex items-center gap-2 hover:bg-white hover:shadow-lg transition cursor-pointer"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {t('post.readMore')}
              </button>
              <div className="absolute bottom-3 left-3 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white">
                📸 Foto ilustrativa
              </div>
            </div>
          </div>
        )}

        {/* Tags Relacionadas */}
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">#Market</span>
          <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">#Breaking</span>
          <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">#Economia</span>
        </div>

        {/* Statistics */}
        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {liked ? likes + 1 : likes}
            </span>
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {comments}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              2.4K
            </span>
          </div>
          <span className="text-xs font-semibold text-purple-600">Trending 🔥</span>
        </div>

        {/* Ações */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            <span className="text-sm font-semibold">Curtir</span>
          </button>
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Comentar</span>
          </button>
          <button 
            onClick={onShareClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Compartilhar</span>
          </button>
        </div>
      </div>
    );
  }

  // Post de Education
  if (type === 'education') {
    const levelColors = {
      'Iniciante': 'bg-green-100 text-green-700 border-green-300',
      'Intermediário': 'bg-orange-100 text-orange-700 border-orange-300',
      'Avançado': 'bg-red-100 text-red-700 border-red-300'
    };

    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl shadow-md mb-4 overflow-hidden border-2 border-orange-300">
        {/* Header do Post */}
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl bg-white shadow-md border-2 border-orange-200">
            📚
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">📚 EDUCAÇÃO</span>
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded border border-orange-300">{eduCategory}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded border ${levelColors[eduLevel]}`}>
                {eduLevel === 'Iniciante' && '🌱 '}
                {eduLevel === 'Intermediário' && '📈 '}
                {eduLevel === 'Avançado' && '🎯 '}
                {eduLevel}
              </span>
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-600">{time} • {readTime} de leitura • 🎓 Aprenda</p>
          </div>
          <button 
            onClick={() => setSaved(!saved)}
            className="text-slate-400 hover:text-orange-600 transition"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-orange-600 text-orange-600' : ''}`} />
          </button>
        </div>

        {/* Título do Tópico */}
        <div className="px-4 pb-2">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{eduTopic}</h2>
        </div>

        {/* Descrição */}
        <div className="px-4 pb-3">
          <p className="text-slate-700 leading-relaxed text-base">{content}</p>
        </div>

        {/* O que você vai aprender */}
        <div className="px-4 pb-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-orange-200">
            <p className="text-xs font-bold text-orange-800 mb-2">📋 O que você vai aprender:</p>
            <ul className="space-y-1 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Conceitos fundamentais explicados de forma simples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Real market practical examples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Dicas para aplicar no seu dia a dia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Imagem/Ilustração */}
        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden relative shadow-md border-2 border-orange-300">
              <img
                src={image}
                alt={eduTopic}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2 shadow-md">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">100% Gratuito</span>
              </div>
              <div className="absolute top-3 right-3 bg-orange-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white">
                {readTime}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Ação Principal */}
        <div className="px-4 pb-3">
          <button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2" onClick={onEducationStartClick}>
            <Award className="w-5 h-5" />
            <span>Start Learning Now</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-600 bg-white/70 border-t border-orange-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {liked ? likes + 1 : likes}
            </span>
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {comments}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              3.2K
            </span>
          </div>
          <span className="text-xs font-semibold text-orange-600">👥 Popular</span>
        </div>

        {/* Ações */}
        <div className="px-4 py-3 bg-white border-t border-orange-200 flex items-center justify-between">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            <span className="text-sm font-semibold">Curtir</span>
          </button>
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Comentar</span>
          </button>
          <button 
            onClick={onShareClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Compartilhar</span>
          </button>
        </div>
      </div>
    );
  }

  // Post de Analysis
  if (type === 'analysis') {
    const upside = targetPrice && currentPrice ? (((targetPrice - currentPrice) / currentPrice) * 100).toFixed(2) : null;
    const recommendationColors = {
      'COMPRA FORTE': 'bg-green-600 text-white border-green-700',
      'COMPRA': 'bg-green-500 text-white border-green-600',
      'MANTER': 'bg-yellow-500 text-white border-yellow-600',
      'VENDA': 'bg-red-500 text-white border-red-600',
      'VENDA FORTE': 'bg-red-600 text-white border-red-700'
    };

    return (
      <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border-l-4 border-green-600">
        {/* Header do Post */}
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <button 
            onClick={onAuthorClick}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-green-600 shadow-md"
          >
            {companyLogo || author[0]}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">📊 ANÁLISE</span>
              {ticker && (
                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded border border-slate-900">{ticker}</span>
              )}
              {recommendation && (
                <span className={`text-xs font-bold px-3 py-1 rounded border shadow-sm ${recommendationColors[recommendation]}`}>
                  {recommendation}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-500">{role} • {time} • 📈 Analysis Técnica</p>
          </div>
          <button 
            onClick={() => setSaved(!saved)}
            className="text-slate-400 hover:text-green-600 transition"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-green-600 text-green-600' : ''}`} />
          </button>
        </div>

        {/* Indicadores de Preço (se existir análise detalhada) */}
        {ticker && currentPrice && targetPrice && (
          <div className="px-4 pt-3 pb-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Preço Atual
                </p>
                <p className="text-lg font-bold text-slate-900">€ {currentPrice.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Preço Alvo
                </p>
                <p className="text-lg font-bold text-green-600">€ {targetPrice.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Upside
                </p>
                <p className="text-lg font-bold text-green-600">+{upside}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-slate-700 leading-relaxed text-base">{content}</p>
        </div>

        {/* Imagem (se houver) */}
        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden relative shadow-md">
              <img
                src={image}
                alt="Analysis"
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-bold text-green-700 shadow-md">
                📊 Gráfico de Analysis
              </div>
              <div className="absolute top-3 right-3 bg-green-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white">
                Técnica
              </div>
            </div>
          </div>
        )}

        {/* Pontos-chave da Analysis */}
        <div className="px-4 pb-3">
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <p className="text-xs font-bold text-green-800 mb-2">🎯 Pontos-chave da análise:</p>
            <ul className="space-y-1 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">▪</span>
                <span>Volume above average in the last 5 sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">▪</span>
                <span>RSI indicates growing buying pressure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">▪</span>
                <span>Rompimento de resistência importante confirmado</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Statistics */}
        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {liked ? likes + 1 : likes}
            </span>
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {comments}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              1.8K
            </span>
          </div>
          <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            High confidence
          </span>
        </div>

        {/* Ações */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            <span className="text-sm font-semibold">Curtir</span>
          </button>
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Comentar</span>
          </button>
          <button 
            onClick={onShareClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Compartilhar</span>
          </button>
        </div>
      </div>
    );
  }

  // Post de Company
  if (type === 'company') {
    return (
      <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border-l-4 border-blue-600">
        {/* Header do Post */}
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-blue-50 to-sky-50">
          <button 
            onClick={onAuthorClick}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-blue-600 shadow-md"
          >
            {companyLogo || author[0]}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">🏢 EMPRESA</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded border border-blue-200 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Oficial
              </span>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                ✓ Verified
              </span>
            </div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              {author}
              <span className="text-blue-600">•</span>
            </h3>
            <p className="text-xs text-slate-500">{role} • {time} • 💼 Comunicado</p>
          </div>
          <button 
            onClick={() => setSaved(!saved)}
            className="text-slate-400 hover:text-blue-600 transition"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-blue-600 text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Tipo de Anúncio */}
        {announcement && (
          <div className="px-4 pt-3">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-bold">{announcement}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-slate-700 leading-relaxed text-base font-medium">{content}</p>
        </div>

        {/* Métricas da Company (se houver) */}
        {companyMetrics && (
          <div className="px-4 pb-3">
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Indicadores Financeiros - Q4 2025
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-slate-600 mb-1">Receita</p>
                  <p className="text-lg font-bold text-slate-900">{companyMetrics.revenue}</p>
                  <p className="text-xs text-green-600 font-semibold">{companyMetrics.revenueGrowth}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-slate-600 mb-1">EBITDA</p>
                  <p className="text-lg font-bold text-slate-900">{companyMetrics.ebitda}</p>
                  <p className="text-xs text-green-600 font-semibold">{companyMetrics.ebitdaGrowth}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Imagem (se houver) */}
        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden relative shadow-md border border-blue-200">
              <img
                src={image}
                alt={companyName}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-bold text-blue-700 shadow-md flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                Comunicado Oficial
              </div>
              <div className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white">
                📊 Institucional
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="px-4 pb-3">
          <button className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2" onClick={onCompanyDetailsClick}>
            <DollarSign className="w-5 h-5" />
            <span>Ver Detalhes da Company</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {liked ? likes + 1 : likes}
            </span>
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {comments}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              5.1K
            </span>
          </div>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Oficial
          </span>
        </div>

        {/* Ações */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            <span className="text-sm font-semibold">Curtir</span>
          </button>
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Comentar</span>
          </button>
          <button 
            onClick={onShareClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Compartilhar</span>
          </button>
        </div>
      </div>
    );
  }
  
  // Post Normal (outros tipos)
  return (
    <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
      {/* Header do Post */}
      <div className="p-4 flex items-start gap-3">
        <button 
          onClick={onAuthorClick}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-green-600"
        >
          {companyLogo || author[0]}
        </button>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900">{author}</h3>
          <p className="text-xs text-slate-500">{role} • {time}</p>
        </div>
        <button 
          onClick={() => setSaved(!saved)}
          className="text-slate-400"
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-green-600 text-green-600' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-slate-700 leading-relaxed">{content}</p>
      </div>

      {/* Imagem (se houver) */}
      {image && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={image}
              alt="Post"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-slate-500">
        <div className="flex gap-3">
          <span>{liked ? likes + 1 : likes} likes</span>
          {comments > 0 && <span>{comments} comments</span>}
        </div>
        <span>1.2K views</span>
      </div>

      {/* Ações */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <button 
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-slate-600'}`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
          <span className="text-sm font-semibold">Curtir</span>
        </button>
        <button 
          onClick={onCommentClick}
          className="flex items-center gap-2 text-slate-600"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Comentar</span>
        </button>
        <button 
          onClick={onShareClick}
          className="flex items-center gap-2 text-slate-600"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Compartilhar</span>
        </button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, BarChart3, TrendingUp, TrendingDown, ChevronRight, Eye, DollarSign, Target, Activity, Award, Building2, Briefcase, MoreVertical, Flag, X } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { ReportModal } from './ReportModal';

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
  // post id for reporting
  id,
  authorUsername,
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
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // ─── Menu de opções (3 pontinhos) ─────────────────────────
  const PostMenu = ({ accentColor = 'text-slate-600' }: { accentColor?: string }) => (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition"
      >
        <MoreVertical className={`w-5 h-5 ${accentColor}`} />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-200 z-50 w-44 overflow-hidden">
            <button
              onClick={() => { setShowMenu(false); setShowReport(true); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left"
            >
              <Flag className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">Report</span>
            </button>
            <button
              onClick={() => { setShowMenu(false); setSaved(!saved); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{saved ? 'Unsave' : 'Save'}</span>
            </button>
            <button
              onClick={() => { setShowMenu(false); onShareClick?.(); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Share</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ─── Action bar (reutilizado em todos os tipos) ────────────
  const ActionBar = ({ borderColor = 'border-slate-100' }: { borderColor?: string }) => (
    <div className={`px-4 py-3 border-t ${borderColor} flex items-center justify-between`}>
      <button
        onClick={() => setLiked(!liked)}
        className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
      >
        <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
        <span className="text-sm font-semibold">Like</span>
      </button>
      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Comment</span>
      </button>
      <button
        onClick={onShareClick}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-semibold">Share</span>
      </button>
    </div>
  );

  // ─── Report Modal (shared across all post types) ───────────
  const ReportModalWrapper = () => showReport ? (
    <ReportModal
      targetType="post"
      targetId={id || 'unknown'}
      targetName={authorUsername ? `@${authorUsername}'s post` : 'this post'}
      onClose={() => setShowReport(false)}
    />
  ) : null;

  // ── NEWS ───────────────────────────────────────────────────
  if (type === 'news') {
    return (
      <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border-l-4 border-purple-600">
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-purple-50 to-purple-100/50">
          <button onClick={onAuthorClick} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-purple-600 shadow-md flex-shrink-0">
            {companyLogo || author?.[0]}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">🔴 NEWS</span>
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded border border-purple-200">{category}</span>
              <span className="bg-white text-purple-600 text-xs font-semibold px-2 py-1 rounded">✓ Verified</span>
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-500">{time} • {readTime} min read</p>
          </div>
          <PostMenu accentColor="text-purple-600" />
        </div>

        <div className="px-4 pt-4">
          <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{newsTitle}</h2>
        </div>
        <div className="px-4 pb-3">
          <p className="text-slate-700 leading-relaxed">{content}</p>
        </div>
        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden relative shadow-md">
              <img src={image} alt={newsTitle} className="w-full h-auto object-cover" />
              <button onClick={onNewsReadMoreClick} className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-bold text-purple-700 shadow-md flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Read more
              </button>
            </div>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{liked ? likes + 1 : likes}</span>
            {comments > 0 && <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{comments}</span>}
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />2.4K</span>
          </div>
          <span className="text-xs font-semibold text-purple-600">Trending 🔥</span>
        </div>
        <ActionBar />
        <ReportModalWrapper />
      </div>
    );
  }

  // ── EDUCATION ──────────────────────────────────────────────
  if (type === 'education') {
    const levelColors: Record<string, string> = {
      'Iniciante': 'bg-green-100 text-green-700 border-green-300',
      'Beginner':  'bg-green-100 text-green-700 border-green-300',
      'Intermediário': 'bg-orange-100 text-orange-700 border-orange-300',
      'Intermediate':  'bg-orange-100 text-orange-700 border-orange-300',
      'Avançado':  'bg-red-100 text-red-700 border-red-300',
      'Advanced':  'bg-red-100 text-red-700 border-red-300',
    };

    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl shadow-md mb-4 overflow-hidden border-2 border-orange-300">
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl bg-white shadow-md border-2 border-orange-200 flex-shrink-0">📚</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">📚 EDUCATION</span>
              {eduCategory && <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded border border-orange-300">{eduCategory}</span>}
              {eduLevel && <span className={`text-xs font-semibold px-2 py-1 rounded border ${levelColors[eduLevel] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>{eduLevel}</span>}
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-600">{time} • {readTime} read</p>
          </div>
          <PostMenu accentColor="text-orange-600" />
        </div>

        {eduTopic && <div className="px-4 pb-2"><h2 className="text-xl font-bold text-slate-900 leading-tight">{eduTopic}</h2></div>}
        <div className="px-4 pb-3"><p className="text-slate-700 leading-relaxed">{content}</p></div>

        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden relative shadow-md border-2 border-orange-300">
              <img src={image} alt={eduTopic} className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

        <div className="px-4 pb-3">
          <button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2" onClick={onEducationStartClick}>
            <Award className="w-5 h-5" />
            Start Learning
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-600 bg-white/70 border-t border-orange-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{liked ? likes + 1 : likes}</span>
            {comments > 0 && <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{comments}</span>}
          </div>
          <span className="text-xs font-semibold text-orange-600">👥 Popular</span>
        </div>
        <ActionBar borderColor="border-orange-200" />
        <ReportModalWrapper />
      </div>
    );
  }

  // ── ANALYSIS ───────────────────────────────────────────────
  if (type === 'analysis') {
    const upside = targetPrice && currentPrice ? (((targetPrice - currentPrice) / currentPrice) * 100).toFixed(2) : null;
    const recommendationColors: Record<string, string> = {
      'STRONG BUY': 'bg-green-600 text-white border-green-700',
      'BUY':        'bg-green-500 text-white border-green-600',
      'HOLD':       'bg-yellow-500 text-white border-yellow-600',
      'SELL':       'bg-red-500 text-white border-red-600',
      'STRONG SELL':'bg-red-600 text-white border-red-700',
      'COMPRA FORTE':'bg-green-600 text-white border-green-700',
      'COMPRA':     'bg-green-500 text-white border-green-600',
      'MANTER':     'bg-yellow-500 text-white border-yellow-600',
      'VENDA':      'bg-red-500 text-white border-red-600',
    };

    return (
      <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border-l-4 border-green-600">
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <button onClick={onAuthorClick} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-green-600 shadow-md flex-shrink-0">
            {companyLogo || author?.[0]}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">📊 ANALYSIS</span>
              {ticker && <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded">${ticker}</span>}
              {recommendation && <span className={`text-xs font-bold px-3 py-1 rounded border shadow-sm ${recommendationColors[recommendation] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>{recommendation}</span>}
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-500">{role} • {time}</p>
          </div>
          <PostMenu accentColor="text-green-600" />
        </div>

        {ticker && currentPrice && targetPrice && (
          <div className="px-4 pt-3 pb-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Current Price</p>
                <p className="text-lg font-bold text-slate-900">€ {currentPrice.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                <p className="text-xs text-slate-600 mb-1">Target Price</p>
                <p className="text-lg font-bold text-green-600">€ {targetPrice.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                <p className="text-xs text-slate-600 mb-1">Upside</p>
                <p className="text-lg font-bold text-green-600">+{upside}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pt-4 pb-3"><p className="text-slate-700 leading-relaxed">{content}</p></div>

        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden shadow-md">
              <img src={image} alt="Analysis chart" className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{liked ? likes + 1 : likes}</span>
            {comments > 0 && <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{comments}</span>}
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />1.8K</span>
          </div>
          <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />High confidence</span>
        </div>
        <ActionBar />
        <ReportModalWrapper />
      </div>
    );
  }

  // ── COMPANY ────────────────────────────────────────────────
  if (type === 'company') {
    return (
      <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border-l-4 border-blue-600">
        <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-blue-50 to-sky-50">
          <button onClick={onAuthorClick} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-blue-600 shadow-md flex-shrink-0">
            {companyLogo || author?.[0]}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">🏢 COMPANY</span>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">✓ Verified</span>
            </div>
            <h3 className="font-bold text-slate-900">{author}</h3>
            <p className="text-xs text-slate-500">{role} • {time}</p>
          </div>
          <PostMenu accentColor="text-blue-600" />
        </div>

        {announcement && (
          <div className="px-4 pt-3">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-bold">{announcement}</span>
            </div>
          </div>
        )}

        <div className="px-4 pt-4 pb-3"><p className="text-slate-700 leading-relaxed font-medium">{content}</p></div>

        {companyMetrics && (
          <div className="px-4 pb-3">
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Financial Highlights</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-slate-600 mb-1">Revenue</p>
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

        {image && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden shadow-md border border-blue-200">
              <img src={image} alt={companyName} className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

        <div className="px-4 pb-3">
          <button className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2" onClick={onCompanyDetailsClick}>
            <DollarSign className="w-5 h-5" />
            <span>View Company Details</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{liked ? likes + 1 : likes}</span>
            {comments > 0 && <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{comments}</span>}
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />5.1K</span>
          </div>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1"><Building2 className="w-3 h-3" />Official</span>
        </div>
        <ActionBar borderColor="border-slate-100" />
        <ReportModalWrapper />
      </div>
    );
  }

  // ── DEFAULT ────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <button onClick={onAuthorClick} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-green-600 flex-shrink-0">
          {companyLogo || author?.[0]}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900">{author}</h3>
          <p className="text-xs text-slate-500">{role} • {time}</p>
        </div>
        <PostMenu />
      </div>

      <div className="px-4 pb-3"><p className="text-slate-700 leading-relaxed">{content}</p></div>

      {image && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img src={image} alt="Post" className="w-full h-auto object-cover" />
          </div>
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between text-sm text-slate-500">
        <div className="flex gap-3">
          <span>{liked ? likes + 1 : likes} likes</span>
          {comments > 0 && <span>{comments} comments</span>}
        </div>
        <span>1.2K views</span>
      </div>

      <ActionBar />
      <ReportModalWrapper />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, RefreshCw, BookOpen, TrendingUp, TrendingDown,
  AlertCircle, Loader2, Zap, Sun, Copy, Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useBullsBrief } from '../../hooks/useBullsBrief';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Markdown renderer ────────────────────────────────────────
const renderMarkdown = (text: string, isDark: boolean) => {
  const textColor  = isDark ? 'text-slate-200' : 'text-slate-700';
  const headColor  = isDark ? 'text-white'     : 'text-slate-900';
  const boldColor  = isDark ? 'text-white'     : 'text-slate-900';
  const bulletColor = 'text-amber-500';
  const divider    = isDark ? 'border-white/8' : 'border-slate-200';

  const lines = text.split('\n');
  const output: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      if (output.length > 0) output.push(<div key={`div-${i}`} className={`border-t my-4 ${divider}`} />);
      output.push(
        <h2 key={i} className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${bulletColor}`}>
          <span className="w-1 h-4 rounded-full bg-amber-500 flex-shrink-0" />
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      const content = line.slice(2);
      const parts = content.split(/\*\*(.*?)\*\*/g);
      output.push(
        <div key={i} className={`flex gap-2 text-sm leading-relaxed mb-1 ${textColor}`}>
          <span className={`${bulletColor} flex-shrink-0 mt-0.5`}>•</span>
          <span>
            {parts.map((p, j) =>
              j % 2 === 1
                ? <strong key={j} className={`font-bold ${boldColor}`}>{p}</strong>
                : <span key={j}>{p}</span>
            )}
          </span>
        </div>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      output.push(
        <p key={i} className={`text-sm font-bold mt-3 mb-1 ${boldColor}`}>
          {line.replace(/\*\*/g, '')}
        </p>
      );
    } else if (line.trim() === '') {
      // skip blank lines between list items, they're cosmetic
    } else {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      output.push(
        <p key={i} className={`text-sm leading-relaxed mb-1 ${textColor}`}>
          {parts.map((p, j) =>
            j % 2 === 1
              ? <strong key={j} className={`font-bold ${boldColor}`}>{p}</strong>
              : <span key={j}>{p}</span>
          )}
        </p>
      );
    }
    i++;
  }
  return output;
};

// ─── Loading skeleton ─────────────────────────────────────────
const BriefSkeleton = ({ isDark }: { isDark: boolean }) => {
  const pulse = isDark ? 'bg-white/10' : 'bg-slate-200';
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3, 4].map(n => (
        <div key={n}>
          <div className={`h-3 w-32 rounded mb-3 ${pulse}`} />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex gap-2 mb-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-400/50`} />
              <div className={`flex-1 h-3 rounded ${pulse}`} style={{ width: `${70 + Math.random() * 25}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Greeting ─────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: '☀️' };
  if (h < 17) return { text: 'Good afternoon', icon: '🌤️' };
  return { text: 'Good evening', icon: '🌙' };
};

// ─── Main screen ──────────────────────────────────────────────
export const BullsBriefScreen = ({ onBack }: { onBack: () => void }) => {
  const { brief, loading, error, generate, clearCache } = useBullsBrief();
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const g = greeting();

  useEffect(() => {
    generate();
  }, []);

  const handleRefresh = () => {
    clearCache();
    generate(true);
  };

  const handleCopy = () => {
    if (brief?.raw) {
      navigator.clipboard.writeText(brief.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Theme tokens
  const bg         = isDark ? 'bg-[#080f1a]'  : 'bg-slate-50';
  const headerBg   = isDark ? 'bg-[#0a1220] border-white/6'  : 'bg-white border-slate-200';
  const cardBg     = isDark ? 'bg-[#0f1923] border-white/6'  : 'bg-white border-slate-200';
  const textPrim   = isDark ? 'text-white'     : 'text-slate-900';
  const textSub    = isDark ? 'text-slate-500' : 'text-slate-400';
  const metaBg     = isDark ? 'bg-white/5'     : 'bg-slate-100';

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg}`}>

      {/* ── Header ── */}
      <div className={`flex-shrink-0 border-b ${headerBg}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${textSub}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className={`font-bold text-sm ${textPrim}`}>BullsBrief</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className={`text-[10px] ${textSub}`}>Morning Intel</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {brief && (
              <button onClick={handleCopy} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${textSub}`}>
                {copied ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <button onClick={handleRefresh} disabled={loading} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${textSub}`}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Greeting banner ── */}
        <div className={`mx-4 mt-4 mb-3 rounded-2xl px-4 py-3 flex items-center gap-3 ${
          isDark ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-700/30'
                 : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
        }`}>
          <span className="text-2xl">{g.icon}</span>
          <div>
            <p className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{g.text}!</p>
            {brief?.date && (
              <p className={`text-xs ${isDark ? 'text-amber-500/70' : 'text-amber-600'}`}>{brief.date}</p>
            )}
          </div>
          {brief?.generatedAt && (
            <div className={`ml-auto text-right`}>
              <p className={`text-[10px] ${textSub}`}>Generated</p>
              <p className={`text-[10px] font-semibold ${textSub}`}>
                {new Date(brief.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="px-4 pb-6">

          {/* Error */}
          {error && !loading && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl border mb-4 ${
              isDark ? 'bg-red-900/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Couldn't generate brief</p>
                <p className="text-xs mt-0.5 opacity-80">{error}</p>
                <button onClick={() => generate(true)} className="mt-2 text-xs font-bold underline">Try again</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className={`border rounded-2xl p-5 ${cardBg}`}>
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                <p className={`text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Generating your morning brief…
                </p>
              </div>
              <BriefSkeleton isDark={isDark} />
            </div>
          )}

          {/* Brief content */}
          {brief && !loading && (
            <div className={`border rounded-2xl p-5 ${cardBg}`}>
              {renderMarkdown(brief.raw, isDark)}

              {/* Meta row */}
              <div className={`flex items-center justify-between mt-5 pt-4 border-t ${isDark ? 'border-white/6' : 'border-slate-200'}`}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full bg-amber-500`} />
                  <span className={`text-[10px] ${textSub}`}>Powered by BullsAI</span>
                </div>
                <button
                  onClick={() => setShowRaw(v => !v)}
                  className={`flex items-center gap-1 text-[10px] ${textSub} hover:opacity-70 transition`}
                >
                  Raw
                  {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showRaw && (
                <pre className={`mt-3 text-[10px] leading-relaxed whitespace-pre-wrap p-3 rounded-xl overflow-x-auto ${
                  isDark ? 'bg-black/30 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {brief.raw}
                </pre>
              )}
            </div>
          )}

          {/* Empty state */}
          {!brief && !loading && !error && (
            <div className="text-center py-16">
              <BookOpen className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              <p className={`font-semibold ${textSub}`}>No brief yet</p>
              <button
                onClick={() => generate(true)}
                className="mt-4 px-6 py-3 bg-amber-500 text-white rounded-full font-bold text-sm hover:bg-amber-400 transition"
              >
                Generate Morning Brief
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

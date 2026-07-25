import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Send, Sparkles, RefreshCw, TrendingUp, TrendingDown,
  ChevronRight, Wallet, AlertCircle, Loader2, Copy, Check,
} from 'lucide-react';
import { useBullsAI, AIMessage } from '../../hooks/useBullsAI';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useSubscription } from '../../hooks/useSubscription';

// ─── Suggested prompts ────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '📊', label: 'Analyze my portfolio', prompt: 'Can you analyze my current portfolio and tell me how it looks overall?' },
  { icon: '⚠️', label: 'Biggest risks', prompt: 'What are the biggest risks in my portfolio right now?' },
  { icon: '🔁', label: 'Rebalancing ideas', prompt: 'Should I rebalance my portfolio? What would you suggest?' },
  { icon: '📈', label: 'Best performer', prompt: 'Which asset in my portfolio has the best momentum right now?' },
  { icon: '💡', label: 'Next investment', prompt: 'Based on my current holdings, what type of asset should I consider adding next?' },
  { icon: '🛡️', label: 'Hedge my portfolio', prompt: 'How can I hedge my portfolio against a market downturn?' },
];

// ─── Markdown-lite renderer ───────────────────────────────────
const renderContent = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} className="font-bold text-white">{part}</strong>
        : <span key={j}>{part}</span>
    );

    if (line.startsWith('## ')) {
      return <p key={i} className="font-bold text-green-400 text-sm mt-2 mb-1">{line.slice(3)}</p>;
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 text-sm leading-relaxed">
          <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
          <span>{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-bold text-white">{part}</strong> : <span key={j}>{part}</span>)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return <p key={i} className="text-sm leading-relaxed">{rendered}</p>;
  });
};

// ─── Message bubble ───────────────────────────────────────────
const MessageBubble = ({ msg }: { msg: AIMessage }) => {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[82%] ${isAI ? '' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isAI
            ? 'bg-[#1a2332] border border-white/8 text-slate-200 rounded-tl-sm'
            : 'bg-green-600 text-white rounded-tr-sm'
        }`}>
          {isAI
            ? <div className="space-y-0.5">{renderContent(msg.content)}</div>
            : <p className="text-sm leading-relaxed">{msg.content}</p>
          }
        </div>

        <div className={`flex items-center gap-2 mt-1 px-1 ${isAI ? '' : 'justify-end'}`}>
          <span className="text-[10px] text-slate-600">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isAI && (
            <button onClick={handleCopy} className="text-slate-600 hover:text-slate-400 transition">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
    <div className="bg-[#1a2332] border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-green-500"
            style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Portfolio mini card ──────────────────────────────────────
const PortfolioContext = ({ onClose }: { onClose: () => void }) => {
  const { assets, getPortfolioSummary } = usePortfolio();
  const summary = getPortfolioSummary();
  const pnlPositive = summary.profit >= 0;

  if (assets.length === 0) return null;

  return (
    <div className="mx-4 mb-3 bg-[#0f1923] border border-green-900/50 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-semibold text-green-400">Portfolio context loaded</span>
        </div>
        <button onClick={onClose} className="text-slate-600 text-xs hover:text-slate-400">hide</button>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>{assets.length} assets</span>
        <span>·</span>
        <span className={`font-semibold flex items-center gap-0.5 ${pnlPositive ? 'text-green-400' : 'text-red-400'}`}>
          {pnlPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {pnlPositive ? '+' : ''}{summary.profitPercentage.toFixed(2)}%
        </span>
        <span>·</span>
        <span className="text-slate-500 truncate">
          {assets.slice(0, 3).map(a => a.code).join(', ')}{assets.length > 3 ? ` +${assets.length - 3}` : ''}
        </span>
      </div>
    </div>
  );
};

// ─── Main screen ──────────────────────────────────────────────
export const BullsAIScreen = ({ onBack }: { onBack: () => void }) => {
  const { messages, loading, error, sendMessage, clearChat } = useBullsAI();
  const { currentPlan } = useSubscription() as any;
  const [input, setInput] = useState('');
  const [showContext, setShowContext] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setShowSuggestions(false);
    await sendMessage(text);
  };

  const handleSuggestion = (prompt: string) => {
    setShowSuggestions(false);
    sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onlyWelcome = messages.length === 1 && messages[0].id === 'welcome';

  return (
    <div className="h-screen flex flex-col bg-[#080f1a] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-[#0a1220] border-b border-white/6 px-4 pt-safe">
        <div className="flex items-center justify-between py-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">BullsAI</span>
                <span className="text-[9px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  {currentPlan === 'business' ? 'Business' : currentPlan === 'premium' ? 'Premium' : currentPlan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-slate-500">Personal Investment Advisor</span>
              </div>
            </div>
          </div>

          <button onClick={clearChat} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition text-slate-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Portfolio context bar ── */}
      {showContext && <PortfolioContext onClose={() => setShowContext(false)} />}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Suggestions — only on first view */}
        {onlyWelcome && showSuggestions && (
          <div className="pt-2">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-3 px-1">
              Suggested questions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.prompt}
                  onClick={() => handleSuggestion(s.prompt)}
                  className="flex items-center gap-2 bg-[#111c2b] border border-white/6 rounded-xl px-3 py-2.5 text-left hover:border-green-700/50 hover:bg-[#0f1e2e] transition group"
                >
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition leading-snug">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 bg-[#0a1220] border-t border-white/6 px-4 py-3 pb-safe">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-[#111c2b] border border-white/8 rounded-2xl px-4 py-3 focus-within:border-green-700/60 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio, markets, strategies…"
              rows={1}
              className="w-full bg-transparent text-slate-200 text-sm placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed max-h-32"
              style={{ height: 'auto' }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 128) + 'px';
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition ${
              input.trim() && !loading
                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/40'
                : 'bg-[#111c2b] border border-white/8'
            }`}
          >
            {loading
              ? <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-2">
          BullsAI can make mistakes. Verify before investing.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

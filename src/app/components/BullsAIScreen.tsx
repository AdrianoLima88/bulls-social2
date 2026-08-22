import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Send, Sparkles, RefreshCw, TrendingUp, TrendingDown,
  AlertCircle, Loader2, Copy, Check, Paperclip, Image, Video,
  FileText, X, Sun, Moon, Mic,
} from 'lucide-react';
import { useBullsAI, AIMessage } from '../../hooks/useBullsAI';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useSubscription } from '../../hooks/useSubscription';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Suggested prompts ────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '📊', label: 'Analyze my portfolio', prompt: 'Can you analyze my current portfolio and tell me how it looks overall?' },
  { icon: '⚠️', label: 'Biggest risks', prompt: 'What are the biggest risks in my portfolio right now?' },
  { icon: '🔁', label: 'Rebalancing ideas', prompt: 'Should I rebalance my portfolio? What would you suggest?' },
  { icon: '📈', label: 'Best performer', prompt: 'Which asset in my portfolio has the best momentum right now?' },
  { icon: '💡', label: 'Next investment', prompt: 'Based on my current holdings, what type of asset should I consider adding next?' },
  { icon: '🛡️', label: 'Hedge my portfolio', prompt: 'How can I hedge my portfolio against a market downturn?' },
];

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url?: string;
}

// ─── Markdown-lite renderer ───────────────────────────────────
const renderContent = (text: string, isDark: boolean) => {
  const textColor = isDark ? 'text-slate-200' : 'text-slate-800';
  const boldColor = isDark ? 'text-white' : 'text-slate-900';
  const accentColor = 'text-green-600';
  const bulletColor = 'text-green-500';

  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} className={`font-bold ${boldColor}`}>{part}</strong>
        : <span key={j}>{part}</span>
    );

    if (line.startsWith('## ')) {
      return <p key={i} className={`font-bold ${accentColor} text-sm mt-2 mb-1`}>{line.slice(3)}</p>;
    }
    if (line.startsWith('- ')) {
      const lineParts = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return (
        <div key={i} className={`flex gap-2 text-sm leading-relaxed ${textColor}`}>
          <span className={`${bulletColor} mt-0.5 flex-shrink-0`}>•</span>
          <span>{lineParts.map((p, j) => j % 2 === 1 ? <strong key={j} className={`font-bold ${boldColor}`}>{p}</strong> : <span key={j}>{p}</span>)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return <p key={i} className={`text-sm leading-relaxed ${textColor}`}>{rendered}</p>;
  });
};

// ─── Attachment chip ──────────────────────────────────────────
const AttachmentChip = ({ att, onRemove, isDark }: { att: Attachment; onRemove: () => void; isDark: boolean }) => {
  const icons = { image: Image, video: Video, document: FileText };
  const Icon = icons[att.type];
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
      isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'
    }`}>
      <Icon className="w-3 h-3" />
      <span className="max-w-[80px] truncate">{att.name}</span>
      <button onClick={onRemove} className="opacity-60 hover:opacity-100 transition">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// ─── Message bubble ───────────────────────────────────────────
const MessageBubble = ({ msg, isDark }: { msg: AIMessage; isDark: boolean }) => {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aiBg = isDark ? 'bg-[#1a2332] border border-white/8' : 'bg-slate-100 border border-slate-200';
  const timeColor = isDark ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[82%] ${isAI ? '' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isAI ? `${aiBg} rounded-tl-sm` : 'bg-green-600 text-white rounded-tr-sm'
        }`}>
          {isAI
            ? <div className="space-y-0.5">{renderContent(msg.content, isDark)}</div>
            : <p className="text-sm leading-relaxed text-white">{msg.content}</p>
          }
        </div>

        <div className={`flex items-center gap-2 mt-1 px-1 ${isAI ? '' : 'justify-end'}`}>
          <span className={`text-[10px] ${timeColor}`}>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isAI && (
            <button onClick={handleCopy} className={`transition ${timeColor} hover:text-green-500`}>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────
const TypingIndicator = ({ isDark }: { isDark: boolean }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${isDark ? 'bg-[#1a2332] border border-white/8' : 'bg-slate-100 border border-slate-200'}`}>
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-green-500"
            style={{ animation: `aiDotBounce 1.2s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Portfolio context bar ────────────────────────────────────
const PortfolioContext = ({ onClose, isDark }: { onClose: () => void; isDark: boolean }) => {
  const { assets, getPortfolioSummary } = usePortfolio();
  const summary = getPortfolioSummary();
  const pnlPositive = summary.profit >= 0;

  if (assets.length === 0) return null;

  const bg = isDark ? 'bg-[#0f1923] border-green-900/50' : 'bg-green-50 border-green-200';
  const labelColor = isDark ? 'text-green-400' : 'text-green-700';
  const metaColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`mx-4 mb-3 border rounded-2xl p-3 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span className={`text-xs font-semibold ${labelColor}`}>Portfolio context loaded</span>
        </div>
        <button onClick={onClose} className={`text-xs ${metaColor} hover:opacity-70 transition`}>hide</button>
      </div>
      <div className={`flex items-center gap-3 text-xs ${metaColor}`}>
        <span>{assets.length} assets</span>
        <span>·</span>
        <span className={`font-semibold flex items-center gap-0.5 ${pnlPositive ? 'text-green-600' : 'text-red-500'}`}>
          {pnlPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {pnlPositive ? '+' : ''}{summary.profitPercentage.toFixed(2)}%
        </span>
        <span>·</span>
        <span className="truncate">
          {assets.slice(0, 3).map(a => a.code).join(', ')}{assets.length > 3 ? ` +${assets.length - 3}` : ''}
        </span>
      </div>
    </div>
  );
};

// ─── Attachment menu ──────────────────────────────────────────
const AttachMenu = ({
  onSelect, onClose, isDark,
}: {
  onSelect: (type: 'image' | 'video' | 'document', file: File) => void;
  onClose: () => void;
  isDark: boolean;
}) => {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const handleFile = (type: 'image' | 'video' | 'document', file: File) => {
    onSelect(type, file);
    onClose();
  };

  const bg = isDark ? 'bg-[#1a2332] border border-white/10' : 'bg-white border border-slate-200';
  const itemHover = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50';
  const textColor = isDark ? 'text-slate-200' : 'text-slate-700';

  return (
    <div className={`absolute bottom-full left-0 mb-2 rounded-2xl shadow-xl overflow-hidden ${bg} min-w-[160px]`}>
      {[
        { type: 'image' as const, icon: Image, label: 'Photo', accept: 'image/*', ref: imgRef, color: 'text-blue-500' },
        { type: 'video' as const, icon: Video, label: 'Video', accept: 'video/*', ref: vidRef, color: 'text-purple-500' },
        { type: 'document' as const, icon: FileText, label: 'Document', accept: '.pdf,.doc,.docx,.txt,.csv,.xlsx', ref: docRef, color: 'text-amber-500' },
      ].map(item => (
        <button
          key={item.type}
          onClick={() => item.ref.current?.click()}
          className={`w-full flex items-center gap-3 px-4 py-3 transition ${itemHover}`}
        >
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <span className={`text-sm font-medium ${textColor}`}>{item.label}</span>
          <input
            ref={item.ref}
            type="file"
            accept={item.accept}
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(item.type, f); }}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Main screen ──────────────────────────────────────────────
export const BullsAIScreen = ({ onBack }: { onBack: () => void }) => {
  const { messages, loading, error, sendMessage, clearChat } = useBullsAI();
  const { currentPlan } = useSubscription() as any;
  const { isDark, setTheme, theme } = useTheme();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const [showContext, setShowContext] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const addAttachment = (type: Attachment['type'], file: File) => {
    const att: Attachment = {
      id: `att_${Date.now()}`,
      name: file.name,
      type,
      url: type === 'image' ? URL.createObjectURL(file) : undefined,
    };
    setAttachments(prev => [...prev, att]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = async () => {
    const text = input.trim();
    const attText = attachments.length > 0
      ? `\n\n[Attachments: ${attachments.map(a => `${a.name} (${a.type})`).join(', ')}]`
      : '';
    if (!text && attachments.length === 0) return;
    if (loading) return;
    setInput('');
    setAttachments([]);
    setShowSuggestions(false);
    await sendMessage(text + attText);
  };

  const handleSuggestion = (prompt: string) => {
    setShowSuggestions(false);
    sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const onlyWelcome = messages.length === 1 && messages[0].id === 'welcome';

  // Theme-aware colors
  const bg = isDark ? 'bg-[#080f1a]' : 'bg-white';
  const headerBg = isDark ? 'bg-[#0a1220] border-white/6' : 'bg-white border-slate-200';
  const inputAreaBg = isDark ? 'bg-[#0a1220] border-white/6' : 'bg-white border-slate-200';
  const inputFieldBg = isDark ? 'bg-[#111c2b] border-white/8' : 'bg-slate-100 border-slate-200';
  const inputText = isDark ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400';
  const subtleText = isDark ? 'text-slate-500' : 'text-slate-400';
  const planLabel = isDark ? 'text-slate-500' : 'text-slate-400';
  const suggBg = isDark ? 'bg-[#111c2b] border-white/6 hover:border-green-700/50 hover:bg-[#0f1e2e]' : 'bg-slate-50 border-slate-200 hover:border-green-400 hover:bg-green-50';
  const suggText = isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-green-700';
  const errorBg = isDark ? 'bg-red-900/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600';
  const sectionLabel = isDark ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg}`}>

      {/* ── Header ── */}
      <div className={`flex-shrink-0 border-b ${headerBg}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>BullsAI</span>
                <span className="text-[9px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  {currentPlan === 'business' ? 'Business' : currentPlan === 'premium' ? 'Premium' : currentPlan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className={`text-[10px] ${planLabel}`}>Personal Investment Advisor</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}
              title={isDark ? 'Switch to light' : 'Switch to dark'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={clearChat} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Appearance selector */}
        <div className="flex items-center gap-1 px-4 pb-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition capitalize ${
                theme === t
                  ? 'bg-green-600 text-white'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Portfolio context bar ── */}
      {showContext && <PortfolioContext onClose={() => setShowContext(false)} isDark={isDark} />}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} isDark={isDark} />
        ))}

        {loading && <TypingIndicator isDark={isDark} />}

        {error && (
          <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${errorBg}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Suggestions */}
        {onlyWelcome && showSuggestions && (
          <div className="pt-2">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 px-1 ${sectionLabel}`}>
              Suggested questions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.prompt}
                  onClick={() => handleSuggestion(s.prompt)}
                  className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-left transition group ${suggBg}`}
                >
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <span className={`text-xs transition leading-snug ${suggText}`}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className={`flex-shrink-0 border-t px-4 py-3 ${inputAreaBg}`}>
        {/* Attachments row */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map(att => (
              <AttachmentChip key={att.id} att={att} onRemove={() => removeAttachment(att.id)} isDark={isDark} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowAttachMenu(v => !v)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition ${
                showAttachMenu
                  ? 'bg-green-600 border-green-600 text-white'
                  : isDark
                    ? 'border-white/10 text-slate-400 hover:border-green-600 hover:text-green-500'
                    : 'border-slate-200 text-slate-400 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            {showAttachMenu && (
              <AttachMenu
                onSelect={(type, file) => addAttachment(type, file)}
                onClose={() => setShowAttachMenu(false)}
                isDark={isDark}
              />
            )}
          </div>

          {/* Text input */}
          <div className={`flex-1 border rounded-2xl px-4 py-3 transition ${inputFieldBg} focus-within:border-green-500`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio, markets, strategies…"
              rows={1}
              className={`w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed max-h-32 ${inputText}`}
              style={{ height: 'auto' }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 128) + 'px';
              }}
            />
          </div>

          {/* Mic button (voice-to-text) */}
          <button
            onClick={toggleListen}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${
              isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                : isDark
                  ? 'bg-[#111c2b] border border-white/8 hover:bg-[#1a2b3c]'
                  : 'bg-slate-100 border border-slate-200 hover:bg-green-100'
            }`}
            title={isListening ? 'Stop recording' : 'Voice input'}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-green-600'}`} />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${
              (input.trim() || attachments.length > 0) && !loading
                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20'
                : isDark ? 'bg-[#111c2b] border border-white/8' : 'bg-slate-100 border border-slate-200'
            }`}
          >
            {loading
              ? <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
              : <Send className={`w-4 h-4 ${(input.trim() || attachments.length > 0) ? 'text-white' : subtleText}`} />
            }
          </button>
        </div>

        <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
          BullsAI can make mistakes. Verify before investing.
        </p>
      </div>

      <style>{`
        @keyframes aiDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

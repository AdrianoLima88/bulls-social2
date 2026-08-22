import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Send, Sparkles, Plus, TrendingUp, TrendingDown,
  AlertCircle, Loader2, Copy, Check, Paperclip, Image, Video,
  FileText, X, Sun, Moon, Mic, Trash2, MessageSquare, ChevronRight,
  Clock, MoreHorizontal,
} from 'lucide-react';
import { useBullsAI, type AIMessage, type Conversation } from '../../hooks/useBullsAI';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useSubscription } from '../../hooks/useSubscription';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '📊', label: 'Analyze my portfolio', prompt: 'Can you analyze my current portfolio and tell me how it looks overall?' },
  { icon: '⚠️', label: 'Biggest risks', prompt: 'What are the biggest risks in my portfolio right now?' },
  { icon: '🔁', label: 'Rebalancing ideas', prompt: 'Should I rebalance my portfolio? What would you suggest?' },
  { icon: '📈', label: 'Best performer', prompt: 'Which asset in my portfolio has the best momentum right now?' },
  { icon: '💡', label: 'Next investment', prompt: 'Based on my current holdings, what type of asset should I consider adding next?' },
  { icon: '🛡️', label: 'Hedge my portfolio', prompt: 'How can I hedge my portfolio against a market downturn?' },
];

// ─── Attachment ───────────────────────────────────────────────────────────────
interface Attachment { id: string; name: string; type: 'image' | 'video' | 'document'; url?: string; }

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
const renderContent = (text: string, isDark: boolean) => {
  const textColor = isDark ? 'text-slate-200' : 'text-slate-800';
  const boldColor = isDark ? 'text-white' : 'text-slate-900';
  const accentColor = 'text-green-600';

  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className={`font-bold ${boldColor}`}>{part}</strong> : <span key={j}>{part}</span>
    );
    if (line.startsWith('## ')) return <p key={i} className={`font-bold ${accentColor} text-sm mt-2 mb-1`}>{line.slice(3)}</p>;
    if (line.startsWith('- ')) {
      const lp = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return (
        <div key={i} className={`flex gap-2 text-sm leading-relaxed ${textColor}`}>
          <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
          <span>{lp.map((p, j) => j % 2 === 1 ? <strong key={j} className={`font-bold ${boldColor}`}>{p}</strong> : <span key={j}>{p}</span>)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return <p key={i} className={`text-sm leading-relaxed ${textColor}`}>{rendered}</p>;
  });
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isDark }: { msg: AIMessage; isDark: boolean }) => {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';
  const handleCopy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const aiBg = isDark ? 'bg-[#1a2332] border border-white/8' : 'bg-slate-100 border border-slate-200';
  const timeColor = isDark ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 mt-1 shadow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] ${isAI ? '' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl ${isAI ? `${aiBg} rounded-tl-sm` : 'bg-green-600 text-white rounded-tr-sm'}`}>
          {isAI
            ? <div className="space-y-0.5">{renderContent(msg.content, isDark)}</div>
            : <p className="text-sm leading-relaxed text-white">{msg.content}</p>
          }
        </div>
        <div className={`flex items-center gap-2 mt-1 px-1 ${isAI ? '' : 'justify-end'}`}>
          <span className={`text-[10px] ${timeColor}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = ({ isDark }: { isDark: boolean }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${isDark ? 'bg-[#1a2332] border border-white/8' : 'bg-slate-100 border border-slate-200'}`}>
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-green-500" style={{ animation: `aiDotBounce 1.2s ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Portfolio context pill ───────────────────────────────────────────────────
const PortfolioContext = ({ isDark }: { isDark: boolean }) => {
  const { assets, getPortfolioSummary } = usePortfolio();
  const [shown, setShown] = useState(true);
  const summary = getPortfolioSummary();
  if (assets.length === 0 || !shown) return null;
  const pos = summary.profit >= 0;
  const bg = isDark ? 'bg-[#0f1923] border-green-900/50' : 'bg-green-50 border-green-200';
  const lbl = isDark ? 'text-green-400' : 'text-green-700';
  const meta = isDark ? 'text-slate-400' : 'text-slate-500';
  return (
    <div className={`mx-4 mb-3 border rounded-2xl p-3 ${bg}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span className={`text-xs font-semibold ${lbl}`}>Portfolio loaded</span>
        </div>
        <button onClick={() => setShown(false)} className={`text-xs ${meta} hover:opacity-70`}>hide</button>
      </div>
      <div className={`flex items-center gap-2 text-xs ${meta}`}>
        <span>{assets.length} assets</span>·
        <span className={`font-semibold flex items-center gap-0.5 ${pos ? 'text-green-600' : 'text-red-500'}`}>
          {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {pos ? '+' : ''}{summary.profitPercentage.toFixed(2)}%
        </span>·
        <span className="truncate">{assets.slice(0, 3).map(a => a.code).join(', ')}{assets.length > 3 ? ` +${assets.length - 3}` : ''}</span>
      </div>
    </div>
  );
};

// ─── Attach menu ──────────────────────────────────────────────────────────────
const AttachMenu = ({ onSelect, onClose, isDark }: {
  onSelect: (type: Attachment['type'], file: File) => void;
  onClose: () => void; isDark: boolean;
}) => {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const handle = (type: Attachment['type'], f: File) => { onSelect(type, f); onClose(); };
  const bg = isDark ? 'bg-[#1a2332] border border-white/10' : 'bg-white border border-slate-200';
  const hover = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50';
  const tc = isDark ? 'text-slate-200' : 'text-slate-700';
  return (
    <div className={`absolute bottom-full left-0 mb-2 rounded-2xl shadow-xl overflow-hidden ${bg} min-w-[160px]`}>
      {[
        { type: 'image' as const, icon: Image, label: 'Photo', accept: 'image/*', ref: imgRef, color: 'text-blue-500' },
        { type: 'video' as const, icon: Video, label: 'Video', accept: 'video/*', ref: vidRef, color: 'text-purple-500' },
        { type: 'document' as const, icon: FileText, label: 'Document', accept: '.pdf,.doc,.docx,.txt,.csv,.xlsx', ref: docRef, color: 'text-amber-500' },
      ].map(item => (
        <button key={item.type} onClick={() => item.ref.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 transition ${hover}`}>
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <span className={`text-sm font-medium ${tc}`}>{item.label}</span>
          <input ref={item.ref} type="file" accept={item.accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handle(item.type, f); }} />
        </button>
      ))}
    </div>
  );
};

// ─── Relative time ────────────────────────────────────────────────────────────
const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// ─── Conversation list item ───────────────────────────────────────────────────
const ConvItem = ({
  conv, isDark, onSelect, onDelete,
}: {
  conv: Conversation; isDark: boolean;
  onSelect: () => void; onDelete: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const preview = conv.messages.filter(m => m.role === 'user')[0]?.content.slice(0, 80) || conv.title;

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
        isDark ? 'hover:bg-white/4' : 'hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isDark ? 'bg-white/8' : 'bg-slate-100'
      }`}>
        <MessageSquare className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{conv.title}</p>
        <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{preview}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{relativeTime(conv.updatedAt)}</span>
        <button
          onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
          className={`w-6 h-6 flex items-center justify-center rounded-lg transition opacity-0 group-hover:opacity-100 ${
            isDark ? 'hover:bg-white/10 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
      {showMenu && (
        <div className={`absolute right-4 top-10 z-50 rounded-xl shadow-xl border overflow-hidden min-w-[130px] ${
          isDark ? 'bg-[#1a2332] border-white/10' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50/10 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Input bar (shared between home & chat) ───────────────────────────────────
const InputBar = ({
  isDark, inputFieldBg, inputText, subtleText,
  input, setInput, loading, attachments, setAttachments,
  onSend, onSuggestion, isHome = false,
}: {
  isDark: boolean; inputFieldBg: string; inputText: string; subtleText: string;
  input: string; setInput: React.Dispatch<React.SetStateAction<string>>; loading: boolean;
  attachments: Attachment[]; setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  onSend: () => void; onSuggestion?: (p: string) => void; isHome?: boolean;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    recognitionRef.current = r;
    r.lang = 'en-US';
    r.interimResults = false;
    r.onresult = (e: any) => setInput(prev => prev ? `${prev} ${e.results[0][0].transcript}` : e.results[0][0].transcript);
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.start();
    setIsListening(true);
  };

  const addAttachment = (type: Attachment['type'], file: File) => {
    setAttachments(prev => [...prev, { id: `att_${Date.now()}`, name: file.name, type, url: type === 'image' ? URL.createObjectURL(file) : undefined }]);
  };

  const canSend = (input.trim() || attachments.length > 0) && !loading;

  return (
    <div className={`flex-shrink-0 px-4 pt-3 pb-4 ${isHome ? '' : `border-t ${isDark ? 'border-white/6 bg-[#0a1220]' : 'border-slate-200 bg-white'}`}`}>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map(a => (
            <div key={a.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              {a.type === 'image' ? <Image className="w-3 h-3" /> : a.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              <span className="max-w-[80px] truncate">{a.name}</span>
              <button onClick={() => setAttachments(prev => prev.filter(x => x.id !== a.id))} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}

      <div className={`flex items-end gap-2 rounded-2xl border px-3 py-2 transition ${inputFieldBg} focus-within:border-green-500`}>
        {/* Attach */}
        <div className="relative flex-shrink-0 self-end mb-0.5">
          <button onClick={() => setShowAttachMenu(v => !v)} className={`w-8 h-8 flex items-center justify-center rounded-xl transition ${showAttachMenu ? 'text-green-500' : subtleText} hover:text-green-500`}>
            <Paperclip className="w-4 h-4" />
          </button>
          {showAttachMenu && <AttachMenu onSelect={addAttachment} onClose={() => setShowAttachMenu(false)} isDark={isDark} />}
        </div>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={isHome ? "Ask BullsAI anything about markets, your portfolio…" : "Message BullsAI…"}
          rows={1}
          className={`flex-1 bg-transparent text-sm resize-none focus:outline-none leading-relaxed max-h-32 py-1.5 ${inputText}`}
          onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 128) + 'px'; }}
        />

        {/* Mic */}
        <button onClick={toggleListen} className={`w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 self-end mb-0.5 transition ${isListening ? 'text-red-500 animate-pulse' : subtleText + ' hover:text-green-500'}`}>
          <Mic className="w-4 h-4" />
        </button>

        {/* Send */}
        <button onClick={onSend} disabled={!canSend}
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end mb-0.5 transition ${canSend ? 'bg-green-600 hover:bg-green-500 shadow shadow-green-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          {loading
            ? <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
            : <Send className={`w-4 h-4 ${canSend ? 'text-white' : subtleText}`} />
          }
        </button>
      </div>

      <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
        BullsAI can make mistakes. Verify before investing.
      </p>
    </div>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export const BullsAIScreen = ({ onBack }: { onBack: () => void }) => {
  const { messages, loading, error, conversations, activeConvId, sendMessage, startNewConversation, loadConversation, deleteConversation } = useBullsAI();
  const { currentPlan } = useSubscription() as any;
  const { isDark, setTheme, theme } = useTheme();

  // 'home' | 'chat'
  const [view, setView] = useState<'home' | 'chat'>(activeConvId ? 'chat' : 'home');
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, view]);

  const handleSend = async () => {
    const text = input.trim();
    const attText = attachments.length > 0 ? `\n\n[Attachments: ${attachments.map(a => `${a.name} (${a.type})`).join(', ')}]` : '';
    if (!text && attachments.length === 0) return;
    if (loading) return;
    setInput('');
    setAttachments([]);
    setView('chat');
    await sendMessage(text + attText);
  };

  const handleSuggestion = (prompt: string) => {
    setView('chat');
    sendMessage(prompt);
  };

  const handleNewChat = () => {
    startNewConversation();
    setInput('');
    setAttachments([]);
    setView('home');
  };

  const handleLoadConv = (id: string) => {
    loadConversation(id);
    setView('chat');
  };

  // Theme-aware tokens
  const bg = isDark ? 'bg-[#080f1a]' : 'bg-white';
  const headerBg = isDark ? 'bg-[#0a1220] border-white/6' : 'bg-white border-slate-200';
  const inputFieldBg = isDark ? 'bg-[#111c2b] border-white/8' : 'bg-slate-100 border-slate-200';
  const inputText = isDark ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400';
  const subtleText = isDark ? 'text-slate-500' : 'text-slate-400';
  const sectionLabel = isDark ? 'text-slate-600' : 'text-slate-400';
  const divider = isDark ? 'border-white/6' : 'border-slate-100';
  const planLabel = currentPlan === 'business' ? 'Business' : currentPlan === 'premium' ? 'Premium' : currentPlan === 'pro' ? 'Pro' : 'Free';

  // ── HOME VIEW ───────────────────────────────────────────────────────────────
  if (view === 'home') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const recentConvs = conversations.slice(0, 10);
    const hasConvs = recentConvs.length > 0;

    return (
      <div className={`h-screen flex flex-col overflow-hidden ${bg}`}>
        {/* Header */}
        <div className={`flex-shrink-0 flex items-center justify-between px-4 py-3 border-b ${headerBg}`}>
          <button onClick={onBack} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>BullsAI</span>
            <span className="text-[9px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">{planLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero section */}
          <div className="px-5 pt-8 pb-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              How can I help you?
            </h1>
            <p className={`text-xs ${sectionLabel}`}>{today}</p>
          </div>

          {/* Input (home version) */}
          <div className="px-0">
            <InputBar
              isDark={isDark} inputFieldBg={`mx-4 ${inputFieldBg}`} inputText={inputText} subtleText={subtleText}
              input={input} setInput={setInput} loading={loading}
              attachments={attachments} setAttachments={setAttachments}
              onSend={handleSend} isHome
            />
          </div>

          {/* Suggested prompts */}
          <div className="px-4 pt-2 pb-4">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${sectionLabel}`}>Suggestions</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.prompt}
                  onClick={() => handleSuggestion(s.prompt)}
                  className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-left transition group ${
                    isDark ? 'bg-[#111c2b] border-white/6 hover:border-green-700/50 hover:bg-[#0f1e2e]' : 'bg-slate-50 border-slate-200 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <span className={`text-xs leading-snug ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-green-700'}`}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation history */}
          {hasConvs && (
            <div className="pb-6">
              <div className={`flex items-center justify-between px-4 mb-1 pt-2 border-t ${divider}`}>
                <div className="flex items-center gap-1.5 py-3">
                  <Clock className={`w-3.5 h-3.5 ${sectionLabel}`} />
                  <p className={`text-xs font-semibold uppercase tracking-wide ${sectionLabel}`}>Recent Conversations</p>
                </div>
              </div>
              <div className={`divide-y ${isDark ? 'divide-white/4' : 'divide-slate-100'}`}>
                {recentConvs.map(conv => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    isDark={isDark}
                    onSelect={() => handleLoadConv(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`@keyframes aiDotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
      </div>
    );
  }

  // ── CHAT VIEW ───────────────────────────────────────────────────────────────
  const activeTitle = conversations.find(c => c.id === activeConvId)?.title;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg}`}>
      {/* Header */}
      <div className={`flex-shrink-0 border-b ${headerBg}`}>
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => setView('home')} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeTitle || 'BullsAI'}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className={`text-[10px] ${subtleText}`}>Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* New chat */}
            <button onClick={handleNewChat} className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition ${subtleText}`} title="New chat">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio bar */}
      <div className="pt-3">
        <PortfolioContext isDark={isDark} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} isDark={isDark} />)}
        {loading && <TypingIndicator isDark={isDark} />}
        {error && (
          <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${isDark ? 'bg-red-900/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <InputBar
        isDark={isDark} inputFieldBg={inputFieldBg} inputText={inputText} subtleText={subtleText}
        input={input} setInput={setInput} loading={loading}
        attachments={attachments} setAttachments={setAttachments}
        onSend={handleSend}
      />

      <style>{`@keyframes aiDotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
};

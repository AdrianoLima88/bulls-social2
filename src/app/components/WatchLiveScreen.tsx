import React, { useState, useEffect, useRef } from 'react';
import {
  X, Users, Heart, Send, Share2, MoreVertical, Volume2, VolumeX,
  Maximize, Minimize, AlertTriangle, BarChart3, Smile, Radio, Lock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFollows } from '../../hooks/useFollows';
import { useLives, type Live } from '../../hooks/useLives';
import { useLiveSession } from '../../hooks/useLiveSession';
import { liveStreamStore } from '../../utils/liveStreamStore';
import { useWebRTCHost, useWebRTCViewer } from '../../hooks/useWebRTCLive';

interface WatchLiveScreenProps {
  live: Live;
  onClose: () => void;
}

export const WatchLiveScreen: React.FC<WatchLiveScreenProps> = ({ live, onClose }) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollows();
  const { endLive } = useLives();

  const isHost = !!user && user.id === live.host_id;

  const {
    messages, viewerCount, likesCount,
    viewerLimit, viewerLimitReached, limitChecked,
    sendMessage, sendLike, deleteMessage,
  } = useLiveSession(live.id, live.host_id, isHost);

  const following = live.host_id ? isFollowing(live.host_id) : false;

  // ── Video refs & streams ──────────────────────────────────────────────────
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localFilter, setLocalFilter] = useState('none');

  useEffect(() => {
    if (!isHost) return;
    const s = liveStreamStore.getStream();
    const f = liveStreamStore.getFilter();
    setLocalFilter(f);
    if (!s) return;
    const attach = () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = s;
        setLocalStream(s);
      } else {
        setTimeout(attach, 50);
      }
    };
    attach();
  }, [isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [rtcState, setRtcState] = useState<RTCPeerConnectionState>('new');

  useWebRTCHost(
    isHost ? live.id : null,
    isHost ? (user?.id ?? null) : null,
    localStream,
  );

  useWebRTCViewer(
    !isHost ? live.id : null,
    !isHost ? (live.host_id ?? null) : null,
    !isHost ? (user?.id ?? null) : null,
    (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    },
    setRtcState,
  );

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  // Orientation detection
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);
  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update); };
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.emoji-picker-container') && !t.closest('.emoji-button')) setShowEmojiPicker(false);
      if (!t.closest('.options-menu-container') && !t.closest('.options-button')) setShowOptionsMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!message.trim()) return;
    const text = message;
    setMessage('');
    await sendMessage(text);
  };

  const handleLike = () => {
    sendLike();
    const id = Date.now();
    setFloatingHearts(prev => [...prev, { id, x: Math.random() * 100 }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 2000);
  };

  const handleReaction = (emoji: string) => {
    const id = Date.now();
    setFloatingReactions(prev => [...prev, { id, emoji, x: Math.random() * 100 }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2000);
  };

  const handleEndLive = async () => {
    if (!confirm('End this live for everyone?')) return;
    liveStreamStore.clear();
    setLocalStream(null);
    await endLive(live.id);
    onClose();
  };

  const liveUrl = `https://bulls.com/live/${live.id}`;
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(liveUrl)
      .then(() => { alert('🔗 Link copied!\n\n' + liveUrl); setShowShareModal(false); })
      .catch(() => { alert('❌ Could not copy.\n\n' + liveUrl); });
  };

  // ── Viewer limit wall ─────────────────────────────────────────────────────
  if (limitChecked && viewerLimitReached && !isHost) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Live is at capacity</h2>
          <p className="text-slate-500 text-sm mb-2">
            Maximum of <span className="font-semibold text-slate-800">{viewerLimit.toLocaleString()} viewers</span> reached.
          </p>
          <p className="text-slate-400 text-xs mb-6">
            The host can unlock up to 500 concurrent viewers with <strong>BullsGo Pro</strong>.
          </p>
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Video element ─────────────────────────────────────────────────────────
  const filterMap: Record<string, string> = {
    grayscale: 'grayscale(100%)', sepia: 'sepia(100%)',
    contrast: 'contrast(150%) saturate(150%)',
    vintage: 'sepia(50%) contrast(120%) brightness(90%)',
    cool: 'hue-rotate(180deg) saturate(120%)',
    warm: 'sepia(30%) saturate(150%) brightness(110%)',
    blur: 'blur(2px)',
  };

  const VideoArea = (
    <div className="relative w-full h-full bg-black">
      {isHost && (
        <video ref={localVideoRef} autoPlay playsInline muted
          className="w-full h-full object-cover"
          style={{ display: localStream ? 'block' : 'none', filter: filterMap[localFilter] || 'none' }}
        />
      )}
      {!isHost && (
        <video ref={remoteVideoRef} autoPlay playsInline
          className="w-full h-full object-cover"
          style={{ display: remoteStream ? 'block' : 'none' }}
        />
      )}
      {/* Fallback thumbnail */}
      {((!isHost && !remoteStream) || (isHost && !localStream)) && (
        <img src={live.host?.avatar_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'}
          alt={live.title} className="w-full h-full object-cover" />
      )}
      {/* Connecting overlay (viewer only) */}
      {!isHost && !remoteStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center">
            <div className={`w-14 h-14 bg-green-600/90 rounded-full flex items-center justify-center mx-auto mb-3 ${rtcState !== 'connected' ? 'animate-pulse' : ''}`}>
              <div className="w-8 h-8 bg-green-500 rounded-full" />
            </div>
            <p className="text-white text-xs font-semibold">
              {rtcState === 'failed' ? 'Could not connect' : 'Connecting...'}
            </p>
          </div>
        </div>
      )}
      {/* Floating likes */}
      {floatingHearts.map(h => (
        <div key={h.id} className="absolute bottom-10 animate-float-up pointer-events-none z-10" style={{ right: `${10 + h.x * 0.2}%` }}>
          <Heart className="w-8 h-8 text-green-500 fill-current drop-shadow-lg" />
        </div>
      ))}
      {floatingReactions.map(r => (
        <div key={r.id} className="absolute bottom-10 animate-float-up pointer-events-none z-10" style={{ left: `${10 + r.x * 0.3}%` }}>
          <span className="text-2xl drop-shadow-lg">{r.emoji}</span>
        </div>
      ))}
    </div>
  );

  // ── Shared top bar ────────────────────────────────────────────────────────
  const TopBar = (
    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur-sm">
      {/* Left: close + host info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button onClick={onClose} className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition flex-shrink-0">
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/30">
          <img src={live.host?.avatar_url || 'https://i.pravatar.cc/150'} alt={live.host?.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold text-xs truncate">{live.host?.name}</p>
          <p className="text-white/60 text-[10px] truncate">{live.title}</p>
        </div>
      </div>

      {/* Center: LIVE + viewers */}
      <div className="flex items-center gap-1.5 flex-shrink-0 mx-2">
        <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-white text-[10px] font-black">LIVE</span>
        </div>
        <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full">
          <Users className="w-3 h-3 text-white" />
          <span className="text-white text-[10px] font-bold">{viewerCount}</span>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => setIsMuted(!isMuted)} className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition">
          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition">
          {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
        </button>
        {isHost ? (
          <button onClick={handleEndLive} className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-black flex items-center gap-1 transition">
            <Radio className="w-3 h-3" /> End Live
          </button>
        ) : (
          <button onClick={() => live.host_id && toggleFollow(live.host_id)}
            className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold transition ${following ? 'bg-white/15 text-white border border-white/30' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
            {following ? 'Following' : 'Follow'}
          </button>
        )}
        <div className="relative options-menu-container">
          <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} className="options-button w-8 h-8 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition">
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
          {showOptionsMenu && (
            <div className="absolute top-10 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden min-w-44 z-50 options-menu-container">
              <button onClick={() => { alert(`👀 ${viewerCount} watching\n❤️ ${likesCount} likes\n💬 ${messages.length} messages`); setShowOptionsMenu(false); }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3">
                <BarChart3 className="w-4 h-4" /> Stats
              </button>
              {!isHost && (
                <button onClick={() => { alert('⚠️ Live reported.'); setShowOptionsMenu(false); }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 border-t border-slate-100">
                  <AlertTriangle className="w-4 h-4" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Chat panel ────────────────────────────────────────────────────────────
  const ChatPanel = (
    <div className="flex flex-col h-full bg-[#18181b]">
      {/* Chat header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-white/8">
        <span className="text-white font-bold text-sm">Live Chat</span>
        <span className="text-[#9ea3b0] text-xs ml-2">❤️ {likesCount}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-[#9ea3b0] text-xs text-center py-4">Be the first to comment!</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2 group">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {msg.author?.avatar_url
                ? <img src={msg.author.avatar_url} alt={msg.author.name} className="w-full h-full object-cover" />
                : <span className="text-white text-[10px] font-bold">{msg.author?.name?.[0] || '?'}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#9ea3b0] text-[10px] font-bold">{msg.author?.name || 'Someone'} </span>
              <span className="text-white text-xs">{msg.message}</span>
            </div>
            {(isHost || msg.user_id === user?.id) && (
              <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-white/70">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Reactions strip */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-t border-white/8 overflow-x-auto scrollbar-none">
        {['🚀', '📈', '💰', '🔥', '💯'].map(e => (
          <button key={e} onClick={() => handleReaction(e)}
            className="flex-shrink-0 w-8 h-8 bg-white/8 hover:bg-white/20 rounded-full flex items-center justify-center transition text-base active:scale-95">
            {e}
          </button>
        ))}
        <div className="w-px h-5 bg-white/15 flex-shrink-0" />
        <button onClick={() => setShowShareModal(true)}
          className="flex-shrink-0 w-8 h-8 bg-white/8 hover:bg-white/20 rounded-full flex items-center justify-center transition active:scale-95">
          <Share2 className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>

      {/* Input row */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 pb-4 pt-2 relative">
        {showEmojiPicker && (
          <div className="emoji-picker-container absolute bottom-full left-3 right-3 mb-2 bg-[#1f1f23] border border-white/10 rounded-xl p-3 z-50 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-bold">Emojis</span>
              <button onClick={() => setShowEmojiPicker(false)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {['😀','😂','🤣','😍','😎','🤔','👍','👏','🔥','💯','🚀','📈','💰','💵','📊','🎯','✅','❌','⚡','💪','🙌','🤝','💡','🎉'].map(e => (
                <button key={e} onClick={() => { setMessage(m => m + e); setShowEmojiPicker(false); }}
                  className="text-lg hover:bg-white/10 rounded-lg p-1 transition">{e}</button>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="emoji-button w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition flex-shrink-0">
          <Smile className="w-4 h-4 text-white/70" />
        </button>
        <input
          type="text" value={message} onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Send a message..."
          className="flex-1 bg-white/8 border border-white/15 text-white placeholder-white/40 px-3 py-2 rounded-full text-sm focus:outline-none focus:border-white/30"
        />
        <button onClick={handleLike} className="w-9 h-9 flex items-center justify-center flex-shrink-0 relative active:scale-95 transition">
          <Heart className={`w-5 h-5 drop-shadow-md ${likesCount > 0 ? 'text-green-400 fill-green-400' : 'text-white/70'}`} />
          {likesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {likesCount > 99 ? '99+' : likesCount}
            </span>
          )}
        </button>
        <button onClick={handleSend} disabled={!message.trim()}
          className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition disabled:opacity-40 flex-shrink-0 active:scale-95">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );

  // ── Share modal ───────────────────────────────────────────────────────────
  const ShareModal = showShareModal && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Share Live</h3>
          <button onClick={() => setShowShareModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
            <X className="w-4 h-4 text-slate-700" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleCopyLink} className="py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-sm">Copy Link</button>
          <button onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(liveUrl)}`, '_blank'); setShowShareModal(false); }}
            className="py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm">Facebook</button>
          <button onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(liveUrl)}&text=${encodeURIComponent(live.title)}`, '_blank'); setShowShareModal(false); }}
            className="py-2.5 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition text-sm">Twitter</button>
          <button onClick={() => setShowShareModal(false)} className="py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition text-sm">Close</button>
        </div>
      </div>
    </div>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  // FULLSCREEN: video takes everything, minimal top bar overlay, chat hidden
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Top bar as overlay */}
        <div className="absolute top-0 inset-x-0 z-20">
          {TopBar}
        </div>
        {/* Full video */}
        <div className="flex-1 relative overflow-hidden">
          {VideoArea}
        </div>
        {/* Exit fullscreen hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20">
            <Minimize className="w-3.5 h-3.5" /> Exit Fullscreen
          </button>
        </div>
        {ShareModal}
      </div>
    );
  }

  // LANDSCAPE: side-by-side (video left 60%, chat right 40%)
  if (isLandscape) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {TopBar}
        <div className="flex flex-1 min-h-0">
          {/* Video (60%) */}
          <div className="flex-[3] relative overflow-hidden">
            {VideoArea}
          </div>
          {/* Chat panel (40%) */}
          <div className="flex-[2] min-w-0 border-l border-white/8 overflow-hidden">
            {ChatPanel}
          </div>
        </div>
        {ShareModal}
      </div>
    );
  }

  // PORTRAIT: video on top (~42%), chat panel below (~58%)
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {TopBar}
      {/* Video — fixed 16:9 ratio */}
      <div className="flex-shrink-0 w-full relative bg-black" style={{ aspectRatio: '16/9' }}>
        {VideoArea}
      </div>
      {/* Chat panel fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {ChatPanel}
      </div>
      {ShareModal}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Heart, Send, Share2, MoreVertical, Volume2, VolumeX, Maximize, Minimize, Settings, AlertTriangle, BarChart3, Smile, Radio } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFollows } from '../../hooks/useFollows';
import { useLives, type Live } from '../../hooks/useLives';
import { useLiveSession } from '../../hooks/useLiveSession';
import { liveStreamStore } from '../../utils/liveStreamStore';

interface WatchLiveScreenProps {
  live: Live;
  onClose: () => void;
}

export const WatchLiveScreen: React.FC<WatchLiveScreenProps> = ({ live, onClose }) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollows();
  const { endLive } = useLives();
  const { messages, viewerCount, likesCount, sendMessage, sendLike, deleteMessage } = useLiveSession(live.id);

  const isHost = !!user && user.id === live.host_id;
  const following = live.host_id ? isFollowing(live.host_id) : false;

  // Local camera stream (only available when this user is the host)
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localFilter, setLocalFilter] = useState('none');

  useEffect(() => {
    if (isHost) {
      const s = liveStreamStore.getStream();
      const f = liveStreamStore.getFilter();
      setLocalStream(s);
      setLocalFilter(f);
      if (s && localVideoRef.current) {
        localVideoRef.current.srcObject = s;
      }
    }
    return () => {
      // Do NOT clear the store here — only clear when the host explicitly ends the live
    };
  }, [isHost]);

  // Attach stream to video element once both are ready
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Screen orientation (portrait/landscape) — the chat layout adapts automatically
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);

  useEffect(() => {
    const updateOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
      if (!target.closest('.options-menu-container') && !target.closest('.options-button')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to the latest message, like any live chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const text = message;
    setMessage('');
    await sendMessage(text);
  };

  const handleLike = () => {
    sendLike();
    const newHeart = { id: Date.now(), x: Math.random() * 100 };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  const handleFollow = () => {
    if (live.host_id) toggleFollow(live.host_id);
  };

  const handleEndLive = async () => {
    if (!confirm('End this live for everyone?')) return;
    liveStreamStore.clear(); // stop camera tracks
    setLocalStream(null);
    await endLive(live.id);
    onClose();
  };

  const copyToClipboard = (text: string) => {
    // Fallback that works across all browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (err) {
      console.error('Error copying:', err);
      textArea.remove();
      return false;
    }
  };

  const liveUrl = `https://bulls.com/live/${live.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(liveUrl)
        .then(() => {
          alert('🔗 Link copied!\n\n' + liveUrl);
          setShowShareModal(false);
        })
        .catch(() => {
          if (copyToClipboard(liveUrl)) {
            alert('🔗 Link copied!\n\n' + liveUrl);
            setShowShareModal(false);
          } else {
            alert('❌ Could not copy the link.\n\nLink: ' + liveUrl);
          }
        });
    } else {
      if (copyToClipboard(liveUrl)) {
        alert('🔗 Link copied!\n\n' + liveUrl);
        setShowShareModal(false);
      } else {
        alert('❌ Could not copy the link.\n\nLink: ' + liveUrl);
      }
    }
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(liveUrl)}`, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(liveUrl)}&text=${encodeURIComponent(live.title)}`, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  const handleShareInstagram = () => {
    if (copyToClipboard(liveUrl)) {
      alert('🔗 Link copied!\n\nInstagram doesn\'t support direct web sharing — open Instagram and paste the link.');
    }
    setShowShareModal(false);
  };

  // Toggle fullscreen — not using the Fullscreen API (blocked inside iframes)
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleReaction = (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 100 };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // Floating chat/comments overlay on top of the video (Instagram Live style).
  // The same content is reused in portrait (anchored at the bottom) and landscape (anchored on the right) —
  // only the outer container changes position/size.
  const chatOverlayContent = (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 mb-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2 animate-slide-in group">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold shadow overflow-hidden">
              {msg.author?.avatar_url ? (
                <img src={msg.author.avatar_url} alt={msg.author.name} className="w-full h-full object-cover" />
              ) : (
                msg.author?.name?.[0] || '?'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs leading-snug break-words drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                <span className="font-bold">{msg.author?.name || 'Someone'}</span>{' '}
                <span className="text-white/90">{msg.message}</span>
              </p>
            </div>
            {(isHost || msg.user_id === user?.id) && (
              <button
                onClick={() => handleDeleteMessage(msg.id)}
                className="opacity-0 group-hover:opacity-100 transition flex-shrink-0 text-white/60 hover:text-white"
                title="Delete message"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick reactions + share */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => handleReaction('🚀')}
          className="flex-shrink-0 w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 active:scale-95 transition"
        >
          <span className="text-base">🚀</span>
        </button>
        <button
          onClick={() => handleReaction('📈')}
          className="flex-shrink-0 w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 active:scale-95 transition"
        >
          <span className="text-base">📈</span>
        </button>
        <button
          onClick={() => handleReaction('💰')}
          className="flex-shrink-0 w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 active:scale-95 transition"
        >
          <span className="text-base">💰</span>
        </button>

        <div className="w-px h-6 bg-white/20 flex-shrink-0" />

        <button
          onClick={() => setShowShareModal(true)}
          className="flex-shrink-0 w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 active:scale-95 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Comment input + like, floating over the video */}
      <div className="flex items-center gap-2 relative">
        {showEmojiPicker && (
          <div className="emoji-picker-container absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-900">Quick Emojis</h4>
              <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {['😀', '😂', '🤣', '😍', '😎', '🤔', '👍', '👏', '🔥', '💯', '🚀', '📈', '💰', '💵', '📊', '🎯', '✅', '❌', '⚡', '💪', '🙌', '🤝', '💡', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessage(message + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:bg-slate-100 rounded-lg p-1 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="emoji-button w-9 h-9 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0 active:scale-95 transition"
        >
          <Smile className="w-4 h-4 text-white" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Add a comment..."
          className="flex-1 bg-white/15 text-white placeholder-white/60 px-4 py-2.5 rounded-full text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20"
        />
        <button
          onClick={handleLike}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition relative"
        >
          <Heart className={`w-5 h-5 text-white drop-shadow-md ${likesCount > 0 ? 'fill-white' : ''}`} />
          {likesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {likesCount > 99 ? '99+' : likesCount}
            </span>
          )}
        </button>
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition disabled:opacity-40 shadow-md flex-shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Video layer — full-bleed, fills the whole screen in portrait or landscape */}
      <div className="absolute inset-0">
        {/* HOST: show real local camera feed */}
        {isHost && localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              filter: (() => {
                const filterMap: Record<string, string> = {
                  grayscale: 'grayscale(100%)',
                  sepia: 'sepia(100%)',
                  contrast: 'contrast(150%) saturate(150%)',
                  vintage: 'sepia(50%) contrast(120%) brightness(90%)',
                  cool: 'hue-rotate(180deg) saturate(120%)',
                  warm: 'sepia(30%) saturate(150%) brightness(110%)',
                  blur: 'blur(2px)',
                };
                return filterMap[localFilter] || 'none';
              })(),
            }}
          />
        ) : (
          /* VIEWER (or host without stream): show avatar/placeholder */
          <img
            src={live.host?.avatar_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'}
            alt={live.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Viewer overlay — shown only to non-hosts */}
        {!isHost && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-3 mx-auto">
                <div className="w-12 h-12 bg-green-600/90 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <p className="text-white text-xs font-semibold drop-shadow-lg">Live in progress</p>
              <p className="text-white/70 text-[10px] mt-1 drop-shadow-md">Join the conversation below!</p>
            </div>
          </div>
        )}

        {/* Floating likes */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute bottom-36 animate-float-up pointer-events-none z-30"
            style={{ right: `${10 + heart.x * 0.2}%` }}
          >
            <Heart className="w-8 h-8 text-green-500 fill-current drop-shadow-lg" />
          </div>
        ))}

        {/* Floating reactions */}
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute bottom-36 animate-float-up pointer-events-none z-30"
            style={{ left: `${10 + reaction.x * 0.3}%` }}
          >
            <span className="text-2xl drop-shadow-lg">{reaction.emoji}</span>
          </div>
        ))}
      </div>

      {/* Floating top bar — close, LIVE badge, viewers, controls */}
      <div className="absolute top-0 inset-x-0 z-30 bg-gradient-to-b from-black/65 via-black/25 to-transparent pt-3 pb-8 px-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/25 transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 bg-green-600 px-2.5 py-1 rounded-full animate-pulse shadow-md">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span className="text-white text-[10px] font-bold">LIVE</span>
            </div>
            <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Users className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-bold">
                {viewerCount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/25 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/25 transition"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
            </button>

            <div className="relative options-menu-container">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="options-button w-8 h-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/25 transition"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>

              {showOptionsMenu && (
                <div className="absolute top-10 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden min-w-48 z-50 options-menu-container">
                  <button
                    onClick={() => {
                      alert('Video quality settings aren\'t available for this simulated preview stream.');
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Video quality
                  </button>
                  <button
                    onClick={() => {
                      alert(`👀 ${viewerCount} watching\n❤️ ${likesCount} likes\n💬 ${messages.length} messages`);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </button>
                  {!isHost && (
                    <button
                      onClick={() => {
                        alert('⚠️ Live reported. Thanks for letting us know.');
                        setShowOptionsMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 border-t border-slate-100"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Host info — directly over the video, no solid card (Instagram style) */}
        <div className="flex items-center gap-2">
          <img
            src={live.host?.avatar_url || 'https://i.pravatar.cc/150'}
            alt={live.host?.name}
            className="w-9 h-9 rounded-full border-2 border-white/80 flex-shrink-0 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-white font-bold text-sm truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{live.host?.name}</p>
              {live.host?.verified && <span className="text-blue-400 text-xs flex-shrink-0">✓</span>}
            </div>
            <p className="text-white/85 text-xs line-clamp-1 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {live.title}
            </p>
          </div>
          {isHost ? (
            <button
              onClick={handleEndLive}
              className="px-3 py-1.5 bg-red-600 text-white rounded-full font-bold text-[11px] hover:bg-red-700 transition flex-shrink-0 flex items-center gap-1"
            >
              <Radio className="w-3 h-3" /> End Live
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`px-3 py-1.5 ${following ? 'bg-white/20 text-white border border-white/40' : 'bg-green-600 text-white'} rounded-full font-bold text-[11px] hover:opacity-90 transition flex-shrink-0`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Floating chat — anchored at the bottom in portrait, side column in landscape */}
      {!isFullscreen && (
        isLandscape ? (
          <div className="absolute top-0 right-0 bottom-0 z-20 w-full sm:w-[380px] flex flex-col justify-end pt-28 pb-4 px-3 bg-gradient-to-l from-black/60 via-black/15 to-transparent pointer-events-none">
            <div className="flex flex-col pointer-events-auto max-h-full">
              {chatOverlayContent}
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end pt-24 pb-4 px-3 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none">
            <div className="flex flex-col pointer-events-auto max-h-[55vh]">
              {chatOverlayContent}
            </div>
          </div>
        )
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 animate-scale-up shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">Share Live</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-slate-600 text-xs mb-3">
                Share this live with your friends!
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  Copy Link
                </button>
                <button
                  onClick={handleShareFacebook}
                  className="py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  Facebook
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="py-2.5 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  Twitter
                </button>
                <button
                  onClick={handleShareInstagram}
                  className="py-2.5 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  Instagram
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

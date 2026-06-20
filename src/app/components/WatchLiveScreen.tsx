import React, { useState, useEffect } from 'react';
import { X, Users, Heart, Send, DollarSign, Share2, MoreVertical, Volume2, VolumeX, Maximize, Minimize, Settings, AlertTriangle, UserPlus, TrendingUp, Coins, Rocket, Ban, Trash2, Clock, Scissors, BarChart3, MessageCircle, Smile } from 'lucide-react';

interface WatchLiveScreenProps {
  live: any;
  onClose: () => void;
}

export const WatchLiveScreen: React.FC<WatchLiveScreenProps> = ({ live, onClose }) => {
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Novos estados para features avançadas
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [showCoHostModal, setShowCoHostModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showClipModal, setShowClipModal] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);
  const [coHosts, setCoHosts] = useState<Array<{ id: number; name: string; username: string; avatar: string; isActive: boolean }>>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  const [liveTheme, setLiveTheme] = useState(() => {
    return localStorage.getItem('liveTheme') || 'dark';
  });

  // Atualiza o tema quando o localStorage muda
  useEffect(() => {
    const handleStorageChange = () => {
      setLiveTheme(localStorage.getItem('liveTheme') || 'dark');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close menus ao clicar fora
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

  const isDark = liveTheme === 'dark';

  // Mock de mensagens do chat
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'João Silva', message: 'Excelente análise! 🚀', timestamp: '14:35' },
    { id: 2, user: 'Maria Santos', message: 'Qual a sua opinião sobre PETR4?', timestamp: '14:36' },
    { id: 3, user: 'Pedro Costa', message: 'Melhor live da semana! 📊', timestamp: '14:37' },
    { id: 4, user: 'Ana Oliveira', message: 'Obrigada pelas dicas!', timestamp: '14:38' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        user: 'Você',
        message: message,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setMessage('');
    }
  };

  const handleLike = () => {
    setLikes(prev => prev + 1);
    // Animação de coração flutuante
    const newHeart = { id: Date.now(), x: Math.random() * 100 };
    setFloatingHearts([...floatingHearts, newHeart]);
    setTimeout(() => {
      setFloatingHearts(floatingHearts.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const copyToClipboard = (text: string) => {
    // Método alternativo que funciona em todos os navegadores
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
      console.error('Erro ao copiar:', err);
      textArea.remove();
      return false;
    }
  };

  const handleCopyLink = () => {
    const liveUrl = `https://bulls.com/live/${live.id}`;
    
    // Tenta o método moderno primeiro, se falhar usa o fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(liveUrl)
        .then(() => {
          alert('🔗 Link copiado!\n\n' + liveUrl);
          setShowShareModal(false);
        })
        .catch(() => {
          // Fallback para o método tradicional
          if (copyToClipboard(liveUrl)) {
            alert('🔗 Link copiado!\n\n' + liveUrl);
            setShowShareModal(false);
          } else {
            alert('❌ Não foi possível copiar o link.\n\nLink: ' + liveUrl);
          }
        });
    } else {
      // Usa direto o método tradicional
      if (copyToClipboard(liveUrl)) {
        alert('🔗 Link copiado!\n\n' + liveUrl);
        setShowShareModal(false);
      } else {
        alert('❌ Não foi possível copiar o link.\n\nLink: ' + liveUrl);
      }
    }
  };

  const handleShareFacebook = () => {
    alert('📘 Compartilhando no Facebook!\n\nEm produção, isso abriria o compartilhamento real do Facebook.');
    setShowShareModal(false);
  };

  const handleShareTwitter = () => {
    alert('🐦 Compartilhando no Twitter!\n\nEm produção, isso abriria o compartilhamento real do Twitter.');
    setShowShareModal(false);
  };

  const handleShareInstagram = () => {
    alert('📸 Compartilhando no Instagram!\n\nEm produção, isso abriria o compartilhamento real do Instagram.');
    setShowShareModal(false);
  };

  // Toggle tela cheia - sem usar Fullscreen API (bloqueada em iframes)
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Reações em tempo real
  const handleReaction = (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 100 };
    setFloatingReactions([...floatingReactions, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  // Co-hosts
  const handleAddCoHost = (username: string) => {
    alert(`🎙️ Convite enviado para ${username}!\n\nEm produção, isso enviaria notificação real via WebSocket.`);
    setShowCoHostModal(false);
  };

  const handleRemoveCoHost = (hostId: number) => {
    setCoHosts(coHosts.filter(h => h.id !== hostId));
    alert('Co-host removido da live!');
  };

  // Moderação
  const handleBanUser = (userId: string) => {
    alert(`🚫 Usuário banido da live!\n\nEm produção, isso bloquearia o usuário via backend.`);
  };

  const handleDeleteMessage = (messageId: number) => {
    setChatMessages(chatMessages.filter(m => m.id !== messageId));
  };

  // Clips
  const handleCreateClip = () => {
    alert(`✂️ Clip criado!\n\nDuração: ${clipEnd - clipStart}s\nHome: ${clipStart}s\nFim: ${clipEnd}s\n\nEm produção, isso processaria o vídeo e salvaria no servidor.`);
    setShowClipModal(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Modo Retrato Compacto */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent p-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white transition shadow-md"
          >
            <X className="w-4 h-4 text-slate-900" />
          </button>

          <div className="flex items-center gap-1.5">
            {/* Badge AO VIVO - Verde */}
            <div className="flex items-center gap-1.5 bg-green-600 px-2.5 py-1 rounded-full animate-pulse shadow-md">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span className="text-white text-[10px] font-bold">AO VIVO</span>
            </div>
            {/* Viewers */}
            <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-md">
              <Users className="w-3 h-3 text-slate-700" />
              <span className="text-slate-900 text-xs font-bold">
                {(live.viewers + likes).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white transition shadow-md"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-900" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-900" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white transition shadow-md"
              title={isFullscreen ? 'Sign out da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-slate-900" />
              ) : (
                <Maximize className="w-4 h-4 text-slate-900" />
              )}
            </button>

            <div className="relative options-menu-container">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="options-button w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white transition shadow-md"
              >
                <MoreVertical className="w-4 h-4 text-slate-900" />
              </button>

              {/* Menu de Opções */}
              {showOptionsMenu && (
                <div className="absolute top-10 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden min-w-48 z-50 options-menu-container">
                  <button
                    onClick={() => {
                      alert('🎬 Abrir configurações de qualidade');
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Qualidade do vídeo
                  </button>
                  <button
                    onClick={() => {
                      alert('📊 Ver estatísticas da live');
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Statistics
                  </button>
                  <button
                    onClick={() => {
                      alert('⚠️ Reportar live');
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 border-t border-slate-100"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Reportar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info do Host - Mais Compacto */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <img
              src={live.host.avatar}
              alt={live.host.name}
              className="w-8 h-8 rounded-full border-2 border-emerald-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-slate-900 font-bold text-xs truncate">{live.host.name}</p>
                {live.host.verified && (
                  <span className="text-blue-500 text-[10px] flex-shrink-0">✓</span>
                )}
              </div>
              <p className="text-slate-900 font-medium text-[11px] line-clamp-1 leading-tight">
                {live.title}
              </p>
            </div>
            <button
              onClick={handleFollow}
              className={`px-3 py-1 ${isFollowing ? 'bg-slate-200 text-slate-700' : 'bg-green-600 text-white'} rounded-full font-bold text-[10px] hover:opacity-90 transition shadow-sm flex-shrink-0`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Area - Modo Retrato 9:16 - TELA LIMPA */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
        <div className="w-full h-full max-w-[56.25vh] mx-auto relative">
          <img
            src={live.thumbnail}
            alt="Live Stream"
            className="w-full h-full object-cover"
          />

          {/* Overlay de "simulação" */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-3 mx-auto">
                <div className="w-12 h-12 bg-green-600/90 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <p className="text-white text-xs font-semibold drop-shadow-lg">Live stream simulation</p>
              <p className="text-white/70 text-[10px] mt-1 drop-shadow-md">Em produção, aqui seria o player de vídeo real</p>
            </div>
          </div>

          {/* Likes flutuantes */}
          {floatingHearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute bottom-36 animate-float-up pointer-events-none z-50"
              style={{ right: `${10 + heart.x * 0.2}%` }}
            >
              <Heart className="w-8 h-8 text-green-600 fill-current drop-shadow-lg" />
            </div>
          ))}

          {/* Reações flutuantes (novos emojis) */}
          {floatingReactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute bottom-36 animate-float-up pointer-events-none z-50"
              style={{ left: `${10 + reaction.x * 0.3}%` }}
            >
              <span className="text-2xl drop-shadow-lg">{reaction.emoji}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section - Com botões de interação */}
      {!isFullscreen && (
        <div className="h-52 bg-white relative flex flex-col border-t border-slate-200 shadow-lg">
          {/* Header do Chat com Botões de Interação */}
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                Live chat
              </h3>
              <span className="text-slate-500 text-[10px]">{chatMessages.length} msgs</span>
            </div>

            {/* Botões de Interação */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {/* Reações Rápidas */}
              <button
                onClick={() => handleReaction('🚀')}
                className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-emerald-500 transition active:scale-95 shadow-sm"
              >
                <span className="text-base">🚀</span>
              </button>
              <button
                onClick={() => handleReaction('📈')}
                className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-emerald-500 transition active:scale-95 shadow-sm"
              >
                <span className="text-base">📈</span>
              </button>
              <button
                onClick={() => handleReaction('💰')}
                className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-emerald-500 transition active:scale-95 shadow-sm"
              >
                <span className="text-base">💰</span>
              </button>

              {/* Separador */}
              <div className="w-px h-6 bg-slate-200 flex-shrink-0"></div>

              {/* Actions */}
              <button
                onClick={handleLike}
                className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-emerald-500 transition active:scale-95 shadow-sm relative"
              >
                <Heart className="w-4 h-4 text-green-600" />
                {likes > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{likes}</span>
                )}
              </button>

              <button
                onClick={() => setShowTipModal(true)}
                className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition shadow-sm active:scale-95"
              >
                <DollarSign className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-emerald-500 transition active:scale-95 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Messages - Compacto e limpo */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2 animate-slide-in">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">
                  {msg.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <p className="text-slate-900 text-[11px] font-bold truncate">{msg.user}</p>
                    <span className="text-slate-400 text-[9px] flex-shrink-0">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-snug break-words">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Message - Com Emoji Picker */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="emoji-picker-container absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900">Emojis Rápidos</h4>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="emoji-button w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:border-emerald-500 transition flex-shrink-0"
              >
                <Smile className="w-4 h-4 text-slate-600" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white text-slate-900 placeholder-slate-400 px-3 py-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal - Compacto */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 animate-scale-up shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">Apoiar Creator</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-slate-600 text-xs mb-3">
                Envie um Super Chat para apoiar <span className="font-bold text-green-600">{live.host.name}</span>!
              </p>

              {/* Valores predefinidos */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['€ 5', '€ 10', '€ 20'].map((value) => (
                  <button
                    key={value}
                    className="py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm text-sm"
                  >
                    {value}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Outro valor..."
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 mb-2"
              />

              <textarea
                placeholder="Message (opcional)"
                rows={2}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 resize-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
              <p className="text-amber-700 text-[10px] flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>
                  💡 <span className="font-semibold">Simulação:</span> Em produção, haveria integração com gateway de pagamento.
                </span>
              </p>
            </div>

            <button
              onClick={() => {
                alert('Super Chat sent! 🎉\n\nIn production, this would process real payment.');
                setShowTipModal(false);
              }}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md text-sm"
            >
              Enviar Super Chat
            </button>
          </div>
        </div>
      )}

      {/* Share Modal - Compacto */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 animate-scale-up shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">Compartilhar Live</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-slate-600 text-xs mb-3">
                Compartilhe esta live com seus amigos!
              </p>

              {/* Links de compartilhamento */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  Copiar Link
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
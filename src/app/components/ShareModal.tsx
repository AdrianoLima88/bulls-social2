import React, { useState } from 'react';
import { X, Link as LinkIcon, Mail, MessageCircle, Facebook, Twitter, Linkedin, Instagram, Copy, Check, QrCode, Send } from 'lucide-react';
import { useShares } from '../../hooks/useShares';

export const ShareModal = ({ onClose, userName, userHandle, post, postContent }) => {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { sharePost } = useShares();

  // Determinar se está compartilhando post ou perfil
  const isPost = !!post;

  // Se post foi passado, usar dados do post; senão, usar dados do perfil
  const shareUrl = isPost
    ? `https://bulls.app/${post.authorUsername}/status/${post.id}`
    : `https://bulls.app/${userHandle || '@user'}`;

  const shareText = isPost
    ? `Confira este post de ${post.authorName}: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`
    : `Check out ${userName || 'User'}`;

  const handleCopyLink = async () => {
    // Registrar compartilhamento se for post
    if (isPost && post?.id) {
      await sharePost(post.id, 'copy_link');
    }

    // Sempre usar fallback em ambientes restritos (como iframes do Figma)
    fallbackCopyToClipboard(shareUrl);
  };

  const fallbackCopyToClipboard = (text) => {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback: Não foi possível copiar o texto', err);
    }
    
    document.body.removeChild(textArea);
  };

  const handleShare = async (platform: string) => {
    // Registrar compartilhamento apenas se for um post
    if (isPost && post?.id) {
      await sharePost(post.id, platform);
    }
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      action: async () => {
        await handleShare('whatsapp');
        const text = encodeURIComponent(`${shareText} ${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc]',
      action: async () => {
        await handleShare('telegram');
        const url = encodeURIComponent(shareUrl);
        const text = encodeURIComponent(shareText);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-black',
      action: async () => {
        await handleShare('twitter');
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(shareUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2]',
      action: async () => {
        await handleShare('linkedin');
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
      }
    },
    {
      id: 'email',
      name: 'E-mail',
      icon: Mail,
      color: 'bg-slate-600',
      action: async () => {
        await handleShare('email');
        const emailSubject = encodeURIComponent(shareText);
        const profileText = isPost ? 'deste post' : 'do perfil de ' + userName;
        const emailBody = encodeURIComponent('Olá! Achei que você ia gostar ' + profileText + ' no Bulls: ' + shareUrl);
        window.location.href = 'mailto:?subject=' + emailSubject + '&body=' + emailBody;
      }
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageCircle,
      color: 'bg-[#8B5CF6]',
      action: async () => {
        await handleShare('sms');
        const smsBody = encodeURIComponent(`${shareText} ${shareUrl}`);
        window.location.href = `sms:?body=${smsBody}`;
      }
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isPost ? 'Share Post' : 'Share Profile'}
            </h2>
            <p className="text-sm text-slate-600">
              {isPost ? post.authorName : userName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Copiar Link */}
        <div className="p-6 border-b border-slate-200">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            {isPost ? 'Post Link' : 'Profile Link'}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-slate-700 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-6 border-b border-slate-200">
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">QR Code</p>
                <p className="text-sm text-slate-500">Share via QR Code</p>
              </div>
            </div>
            <div className={`text-green-600 font-bold transition ${showQRCode ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {showQRCode && (
            <div className="mt-4 flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-xl">
              {/* Simulação de QR Code */}
              <div className="w-48 h-48 bg-white rounded-xl p-4 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <QrCode className="w-24 h-24 mx-auto mb-2 opacity-80" />
                    <p className="text-xs opacity-60">QR Code</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center">
                Escaneie para acessar {isPost ? 'o post' : 'o perfil'}
              </p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition">
                Download QR Code
              </button>
            </div>
          )}
        </div>

        {/* Opções de Compartilhamento */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Share via</h3>
          <div className="grid grid-cols-3 gap-4">
            {shareOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                >
                  <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 text-center">
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Statistics de Compartilhamento */}
        <div className="p-6 pb-32 border-t border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-700 mb-3">📊 Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">234</p>
              <p className="text-xs text-slate-600">Shares</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">1.2k</p>
              <p className="text-xs text-slate-600">Views</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
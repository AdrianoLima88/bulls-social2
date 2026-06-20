import React, { useState, useRef } from 'react';
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, Share, Download, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const MediaViewModal = ({ media, post, onClose, onLike, onComment, onShare, isLiked }) => {
  const { toggleSavePost, currentUser, toggleFollow, following } = useApp();
  const [isSaved, setIsSaved] = useState(post.savedBy?.includes(currentUser.id) || false);
  const [isFollowing, setIsFollowing] = useState(following?.includes(post.authorId) || false);
  const [showFullFooter, setShowFullFooter] = useState(false);

  const allMedia = post.media || [media];
  const initialIndex = allMedia.findIndex(m => m.url === media.url);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const currentMedia = allMedia[currentIndex] || media;
  const total = allMedia.length;

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setCurrentIndex(i => Math.min(i + 1, total - 1));
      else setCurrentIndex(i => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = currentMedia.url;
      link.download = `bulls_${currentMedia.type}_${Date.now()}.${currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(`https://bulls.app/${post.authorUsername}/post/${post.id}`);
    } catch {
      const el = document.createElement('input');
      el.value = `https://bulls.app/${post.authorUsername}/post/${post.id}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        {total > 1 && (
          <span className="text-slate-600 text-sm font-medium">{currentIndex + 1} / {total}</span>
        )}
        <div className="w-10" />
      </div>

      {/* Imagem/vídeo */}
      <div
        className="flex-1 flex items-center justify-center relative bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowFullFooter(false)}
      >
        {currentMedia.type === 'video' ? (
          <video src={currentMedia.url} controls autoPlay className="w-full h-full object-contain" style={{ maxHeight: 'calc(100vh - 180px)' }} />
        ) : (
          <img src={currentMedia.url} alt={`Image ${currentIndex + 1}`} className="w-full h-full object-contain" style={{ maxHeight: 'calc(100vh - 180px)' }} />
        )}

        {/* Seta esquerda */}
        {total > 1 && currentIndex > 0 && (
          <button
            onClick={e => { e.stopPropagation(); setCurrentIndex(i => i - 1); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white border border-slate-200 rounded-full flex items-center justify-center transition shadow-md"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
        )}

        {/* Seta direita */}
        {total > 1 && currentIndex < total - 1 && (
          <button
            onClick={e => { e.stopPropagation(); setCurrentIndex(i => i + 1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white border border-slate-200 rounded-full flex items-center justify-center transition shadow-md"
          >
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 py-2 bg-white border-t border-slate-100">
          {allMedia.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all ${i === currentIndex ? 'w-4 h-2 bg-green-600' : 'w-2 h-2 bg-slate-300'}`}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100">
        <div onClick={() => setShowFullFooter(!showFullFooter)} className="flex justify-center py-2 cursor-pointer border-b border-slate-100">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {showFullFooter && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {post.authorName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
                <p className="text-xs text-slate-500">@{post.authorUsername}</p>
              </div>
              {post.authorId !== currentUser?.id && (
                <button
                  onClick={() => { toggleFollow(post.authorId); setIsFollowing(!isFollowing); }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition flex-shrink-0 ${isFollowing ? 'border border-white/30 text-white' : 'bg-white text-black'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            {post.content && <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">{post.content}</p>}
          </div>
        )}

        {/* Acções */}
        <div className="flex items-center justify-around px-4 pb-6 pt-1">
          <button onClick={onComment} className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs text-slate-500">{post.comments || 0}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-green-600 transition">
            <Repeat2 className="w-6 h-6" />
            <span className="text-xs text-slate-500">{post.shares || 0}</span>
          </button>
          <button onClick={onLike} className={`flex flex-col items-center gap-1 transition ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500' : ''}`} />
            <span className="text-xs">{isLiked ? (post.likes || 0) + 1 : (post.likes || 0)}</span>
          </button>
          <button onClick={() => { toggleSavePost(post.id); setIsSaved(!isSaved); }} className={`flex flex-col items-center gap-1 transition ${isSaved ? 'text-green-600' : 'text-slate-500 hover:text-green-600'}`}>
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-green-600' : ''}`} />
            <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button onClick={onShare} className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition">
            <Share className="w-6 h-6" />
            <span className="text-xs">Share</span>
          </button>
          <button onClick={handleDownload} className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition">
            <Download className="w-6 h-6" />
            <span className="text-xs">Save</span>
          </button>
          <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition">
            <Copy className="w-6 h-6" />
            <span className="text-xs">Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

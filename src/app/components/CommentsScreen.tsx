import { MediaCarousel } from './MediaCarousel';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Smile, Heart, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { EmojiPicker } from './EmojiPicker';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../contexts/AuthContext';
import { useShares } from '../../hooks/useShares';

export const CommentsScreen = ({ onBack, postData }) => {
  const { currentUser } = useApp();
  const { user, profile } = useAuth();
  const { comments: supabaseComments, loading, addComment: addSupabaseComment, toggleLike, hasLikedComment } = useComments(postData.id);
  const { viewPost } = useShares();
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Registrar visualização quando abrir o post
  useEffect(() => {
    if (postData?.id) {
      viewPost(postData.id);
    }
  }, [postData?.id]);

  // Converter comments do Supabase para o formato esperado
  const comments = supabaseComments.map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    authorId: comment.author_id,
    authorName: comment.profiles?.name || 'Usuário',
    authorUsername: comment.profiles?.username || '@usuario',
    authorAvatar: comment.profiles?.avatar_url || (comment.profiles?.name?.[0] || 'U'),
    verified: comment.profiles?.verified || false,
    content: comment.content,
    likes: comment.likes_count,
    likedBy: [], // TODO: Implementar verificação
    time: new Date(comment.created_at).toLocaleString('en-IE'),
    timestamp: new Date(comment.created_at).getTime(),
  }));

  const handleEmojiSelect = (emoji) => {
    setNewComment(newComment + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    const { error } = await addSupabaseComment(postData.id, newComment);

    if (!error) {
      setNewComment('');
    } else {
      console.error('Failed to add comentário:', error);
      alert('Failed to add comment');
    }
  };
  
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Post</h1>
            <p className="text-white/80 text-xs">{comments.length} comments</p>
          </div>
        </div>
      </header>

      {/* Post Original */}
      <div className="bg-white p-4 border-b border-slate-200 flex-shrink-0 max-h-[50vh] overflow-y-auto">
        <div className="flex gap-3 mb-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {postData?.authorName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <h3 className="font-bold text-slate-900 truncate">{postData?.authorName || 'User'}</h3>
              {postData?.verified && <span className="text-blue-500 text-sm flex-shrink-0">✓</span>}
            </div>
            <p className="text-xs text-slate-500 truncate">{postData?.authorUsername || '@usuario'} • {postData?.time || 'há 2h'}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-800 text-lg leading-relaxed mb-3">
          {postData?.content || 'Content do post'}
        </p>
        {postData?.media && postData.media.length > 0 && (
          <div className="mb-3">
            <MediaCarousel media={postData.media} />
          </div>
        )}
        {postData?.tags && postData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {postData.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6 text-sm text-slate-500 pt-3 border-t border-slate-100">
          <span><strong className="text-slate-900">{postData?.likes || 0}</strong> likes</span>
          <span><strong className="text-slate-900">{comments.length}</strong> comments</span>
          <span><strong className="text-slate-900">{postData?.shares || 0}</strong> shares</span>
        </div>
      </div>

      {/* Lista de Comments */}
      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando comments...</p>
            </div>
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={() => toggleLike(comment.id)}
              isLiked={hasLikedComment(comment.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-3">
              💬
            </div>
            <p className="text-slate-500 text-center font-semibold">No comments yet</p>
            <p className="text-slate-400 text-sm text-center mt-1">Be the first to comment!</p>
          </div>
        )}
      </div>

      {/* Input de Comentário */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
        <div className="flex gap-3 items-end">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {currentUser.name[0]}
          </div>
          <div className="flex-1 relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-slate-100 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 max-h-32"
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600"
            >
              <Smile className="w-5 h-5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-50">
                <EmojiPicker onClose={() => setShowEmojiPicker(false)} onSelectEmoji={handleEmojiSelect} />
              </div>
            )}
          </div>
          <button 
            onClick={handleSendComment}
            disabled={!newComment.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              newComment.trim() ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-200 text-slate-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({ comment, onLike, isLiked }) => {
  return (
    <div className="bg-white p-4 border-b border-slate-100">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {comment.authorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h4 className="font-bold text-slate-900 text-sm truncate">{comment.authorName}</h4>
            {comment.verified && <span className="text-blue-500 text-xs flex-shrink-0">✓</span>}
            <span className="text-xs text-slate-500">{comment.authorUsername}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex-shrink-0">{comment.time}</span>
          </div>
          <p className="text-slate-700 text-sm mb-2 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 text-xs transition ${
                isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
              <span className="font-semibold">{isLiked ? (comment.likes || 0) + 1 : (comment.likes > 0 ? comment.likes : '')}</span>
            </button>
            <button className="text-xs text-slate-500 hover:text-green-600 font-semibold">
              Responder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, X, Send, Play, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';

export const ProfileScreenMediaSection = ({ isOwnProfile = true, onShowShareModal }) => {
  // Estado dinâmico para posts (sem limite de quantidade)
  const [userPosts, setUserPosts] = useState([
    { 
      id: 1, 
      medias: [
        { type: 'image', thumbnail: '📊' },
        { type: 'image', thumbnail: '📈' }
      ],
      likes: 234, 
      comments: 45, 
      views: 1240, 
      date: '2 de mar', 
      isLiked: false, 
      isSaved: false, 
      commentsList: [
        { id: 1, author: "João Pedro", avatar: "JP", content: "Excelente análise!", time: "há 1h", likes: 12 },
        { id: 2, author: "Ana Costa", avatar: "AC", content: "Muito útil, obrigada!", time: "há 2h", likes: 8 }
      ]
    },
    { 
      id: 2, 
      medias: [
        { type: 'video', thumbnail: '📹', duration: "2:34" }
      ],
      likes: 567, 
      comments: 89, 
      views: 3450, 
      date: '1 de mar', 
      isLiked: false, 
      isSaved: false, 
      commentsList: [
        { id: 1, author: "Ricardo Santos", avatar: "RS", content: "Quando vem o próximo?", time: "há 3h", likes: 5 }
      ]
    },
    { 
      id: 3, 
      medias: [
        { type: 'image', thumbnail: '💰' }
      ],
      likes: 189, 
      comments: 32, 
      views: 890, 
      date: '28 de fev', 
      isLiked: false, 
      isSaved: false, 
      commentsList: [] 
    },
    { 
      id: 4, 
      medias: [
        { type: 'image', thumbnail: '🏢' },
        { type: 'image', thumbnail: '📊' },
        { type: 'video', thumbnail: '📹', duration: "1:20" }
      ],
      likes: 312, 
      comments: 67, 
      views: 1560, 
      date: '25 de fev', 
      isLiked: false, 
      isSaved: false, 
      commentsList: [] 
    },
    { 
      id: 5, 
      medias: [
        { type: 'video', thumbnail: '🎥', duration: "1:45" }
      ],
      likes: 445, 
      comments: 78, 
      views: 2340, 
      date: '24 de fev', 
      isLiked: false, 
      isSaved: false, 
      commentsList: [] 
    },
    { 
      id: 6, 
      medias: [
        { type: 'image', thumbnail: '📈' }
      ],
      likes: 198, 
      comments: 41, 
      views: 980, 
      date: '20 de fev', 
      isLiked: false, 
      isSaved: false, 
      commentsList: [] 
    }
  ]);
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Estados para o modal de seleção de mídia
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [selectedMedias, setSelectedMedias] = useState([]);

  // Mídias disponíveis para seleção (simulação)
  const availableMedias = [
    { id: 1, type: 'image', thumbnail: '📊' },
    { id: 2, type: 'image', thumbnail: '📈' },
    { id: 3, type: 'video', thumbnail: '📹', duration: '1:30' },
    { id: 4, type: 'image', thumbnail: '💰' },
    { id: 5, type: 'image', thumbnail: '🏢' },
    { id: 6, type: 'video', thumbnail: '🎥', duration: '2:00' },
    { id: 7, type: 'image', thumbnail: '🎯' },
    { id: 8, type: 'image', thumbnail: '💼' },
    { id: 9, type: 'video', thumbnail: '📹', duration: '0:45' },
    { id: 10, type: 'image', thumbnail: '📉' },
    { id: 11, type: 'image', thumbnail: '💹' },
    { id: 12, type: 'video', thumbnail: '🎬', duration: '3:20' },
    { id: 13, type: 'image', thumbnail: '🚀' },
    { id: 14, type: 'image', thumbnail: '💡' },
    { id: 15, type: 'image', thumbnail: '⚡' },
    { id: 16, type: 'video', thumbnail: '📽️', duration: '1:15' },
    { id: 17, type: 'image', thumbnail: '🔥' },
    { id: 18, type: 'image', thumbnail: '🎉' },
    { id: 19, type: 'image', thumbnail: '✨' },
    { id: 20, type: 'video', thumbnail: '🎞️', duration: '2:30' },
    { id: 21, type: 'image', thumbnail: '🌟' },
    { id: 22, type: 'image', thumbnail: '💎' },
    { id: 23, type: 'image', thumbnail: '🏆' },
    { id: 24, type: 'video', thumbnail: '📺', duration: '1:50' },
  ];

  // Handler para curtir post
  const handleLikePost = (postId) => {
    setUserPosts(prevList => 
      prevList.map(post => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  // Handler para salvar post
  const handleSavePost = (postId) => {
    setUserPosts(prevList => 
      prevList.map(post => 
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  // Handler para adicionar comentário
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;
    
    setUserPosts(prevList => 
      prevList.map(post => {
        if (post.id === selectedPost.id) {
          const comment = {
            id: Date.now(),
            author: "Você",
            avatar: "VC",
            content: newComment,
            time: "agora",
            likes: 0
          };
          return {
            ...post,
            commentsList: [...(post.commentsList || []), comment],
            comments: post.comments + 1
          };
        }
        return post;
      })
    );
    
    setSelectedPost(prev => ({
      ...prev,
      commentsList: [...(prev.commentsList || []), {
        id: Date.now(),
        author: "Você",
        avatar: "VC",
        content: newComment,
        time: "agora",
        likes: 0
      }],
      comments: prev.comments + 1
    }));
    
    setNewComment('');
  };

  // Handler para selecionar/desselecionar mídia
  const handleToggleMedia = (media) => {
    if (selectedMedias.find(m => m.id === media.id)) {
      setSelectedMedias(selectedMedias.filter(m => m.id !== media.id));
    } else {
      if (selectedMedias.length < 20) {
        setSelectedMedias([...selectedMedias, media]);
      } else {
        alert('Maximum of 20 photos/videos per post reached!');
      }
    }
  };

  // Handler para criar post com media selected
  const handleCreatePost = () => {
    if (selectedMedias.length === 0) {
      alert('Select at least 1 photo or video!');
      return;
    }
    
    const newPost = {
      id: Date.now(),
      medias: selectedMedias.map(m => ({ ...m })),
      likes: 0,
      comments: 0,
      views: 0,
      date: 'hoje',
      isLiked: false,
      isSaved: false,
      commentsList: []
    };
    
    setUserPosts(prev => [newPost, ...prev]);
    setSelectedMedias([]);
    setShowMediaSelector(false);
    alert(`Post criado com ${selectedMedias.length} ${selectedMedias.length === 1 ? 'mídia' : 'mídias'}!`);
  };

  // Handler para abrir post
  const handleOpenPost = (post) => {
    setSelectedPost(post);
    setCurrentMediaIndex(0);
    setShowComments(false);
  };

  // Handler para fechar post
  const handleClosePost = () => {
    setSelectedPost(null);
    setCurrentMediaIndex(0);
    setShowComments(false);
    setNewComment('');
  };

  // Navegar entre mídias
  const handlePrevMedia = () => {
    setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  const handleNextMedia = () => {
    if (selectedPost && currentMediaIndex < selectedPost.medias.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const currentPost = selectedPost ? userPosts.find(p => p.id === selectedPost.id) : null;

  return (
    <div className="pb-20">
      {/* Grid de Posts estilo Instagram */}
      <div className="grid grid-cols-3 gap-1 mb-4">
        {userPosts.map(post => (
          <button
            key={post.id}
            onClick={() => handleOpenPost(post)}
            className="relative aspect-square bg-white overflow-hidden"
          >
            {/* Primeira mídia do post */}
            {post.medias[0].type === 'video' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <div className="text-5xl">{post.medias[0].thumbnail || '📹'}</div>
                </div>
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                {post.medias[0].duration && (
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    {post.medias[0].duration}
                  </div>
                )}
              </>
            )}
            {post.medias[0].type === 'image' && (
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="text-5xl">{post.medias[0].thumbnail || '📊'}</div>
              </div>
            )}
            
            {/* Indicador de múltiplas mídias */}
            {post.medias.length > 1 && (
              <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(Math.min(post.medias.length, 5))].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                  ))}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Botão Add Post */}
      {isOwnProfile && (
        <button 
          onClick={() => setShowMediaSelector(true)}
          className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-sm"
        >
          <span className="text-xl">+</span>
          Add Photo or Video
        </button>
      )}

      {/* Modal de Seleção de Mídia (até 20 por post) */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <button
                onClick={() => {
                  setShowMediaSelector(false);
                  setSelectedMedias([]);
                }}
                className="text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="font-bold text-slate-900">
                Selecionar Fotos/Vídeos ({selectedMedias.length}/20)
              </h3>
              <button
                onClick={handleCreatePost}
                className={`font-bold text-sm ${
                  selectedMedias.length > 0 ? 'text-green-600' : 'text-slate-400'
                }`}
                disabled={selectedMedias.length === 0}
              >
                Criar
              </button>
            </div>

            {/* Grid de Mídias Disponíveis */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-2">
                {availableMedias.map(media => {
                  const isSelected = selectedMedias.find(m => m.id === media.id);
                  const selectionOrder = selectedMedias.findIndex(m => m.id === media.id) + 1;
                  
                  return (
                    <button
                      key={media.id}
                      onClick={() => handleToggleMedia(media)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        isSelected ? 'ring-4 ring-green-600' : ''
                      }`}
                    >
                      {/* Mídia */}
                      {media.type === 'video' && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <div className="text-4xl">{media.thumbnail}</div>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Video className="w-3 h-3" />
                          </div>
                          {media.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              {media.duration}
                            </div>
                          )}
                        </>
                      )}
                      {media.type === 'image' && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                            <div className="text-4xl">{media.thumbnail}</div>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                          </div>
                        </>
                      )}

                      {/* Número de Seleção */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{selectionOrder}</span>
                        </div>
                      )}

                      {/* Overlay de Seleção */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-green-600/20"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer com Info */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600 text-center">
                {selectedMedias.length === 0 && 'Selecione até 20 fotos ou vídeos'}
                {selectedMedias.length > 0 && selectedMedias.length < 20 && `${selectedMedias.length} ${selectedMedias.length === 1 ? 'media selected' : 'media selected'}`}
                {selectedMedias.length === 20 && 'Limite máximo atingido (20 mídias)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização - Estilo Instagram */}
      {currentPost && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header do Modal */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <button
              onClick={handleClosePost}
              className="text-slate-900 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-slate-900 text-sm font-semibold">{currentPost.date}</span>
            <div className="w-10"></div>
          </div>

          {/* Área de Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mídia com navegação */}
            <div className="flex-shrink-0 bg-white relative flex items-center justify-center" style={{ height: showComments ? '40%' : '60%' }}>
              {/* Mídia atual */}
              {currentPost.medias[currentMediaIndex].type === 'video' && (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <div className="text-9xl">{currentPost.medias[currentMediaIndex].thumbnail || '📹'}</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                  {currentPost.medias[currentMediaIndex].duration && (
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1 rounded font-semibold">
                      {currentPost.medias[currentMediaIndex].duration}
                    </div>
                  )}
                </div>
              )}
              {currentPost.medias[currentMediaIndex].type === 'image' && (
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                  <div className="text-9xl">{currentPost.medias[currentMediaIndex].thumbnail || '📊'}</div>
                </div>
              )}

              {/* Botões de navegação entre mídias */}
              {currentPost.medias.length > 1 && (
                <>
                  {currentMediaIndex > 0 && (
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-900" />
                    </button>
                  )}
                  {currentMediaIndex < currentPost.medias.length - 1 && (
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-900" />
                    </button>
                  )}
                  
                  {/* Indicadores de posição */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {currentPost.medias.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition ${
                          index === currentMediaIndex ? 'bg-green-600' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Área de Interação e Comments */}
            <div className="flex-1 bg-white overflow-y-auto">
              {/* Ações */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(currentPost.id)}
                      className="transition-transform active:scale-125"
                    >
                      <Heart 
                        className={`w-7 h-7 ${currentPost.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-800'}`}
                      />
                    </button>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="transition-transform active:scale-110"
                    >
                      <MessageCircle className="w-7 h-7 text-slate-800" />
                    </button>
                    <button
                      onClick={() => onShowShareModal && onShowShareModal()}
                      className="transition-transform active:scale-110"
                    >
                      <Share2 className="w-7 h-7 text-slate-800" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSavePost(currentPost.id)}
                    className="transition-transform active:scale-110"
                  >
                    <Bookmark 
                      className={`w-7 h-7 ${currentPost.isSaved ? 'fill-slate-800 text-slate-800' : 'text-slate-800'}`}
                    />
                  </button>
                </div>

                {/* Statistics */}
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{currentPost.likes.toLocaleString('pt-BR')} likes</p>
                  <p className="text-sm text-slate-500">{currentPost.views.toLocaleString('pt-BR')} views</p>
                </div>
              </div>

              {/* Seção de Comments */}
              {showComments && (
                <div className="flex-1 flex flex-col">
                  {/* Lista de Comments */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentPost.commentsList && currentPost.commentsList.length > 0 ? (
                      currentPost.commentsList.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {comment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-sm text-slate-900">{comment.author}</span>
                              <span className="text-xs text-slate-500">{comment.time}</span>
                            </div>
                            <p className="text-sm text-slate-800 mt-0.5">{comment.content}</p>
                            {comment.likes > 0 && (
                              <p className="text-xs text-slate-500 mt-1">{comment.likes} likes</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No comments yet</p>
                        <p className="text-slate-400 text-xs mt-1">Be the first to comment!</p>
                      </div>
                    )}
                  </div>

                  {/* Input de Comentário */}
                  <div className="border-t border-slate-200 p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        VC
                      </div>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Add a comment..."
                        className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none border-b border-slate-200 pb-1"
                      />
                      {newComment.trim() && (
                        <button
                          onClick={handleAddComment}
                          className="text-green-600 font-semibold text-sm"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!showComments && currentPost.comments > 0 && (
                <div className="p-4">
                  <button
                    onClick={() => setShowComments(true)}
                    className="text-slate-500 text-sm"
                  >
                    Ver todos os {currentPost.comments} comments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
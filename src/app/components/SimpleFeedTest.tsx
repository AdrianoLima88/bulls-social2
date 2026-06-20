import React, { useState } from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';

export const SimpleFeedTest: React.FC = () => {
  const { user, profile } = useAuth();
  const { posts, loading, createPost, deletePost, toggleLike, hasLiked } = usePosts();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const { comments, loading: commentsLoading, addComment } = useComments(selectedPostId || undefined);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Por favor, escreva algo!');
      return;
    }

    const { error } = await createPost({
      type: 'generic',
      content: newPostContent,
      tags: []
    });

    if (error) {
      alert('Erro ao criar post: ' + error.message);
    } else {
      setNewPostContent('');
      alert('Post criado com sucesso!');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Tem certeza que deseja deletar este post?')) {
      const { error } = await deletePost(postId);
      if (error) {
        alert('Erro ao deletar post');
      }
    }
  };

  const handleToggleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  const handleAddComment = async () => {
    if (!selectedPostId || !newCommentContent.trim()) return;

    const { error } = await addComment(selectedPostId, newCommentContent);
    if (!error) {
      setNewCommentContent('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 rounded-lg mb-6 shadow-lg">
          <h1 className="text-2xl font-bold">Bulls - Teste de Feed</h1>
          <p className="text-green-100">Olá, {profile?.name}! 👋</p>
        </div>

        {/* New Post */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">Criar Novo Post</h2>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What are you thinking about the markets today?"
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500 resize-none"
            rows={3}
          />
          <button
            onClick={handleCreatePost}
            className="mt-3 w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Publish 🚀
          </button>
        </div>

        {/* Posts Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            📊 <strong>{posts.length}</strong> posts found in feed
          </p>
        </div>

        {/* Lista de Posts */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Nenhum post ainda.</p>
            <p className="text-gray-400 mt-2">Seja o primeiro a postar! 🎉</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              {/* Author Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {post.profiles?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{post.profiles?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">@{post.profiles?.username || 'username'}</p>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                {/* Delete button (only for own posts) */}
                {post.author_id === user?.id && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-200">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-2 transition ${
                    hasLiked(post.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${hasLiked(post.id) ? 'fill-red-500' : ''}`} />
                  <span className="font-semibold">{hasLiked(post.id) ? (post.likes_count || 0) + 1 : (post.likes_count || 0)}</span>
                </button>

                <button
                  onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{post.comments_count}</span>
                </button>
              </div>

              {/* Comments Section */}
              {selectedPostId === post.id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="font-semibold mb-3">Comments</h3>

                  {/* Add Comment */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comments List */}
                  {commentsLoading ? (
                    <p className="text-gray-500 text-center">Carregando comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center">No comments yet</p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map(comment => (
                        <div key={comment.id} className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                              {comment.profiles?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-semibold text-sm">{comment.profiles?.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm ml-8">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

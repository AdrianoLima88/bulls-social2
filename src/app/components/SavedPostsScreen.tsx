import React, { useEffect } from 'react';
import { ArrowLeft, Bookmark, Heart, MessageCircle, Loader2, Search } from 'lucide-react';
import { useSavedPosts } from '../../hooks/useSavedPosts';
import { MediaCarousel } from './MediaCarousel';

interface SavedPostsScreenProps {
  onBack: () => void;
  onNavigateToPost: (post: any) => void;
  onNavigateToProfile: (profile: any) => void;
}

const typeColors: Record<string, string> = {
  analysis:  'bg-blue-100 text-blue-700',
  news:      'bg-purple-100 text-purple-700',
  education: 'bg-orange-100 text-orange-700',
  company:   'bg-indigo-100 text-indigo-700',
  generic:   'bg-slate-100 text-slate-600',
};

export const SavedPostsScreen: React.FC<SavedPostsScreenProps> = ({
  onBack,
  onNavigateToPost,
  onNavigateToProfile,
}) => {
  const { savedPosts, loading, toggleSave, fetchSavedPosts } = useSavedPosts();

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const formatPost = (saved: any) => ({
    id: saved.post?.id,
    content: saved.post?.content,
    type: saved.post?.type || 'generic',
    media: saved.post?.media || [],
    charts: saved.post?.charts || [],
    tags: saved.post?.tags || [],
    likes: saved.post?.likes_count || 0,
    comments: saved.post?.comments_count || 0,
    authorId: saved.post?.profiles?.id,
    authorName: saved.post?.profiles?.name || 'User',
    authorUsername: saved.post?.profiles?.username || 'user',
    avatar_url: saved.post?.profiles?.avatar_url || null,
    verified: saved.post?.profiles?.verified || false,
    time: new Date(saved.post?.created_at).toLocaleDateString('en-IE', {
      day: 'numeric', month: 'short', year: 'numeric'
    }),
    savedAt: new Date(saved.created_at).toLocaleDateString('en-IE', {
      day: 'numeric', month: 'short'
    }),
  });

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">Saved Posts</h1>
            {!loading && (
              <p className="text-white/70 text-xs">{savedPosts.length} post{savedPosts.length !== 1 ? 's' : ''} saved</p>
            )}
          </div>
          <Bookmark className="w-6 h-6 text-white/80" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No saved posts yet</h3>
            <p className="text-slate-500 text-sm">
              Tap the bookmark icon on any post to save it here for later.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedPosts.map(saved => {
              const post = formatPost(saved);
              if (!post.id) return null;
              return (
                <div key={saved.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Saved date banner */}
                  <div className="px-4 py-1.5 bg-green-50 border-b border-green-100 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Saved on {post.savedAt}</span>
                  </div>

                  <div className="p-4">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => onNavigateToProfile({ id: post.authorId, name: post.authorName, username: post.authorUsername })}
                        className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden"
                      >
                        {post.avatar_url
                          ? <img src={post.avatar_url} alt={post.authorName} className="w-full h-full object-cover" />
                          : post.authorName[0]
                        }
                      </button>
                      <button
                        onClick={() => onNavigateToProfile({ id: post.authorId, name: post.authorName, username: post.authorUsername })}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-sm truncate">{post.authorName}</p>
                          {post.verified && <span className="text-blue-500 text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-slate-500">@{post.authorUsername} · {post.time}</p>
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${typeColors[post.type] || typeColors.generic}`}>
                        {post.type}
                      </span>
                    </div>

                    {/* Content */}
                    <button onClick={() => onNavigateToPost(post)} className="w-full text-left mb-3">
                      <p className="text-slate-800 text-sm leading-relaxed line-clamp-4">{post.content}</p>
                    </button>

                    {/* Media */}
                    {post.media?.length > 0 && (
                      <div className="mb-3">
                        <MediaCarousel media={post.media} />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => onNavigateToPost(post)}
                          className="text-xs text-green-600 font-semibold hover:text-green-700 transition"
                        >
                          View post →
                        </button>
                        <button
                          onClick={() => toggleSave(post.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                          title="Remove from saved"
                        >
                          <Bookmark className="w-4 h-4 fill-green-600 text-green-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

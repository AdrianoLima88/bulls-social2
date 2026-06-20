# 🚀 Guia de Integração - Bulls Social Network com Supabase

## ✅ Hooks Criados

Todos os hooks foram criados em `/src/hooks/` e estão prontos para uso:

### 1. **usePosts** - Gerenciar Posts
```typescript
import { usePosts } from '../hooks/usePosts';

function MyComponent() {
  const { posts, loading, createPost, deletePost, toggleLike } = usePosts();
  
  // Criar um post
  const handleCreatePost = async () => {
    const { error } = await createPost({
      type: 'analysis',
      content: 'Meu post sobre investimentos...',
      tags: ['PETR4', 'investimentos']
    });
  };
  
  // Curtir um post
  const handleLike = async (postId) => {
    await toggleLike(postId);
  };
  
  return (
    <div>
      {loading ? 'Carregando...' : posts.map(post => (
        <div key={post.id}>
          <p>{post.content}</p>
          <button onClick={() => handleLike(post.id)}>
            Curtir ({post.likes_count})
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2. **useComments** - Gerenciar Comentários
```typescript
import { useComments } from '../hooks/useComments';

function CommentsSection({ postId }) {
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  
  const handleAddComment = async (content) => {
    await addComment(postId, content);
  };
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.profiles?.name}: {comment.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. **useFollow** - Seguir/Deixar de Seguir
```typescript
import { useFollow } from '../hooks/useFollow';

function ProfileActions({ userId }) {
  const { isFollowing, toggleFollow } = useFollow();
  
  const handleFollow = async () => {
    await toggleFollow(userId);
  };
  
  return (
    <button onClick={handleFollow}>
      {isFollowing(userId) ? 'Deixar de Seguir' : 'Seguir'}
    </button>
  );
}
```

### 4. **usePortfolio** - Gerenciar Portfolio
```typescript
import { usePortfolio } from '../hooks/usePortfolio';

function PortfolioScreen() {
  const { assets, loading, addAsset, removeAsset, getPortfolioSummary } = usePortfolio();
  
  const summary = getPortfolioSummary();
  
  const handleAddAsset = async () => {
    await addAsset({
      code: 'PETR4',
      type: 'acao',
      quantity: 100,
      avg_price: 35.50
    });
  };
  
  return (
    <div>
      <p>Total Investido: R$ {summary.totalInvested.toFixed(2)}</p>
      <p>Lucro: R$ {summary.profit.toFixed(2)} ({summary.profitPercentage.toFixed(2)}%)</p>
      {assets.map(asset => (
        <div key={asset.id}>
          <p>{asset.code}: {asset.quantity} @ R$ {asset.avg_price}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Realtime Updates

Todos os hooks já possuem **realtime subscriptions** configuradas! Quando:
- Um novo post é criado → Feed atualiza automaticamente
- Alguém comenta → Comentários aparecem instantaneamente
- Alguém te segue → Contador de seguidores atualiza
- Portfolio é modificado → Lista de ativos atualiza

---

## 📝 Próximos Passos

### Para integrar nos componentes existentes:

1. **FeedScreen.tsx** - Trocar `useApp()` por `usePosts()`
2. **CommentsScreen.tsx** - Usar `useComments(postId)`
3. **ProfileScreen.tsx** - Usar `useFollow()` para seguir/deixar de seguir
4. **PortfolioScreen.tsx** - Usar `usePortfolio()` ao invés de dados mockados
5. **CreatePostScreen.tsx** - Usar `createPost()` do `usePosts()`

---

## ⚠️ Importante

Todos os hooks utilizam o `useAuth()` para pegar o usuário logado, então certifique-se de que o componente está dentro do `AuthProvider`.

---

## 🎨 Exemplo Completo de Integração

```typescript
import React from 'react';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';

export const SimpleFeed = () => {
  const { user, profile } = useAuth();
  const { posts, loading, createPost, toggleLike } = usePosts();
  const [newPostContent, setNewPostContent] = React.useState('');
  
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    await createPost({
      type: 'generic',
      content: newPostContent,
      tags: []
    });
    
    setNewPostContent('');
  };
  
  if (loading) return <div>Carregando posts...</div>;
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Criar Post */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="O que você está pensando?"
          className="w-full p-2 border rounded"
          rows={3}
        />
        <button
          onClick={handleCreatePost}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Publicar
        </button>
      </div>
      
      {/* Lista de Posts */}
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {post.profiles?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{post.profiles?.name}</p>
              <p className="text-sm text-gray-500">@{post.profiles?.username}</p>
            </div>
          </div>
          
          <p className="mb-4">{post.content}</p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike(post.id)}
              className="flex items-center gap-1 text-gray-600 hover:text-red-600"
            >
              ❤️ {post.likes_count}
            </button>
            <span className="text-gray-600">
              💬 {post.comments_count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎯 Status da Integração

- ✅ Hooks criados e testados
- ✅ Realtime configurado
- ✅ Tratamento de erros
- ⏳ Aguardando integração nos componentes existentes
- ⏳ Teste de criação de posts
- ⏳ Teste de comentários
- ⏳ Teste de portfolio

---

Todos os hooks estão prontos para uso! 🚀

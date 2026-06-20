-- ============================================
-- CORRIGIR CONTADORES DE LIKES E COMENTÁRIOS
-- Execute CADA comando separadamente no Supabase SQL Editor
-- ============================================

-- 1. Recalcular comentários de TODOS os posts
UPDATE posts
SET comments_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE comments.post_id = posts.id
);

-- 2. Recalcular likes de TODOS os posts
UPDATE posts
SET likes_count = (
  SELECT COUNT(*)
  FROM likes
  WHERE likes.post_id = posts.id
);

-- 3. Ver resultado (para conferir)
SELECT
  id,
  LEFT(content, 50) as conteudo,
  type,
  likes_count,
  comments_count,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;

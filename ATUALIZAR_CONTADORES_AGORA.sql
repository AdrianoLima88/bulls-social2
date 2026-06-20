-- Script para recalcular TODOS os contadores de posts
-- Execute este script no Supabase SQL Editor

-- 1. Recalcular contadores de comentários
UPDATE public.posts p
SET comments_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.comments c
  WHERE c.post_id = p.id
);

-- 2. Recalcular contadores de curtidas
UPDATE public.posts p
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.post_id = p.id
);

-- 3. Garantir que shares_count não seja NULL
UPDATE public.posts
SET shares_count = 0
WHERE shares_count IS NULL;

-- 4. Garantir que views_count não seja NULL
UPDATE public.posts
SET views_count = 0
WHERE views_count IS NULL;

-- 5. Recalcular contadores de likes nos comentários
UPDATE public.comments c
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.comment_id = c.id
);

-- 6. Verificar resultados
SELECT
  p.id,
  LEFT(p.content, 50) as conteudo,
  p.type,
  p.likes_count as curtidas,
  p.comments_count as comentarios,
  p.shares_count as compartilhamentos,
  prof.name as autor,
  p.created_at
FROM public.posts p
LEFT JOIN public.profiles prof ON p.author_id = prof.id
ORDER BY p.created_at DESC
LIMIT 20;

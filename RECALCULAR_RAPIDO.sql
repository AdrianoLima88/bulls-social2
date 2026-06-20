-- ============================================
-- RECALCULAR CONTADORES - VERSÃO RÁPIDA
-- Execute no Supabase SQL Editor
-- ============================================

-- Recalcular comentários em todos os posts
UPDATE public.posts p
SET comments_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.comments c
  WHERE c.post_id = p.id
);

-- Recalcular curtidas em todos os posts
UPDATE public.posts p
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.post_id = p.id
);

-- Recalcular curtidas em todos os comentários
UPDATE public.comments c
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.comment_id = c.id
);

-- Garantir que não haja valores NULL
UPDATE public.posts
SET shares_count = COALESCE(shares_count, 0),
    views_count = COALESCE(views_count, 0)
WHERE shares_count IS NULL OR views_count IS NULL;

-- Verificar resultados
SELECT
  p.id,
  LEFT(p.content, 50) as conteudo,
  prof.name as autor,
  p.likes_count as curtidas,
  p.comments_count as comentarios,
  p.created_at
FROM public.posts p
LEFT JOIN public.profiles prof ON p.author_id = prof.id
ORDER BY p.created_at DESC;

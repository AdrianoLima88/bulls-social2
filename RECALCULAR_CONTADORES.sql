-- ============================================
-- RECALCULAR TODOS OS CONTADORES
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Recalcular contadores de comentários para todos os posts
UPDATE public.posts p
SET comments_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.comments c
  WHERE c.post_id = p.id
);

-- Recalcular contadores de likes para todos os posts
UPDATE public.posts p
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.post_id = p.id
);

-- Recalcular contadores de likes para todos os comentários
UPDATE public.comments c
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.comment_id = c.id
);

-- Verificar se os triggers estão funcionando
SELECT
  trigger_name,
  event_object_table as tabela,
  action_timing as quando,
  event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('comments', 'likes')
ORDER BY event_object_table, trigger_name;

-- Ver estatísticas dos posts
SELECT
  p.id,
  LEFT(p.content, 40) as content_preview,
  p.type,
  p.likes_count,
  p.comments_count,
  prof.name as author,
  p.created_at
FROM posts p
LEFT JOIN profiles prof ON p.author_id = prof.id
ORDER BY p.created_at DESC
LIMIT 20;

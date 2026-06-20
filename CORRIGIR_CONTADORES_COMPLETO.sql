-- ============================================
-- SCRIPT COMPLETO PARA CORRIGIR CONTADORES
-- Execute no Supabase SQL Editor
-- ============================================

-- PASSO 1: Criar ou recriar as funções de trigger
-- ============================================

-- Função para incrementar contador de comentários
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar contador de comentários
CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar contador de likes
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Like em post
  IF NEW.post_id IS NOT NULL THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  END IF;

  -- Like em comentário
  IF NEW.comment_id IS NOT NULL THEN
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar contador de likes
CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Unlike em post
  IF OLD.post_id IS NOT NULL THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;

  -- Unlike em comentário
  IF OLD.comment_id IS NOT NULL THEN
    UPDATE public.comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- PASSO 2: Remover triggers existentes (se houver)
-- ============================================

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
DROP TRIGGER IF EXISTS on_like_created ON public.likes;
DROP TRIGGER IF EXISTS on_like_deleted ON public.likes;


-- PASSO 3: Criar os triggers
-- ============================================

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comments_count();

CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comments_count();

CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_likes_count();

CREATE TRIGGER on_like_deleted
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_likes_count();


-- PASSO 4: Recalcular TODOS os contadores existentes
-- ============================================

-- Recalcular comentários
UPDATE public.posts p
SET comments_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.comments c
  WHERE c.post_id = p.id
);

-- Recalcular likes em posts
UPDATE public.posts p
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.post_id = p.id
);

-- Recalcular likes em comentários
UPDATE public.comments c
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.likes l
  WHERE l.comment_id = c.id
);

-- Garantir que shares_count e views_count não sejam NULL
UPDATE public.posts
SET shares_count = COALESCE(shares_count, 0),
    views_count = COALESCE(views_count, 0);


-- PASSO 5: Verificar os resultados
-- ============================================

SELECT
  '=== POSTS COM CONTADORES ===' as info;

SELECT
  p.id,
  LEFT(p.content, 40) as conteudo,
  prof.name as autor,
  p.likes_count as curtidas,
  p.comments_count as comentarios,
  p.shares_count as compartilhamentos,
  p.created_at
FROM public.posts p
LEFT JOIN public.profiles prof ON p.author_id = prof.id
ORDER BY p.created_at DESC;

SELECT
  '=== COMENTÁRIOS COM CONTADORES ===' as info;

SELECT
  c.id,
  LEFT(c.content, 40) as conteudo,
  prof.name as autor,
  c.likes_count as curtidas,
  c.created_at
FROM public.comments c
LEFT JOIN public.profiles prof ON c.author_id = prof.id
ORDER BY c.created_at DESC
LIMIT 10;

SELECT
  '=== TRIGGERS CRIADOS ===' as info;

SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'on_comment_created',
    'on_comment_deleted',
    'on_like_created',
    'on_like_deleted'
  )
ORDER BY event_object_table, trigger_name;

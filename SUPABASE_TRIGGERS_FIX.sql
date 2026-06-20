-- ============================================
-- CORRIGIR TRIGGERS DE CONTADORES
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Remover triggers antigos (se existirem)
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
DROP TRIGGER IF EXISTS on_like_created ON public.likes;
DROP TRIGGER IF EXISTS on_like_deleted ON public.likes;

DROP FUNCTION IF EXISTS increment_comment_count();
DROP FUNCTION IF EXISTS decrement_comment_count();
DROP FUNCTION IF EXISTS increment_post_likes();
DROP FUNCTION IF EXISTS decrement_post_likes();

-- 2. Criar função para incrementar contador de comentários
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função para decrementar contador de comentários
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar função para incrementar contador de likes
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para decrementar contador de likes
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.post_id IS NOT NULL THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar triggers para comentários
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_comment_count();

CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_comment_count();

-- 7. Criar triggers para likes
CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes();

CREATE TRIGGER on_like_deleted
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes();

-- 8. Corrigir contadores atuais (recalcular baseado nos dados existentes)
UPDATE public.posts p
SET comments_count = (
  SELECT COUNT(*)
  FROM public.comments c
  WHERE c.post_id = p.id
);

UPDATE public.posts p
SET likes_count = (
  SELECT COUNT(*)
  FROM public.likes l
  WHERE l.post_id = p.id
);

-- Verificar se os triggers foram criados
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('comments', 'likes')
ORDER BY event_object_table, trigger_name;

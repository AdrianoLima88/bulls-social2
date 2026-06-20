-- ============================================
-- ADICIONAR SISTEMA DE SHARES, VIEWS E NOTIFICAÇÕES
-- Execute no Supabase SQL Editor
-- Versão 2 - Corrigida para re-execução
-- ============================================

-- ============================================
-- 1. TABELA DE SHARES (Compartilhamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT, -- whatsapp, telegram, twitter, linkedin, email, sms, bulls
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id, platform)
);

-- Index para melhor performance
CREATE INDEX IF NOT EXISTS idx_shares_post_id ON public.shares(post_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);

-- RLS para shares
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all shares" ON public.shares;
CREATE POLICY "Users can view all shares" ON public.shares
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own shares" ON public.shares;
CREATE POLICY "Users can create their own shares" ON public.shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. TABELA DE VIEWS (Visualizações)
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT, -- Para visitantes não autenticados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para melhor performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON public.post_views(user_id);

-- RLS para views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all post views" ON public.post_views;
CREATE POLICY "Users can view all post views" ON public.post_views
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create post views" ON public.post_views;
CREATE POLICY "Anyone can create post views" ON public.post_views
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. TRIGGERS PARA SHARES
-- ============================================

-- Incrementar contador de shares
CREATE OR REPLACE FUNCTION increment_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = shares_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrementar contador de shares (caso apague)
CREATE OR REPLACE FUNCTION decrement_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET shares_count = GREATEST(shares_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers
DROP TRIGGER IF EXISTS on_share_created ON public.shares;
CREATE TRIGGER on_share_created
  AFTER INSERT ON public.shares
  FOR EACH ROW
  EXECUTE FUNCTION increment_shares_count();

DROP TRIGGER IF EXISTS on_share_deleted ON public.shares;
CREATE TRIGGER on_share_deleted
  AFTER DELETE ON public.shares
  FOR EACH ROW
  EXECUTE FUNCTION decrement_shares_count();

-- ============================================
-- 4. TRIGGERS PARA VIEWS
-- ============================================

-- Incrementar contador de views
CREATE OR REPLACE FUNCTION increment_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET views_count = views_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_view_created ON public.post_views;
CREATE TRIGGER on_view_created
  AFTER INSERT ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_views_count();

-- ============================================
-- 5. TRIGGERS PARA NOTIFICAÇÕES AUTOMÁTICAS
-- ============================================

-- Notificação quando alguém curte seu post
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Pegar o autor do post
  SELECT author_id INTO post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Não criar notificação se curtiu o próprio post
  IF post_author_id != NEW.user_id AND post_author_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, actor_id, post_id)
    VALUES (post_author_id, 'like', NEW.user_id, NEW.post_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_create_notification ON public.likes;
CREATE TRIGGER on_like_create_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL)
  EXECUTE FUNCTION create_like_notification();

-- Notificação quando alguém comenta no seu post
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Pegar o autor do post
  SELECT author_id INTO post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Não criar notificação se comentou no próprio post
  IF post_author_id != NEW.author_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, post_id, comment_id, content)
    VALUES (post_author_id, 'comment', NEW.author_id, NEW.post_id, NEW.id, NEW.content);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_create_notification ON public.comments;
CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- Notificação quando alguém te segue
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_create_notification ON public.follows;
CREATE TRIGGER on_follow_create_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- Notificação quando alguém compartilha seu post
CREATE OR REPLACE FUNCTION create_share_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Pegar o autor do post
  SELECT author_id INTO post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Não criar notificação se compartilhou o próprio post
  IF post_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, post_id)
    VALUES (post_author_id, 'share', NEW.user_id, NEW.post_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_share_create_notification ON public.shares;
CREATE TRIGGER on_share_create_notification
  AFTER INSERT ON public.shares
  FOR EACH ROW
  EXECUTE FUNCTION create_share_notification();

-- ============================================
-- 6. FUNÇÃO PARA MARCAR NOTIFICAÇÕES COMO LIDAS
-- ============================================
CREATE OR REPLACE FUNCTION mark_notifications_as_read(notification_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE id = ANY(notification_ids)
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FUNÇÃO PARA MARCAR TODAS AS NOTIFICAÇÕES COMO LIDAS
-- ============================================
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = auth.uid()
  AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT
  '✅ Tabelas criadas' as status,
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('shares', 'post_views');

SELECT
  '✅ Triggers criados' as status,
  COUNT(*) as total_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
  'on_share_created',
  'on_share_deleted',
  'on_view_created',
  'on_like_create_notification',
  'on_comment_create_notification',
  'on_follow_create_notification',
  'on_share_create_notification'
);

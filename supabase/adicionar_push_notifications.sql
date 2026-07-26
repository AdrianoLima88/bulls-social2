-- ============================================================
-- Push Notifications nativas (OneSignal) — já aplicado no projeto
-- via Supabase MCP em 2026-06-28. Mantido aqui apenas para
-- referência/histórico de versionamento.
-- ============================================================

-- Habilita chamadas HTTP assíncronas do Postgres (necessário para acionar a Edge Function)
create extension if not exists pg_net;

create or replace function public.notify_push_on_notification()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  actor_name text;
  msg text;
begin
  if NEW.actor_id is not null then
    select coalesce(name, username, 'Alguém') into actor_name
    from public.profiles where id = NEW.actor_id;
  end if;
  actor_name := coalesce(actor_name, 'Alguém');

  msg := case NEW.type
    when 'like' then actor_name || ' curtiu seu post'
    when 'comment' then actor_name || ' comentou: "' || coalesce(left(NEW.content, 80), '') || '"'
    when 'follow' then actor_name || ' começou a seguir você'
    when 'share' then actor_name || ' compartilhou seu post'
    when 'mention' then actor_name || ' mencionou você'
    else actor_name || ' interagiu com você'
  end;

  -- Chama a Edge Function "send-notification", que envia o push via OneSignal.
  -- O header x-webhook-secret precisa bater com o valor checado em
  -- supabase/functions/send-notification/index.ts (WEBHOOK_SECRET).
  perform net.http_post(
    url := 'https://ewjopuynehppzozgzsht.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '1b85c5bc9fc8dc21be46fc4d3fb89bb4e4ac768bbc252b7df65e263ab3f17e6b'
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id::text,
      'title', 'Bulls',
      'message', msg,
      'type', NEW.type
    ),
    timeout_milliseconds := 5000
  );

  return NEW;
end;
$function$;

drop trigger if exists on_notification_created_push on public.notifications;
create trigger on_notification_created_push
  after insert on public.notifications
  for each row execute function public.notify_push_on_notification();

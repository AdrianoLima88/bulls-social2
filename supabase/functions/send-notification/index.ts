// supabase/functions/send-notification/index.ts
// Deploy: supabase functions deploy send-notification --no-verify-jwt
// Chamada pelo trigger do Postgres (tabela notifications) via pg_net — não é chamada pelo client.
// Autenticação: header "x-webhook-secret" precisa bater com WEBHOOK_SECRET.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ONESIGNAL_APP_ID = 'ad9d92dd-6826-4a42-91d0-b96a2aa05943';
const ONESIGNAL_REST_API_KEY = 'os_v2_app_vwozfxliezfefeoqxfvcviczipocr34ler5usc4nwlu66i7ancfzg3uhvf7sidb3xn7dlzjrgs3cnx7v4pcuqapxngu25x2sko3vbgi';
const WEBHOOK_SECRET = '1b85c5bc9fc8dc21be46fc4d3fb89bb4e4ac768bbc252b7df65e263ab3f17e6b';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Autenticação simples via secret compartilhado (chamada vem do trigger do Postgres)
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { user_id, title, message, url, type } = await req.json();

    if (!user_id || !title || !message) {
      throw new Error('Missing required fields: user_id, title, message');
    }

    const notification = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      filters: [
        { field: 'tag', key: 'supabase_user_id', relation: '=', value: user_id }
      ],
      url: url || 'https://social-media-2-phi.vercel.app',
      data: { type, user_id },
      chrome_web_icon: 'https://social-media-2-phi.vercel.app/icon-192.png',
      ttl: 86400,
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(`OneSignal error: ${JSON.stringify(result)}`);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

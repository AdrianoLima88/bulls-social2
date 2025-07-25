import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const body = await req.json();
    const { portfolio, signals, plan, username, date } = body;

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

    // Build portfolio context
    const portfolioContext = portfolio.length > 0
      ? portfolio.map((a: any) => {
          const currentVal = a.quantity * a.current_price;
          const invested   = a.quantity * a.avg_price;
          const pnl        = currentVal - invested;
          const pct        = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0';
          return `${a.code} (${a.type}): qty=${a.quantity}, avg=$${a.avg_price}, now=$${a.current_price}, P&L=${pct}%`;
        }).join('\n')
      : 'No portfolio assets yet.';

    // Build signals context
    const signalsContext = signals.length > 0
      ? signals.map((s: any) => `${s.ticker}: ${s.bullPct}% bullish (${s.totalVotes} votes)`).join(', ')
      : 'No signals available yet.';

    const today = date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `You are BullsBrief, the morning intelligence briefing for BullsGo — a social investment network.

Today is ${today}. Generate a concise, insightful morning brief for ${username}.

IMPORTANT RULES:
- Write in clean, engaging prose with minimal fluff
- Use markdown: **bold** for key figures, ## for section headers, - for bullet points
- Sections MUST be: ## Market Pulse, ## Your Portfolio, ## Today's Signals, ## Watch Today
- Keep each section to 3-5 bullet points max
- Be specific and data-driven where possible
- End with one actionable "Key Takeaway" sentence
- Do NOT add disclaimers or "I'm an AI" statements
- Match the user's language (if they have Portuguese posts, respond in Portuguese; otherwise English)

User plan: ${plan}
User portfolio:
${portfolioContext}

BullsSignal community sentiment:
${signalsContext}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Generate my morning brief for ${today}. Be concise and insightful.` }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error: ${err}`);
    }

    const data = await response.json();
    const brief = data.content?.[0]?.text ?? '';

    return new Response(
      JSON.stringify({ brief, date: today, generated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

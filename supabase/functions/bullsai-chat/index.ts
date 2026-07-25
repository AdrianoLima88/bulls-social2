// supabase/functions/bullsai-chat/index.ts
// Deploy: supabase functions deploy bullsai-chat

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PortfolioAsset {
  code: string;
  type: string;
  quantity: number;
  avg_price: number;
  current_price?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      messages,          // ChatMessage[] — full conversation history
      portfolio,         // PortfolioAsset[]
      plan,              // 'free' | 'pro' | 'premium' | 'business'
      username,
      signal,            // optional: BullsSignal data { ticker, sentiment, mentions }[]
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build portfolio context
    const portfolioText = buildPortfolioContext(portfolio || [], plan || 'free');
    const signalText = signal && signal.length > 0 ? buildSignalContext(signal) : '';

    const systemPrompt = `You are BullsAI, the personal investment advisor inside BullsGo — a social investment network.

You are talking to ${username || 'the investor'}, a BullsGo ${plan || 'free'} plan user.

## Their Portfolio
${portfolioText}

${signalText ? `## BullsSignal — Community Sentiment (last 7 days)\n${signalText}\n` : ''}

## Your role
- Give personalized, actionable investment advice based on their SPECIFIC portfolio above
- When they ask about a stock/crypto they hold, always reference their position (quantity, avg price, current P&L)
- Be concise and direct. No fluff. Use plain language with financial accuracy.
- Mention risk whenever suggesting action
- Never guarantee returns
- You can analyze the BullsSignal data to show community sentiment for assets they ask about
- For ${plan === 'free' ? 'free plan users, give solid general advice but mention Pro/Premium for deeper analysis' : plan + ' plan users, give full institutional-grade analysis'}
- Respond in the SAME LANGUAGE the user writes in (Portuguese if they write in Portuguese, English if English, etc.)
- Keep responses under 250 words unless a detailed breakdown is explicitly requested

Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;

    // Call Anthropic Claude API
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic error:', errText);
      return new Response(JSON.stringify({ error: 'AI service error', details: errText }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await anthropicRes.json();
    const reply = data.content?.[0]?.text ?? '';

    return new Response(JSON.stringify({ reply, usage: data.usage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('BullsAI error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ─── Helpers ──────────────────────────────────────────────────

function buildPortfolioContext(assets: PortfolioAsset[], plan: string): string {
  if (!assets || assets.length === 0) {
    return 'No assets in portfolio yet.';
  }

  let totalInvested = 0;
  let totalCurrent = 0;

  const lines = assets.map(a => {
    const invested = a.quantity * a.avg_price;
    const current = a.quantity * (a.current_price || a.avg_price);
    const pnl = current - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    totalInvested += invested;
    totalCurrent += current;

    const sign = pnl >= 0 ? '+' : '';
    return `- ${a.code} (${a.type}): ${a.quantity} units @ ${a.avg_price.toFixed(2)} avg | Current: ${(a.current_price || a.avg_price).toFixed(2)} | P&L: ${sign}${pnlPct.toFixed(1)}%`;
  });

  const totalPnl = totalCurrent - totalInvested;
  const totalPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const sign = totalPnl >= 0 ? '+' : '';

  return [
    `Total invested: ${totalInvested.toFixed(2)} | Current value: ${totalCurrent.toFixed(2)} | Overall P&L: ${sign}${totalPct.toFixed(2)}%`,
    `${assets.length} assets:`,
    ...lines,
  ].join('\n');
}

function buildSignalContext(signals: { ticker: string; sentiment: number; mentions: number }[]): string {
  if (!signals || signals.length === 0) return '';
  return signals.slice(0, 15).map(s => {
    const label = s.sentiment > 20 ? '🟢 Bullish' : s.sentiment < -20 ? '🔴 Bearish' : '🟡 Neutral';
    return `- ${s.ticker}: ${label} (score ${s.sentiment > 0 ? '+' : ''}${s.sentiment}, ${s.mentions} mentions)`;
  }).join('\n');
}

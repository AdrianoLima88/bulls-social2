// supabase/functions/stripe-checkout/index.ts
// Deploy: supabase functions deploy stripe-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Price IDs (Test Mode) ────────────────────────────────────
const PRICE_IDS = {
  premium_monthly:  'price_1TfUcUH1LrvOH1CKawKzROWn',
  premium_yearly:   'price_1TfUcxH1LrvOH1CKd1uxh2Ei',
  pro_monthly:      'price_1TfUdQH1LrvOH1CKzxPrDk05',
  pro_yearly:       'price_1TfUdrH1LrvOH1CKzhoYl8DM',
  business_monthly: 'price_1TfUeDH1LrvOH1CKu6TPzugF',
  business_yearly:  'price_1TfUeZH1LrvOH1CKcJfx5Q8k',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Not authenticated');

    const body = await req.json();
    const { action } = body;

    // ── CREATE CHECKOUT SESSION ──────────────────────────────
    if (action === 'create_checkout') {
      const { plan, billing_cycle } = body;
      const priceKey = `${plan}_${billing_cycle}` as keyof typeof PRICE_IDS;
      const priceId = PRICE_IDS[priceKey];
      if (!priceId) throw new Error(`Invalid plan/cycle: ${priceKey}`);

      // Get or create Stripe customer
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      let customerId = sub?.stripe_customer_id;
      if (!customerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single();

        const customer = await stripe.customers.create({
          email: profile?.email || user.email,
          name: profile?.name,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;

        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'inactive',
        }, { onConflict: 'user_id' });
      }

      const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${frontendUrl}?payment=success&plan=${plan}`,
        cancel_url: `${frontendUrl}?payment=cancelled`,
        metadata: { supabase_user_id: user.id, plan, billing_cycle },
        subscription_data: {
          metadata: { supabase_user_id: user.id, plan, billing_cycle },
        },
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── CREATE TIP PAYMENT ───────────────────────────────────
    if (action === 'create_tip') {
      const { amount, currency = 'eur', receiver_id, message } = body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency,
            product_data: { name: 'Tip for Bulls creator' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${Deno.env.get('FRONTEND_URL')}?tip=success`,
        cancel_url: `${Deno.env.get('FRONTEND_URL')}?tip=cancelled`,
        metadata: {
          supabase_user_id: user.id,
          receiver_id,
          message: message || '',
          type: 'tip',
        },
      });

      await supabase.from('tips').insert({
        sender_id: user.id,
        receiver_id,
        amount,
        currency,
        message,
        stripe_payment_id: session.payment_intent as string,
        status: 'pending',
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── GET SUBSCRIPTION ─────────────────────────────────────
    if (action === 'get_subscription') {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── CANCEL SUBSCRIPTION ──────────────────────────────────
    if (action === 'cancel_subscription') {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .single();

      if (sub?.stripe_subscription_id) {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
        await supabase.from('subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('user_id', user.id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── CREATE BILLING PORTAL SESSION ────────────────────────
    if (action === 'create_portal_session') {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (!sub?.stripe_customer_id) throw new Error('No Stripe customer found');

      const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: frontendUrl,
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── REACTIVATE SUBSCRIPTION ──────────────────────────────
    if (action === 'reactivate_subscription') {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .single();

      if (sub?.stripe_subscription_id) {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: false,
        });
        await supabase.from('subscriptions')
          .update({ cancel_at_period_end: false })
          .eq('user_id', user.id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (err) {
    console.error('stripe-checkout error:', err?.message || err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

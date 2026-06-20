// supabase/functions/stripe-webhook/index.ts
// Deploy: supabase functions deploy stripe-webhook
// Set webhook URL in Stripe Dashboard:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
// Events to listen: checkout.session.completed, customer.subscription.updated,
//                   customer.subscription.deleted, invoice.payment_failed

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('No signature', { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEventAsync
      ? await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '')
      : stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '');
  } catch (err) {
    return new Response(`Webhook signature error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  switch (event.type) {

    // ── Checkout completed (new subscription or tip) ─────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;
      const billingCycle = session.metadata?.billing_cycle;
      const type = session.metadata?.type;

      if (type === 'tip') {
        // Mark tip as completed
        await supabase.from('tips')
          .update({ status: 'completed' })
          .eq('stripe_payment_id', session.payment_intent as string);
        break;
      }

      if (userId && plan && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          billing_cycle: billingCycle || 'monthly',
          status: 'active',
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        // Update user_type in profile
        const userType = plan === 'business' ? 'business' : 'investor';
        await supabase.from('profiles')
          .update({ user_type: userType })
          .eq('id', userId);
      }
      break;
    }

    // ── Subscription updated ─────────────────────────────────
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase.from('subscriptions')
        .update({
          status: sub.status === 'active' ? 'active' : sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      break;
    }

    // ── Subscription cancelled/deleted ───────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase.from('subscriptions')
        .update({
          status: 'cancelled',
          plan: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      await supabase.from('profiles')
        .update({ user_type: 'investor' })
        .eq('id', userId);
      break;
    }

    // ── Payment failed ───────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase.from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

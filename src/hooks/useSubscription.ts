import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'premium' | 'pro' | 'business';
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (err && err.code !== 'PGRST116') throw err;
      setSubscription(data || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Call Stripe checkout via Supabase Edge Function
  const startCheckout = useCallback(async (
    plan: 'premium' | 'pro' | 'business',
    billing_cycle: 'monthly' | 'yearly'
  ) => {
    if (!user) return { error: 'Not authenticated' };
    setCheckoutLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ action: 'create_checkout', plan, billing_cycle }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return { error: null };
    } catch (e: any) {
      const msg = e.message || 'Payment setup failed. Please try again.';
      setError(msg);
      return { error: msg };
    } finally {
      setCheckoutLoading(false);
    }
  }, [user]);

  // Send a tip via Stripe
  const sendTip = useCallback(async (
    receiverId: string,
    amount: number,
    message: string,
    currency = 'eur'
  ) => {
    if (!user) return { error: 'Not authenticated' };
    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'create_tip',
            amount,
            currency,
            receiver_id: receiverId,
            message,
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setCheckoutLoading(false);
    }
  }, [user]);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ action: 'cancel_subscription' }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchSubscription();
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  }, [user, fetchSubscription]);

  // Helpers
  const isPremium = subscription?.plan !== 'free' && subscription?.status === 'active';
  const isPro = (subscription?.plan === 'pro' || subscription?.plan === 'business') && subscription?.status === 'active';
  const isBusiness = subscription?.plan === 'business' && subscription?.status === 'active';
  const currentPlan = subscription?.plan || 'free';

  // Check URL for payment result on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setTimeout(fetchSubscription, 2000); // Give webhook time to process
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchSubscription]);

  useEffect(() => {
    fetchSubscription();
    if (!user) return;
    // Realtime subscription updates
    const channel = supabase
      .channel(`subscription_${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, fetchSubscription)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchSubscription]);

  return {
    subscription,
    loading,
    checkoutLoading,
    error,
    isPremium,
    isPro,
    isBusiness,
    currentPlan,
    startCheckout,
    sendTip,
    cancelSubscription,
    refresh: fetchSubscription,
  };
}

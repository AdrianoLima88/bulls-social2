import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface SponsoredPost {
  id: string;
  advertiser_id: string;
  title: string;
  content: string;
  cta_label: string;
  cta_url: string | null;
  budget: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  // joined
  advertiser_name?: string;
  advertiser_avatar?: string;
  advertiser_username?: string;
}

export interface CreateCampaignInput {
  title: string;
  content: string;
  cta_label: string;
  cta_url: string;
  budget: number;
}

// ─── Feed hook — todos os posts sponsored ativos (para injeção no feed) ──────
export const useSponsoredFeed = () => {
  const [sponsored, setSponsored] = useState<SponsoredPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('sponsored_posts')
        .select(`
          *,
          profiles:advertiser_id (
            name,
            avatar_url,
            username
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setSponsored(
        (data || []).map((s: any) => ({
          ...s,
          advertiser_name:     s.profiles?.name     || 'Advertiser',
          advertiser_avatar:   s.profiles?.avatar_url || null,
          advertiser_username: s.profiles?.username  || '',
        }))
      );
    } catch (e) {
      console.error('useSponsored feed error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const trackImpression = useCallback(async (id: string) => {
    await supabase.rpc('increment_sponsored_impression', { post_id: id });
  }, []);

  const trackClick = useCallback(async (id: string) => {
    await supabase.rpc('increment_sponsored_click', { post_id: id });
    setSponsored(prev =>
      prev.map(s => s.id === id ? { ...s, clicks: s.clicks + 1 } : s)
    );
  }, []);

  return { sponsored, loading, trackImpression, trackClick };
};

// ─── Business hook — campanhas do próprio anunciante ────────────────────────
export const useMyCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<SponsoredPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('sponsored_posts')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setCampaigns(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const createCampaign = useCallback(async (input: CreateCampaignInput) => {
    if (!user) return false;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('sponsored_posts')
        .insert({
          advertiser_id: user.id,
          title:     input.title,
          content:   input.content,
          cta_label: input.cta_label || 'Learn More',
          cta_url:   input.cta_url || null,
          budget:    input.budget || 0,
          status:    'active',
        })
        .select()
        .single();

      if (err) throw err;
      setCampaigns(prev => [data, ...prev]);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const toggleStatus = useCallback(async (id: string, current: 'active' | 'paused' | 'completed') => {
    const next = current === 'active' ? 'paused' : 'active';
    await supabase.from('sponsored_posts').update({ status: next }).eq('id', id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: next } : c));
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    await supabase.from('sponsored_posts').delete().eq('id', id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  return { campaigns, loading, submitting, error, createCampaign, toggleStatus, deleteCampaign, refresh: fetch };
};

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface PortfolioAsset {
  id: string;
  user_id: string;
  code: string;
  type: 'acao' | 'fii' | 'crypto' | 'internacional';
  quantity: number;
  avg_price: number;
  current_price?: number;
  created_at: string;
  updated_at: string;
}

export const usePortfolio = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch user's portfolio
  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add asset to portfolio
  const addAsset = async (assetData: {
    code: string;
    type: 'acao' | 'fii' | 'crypto' | 'internacional';
    quantity: number;
    avg_price: number;
  }) => {
    if (!user) {
      console.error('User not authenticated');
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_assets')
        .insert({
          user_id: user.id,
          code: assetData.code.toUpperCase(),
          type: assetData.type,
          quantity: assetData.quantity,
          avg_price: assetData.avg_price,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh portfolio after adding
      await fetchPortfolio();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding asset:', error);
      return { error };
    }
  };

  // Update asset in portfolio
  const updateAsset = async (
    assetId: string,
    updates: {
      quantity?: number;
      avg_price?: number;
      current_price?: number;
    }
  ) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('portfolio_assets')
        .update(updates)
        .eq('id', assetId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh portfolio after updating
      await fetchPortfolio();
      return { error: null };
    } catch (error) {
      console.error('Error updating asset:', error);
      return { error };
    }
  };

  // Remove asset from portfolio
  const removeAsset = async (assetId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('portfolio_assets')
        .delete()
        .eq('id', assetId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh portfolio after removing
      await fetchPortfolio();
      return { error: null };
    } catch (error) {
      console.error('Error removing asset:', error);
      return { error };
    }
  };

  // Calculate portfolio totals
  const getPortfolioSummary = () => {
    const totalInvested = assets.reduce(
      (sum, asset) => sum + asset.quantity * asset.avg_price,
      0
    );

    const totalCurrent = assets.reduce(
      (sum, asset) =>
        sum + asset.quantity * (asset.current_price || asset.avg_price),
      0
    );

    const profit = totalCurrent - totalInvested;
    const profitPercentage = totalInvested > 0
      ? ((profit / totalInvested) * 100)
      : 0;

    return {
      totalInvested,
      totalCurrent,
      profit,
      profitPercentage,
      assetCount: assets.length,
    };
  };

  // Fetch portfolio on mount
  useEffect(() => {
    if (user) {
      fetchPortfolio();

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`portfolio_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'portfolio_assets',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchPortfolio();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    removeAsset,
    getPortfolioSummary,
    refresh: fetchPortfolio,
  };
};

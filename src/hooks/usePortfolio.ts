import { useState, useEffect, useCallback } from 'react';
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

  const fetchPortfolio = useCallback(async () => {
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
  }, [user]);

  // Add or update asset — if already exists, merge quantities with weighted avg price
  const addAsset = async (assetData: {
    code: string;
    type: string;
    quantity: number;
    avg_price: number;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const code = assetData.code.toUpperCase();

      // Check if asset already exists
      const existing = assets.find(a => a.code.toUpperCase() === code);

      if (existing) {
        // Merge: calculate new weighted average price
        const totalOldValue = existing.quantity * existing.avg_price;
        const totalNewValue = assetData.quantity * assetData.avg_price;
        const newQuantity = existing.quantity + assetData.quantity;
        const newAvgPrice = (totalOldValue + totalNewValue) / newQuantity;

        const { error } = await supabase
          .from('portfolio_assets')
          .update({
            quantity: newQuantity,
            avg_price: Math.round(newAvgPrice * 100) / 100,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update state directly
        setAssets(prev => prev.map(a =>
          a.id === existing.id
            ? { ...a, quantity: newQuantity, avg_price: Math.round(newAvgPrice * 100) / 100 }
            : a
        ));

        return { data: existing, error: null, merged: true };
      } else {
        // New asset — insert
        const { data, error } = await supabase
          .from('portfolio_assets')
          .insert({
            user_id: user.id,
            code,
            type: assetData.type,
            quantity: assetData.quantity,
            avg_price: assetData.avg_price,
          })
          .select()
          .single();

        if (error) throw error;

        setAssets(prev => [data, ...prev]);
        return { data, error: null, merged: false };
      }
    } catch (error) {
      console.error('Error adding asset:', error);
      return { error };
    }
  };

  const updateAsset = async (assetId: string, updates: { quantity?: number; avg_price?: number; current_price?: number }) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { error } = await supabase
        .from('portfolio_assets')
        .update(updates)
        .eq('id', assetId)
        .eq('user_id', user.id);

      if (error) throw error;
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, ...updates } : a));
      return { error: null };
    } catch (error) {
      console.error('Error updating asset:', error);
      return { error };
    }
  };

  const removeAssetByCode = async (code: string) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { error } = await supabase
        .from('portfolio_assets')
        .delete()
        .eq('user_id', user.id)
        .ilike('code', code);

      if (error) throw error;
      setAssets(prev => prev.filter(a => a.code.toUpperCase() !== code.toUpperCase()));
      return { error: null };
    } catch (e: any) {
      console.error('removeAssetByCode error:', e);
      return { error: e.message };
    }
  };

  const removeAsset = async (assetId: string) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { error } = await supabase
        .from('portfolio_assets')
        .delete()
        .eq('id', assetId)
        .eq('user_id', user.id);

      if (error) throw error;
      setAssets(prev => prev.filter(a => a.id !== assetId));
      return { error: null };
    } catch (error) {
      console.error('Error removing asset:', error);
      return { error };
    }
  };

  const getPortfolioSummary = () => {
    const totalInvested = assets.reduce((sum, a) => sum + a.quantity * a.avg_price, 0);
    const totalCurrent = assets.reduce((sum, a) => sum + a.quantity * (a.current_price || a.avg_price), 0);
    const profit = totalCurrent - totalInvested;
    const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrent, profit, profitPercentage, assetCount: assets.length };
  };

  useEffect(() => {
    if (!user) return;
    fetchPortfolio();
  }, [user, fetchPortfolio]);

  return { assets, loading, addAsset, updateAsset, removeAsset, removeAssetByCode, getPortfolioSummary, refresh: fetchPortfolio };
};

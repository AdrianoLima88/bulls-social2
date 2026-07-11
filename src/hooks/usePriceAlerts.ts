import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface PriceAlert {
  id: string;
  user_id: string;
  asset_code: string;
  asset_type: string;
  target_price: number;
  direction: 'above' | 'below';
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const usePriceAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const createAlert = async (params: {
    asset_code: string;
    asset_type: string;
    target_price: number;
    direction: 'above' | 'below';
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({ ...params, user_id: user.id })
      .select()
      .single();
    if (!error && data) setAlerts(prev => [data, ...prev]);
    return { data, error };
  };

  const deleteAlert = async (id: string) => {
    await supabase.from('price_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  /** Chamado quando o portfolio carrega — verifica alertas activos vs preço actual */
  const checkAlerts = useCallback(async (assetCode: string, currentPrice: number) => {
    if (!user) return;
    const active = alerts.filter(
      a => a.is_active && a.asset_code.toUpperCase() === assetCode.toUpperCase()
    );
    for (const alert of active) {
      const triggered =
        (alert.direction === 'above' && currentPrice >= alert.target_price) ||
        (alert.direction === 'below' && currentPrice <= alert.target_price);

      if (triggered) {
        // Marcar como inactivo + registar timestamp
        await supabase
          .from('price_alerts')
          .update({ is_active: false, triggered_at: new Date().toISOString() })
          .eq('id', alert.id);

        // Criar notificação
        const currency = alert.asset_type === 'crypto' || alert.asset_type === 'internacional' ? '$' : '€';
        await supabase.from('notifications').insert({
          user_id: user.id,
          actor_id: user.id,
          type: 'price_alert',
          content: `${alert.asset_code} atingiu ${currency}${Number(alert.target_price).toFixed(2)} — o seu alerta de preço foi disparado!`,
          read: false,
        });

        setAlerts(prev =>
          prev.map(a =>
            a.id === alert.id
              ? { ...a, is_active: false, triggered_at: new Date().toISOString() }
              : a
          )
        );
      }
    }
  }, [user, alerts]);

  const alertsForAsset = (code: string) =>
    alerts.filter(a => a.asset_code.toUpperCase() === code.toUpperCase());

  return { alerts, loading, createAlert, deleteAlert, checkAlerts, alertsForAsset, refresh: fetchAlerts };
};

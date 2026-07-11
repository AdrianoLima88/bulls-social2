import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Invite {
  id: string;
  email: string;
  status: 'pending' | 'accepted';
  created_at: string;
  invited_user?: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

export function useInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchInvites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('invites')
        .select(`
          id, email, status, created_at,
          invited_user:profiles!invites_invited_user_id_fkey(id, name, username, avatar_url)
        `)
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false });

      setInvites((data as any[]) || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const sendInvite = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not logged in' };
    setSending(true);
    try {
      const { error } = await supabase
        .from('invites')
        .insert({ inviter_id: user.id, email: email.toLowerCase().trim() });

      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'You already sent an invite to this email.' };
        }
        throw error;
      }

      await fetchInvites();
      return { success: true, message: 'Invite sent!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to send invite.' };
    } finally {
      setSending(false);
    }
  }, [user, fetchInvites]);

  const acceptedInvites = invites.filter(i => i.status === 'accepted' && i.invited_user);
  const pendingCount = invites.filter(i => i.status === 'pending').length;

  return { invites, acceptedInvites, pendingCount, loading, sending, sendInvite, refetch: fetchInvites };
}

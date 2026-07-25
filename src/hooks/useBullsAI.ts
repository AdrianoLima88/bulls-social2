import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { usePortfolio } from './usePortfolio';
import { useSubscription } from './useSubscription';
import { useAuth } from '../contexts/AuthContext';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm **BullsAI**, your personal investment advisor on BullsGo.\n\nI know your portfolio and can answer questions about your positions, market trends, or help you think through investment decisions.\n\nWhat would you like to know?",
  timestamp: new Date(),
};

export const useBullsAI = () => {
  const { assets } = usePortfolio();
  const { currentPlan } = useSubscription() as any;
  const { user, profile } = useAuth() as any;

  const [messages, setMessages] = useState<AIMessage[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = useCallback(async (text: string, signalData?: any[]) => {
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    // Build conversation history for the API (skip welcome message)
    const history = [...messages.filter(m => m.id !== 'welcome'), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('bullsai-chat', {
        body: {
          messages: history,
          portfolio: assets.map(a => ({
            code: a.code,
            type: a.type,
            quantity: a.quantity,
            avg_price: a.avg_price,
            current_price: a.current_price,
          })),
          plan: currentPlan || 'free',
          username: profile?.name || profile?.username || 'Investor',
          signal: signalData || [],
        },
      });

      if (res.error) throw new Error(res.error.message || 'AI error');

      const reply = res.data?.reply;
      if (!reply) throw new Error('Empty response from AI');

      const aiMsg: AIMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response. Try again.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading, assets, currentPlan, profile]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME]);
    setError('');
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
};

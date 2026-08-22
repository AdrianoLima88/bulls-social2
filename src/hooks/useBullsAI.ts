import { useState, useCallback, useEffect } from 'react';
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

export interface Conversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'bullsai_conversations';
const MAX_CONVERSATIONS = 30;

const WELCOME_TEXT =
  "Hi! I'm **BullsAI**, your personal investment advisor on BullsGo.\n\nI know your portfolio and can answer questions about your positions, market trends, or help you think through investment decisions.\n\nWhat would you like to know?";

const makeWelcome = (): AIMessage => ({
  id: 'welcome',
  role: 'assistant',
  content: WELCOME_TEXT,
  timestamp: new Date(),
});

const genId = () => `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const loadSaved = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Conversation[]).map(c => ({
      ...c,
      messages: c.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp as any) })),
    }));
  } catch { return []; }
};

const persist = (convs: Conversation[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, MAX_CONVERSATIONS))); }
  catch { /* quota */ }
};

export const useBullsAI = () => {
  const { assets } = usePortfolio();
  const { currentPlan } = useSubscription() as any;
  const { profile } = useAuth() as any;

  const [conversations, setConversations] = useState<Conversation[]>(loadSaved);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([makeWelcome()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { persist(conversations); }, [conversations]);

  const startNewConversation = useCallback(() => {
    setActiveConvId(null);
    setMessages([makeWelcome()]);
    setError('');
  }, []);

  const loadConversation = useCallback((id: string, allConvs?: Conversation[]) => {
    const list = allConvs ?? conversations;
    const conv = list.find(c => c.id === id);
    if (!conv) return;
    setActiveConvId(id);
    setMessages(conv.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp as any) })));
    setError('');
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([makeWelcome()]);
    }
  }, [activeConvId]);

  const sendMessage = useCallback(async (text: string, signalData?: any[]) => {
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = { id: `u_${Date.now()}`, role: 'user', content: text.trim(), timestamp: new Date() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setLoading(true);
    setError('');

    const history = withUser.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('bullsai-chat', {
        body: {
          messages: history,
          portfolio: assets.map(a => ({
            code: a.code, type: a.type, quantity: a.quantity,
            avg_price: a.avg_price, current_price: a.current_price,
          })),
          plan: currentPlan || 'free',
          username: profile?.name || profile?.username || 'Investor',
          signal: signalData || [],
        },
      });

      if (res.error) throw new Error(res.error.message || 'AI error');
      const reply = res.data?.reply;
      if (!reply) throw new Error('Empty response from AI');

      const aiMsg: AIMessage = { id: `a_${Date.now()}`, role: 'assistant', content: reply, timestamp: new Date() };
      const finalMsgs = [...withUser, aiMsg];
      setMessages(finalMsgs);

      const title = text.trim().slice(0, 65) + (text.trim().length > 65 ? '…' : '');
      let newId = activeConvId;

      setConversations(prev => {
        if (activeConvId) {
          return prev.map(c =>
            c.id === activeConvId ? { ...c, messages: finalMsgs, updatedAt: new Date().toISOString() } : c
          );
        }
        const created: Conversation = {
          id: genId(), title,
          messages: finalMsgs,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newId = created.id;
        setActiveConvId(created.id);
        return [created, ...prev];
      });

      void newId; // suppress lint

    } catch (err: any) {
      setError(err.message || 'Failed to get response. Try again.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading, assets, currentPlan, profile, activeConvId]);

  const clearChat = useCallback(() => { startNewConversation(); }, [startNewConversation]);

  return {
    messages, loading, error,
    conversations, activeConvId,
    sendMessage, clearChat,
    startNewConversation, loadConversation, deleteConversation,
  };
};

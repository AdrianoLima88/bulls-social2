// src/app/components/NotificationToggle.tsx
// Botão para activar/desactivar push notifications

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { subscribeUser, unsubscribeUser, isSubscribed } from '../../utils/OneSignalInit';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isSubscribed().then(val => { setSubscribed(val); setLoading(false); });
  }, []);

  const handleToggle = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeUser();
        setSubscribed(false);
      } else {
        const id = await subscribeUser(user.id);
        setSubscribed(!!id);
        if (!id) alert('Failed to enable notifications. Please allow notifications in your browser settings.');
      }
    } catch {}
    setLoading(false);
  };

  if (loading) return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      <span className="text-sm text-slate-500">Checking...</span>
    </div>
  );

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition ${
        subscribed
          ? 'border-green-600 bg-green-50 text-green-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      } ${className}`}
    >
      {subscribed
        ? <Bell className="w-5 h-5 text-green-600" />
        : <BellOff className="w-5 h-5 text-slate-400" />
      }
      <div className="flex-1 text-left">
        <p className="font-semibold text-sm">
          {subscribed ? 'Notifications enabled' : 'Enable notifications'}
        </p>
        <p className="text-xs text-slate-500">
          {subscribed ? 'You\'ll receive push notifications' : 'Get notified of likes, comments and follows'}
        </p>
      </div>
      <div className={`w-10 h-6 rounded-full relative transition ${subscribed ? 'bg-green-600' : 'bg-slate-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${subscribed ? 'right-0.5' : 'left-0.5'}`} />
      </div>
    </button>
  );
};

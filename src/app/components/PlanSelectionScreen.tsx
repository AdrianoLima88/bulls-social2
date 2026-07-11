import React, { useState } from 'react';
import { TrendingUp, Check, Crown, Sparkles, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

const PLANS = [
  {
    key: 'free' as const,
    name: 'Free',
    icon: TrendingUp,
    price: '€0',
    gradient: 'from-slate-500 to-slate-600',
    description: 'Get started with the basics',
    features: ['Feed, follow & post', 'Up to 5 portfolio assets', 'Community access'],
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    icon: Crown,
    price: '€9.99',
    gradient: 'from-yellow-400 to-orange-500',
    description: 'For serious investors',
    badge: 'Most Popular',
    features: ['Unlimited portfolio', 'Premium posts unlocked', 'Premium badge on profile'],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    icon: Sparkles,
    price: '€24.99',
    gradient: 'from-purple-500 to-pink-500',
    description: 'For creators & educators',
    features: ['Everything in Premium', 'Monetise your content', 'Pro badge on profile'],
  },
  {
    key: 'business' as const,
    name: 'Business',
    icon: Building2,
    price: '€149.99',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'For companies & IR teams',
    features: ['Everything in Premium', 'Company analytics', 'Business badge on profile'],
  },
];

export const PlanSelectionScreen: React.FC = () => {
  const { updateProfile } = useAuth();
  const { startCheckout } = useSubscription();
  const [selected, setSelected] = useState<typeof PLANS[number]['key'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);

    // Mark onboarding as done first so the user isn't stuck on this screen
    // even if checkout fails or is cancelled.
    const { error: profileError } = await updateProfile({ onboarding_completed: true } as any);
    if (profileError) {
      setLoading(false);
      setError('Could not save your choice. Please try again.');
      return;
    }

    if (selected === 'free') {
      setLoading(false);
      return; // App.tsx will re-render past this screen automatically
    }

    const { error: checkoutError } = await startCheckout(selected, 'monthly');
    if (checkoutError) {
      setLoading(false);
      setError(checkoutError);
      // Onboarding is already marked complete, so the user can pick a plan
      // again later from Settings → Subscription.
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-4">
            <TrendingUp className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Choose your plan</h1>
          <p className="text-green-100">Pick how you want to use Bulls — you can change this anytime in Settings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.key;
            return (
              <button
                key={plan.key}
                onClick={() => setSelected(plan.key)}
                className={`relative text-left bg-white rounded-2xl p-5 border-2 transition ${
                  isSelected ? 'border-green-400 ring-4 ring-green-400/30' : 'border-transparent hover:border-white/50'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-5 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{plan.name}</p>
                    <p className="text-xs text-slate-500">{plan.description}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-3">
                  {plan.price}<span className="text-sm font-normal text-slate-400">/month</span>
                </p>
                <div className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className={`w-full py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 ${
            !selected || loading
              ? 'bg-white/40 text-white/70 cursor-not-allowed'
              : 'bg-white text-green-700 hover:bg-white/90 shadow-xl'
          }`}
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</>
            : !selected ? 'Select a plan to continue'
            : selected === 'free' ? 'Continue with Free'
            : `Continue with ${selected.charAt(0).toUpperCase() + selected.slice(1)}`
          }
        </button>
      </div>
      </div>
    </div>
  );
};

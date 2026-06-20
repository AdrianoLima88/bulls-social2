import React, { useState } from 'react';
import { X, Check, Crown, Sparkles, Building2, Loader2, AlertCircle, Star } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

const PLANS = {
  premium: {
    name: 'Bulls Premium',
    icon: Crown,
    gradient: 'from-yellow-400 to-orange-500',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    description: 'For serious investors who want quality information',
    badge: 'Most Popular',
    features: [
      'Real-time market data',
      'Advanced analysis & professional charts',
      'Custom asset price alerts',
      'Ad-free experience',
      'Unlimited investment portfolio',
      'Exclusive reports & insights',
      'Priority access to educators',
      'Verified Premium badge on profile',
    ],
  },
  pro: {
    name: 'Bulls Pro',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    monthlyPrice: 24.99,
    yearlyPrice: 249.99,
    description: 'For creators and educators monetising content',
    badge: null,
    features: [
      'Everything in Bulls Premium',
      'Highlighted verified PRO badge',
      'Detailed audience analytics',
      'Tips & donations from followers',
      'Paid courses & mentoring (15% commission)',
      'Premium posts for subscribers',
      'Exclusive lives with up to 500 viewers',
      'Priority 24/7 support',
    ],
  },
  business: {
    name: 'Bulls Business',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    monthlyPrice: 149.99,
    yearlyPrice: 1499.99,
    description: 'For companies and IR that want investor attention',
    badge: null,
    features: [
      'Everything in Bulls Premium',
      'Featured balance sheet publications',
      'Company sentiment analytics',
      'Investor interest aggregated data',
      'Native sponsored posts',
      'Brand perception dashboard',
      'IR systems integration API',
      'Dedicated account manager',
    ],
  },
} as const;

type PlanKey = keyof typeof PLANS;

export const PremiumScreen = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { startCheckout, checkoutLoading, error, currentPlan, isPremium } = useSubscription();

  const plan = PLANS[selectedPlan];
  const Icon = plan.icon;
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const yearlySavings = ((plan.monthlyPrice * 12) - plan.yearlyPrice).toFixed(0);

  const handleSubscribe = async () => {
    const { error: err } = await startCheckout(selectedPlan, billingCycle);
    if (err) return; // error shown in UI
    // Redirect happens inside startCheckout
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Go Premium</h1>
              <p className="text-white/80 text-sm">Unlock the full power of Bulls</p>
            </div>
          </div>
        </div>

        <div className="p-5">

          {/* Current plan notice */}
          {isPremium && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
              <Star className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">
                You're on <strong className="capitalize">{currentPlan}</strong>. Upgrade anytime to access more features.
              </p>
            </div>
          )}

          {/* Plan selector */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {(Object.entries(PLANS) as [PlanKey, typeof PLANS.premium][]).map(([key, p]) => {
              const PlanIcon = p.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`relative p-3 rounded-xl border-2 transition text-center ${
                    selectedPlan === key
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {p.badge}
                    </span>
                  )}
                  <PlanIcon className={`w-5 h-5 mx-auto mb-1 ${selectedPlan === key ? 'text-green-600' : 'text-slate-400'}`} />
                  <p className={`text-xs font-semibold ${selectedPlan === key ? 'text-green-700' : 'text-slate-600'}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                billingCycle === 'monthly' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Yearly
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                billingCycle === 'yearly' ? 'bg-white/20' : 'bg-green-100 text-green-700'
              }`}>
                Save €{yearlySavings}
              </span>
            </button>
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-slate-900">€{price.toFixed(2)}</span>
              <span className="text-slate-500 text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-sm text-green-600 font-medium mt-1">
                That's €{(price / 12).toFixed(2)}/month — save €{yearlySavings} vs monthly
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-6">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            className={`w-full py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 ${
              checkoutLoading
                ? 'bg-slate-200 text-slate-400'
                : `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 shadow-lg`
            }`}
          >
            {checkoutLoading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting to payment...</>
              : `Subscribe to ${plan.name}`
            }
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Cancel anytime · Secure payment via Stripe · VAT included
          </p>
        </div>
      </div>
    </div>
  );
};

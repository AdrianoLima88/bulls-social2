import React, { useState } from 'react';
import {
  X, Check, Crown, Sparkles, Building2, Loader2, AlertCircle,
  Star, CreditCard, CalendarClock, AlertTriangle, RefreshCw, ExternalLink,
  TrendingUp,
} from 'lucide-react';
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

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  premium: 'Premium',
  pro: 'Pro',
  business: 'Business',
};

const PLAN_ICONS: Record<string, React.FC<any>> = {
  free: TrendingUp,
  premium: Crown,
  pro: Sparkles,
  business: Building2,
};

const PLAN_GRADIENTS: Record<string, string> = {
  free: 'from-slate-400 to-slate-500',
  premium: 'from-yellow-400 to-orange-500',
  pro: 'from-purple-500 to-pink-500',
  business: 'from-blue-500 to-indigo-600',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Management mode (user already has paid plan) ────────────────────────────
const ManageSubscription: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    subscription,
    currentPlan,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
    startCheckout,
    checkoutLoading,
  } = useSubscription();

  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const PlanIcon = PLAN_ICONS[currentPlan] ?? Crown;
  const gradient = PLAN_GRADIENTS[currentPlan] ?? 'from-yellow-400 to-orange-500';
  const isCancelling = subscription?.cancel_at_period_end === true;
  const renewalDate = formatDate(subscription?.current_period_end ?? null);

  const handleCancel = async () => {
    setCancelLoading(true);
    setActionError(null);
    const { error } = await cancelSubscription();
    setCancelLoading(false);
    if (error) setActionError(error);
    else setShowCancelConfirm(false);
  };

  const handleReactivate = async () => {
    setReactivateLoading(true);
    setActionError(null);
    const { error } = await reactivateSubscription();
    setReactivateLoading(false);
    if (error) setActionError(error);
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    await openBillingPortal();
    setPortalLoading(false);
  };

  const handleUpgrade = async () => {
    await startCheckout(selectedPlan, billingCycle);
  };

  // Plans the user can upgrade to (not current plan)
  const upgradablePlans = (Object.keys(PLANS) as PlanKey[]).filter(k => k !== currentPlan);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <PlanIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Subscription</h1>
              <p className="text-white/80 text-sm">Bulls {PLAN_LABELS[currentPlan]}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* Current plan card */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Plan</span>
              <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                Bulls {PLAN_LABELS[currentPlan]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Billing</span>
              <span className="text-sm font-semibold text-slate-900 capitalize">
                {subscription?.billing_cycle ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Status</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                isCancelling
                  ? 'bg-amber-100 text-amber-700'
                  : subscription?.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
              }`}>
                {isCancelling ? 'Cancels at period end' : subscription?.status ?? 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" />
                {isCancelling ? 'Access until' : 'Renews on'}
              </span>
              <span className="text-sm font-semibold text-slate-900">{renewalDate}</span>
            </div>
          </div>

          {/* Pending cancellation warning */}
          {isCancelling && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">Cancellation scheduled</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your plan will remain active until <strong>{renewalDate}</strong>. After that, your account reverts to Free.
                  </p>
                  <button
                    onClick={handleReactivate}
                    disabled={reactivateLoading}
                    className="mt-3 w-full py-2.5 bg-amber-600 text-white font-bold text-sm rounded-xl hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {reactivateLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Reactivating...</>
                      : <><RefreshCw className="w-4 h-4" /> Reactivate Subscription</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action error */}
          {actionError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{actionError}</p>
            </div>
          )}

          {/* Billing portal */}
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {portalLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening portal...</>
              : <><CreditCard className="w-4 h-4" /> Manage Payment & Invoices <ExternalLink className="w-3.5 h-3.5 opacity-70" /></>
            }
          </button>

          {/* Upgrade section */}
          {upgradablePlans.length > 0 && (
            <div>
              <button
                onClick={() => setShowUpgrade(!showUpgrade)}
                className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 transition flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                {showUpgrade ? 'Hide upgrade options' : 'Change / Upgrade Plan'}
              </button>

              {showUpgrade && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {upgradablePlans.map(key => {
                      const p = PLANS[key];
                      const PIcon = p.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedPlan(key)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                            selectedPlan === key
                              ? 'border-green-600 bg-green-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0`}>
                            <PIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">€{p.monthlyPrice.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">/month</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    {(['monthly', 'yearly'] as const).map(cycle => (
                      <button
                        key={cycle}
                        onClick={() => setBillingCycle(cycle)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                          billingCycle === cycle ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cycle === 'monthly' ? 'Monthly' : 'Yearly (save ~16%)'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={checkoutLoading}
                    className={`w-full py-3.5 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 bg-gradient-to-r ${PLAN_GRADIENTS[selectedPlan]} disabled:opacity-50`}
                  >
                    {checkoutLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                      : `Switch to ${PLANS[selectedPlan].name}`
                    }
                  </button>
                  <p className="text-center text-xs text-slate-400">Stripe will handle proration automatically</p>
                </div>
              )}
            </div>
          )}

          {/* Cancel button — only if not already cancelling */}
          {!isCancelling && (
            <div>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl transition"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-800 mb-1">Cancel subscription?</p>
                  <p className="text-xs text-red-700 mb-3">
                    You'll keep access until <strong>{renewalDate}</strong>. After that your account reverts to the Free plan.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-white transition"
                    >
                      Keep Plan
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelLoading}
                      className="flex-1 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {cancelLoading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...</>
                        : 'Yes, cancel'
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Subscribe mode (free user) ──────────────────────────────────────────────
const SubscribeScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { startCheckout, checkoutLoading, error } = useSubscription();

  const plan = PLANS[selectedPlan];
  const Icon = plan.icon;
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const yearlySavings = ((plan.monthlyPrice * 12) - plan.yearlyPrice).toFixed(0);

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
            onClick={() => startCheckout(selectedPlan, billingCycle)}
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

// ─── Main export — routes to the right mode ──────────────────────────────────
export const PremiumScreen: React.FC<{ onClose: () => void; onUpgrade?: () => void }> = ({ onClose, onUpgrade }) => {
  const { isPremium, loading } = useSubscription();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (isPremium) {
    return <ManageSubscription onClose={onClose} />;
  }

  return <SubscribeScreen onClose={onClose} />;
};

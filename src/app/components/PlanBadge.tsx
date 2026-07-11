import React from 'react';
import { Crown, Sparkles, Building2 } from 'lucide-react';

interface PlanBadgeProps {
  plan?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CONFIG: Record<string, { icon: any; bg: string; label: string }> = {
  premium: { icon: Crown, bg: 'bg-gradient-to-r from-yellow-400 to-orange-500', label: 'Premium' },
  pro: { icon: Sparkles, bg: 'bg-gradient-to-r from-purple-500 to-pink-500', label: 'Pro' },
  business: { icon: Building2, bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', label: 'Business' },
};

// Plan badge: distinct from the blue "verified" checkmark — shows which paid
// tier a user is on. Renders nothing for free/unknown plans.
export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, size = 'sm' }) => {
  if (!plan || plan === 'free' || !CONFIG[plan]) return null;
  const { icon: Icon, bg, label } = CONFIG[plan];

  const iconSizes = { sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5' };
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
  const padding = { sm: 'px-1.5 py-0.5', md: 'px-2 py-0.5', lg: 'px-2.5 py-1' };

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full text-white font-bold ${bg} ${padding[size]}`} title={`${label} member`}>
      <Icon className={`${iconSizes[size]} fill-current`} />
      <span className={textSizes[size]}>{label}</span>
    </span>
  );
};

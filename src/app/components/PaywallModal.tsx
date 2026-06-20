import React from 'react';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';

interface PaywallModalProps {
  featureName: string;
  onUpgrade: () => void;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ featureName, onUpgrade, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Recurso Premium</h2>
          <p className="text-white/90">Desbloqueie o potencial completo da Bulls</p>
        </div>

        <div className="p-8">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-slate-700 text-center">
              <span className="font-bold text-yellow-700">"{featureName}"</span> é exclusivo para assinantes Premium
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Dados em tempo real</p>
                <p className="text-sm text-slate-600">Cotações atualizadas a cada segundo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ad-free</p>
                <p className="text-sm text-slate-600">Foco total nos seus investimentos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Analyses avançadas</p>
                <p className="text-sm text-slate-600">Charts e insights profissionais</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center mb-6">
            <p className="text-sm text-white/80 mb-2">A partir de</p>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-4xl font-bold">€ 29,90</span>
              <span className="text-white/80">/mês</span>
            </div>
            <p className="text-sm text-white/90">Teste grátis por 7 dias</p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition transform hover:scale-105"
            >
              Start Free Trial
            </button>

            <button
              onClick={onClose}
              className="w-full text-slate-600 hover:text-slate-800 font-semibold py-3 transition"
            >
              Not now
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            Cancel anytime • No commitment
          </p>
        </div>
      </div>
    </div>
  );
};

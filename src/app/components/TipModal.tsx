import React, { useState } from 'react';
import { X, Heart, Coffee, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface TipModalProps {
  creatorName: string;
  creatorUsername: string;
  receiverId: string;
  onClose: () => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  creatorName,
  creatorUsername,
  receiverId,
  onClose,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const { sendTip, checkoutLoading, error } = useSubscription();

  const quickAmounts = [2, 5, 10, 20, 50];
  const totalAmount = selectedAmount ?? (parseFloat(customAmount) || 0);
  const canSend = totalAmount > 0 && !checkoutLoading;

  const handleSend = async () => {
    if (!canSend) return;
    await sendTip(receiverId, totalAmount, message);
    // sendTip redirects to Stripe if successful
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Send a Tip</h2>
              <p className="text-white/80 text-sm">Support @{creatorUsername}</p>
            </div>
          </div>
        </div>

        <div className="p-5">

          {/* Creator info */}
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3 mb-5">
            <Coffee className="w-6 h-6 text-purple-500 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              Support <span className="font-bold">{creatorName}</span> for their great content!
            </p>
          </div>

          {/* Quick amounts */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Choose amount</p>
          <div className="flex gap-2 mb-3 flex-wrap">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                className={`flex-1 min-w-[48px] py-2.5 rounded-xl text-sm font-bold transition border-2 ${
                  selectedAmount === amt
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                €{amt}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
            <input
              type="number"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              placeholder="Custom amount"
              min="1"
              step="0.50"
              className="w-full pl-7 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a message (optional)..."
            rows={2}
            maxLength={150}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 text-sm resize-none focus:outline-none focus:border-purple-400 mb-4"
          />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              canSend
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {checkoutLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
              : totalAmount > 0
              ? `Send €${totalAmount.toFixed(2)} tip`
              : 'Choose an amount'
            }
          </button>

          <p className="text-center text-xs text-slate-400 mt-2">
            Secure payment via Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

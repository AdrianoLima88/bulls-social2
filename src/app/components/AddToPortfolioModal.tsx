import React, { useState } from 'react';
import { X, TrendingUp, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useSubscription } from '../../hooks/useSubscription';

const FREE_ASSET_LIMIT = 5;

interface AddToPortfolioModalProps {
  asset: any;
  assetType: 'stock' | 'fii' | 'crypto' | 'international' | 'etf';
  currency?: string;
  onClose: () => void;
}

const toPortfolioType = (assetType: string): string => {
  if (assetType === 'crypto')        return 'crypto';
  if (assetType === 'fii')           return 'fii';
  if (assetType === 'etf')           return 'etf';
  if (assetType === 'international') return 'stock';
  return 'stock';
};

const currencySymbol = (c = 'USD') =>
  c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';

export const AddToPortfolioModal: React.FC<AddToPortfolioModalProps> = ({
  asset,
  assetType,
  currency,
  onClose,
}) => {
  const { addAsset, assets } = usePortfolio();
  const { isPremium, isPro, isBusiness } = useSubscription();
  const isUpgraded = isPremium || isPro || isBusiness;
  const atFreeLimit = !isUpgraded && assets.length >= FREE_ASSET_LIMIT;

  const resolvedCurrency = currency || asset.currency || 'USD';
  const sym = currencySymbol(resolvedCurrency);

  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState(
    asset.price ? asset.price.toString() : ''
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  const qty = parseFloat(quantity);
  const avg = parseFloat(avgPrice);
  const totalInvested = qty > 0 && avg > 0 ? qty * avg : 0;
  const currentValue = qty > 0 ? qty * asset.price : 0;
  const profit = currentValue - totalInvested;
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  const qtyValid = quantity !== '' && qty > 0;
  const avgValid = avgPrice !== '' && avg > 0;
  const canSave = qtyValid && avgValid;

  const handleAdd = async () => {
    setAttempted(true);
    if (!canSave) return;
    if (atFreeLimit) return;

    setSaving(true);
    setError('');

    const { error: err } = await addAsset({
      code: asset.code.split('.')[0].toUpperCase(),
      type: toPortfolioType(assetType),
      quantity: qty,
      avg_price: avg,
    });

    setSaving(false);
    if (err) {
      setError(typeof err === 'string' ? err : 'Failed to add asset. Try again.');
    } else {
      setSaved(true);
      setTimeout(() => onClose(), 1400);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-[60] animate-fade-in">
      <div className="bg-white w-full rounded-t-3xl max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add to Portfolio</h2>
            <p className="text-sm text-slate-500">{asset.code} · {asset.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Free plan limit */}
          {atFreeLimit && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold">Free plan limit reached</p>
              <p className="text-xs mt-1">Upgrade your plan to add more than {FREE_ASSET_LIMIT} assets.</p>
            </div>
          )}

          {/* Current price card */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1">Current Price</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-slate-900">
                {sym}{asset.price?.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
              </p>
              {asset.change !== undefined && (
                <p className={`text-sm font-semibold mb-0.5 ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                </p>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Quantity (shares)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={e => { setQuantity(e.target.value); setError(''); }}
              placeholder="0"
              min="0"
              step={assetType === 'crypto' ? '0.00000001' : '1'}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                attempted && !qtyValid ? 'border-red-400 bg-red-50' : 'border-slate-200'
              }`}
            />
            {attempted && !qtyValid && (
              <p className="text-xs text-red-500 mt-1">Enter a quantity greater than 0</p>
            )}
          </div>

          {/* Avg Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Average Purchase Price ({sym})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">{sym}</span>
              <input
                type="number"
                value={avgPrice}
                onChange={e => { setAvgPrice(e.target.value); setError(''); }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 bg-white border-2 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                  attempted && !avgValid ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
              />
            </div>
            {attempted && !avgValid && (
              <p className="text-xs text-red-500 mt-1">Enter the price you paid per share</p>
            )}
          </div>

          {/* Position Summary */}
          {totalInvested > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">Position Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Invested</span>
                  <span className="font-semibold text-slate-900">
                    {sym}{totalInvested.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Value</span>
                  <span className="font-semibold text-slate-900">
                    {sym}{currentValue.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="font-bold text-slate-900">Return</span>
                  <div className="text-right">
                    <p className={`font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}{sym}{Math.abs(profit).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-semibold ${profitPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-semibold">{asset.code} added to your portfolio!</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleAdd}
            disabled={saving || saved || atFreeLimit}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition ${
              saving || saved || atFreeLimit
                ? 'bg-slate-200 text-slate-400'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
            }`}
          >
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
             : saved ? <><CheckCircle className="w-5 h-5" /> Saved!</>
             : 'Add to Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
};

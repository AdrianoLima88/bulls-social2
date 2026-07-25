import React, { useState } from 'react';
import { X, PlusCircle, TrendingUp, Calendar, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useSubscription } from '../../hooks/useSubscription';

const FREE_ASSET_LIMIT = 5;

const currencySymbol = (c = 'USD') => c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';

// Map MarketScreen assetType → portfolio DB type
const toPortfolioType = (assetType: string): string => {
  if (assetType === 'crypto')        return 'crypto';
  if (assetType === 'fii')           return 'fii';
  if (assetType === 'stock')         return 'acao';
  if (assetType === 'international') return 'stock';   // shown as "INTL" in portfolio
  return 'stock';
};

interface Props {
  asset: {
    code: string;
    name: string;
    price: number;
    change: number;
    description?: string;
    currency?: string;
  };
  assetType: 'stock' | 'fii' | 'crypto' | 'international';
  currency?: string;
  onClose: () => void;
}

export const AddToPortfolioModal: React.FC<Props> = ({ asset, assetType, currency: currencyProp, onClose }) => {
  const { addAsset, assets } = usePortfolio();
  const { isPremium } = useSubscription() as any;

  const atFreeLimit = !isPremium && assets.length >= FREE_ASSET_LIMIT;

  const currency   = currencyProp || asset.currency || (assetType === 'crypto' ? 'USD' : 'USD');
  const sym        = currencySymbol(currency);
  const portfolioType = toPortfolioType(assetType);

  const [quantity,     setQuantity]     = useState('');
  const [avgPrice,     setAvgPrice]     = useState(asset.price.toFixed(asset.price < 1 ? 4 : 2));
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState('');

  const qty       = parseFloat(quantity || '0');
  const price     = parseFloat(avgPrice || '0');
  const invested  = qty * price;
  const currVal   = qty * asset.price;
  const profit    = currVal - invested;
  const profitPct = invested > 0 ? (profit / invested) * 100 : 0;

  const handleAdd = async () => {
    if (!quantity || qty <= 0)  { toast.error('Enter a valid quantity');      return; }
    if (!avgPrice || price <= 0){ toast.error('Enter a valid purchase price'); return; }

    setSaving(true);
    setError('');

    const { error: err } = await addAsset({
      code:      asset.code.toUpperCase(),
      type:      portfolioType,
      quantity:  qty,
      avg_price: price,
      currency,
    });

    setSaving(false);
    if (err) {
      const msg = typeof err === 'string' ? err : 'Failed to add asset. Please try again.';
      setError(msg);
      toast.error(msg);
    } else {
      setSaved(true);
      toast.success(`${asset.code} added to portfolio! 📊`);
      setTimeout(onClose, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-[60]">
      <div className="bg-white w-full rounded-t-3xl max-h-[88vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add to Portfolio</h2>
            <p className="text-xs text-slate-500">{asset.code} · {asset.name}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600"/>
          </button>
        </div>

        {/* Free-tier limit gate */}
        {atFreeLimit ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-yellow-600"/>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Portfolio limit reached</h3>
            <p className="text-sm text-slate-500 mb-4">
              Free plan allows up to {FREE_ASSET_LIMIT} assets. Upgrade to add unlimited assets.
            </p>
            <button onClick={onClose} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl">
              Close
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">

            {/* Current price chip */}
            <div className="bg-slate-50 rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Current Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  {sym}{asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${asset.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </span>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Quantity {assetType === 'crypto' ? '(units)' : '(shares)'}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
                step={assetType === 'crypto' ? '0.00000001' : '1'}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition font-semibold text-slate-900"
              />
            </div>

            {/* Average Purchase Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Average Purchase Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">{sym}</span>
                <input
                  type="number"
                  value={avgPrice}
                  onChange={e => setAvgPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition font-semibold text-slate-900"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Price you paid per {assetType === 'crypto' ? 'unit' : 'share'}
              </p>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>Purchase Date (optional)</span>
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition font-semibold text-slate-900"
              />
            </div>

            {/* Position summary */}
            {quantity && avgPrice && qty > 0 && price > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-600"/>
                  <h3 className="font-bold text-slate-800 text-sm">Position Summary</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-semibold text-slate-900">{qty.toLocaleString()} {assetType === 'crypto' ? 'units' : 'shares'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Price</span>
                    <span className="font-semibold text-slate-900">{sym}{price.toLocaleString('en-IE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Invested</span>
                    <span className="font-semibold text-slate-900">{sym}{invested.toLocaleString('en-IE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="text-slate-500">Current Value</span>
                    <span className="font-semibold text-slate-900">{sym}{currVal.toLocaleString('en-IE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-800">Return</span>
                    <div className="text-right">
                      <p className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}{sym}{Math.abs(profit).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs font-semibold ${profitPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0"/>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAdd}
              disabled={saving || saved || !quantity || !avgPrice || qty <= 0 || price <= 0}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
                saved ? 'bg-green-500' :
                saving || !quantity || qty <= 0 ? 'bg-slate-300' :
                'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg'
              }`}
            >
              {saved   ? <><CheckCircle className="w-5 h-5"/> Added!</> :
               saving  ? <><Loader2 className="w-5 h-5 animate-spin"/> Saving…</> :
                         <><PlusCircle className="w-5 h-5"/> Add to Portfolio</>}
            </button>

            <p className="text-center text-xs text-slate-400 pb-2">
              💡 Information shown is for educational purposes. Track your real investments here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

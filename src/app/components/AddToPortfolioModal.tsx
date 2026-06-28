import React, { useState } from 'react';
import { X, PlusCircle, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';

interface AddToPortfolioModalProps {
  asset: any;
  assetType: 'stock' | 'etf' | 'crypto' | 'international';
  onClose: () => void;
}

export const AddToPortfolioModal: React.FC<AddToPortfolioModalProps> = ({ asset, assetType, onClose }) => {
  const { addAsset } = useApp();
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState(asset.price.toString());
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const currency = assetType === 'stock' || assetType === 'etf' ? '€' : '$';
  const totalInvested = parseFloat(quantity || '0') * parseFloat(avgPrice || '0');
  const currentValue = parseFloat(quantity || '0') * asset.price;
  const profit = currentValue - totalInvested;
  const profitPercent = totalInvested > 0 ? ((profit / totalInvested) * 100) : 0;

  const handleAdd = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!avgPrice || parseFloat(avgPrice) <= 0) {
      toast.error('Please enter a valid average price');
      return;
    }

    // Map asset type
    const assetTypeMap = {
      'stock': 'stock',
      'etf': 'etf',
      'crypto': 'crypto',
      'international': 'stock'
    };

    // Add to portfolio
    addAsset({
      code: asset.code,
      quantity: parseFloat(quantity),
      avgPrice: parseFloat(avgPrice),
      currentPrice: asset.price,
      type: assetTypeMap[assetType] as 'stock' | 'etf' | 'crypto' | 'bond',
      purchaseDate: purchaseDate
    });

    toast.success(
      `${asset.code} adicionado à carteira! 📊\n${quantity} ${assetType === 'crypto' ? 'units' : 'units'} • PM: ${currency} ${parseFloat(avgPrice).toFixed(2)}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-[60] animate-fade-in">
      <div className="bg-white w-full rounded-t-3xl animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add to Portfolio</h2>
            <p className="text-sm text-slate-600">{asset.code} • {asset.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Preço Atual */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-slate-600 mb-1">Current Asset Price</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900">
                {currency} {asset.price.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-sm font-semibold mb-1 ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Quantity (units)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              step={assetType === 'crypto' ? '0.00000001' : '1'}
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition font-semibold text-slate-900"
            />
          </div>

          {/* Avg Price */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Average Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">
                {currency}
              </span>
              <input
                type="number"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition font-semibold text-slate-900"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Enter the average price you paid per {assetType === 'crypto' ? 'unit' : 'share'}
            </p>
          </div>

          {/* Purchase Date */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Data da Compra (Opcional)</span>
              </div>
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition font-semibold text-slate-900"
            />
          </div>

          {/* Resumo */}
          {quantity && avgPrice && (
            <div className="bg-slate-50 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Resumo da Posição</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="font-semibold text-slate-900">
                    {quantity} {assetType === 'crypto' ? 'units' : 'units'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Avg Price:</span>
                  <span className="font-semibold text-slate-900">
                    {currency} {parseFloat(avgPrice).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Invested:</span>
                  <span className="font-semibold text-slate-900">
                    {currency} {totalInvested.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 text-sm">Current Value:</span>
                    <span className="font-semibold text-slate-900">
                      {currency} {currentValue.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Return:</span>
                    <div className="text-right">
                      <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{currency} {Math.abs(profit).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                      </span>
                      <p className={`text-xs font-semibold ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Add */}
          <button
            onClick={handleAdd}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg text-lg flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Add to Portfolio</span>
          </button>

          {/* Aviso */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700">
              💡 <span className="font-semibold">Tip:</span> You can edit or remove this position at any time from your portfolio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
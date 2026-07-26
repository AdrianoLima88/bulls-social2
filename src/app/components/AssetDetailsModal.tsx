import React, { useState } from 'react';
import { X, Star, TrendingUp, TrendingDown, BarChart3, Clock, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AddToPortfolioModal } from './AddToPortfolioModal';

interface AssetDetailsModalProps {
  asset: any;
  assetType: 'stock' | 'fii' | 'crypto' | 'international';
  onClose: () => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ asset, assetType, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [showAddToPortfolioModal, setShowAddToPortfolioModal] = useState(false);

  // Dados mockados para gráfico
  const generateChartData = React.useMemo(() => {
    const basePrice = asset.price;
    const points = selectedPeriod === '1D' ? 24 : selectedPeriod === '1W' ? 7 : selectedPeriod === '1M' ? 30 : 90;
    const data = [];

    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * (basePrice * 0.05);
      data.push({
        time: `${asset.code}-${selectedPeriod}-${i}-${Date.now()}`, // Unique time identifier
        price: parseFloat((basePrice + variation).toFixed(2)),
        index: i // Add index único
      });
    }
    return data;
  }, [asset.price, asset.code, selectedPeriod]);

  const chartData = generateChartData;

  const periods = ['1D', '1W', '1M', '3M'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50 animate-fade-in">
      <div className="bg-white w-full rounded-t-3xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{asset.code}</h2>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-1 hover:bg-slate-100 rounded-full transition"
              >
                <Star className={`w-6 h-6 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
              </button>
            </div>
            <p className="text-sm text-slate-600">{asset.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Preço Atual */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-end gap-3 mb-2">
            <p className="text-4xl font-bold text-slate-900">
              {assetType === 'stock' || assetType === 'fii' ? '€ ' : assetType === 'crypto' ? '$' : '$'}
              {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${asset.change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {asset.change >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`font-bold ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500">Today</p>
        </div>

        {/* Gráfico */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex gap-2 mb-4">
            {periods.map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition ${
                  selectedPeriod === period 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="index" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                formatter={(value: any) => [`${assetType === 'stock' || assetType === 'fii' ? '€ ' : '$'}${value}`, 'Preço']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={asset.change >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Information Detalhadas */}
        <div className="p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Volume */}
            {asset.volume && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <p className="text-xs text-slate-600">Volume</p>
                </div>
                <p className="font-bold text-slate-900">{asset.volume}</p>
              </div>
            )}

            {/* Change */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <p className="text-xs text-slate-600">Change</p>
              </div>
              <p className={`font-bold ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </p>
            </div>

            {/* Dividendo (apenas FIIs) */}
            {assetType === 'fii' && asset.dividend && (
              <>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-slate-600" />
                    <p className="text-xs text-slate-600">Dividendo</p>
                  </div>
                  <p className="font-bold text-green-600">€ {asset.dividend.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <p className="text-xs text-slate-600">DY</p>
                  </div>
                  <p className="font-bold text-green-600">{((asset.dividend / asset.price) * 100).toFixed(2)}%</p>
                </div>
              </>
            )}

            {/* Market (apenas Internacional) */}
            {assetType === 'international' && asset.market && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <p className="text-xs text-slate-600">Market</p>
                </div>
                <p className="font-bold text-slate-900">{asset.market}</p>
              </div>
            )}

            {/* Sector (Ações e FIIs) */}
            {asset.sector && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  <p className="text-xs text-slate-600">Sector</p>
                </div>
                <p className="font-bold text-slate-900">{asset.sector}</p>
              </div>
            )}
          </div>

          {/* Descrição */}
          {asset.description && (
            <div className="mt-6">
              <h3 className="font-bold text-slate-900 mb-2">About</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{asset.description}</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="mt-6">
            <button 
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-2"
              onClick={() => setShowAddToPortfolioModal(true)}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Add to My Portfolio</span>
            </button>
          </div>

          {/* Aviso */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700">
              💡 <span className="font-semibold">Tip:</span> Information shown is for educational purposes. Add assets to your portfolio to track their performance.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Add to Portfolio */}
      {showAddToPortfolioModal && (
        <AddToPortfolioModal 
          asset={asset} 
          assetType={assetType} 
          onClose={() => setShowAddToPortfolioModal(false)}
        />
      )}
    </div>
  );
};
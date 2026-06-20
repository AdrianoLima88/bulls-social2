import React from 'react';
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';
import { usePortfolio } from '../../hooks/usePortfolio';

export const PortfolioScreen = ({ onBack, onAddAsset, onViewAsset }) => {
  const { assets, loading, getPortfolioSummary } = usePortfolio();
  const { t, formatCurrency } = useLocale();

  // Converter assets do Supabase para o formato esperado
  const portfolio = assets.map(asset => ({
    code: asset.code,
    quantity: asset.quantity,
    avgPrice: asset.avg_price,
    currentPrice: asset.current_price || asset.avg_price,
    type: asset.type,
    purchaseDate: asset.created_at,
  }));

  const summary = getPortfolioSummary();
  const totalInvested = summary.totalInvested;
  const currentTotal = summary.totalCurrent;
  const totalProfit = summary.profit;
  const profitPercent = summary.profitPercentage;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">{t('portfolio.title')}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Resumo Total */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex-shrink-0">
        <p className="text-white/80 text-sm mb-1">Total Portfolio Value</p>
        <p className="text-white text-4xl font-bold mb-3">
          € {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          totalProfit >= 0 ? 'bg-white/20' : 'bg-red-500/30'
        }`}>
          {totalProfit >= 0 ? <TrendingUp className="w-5 h-5 text-white" /> : <TrendingDown className="w-5 h-5 text-white" />}
          <span className="text-white font-bold">
            {totalProfit >= 0 ? '+' : ''}€ {Math.abs(totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-white/90">({profitPercent.toFixed(2)}%)</span>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Invested</p>
            <p className="text-white font-bold">
              € {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Ativos</p>
            <p className="text-white font-bold">{portfolio.length}</p>
          </div>
        </div>
      </div>

      {/* Lista de Ativos */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {portfolio.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-slate-900">My Assets</h2>
              <button 
                onClick={onAddAsset}
                className="text-green-600 font-semibold text-sm hover:text-green-700"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {portfolio.map(item => {
                const invested = item.quantity * item.avgPrice;
                const current = item.quantity * item.currentPrice;
                const profit = current - invested;
                const profitPct = ((profit / invested) * 100);
                
                return (
                  <button 
                    key={item.code} 
                    onClick={() => onViewAsset(item)}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition w-full text-left"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                          item.type === 'acao' ? 'bg-blue-600' :
                          item.type === 'fii' ? 'bg-green-600' :
                          item.type === 'crypto' ? 'bg-orange-600' :
                          'bg-purple-600'
                        }`}>
                          {item.code.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{item.code}</h3>
                          <p className="text-xs text-slate-500">
                            {item.quantity} {item.type === 'crypto' ? 'un' : 'units'} • 
                            PM: {item.type === 'crypto' ? '$' : '€'} {item.avgPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        item.type === 'acao' ? 'bg-blue-100 text-blue-700' :
                        item.type === 'fii' ? 'bg-green-100 text-green-700' :
                        item.type === 'crypto' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type === 'acao' ? 'AÇÃO' :
                         item.type === 'fii' ? 'FII' :
                         item.type === 'crypto' ? 'CRIPTO' :
                         'RENDA FIXA'}
                      </span>
                    </div>

                    {/* Values */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Current Value</p>
                        <p className="font-bold text-slate-900 text-lg">
                          {item.type === 'crypto' ? '$' : '€'} {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Return</p>
                        <p className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profit >= 0 ? '+' : ''}{profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({profitPct.toFixed(2)}%)
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Price: {item.type === 'crypto' ? '$' : '€'} {item.currentPrice.toFixed(2)}</span>
                        <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {profit >= 0 ? '▲' : '▼'} {Math.abs(profitPct).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${profit >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{ width: `${Math.min(Math.abs(profitPct), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">Portfolio Vazia</h3>
            <p className="text-slate-500 text-center mb-6">
              Start building your portfolio<br/>by adding your first assets
            </p>
            <button
              onClick={onAddAsset}
              className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Primeiro Ativo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
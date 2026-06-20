import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Minus, Calendar, DollarSign, BarChart3, AlertCircle, Trash2, X } from 'lucide-react';

export const AssetDetailScreen = ({ asset, onBack, onAddMore, onSell }) => {
  const [showActions, setShowActions] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  
  const invested = asset.quantity * asset.avgPrice;
  const current = asset.quantity * asset.currentPrice;
  const profit = current - invested;
  const profitPct = ((profit / invested) * 100);
  const isPositive = profit >= 0;

  // Mock de dados históricos
  const history = [
    { date: '15/01/2024', type: 'buy', quantity: 50, price: 32.40, total: 1620.00 },
    { date: '22/02/2024', type: 'buy', quantity: 30, price: 36.80, total: 1104.00 },
    { date: '10/03/2024', type: 'buy', quantity: 20, price: 37.20, total: 744.00 },
  ];

  // Informações adicionais baseadas no tipo
  const getAssetInfo = () => {
    switch(asset.type) {
      case 'acao':
        return {
          name: asset.code === 'PETR4' ? 'Petrobras PN' :
                asset.code === 'VALE3' ? 'Vale ON' :
                asset.code === 'ITUB4' ? 'Itaú Unibanco PN' :
                asset.code,
          sector: 'Petróleo e Gás',
          dividendYield: '8.5%',
          pe: '4.2x'
        };
      case 'fii':
        return {
          name: asset.code === 'HGLG11' ? 'CSHG Logística FII' : asset.code,
          sector: 'Logística',
          dividendYield: '9.2%',
          pvp: '0.95x'
        };
      case 'crypto':
        return {
          name: asset.code === 'BTC' ? 'Bitcoin' : 
                asset.code === 'ETH' ? 'Ethereum' : asset.code,
          marketCap: 'US$ 1.2T',
          volume24h: 'US$ 45.8B'
        };
      default:
        return { name: asset.code };
    }
  };

  const assetInfo = getAssetInfo();

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className={`z-50 flex-shrink-0 ${
        asset.type === 'acao' ? 'bg-blue-600' :
        asset.type === 'fii' ? 'bg-green-600' :
        asset.type === 'crypto' ? 'bg-orange-600' :
        'bg-purple-600'
      }`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">{asset.code}</h1>
          <button 
            onClick={() => setShowActions(!showActions)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <BarChart3 className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Card de Resumo */}
        <div className={`p-6 text-white ${
          asset.type === 'acao' ? 'bg-blue-600' :
          asset.type === 'fii' ? 'bg-green-600' :
          asset.type === 'crypto' ? 'bg-orange-600' :
          'bg-purple-600'
        }`}>
          <div className="mb-4">
            <h2 className="text-2xl font-black mb-1">{asset.code}</h2>
            <p className="text-white/80 text-sm">{assetInfo.name}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/80 text-sm mb-2">Current Value</p>
            <p className="text-4xl font-black mb-3">
              {asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'} {current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isPositive ? 'bg-white/20' : 'bg-red-500/30'
            }`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-bold">
                {isPositive ? '+' : ''}{asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'} {Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({profitPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="p-4 space-y-3">
          {/* Posição */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Current Position
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 text-sm mb-1">Quantity</p>
                <p className="text-lg font-bold text-slate-900">
                  {asset.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Avg Price</p>
                <p className="text-lg font-bold text-slate-900">
                  {asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'} {asset.avgPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Current Price</p>
                <p className="text-lg font-bold text-green-600">
                  {asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'} {asset.currentPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Invested</p>
                <p className="text-lg font-bold text-slate-900">
                  {asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'} {invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {asset.type === 'acao' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Fundamentals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Sector</p>
                  <p className="font-semibold text-slate-900">{assetInfo.sector}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">P/L</p>
                  <p className="font-semibold text-slate-900">{assetInfo.pe}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Dividend Yield</p>
                  <p className="font-semibold text-green-600">{assetInfo.dividendYield}</p>
                </div>
              </div>
            </div>
          )}

          {asset.type === 'fii' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Indicadores</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Segmento</p>
                  <p className="font-semibold text-slate-900">{assetInfo.sector}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">P/VP</p>
                  <p className="font-semibold text-slate-900">{assetInfo.pvp}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Dividend Yield</p>
                  <p className="font-semibold text-green-600">{assetInfo.dividendYield}</p>
                </div>
              </div>
            </div>
          )}

          {asset.type === 'crypto' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Market</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Market Cap</p>
                  <p className="font-semibold text-slate-900">{assetInfo.marketCap}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Volume 24h</p>
                  <p className="font-semibold text-slate-900">{assetInfo.volume24h}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Transaction History
            </h3>
            
            <div className="space-y-3">
              {history.map((operation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      operation.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {operation.type === 'buy' ? (
                        <Plus className="w-5 h-5 text-green-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {operation.type === 'buy' ? 'Buy' : 'Sell'} • {operation.quantity} {asset.type === 'crypto' ? 'un' : 'units'}
                      </p>
                      <p className="text-xs text-slate-500">{operation.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'} {operation.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      @ {asset.type === 'crypto' || asset.type === 'international' ? '$' : '€'}{operation.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerta */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Investment Tip</p>
              <p className="text-sm text-blue-800">
                {asset.type === 'acao' && 'Monitor company fundamentals and quarterly results.'}
                {asset.type === 'fii' && 'FIIs distribuem pelo menos 95% dos lucros. Acompanhe os relatórios mensais.'}
                {asset.type === 'crypto' && 'Criptomoedas são voláteis. Use stop loss para proteger seu capital.'}
                {asset.type === 'renda_fixa' && 'Verifique a liquidez e o prazo de vencimento antes de investir mais.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação Fixos */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3">
        <button
          onClick={() => {
            onAddMore(asset);
          }}
          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add More
        </button>
        <button
          onClick={() => setShowRemoveModal(true)}
          className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition shadow-lg"
        >
          <Trash2 className="w-5 h-5" />
          Remove
        </button>
      </div>

      {/* Modal de Confirmação de Remoção */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Remove da Portfolio?</h3>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-900">
                  📚 <span className="font-semibold">Atenção:</span> Você está removendo <span className="font-bold">{asset.code}</span> da sua carteira de acompanhamento educacional.
                </p>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  ⚠️ <span className="font-semibold">O Bulls é uma rede social educacional.</span> Esta ação apenas remove o ativo da sua lista de acompanhamento.
                </p>
                <p className="mt-3">
                  💡 <span className="font-semibold">Nenhuma transação real será realizada.</span> Para comprar ou vender ativos reais, utilize sua corretora de investimentos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSell(asset);
                  setShowRemoveModal(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-lg"
              >
                Sim, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
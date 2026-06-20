import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Eye, DollarSign } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { usePortfolio } from '../../hooks/usePortfolio';

export const AddAssetToPortfolio = ({ onBack }) => {
  const { addAsset } = usePortfolio();
  const [assetType, setAssetType] = useState('acao');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Sugestões populares
  const popularAssets = {
    acao: [
      { code: 'PETR4', name: 'Petrobras', currentPrice: 38.52 },
      { code: 'VALE3', name: 'Vale', currentPrice: 65.80 },
      { code: 'ITUB4', name: 'Itaú Unibanco', currentPrice: 28.45 },
      { code: 'BBDC4', name: 'Bradesco', currentPrice: 15.20 },
      { code: 'WEGE3', name: 'WEG', currentPrice: 42.30 },
      { code: 'MGLU3', name: 'Magazine Luiza', currentPrice: 3.45 }
    ],
    fii: [
      { code: 'HGLG11', name: 'CSHG Logística', currentPrice: 162.50 },
      { code: 'MXRF11', name: 'Maxi Renda', currentPrice: 10.25 },
      { code: 'VISC11', name: 'Vinci Shopping Centers', currentPrice: 8.95 },
      { code: 'KNRI11', name: 'Kinea Renda Imobiliária', currentPrice: 9.80 },
      { code: 'XPML11', name: 'XP Malls', currentPrice: 10.15 },
      { code: 'BTLG11', name: 'BTG Pactual Logística', currentPrice: 103.40 }
    ],
    crypto: [
      { code: 'BTC', name: 'Bitcoin', currentPrice: 52340 },
      { code: 'ETH', name: 'Ethereum', currentPrice: 3250 },
      { code: 'BNB', name: 'Binance Coin', currentPrice: 425 },
      { code: 'SOL', name: 'Solana', currentPrice: 105 },
      { code: 'ADA', name: 'Cardano', currentPrice: 0.85 },
      { code: 'DOT', name: 'Polkadot', currentPrice: 8.50 }
    ],
    renda_fixa: [
      { code: 'TESOURO-SELIC', name: 'Tesouro Selic 2029', currentPrice: 1050.30 },
      { code: 'TESOURO-IPCA', name: 'Tesouro IPCA+ 2035', currentPrice: 3250.80 },
      { code: 'CDB-INTER', name: 'CDB Inter 110% CDI', currentPrice: 1000 },
      { code: 'LCI-NUBANK', name: 'LCI Nubank 95% CDI', currentPrice: 1000 },
      { code: 'LCA-XP', name: 'LCA XP 100% CDI', currentPrice: 1000 },
      { code: 'TESOURO-PREFIXADO', name: 'Tesouro Prefixado 2028', currentPrice: 875.50 }
    ]
  };

  const handleSearch = (query) => {
    setTicker(query.toUpperCase());
    if (query.length >= 2) {
      const results = popularAssets[assetType].filter(
        asset => 
          asset.code.includes(query.toUpperCase()) || 
          asset.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  const selectAsset = (asset) => {
    setTicker(asset.code);
    setAvgPrice(asset.currentPrice.toString());
    setShowSearch(false);
  };

  const totalInvested = quantity && avgPrice ? parseFloat(quantity) * parseFloat(avgPrice) : 0;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white font-semibold">
            Cancel
          </button>
          <h1 className="text-white font-bold text-lg">Add Ativo</h1>
          <button
            onClick={async () => {
              if (ticker && quantity && avgPrice) {
                const { error } = await addAsset({
                  code: ticker,
                  quantity: parseFloat(quantity),
                  avg_price: parseFloat(avgPrice),
                  type: assetType as 'acao' | 'fii' | 'crypto' | 'internacional'
                });

                if (error) {
                  alert('❌ Failed to add ativo. Tente novamente.');
                  console.error('Error adding asset:', error);
                } else {
                  alert(`✅ ${ticker} adicionado com sucesso à sua carteira! 🎉`);
                  onBack();
                }
              }
            }}
            className={`font-semibold ${(ticker && quantity && avgPrice) ? 'text-white hover:text-white/90' : 'text-white/50 cursor-not-allowed'}`}
          >
            Add
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Asset Type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-3">Asset Type</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => {
                setAssetType('acao');
                setTicker('');
                setShowSearch(false);
              }}
              className={`py-3 px-4 rounded-xl font-semibold transition ${
                assetType === 'acao' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              📈 Ações
            </button>
            <button 
              onClick={() => {
                setAssetType('fii');
                setTicker('');
                setShowSearch(false);
              }}
              className={`py-3 px-4 rounded-xl font-semibold transition ${
                assetType === 'fii' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              🏢 FIIs
            </button>
            <button 
              onClick={() => {
                setAssetType('crypto');
                setTicker('');
                setShowSearch(false);
              }}
              className={`py-3 px-4 rounded-xl font-semibold transition ${
                assetType === 'crypto' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              ₿ Cripto
            </button>
            <button 
              onClick={() => {
                setAssetType('renda_fixa');
                setTicker('');
                setShowSearch(false);
              }}
              className={`py-3 px-4 rounded-xl font-semibold transition ${
                assetType === 'renda_fixa' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              💰 Renda Fixa
            </button>
          </div>
        </div>

        {/* Search Ativo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 relative">
          <label className="text-slate-700 font-semibold mb-2 block">
            Search Ativo *
          </label>
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ticker}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                assetType === 'acao' ? 'Ex: PETR4, VALE3...' :
                assetType === 'fii' ? 'Ex: HGLG11, MXRF11...' :
                assetType === 'crypto' ? 'Ex: BTC, ETH...' :
                'Ex: Tesouro Selic...'
              }
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Returns da Busca */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-64 overflow-y-auto z-50">
              {searchResults.map(asset => (
                <button
                  key={asset.code}
                  onClick={() => selectAsset(asset)}
                  className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-b-0"
                >
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{asset.code}</p>
                    <p className="text-sm text-slate-500">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      € {asset.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ativos Populares */}
        {!ticker && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-slate-700 font-semibold mb-3">✨ Populares em {
              assetType === 'acao' ? 'Ações' :
              assetType === 'fii' ? 'FIIs' :
              assetType === 'crypto' ? 'Cripto' :
              'Renda Fixa'
            }</p>
            <div className="space-y-2">
              {popularAssets[assetType].slice(0, 4).map(asset => (
                <button
                  key={asset.code}
                  onClick={() => selectAsset(asset)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition"
                >
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{asset.code}</p>
                    <p className="text-sm text-slate-500">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      € {asset.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantidade e Preço */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-700 font-semibold mb-2 block">
                Quantidade *
              </label>
              <input
                type="number"
                step={assetType === 'crypto' ? '0.00000001' : '1'}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={assetType === 'crypto' ? '0.05' : '100'}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold mb-2 block">
                Preço Médio *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="35.20"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          </div>

          {/* Data de Compra */}
          <div>
            <label className="text-slate-700 font-semibold mb-2 block">
              Data de Compra (Opcional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Resumo do Investimento */}
        {quantity && avgPrice && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm mb-4 border-2 border-green-200">
            <p className="text-green-700 font-bold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Resumo do Investimento
            </p>
            <div className="bg-white rounded-xl p-4">
              {ticker && (
                <div className="mb-3 pb-3 border-b border-slate-100">
                  <p className="text-slate-500 text-sm mb-1">Ativo</p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-green-700">{ticker}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      assetType === 'acao' ? 'bg-blue-100 text-blue-700' :
                      assetType === 'fii' ? 'bg-green-100 text-green-700' :
                      assetType === 'crypto' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {assetType === 'acao' ? 'AÇÃO' :
                       assetType === 'fii' ? 'FII' :
                       assetType === 'crypto' ? 'CRIPTO' :
                       'RENDA FIXA'}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Quantidade</p>
                  <p className="text-lg font-bold text-slate-900">{parseFloat(quantity).toLocaleString('pt-BR', { maximumFractionDigits: 8 })}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Preço Médio</p>
                  <p className="text-lg font-bold text-slate-900">€ {parseFloat(avgPrice).toFixed(2)}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-slate-500 text-sm mb-1">Valor Total Invested</p>
                <p className="text-2xl font-black text-green-600">
                  € {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dicas */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-blue-900 font-bold mb-2">💡 Dica</p>
          <p className="text-sm text-blue-800">
            {assetType === 'acao' && 'Diversifique sua carteira com ações de diferentes setores para reduzir riscos.'}
            {assetType === 'fii' && 'FIIs distribuem pelo menos 95% dos lucros como dividendos. Ótimos para renda passiva!'}
            {assetType === 'crypto' && 'Criptomoedas são voláteis. Invista apenas o que você pode perder.'}
            {assetType === 'renda_fixa' && 'Renda fixa oferece previsibilidade. Ideal para reserva de emergência e objetivos de curto prazo.'}
          </p>
        </div>
      </div>
    </div>
  );
};
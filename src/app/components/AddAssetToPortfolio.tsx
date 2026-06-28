import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio';

// ─── European & Global assets by type ─────────────────────────
const POPULAR_ASSETS = {
  stock: [
    { code: 'SHEL',  name: 'Shell',         price: 2856.50, currency: 'GBP', exchange: 'LSE' },
    { code: 'AZN',   name: 'AstraZeneca',   price: 12845.0, currency: 'GBP', exchange: 'LSE' },
    { code: 'HSBA',  name: 'HSBC Holdings', price: 734.80,  currency: 'GBP', exchange: 'LSE' },
    { code: 'BP',    name: 'BP',            price: 425.60,  currency: 'GBP', exchange: 'LSE' },
    { code: 'AAPL',  name: 'Apple',         price: 213.45,  currency: 'USD', exchange: 'NASDAQ' },
    { code: 'MSFT',  name: 'Microsoft',     price: 432.80,  currency: 'USD', exchange: 'NASDAQ' },
    { code: 'NVDA',  name: 'NVIDIA',        price: 1245.60, currency: 'USD', exchange: 'NASDAQ' },
    { code: 'ASML',  name: 'ASML Holding',  price: 845.20,  currency: 'EUR', exchange: 'Euronext' },
  ],
  etf: [
    { code: 'VWCE',  name: 'Vanguard FTSE All-World',  price: 118.50, currency: 'EUR', exchange: 'Xetra' },
    { code: 'CSPX',  name: 'iShares Core S&P 500',     price: 542.80, currency: 'USD', exchange: 'LSE' },
    { code: 'VUSA',  name: 'Vanguard S&P 500',         price: 98.45,  currency: 'GBP', exchange: 'LSE' },
    { code: 'IWDA',  name: 'iShares MSCI World',       price: 98.12,  currency: 'USD', exchange: 'Euronext' },
    { code: 'EQQQ',  name: 'Invesco NASDAQ-100',       price: 458.30, currency: 'GBP', exchange: 'LSE' },
    { code: 'ISF',   name: 'iShares FTSE 100',         price: 8.42,   currency: 'GBP', exchange: 'LSE' },
    { code: 'MEUD',  name: 'Amundi MSCI Europe',       price: 42.15,  currency: 'EUR', exchange: 'Euronext' },
    { code: 'GLDA',  name: 'iShares Physical Gold',    price: 38.90,  currency: 'USD', exchange: 'LSE' },
  ],
  crypto: [
    { code: 'BTC',   name: 'Bitcoin',    price: 67820,   currency: 'USD', exchange: 'Crypto' },
    { code: 'ETH',   name: 'Ethereum',   price: 3845,    currency: 'USD', exchange: 'Crypto' },
    { code: 'BNB',   name: 'BNB',        price: 612,     currency: 'USD', exchange: 'Crypto' },
    { code: 'SOL',   name: 'Solana',     price: 178.40,  currency: 'USD', exchange: 'Crypto' },
    { code: 'XRP',   name: 'XRP',        price: 0.612,   currency: 'USD', exchange: 'Crypto' },
    { code: 'ADA',   name: 'Cardano',    price: 0.485,   currency: 'USD', exchange: 'Crypto' },
    { code: 'DOT',   name: 'Polkadot',   price: 7.25,    currency: 'USD', exchange: 'Crypto' },
    { code: 'AVAX',  name: 'Avalanche',  price: 36.80,   currency: 'USD', exchange: 'Crypto' },
  ],
  bond: [
    { code: 'IE-10Y',   name: 'Irish Govt Bond 10Y',    price: 98.50,   currency: 'EUR', exchange: 'NTMA' },
    { code: 'UK-GILT',  name: 'UK Gilt 10Y',            price: 97.20,   currency: 'GBP', exchange: 'DMO' },
    { code: 'US-T10Y',  name: 'US Treasury Bond 10Y',   price: 96.80,   currency: 'USD', exchange: 'TreasuryDirect' },
    { code: 'EU-5Y',    name: 'European Govt Bond 5Y',  price: 99.10,   currency: 'EUR', exchange: 'Euronext' },
    { code: 'IBTA',     name: 'iShares € Govt Bond',   price: 101.40,  currency: 'EUR', exchange: 'Xetra' },
    { code: 'VGOV',     name: 'Vanguard UK Gilt',       price: 18.50,   currency: 'GBP', exchange: 'LSE' },
  ],
};

const TYPE_CONFIG = {
  stock:  { label: '📈 Stocks',  desc: 'UK, EU & US shares',     color: 'bg-blue-600',   searchPlaceholder: 'E.g. AAPL, SHEL, ASML...' },
  etf:    { label: '🌍 ETFs',    desc: 'Diversified funds',      color: 'bg-green-600',  searchPlaceholder: 'E.g. VWCE, CSPX, IWDA...' },
  crypto: { label: '₿ Crypto',  desc: 'Digital assets',         color: 'bg-orange-500', searchPlaceholder: 'E.g. BTC, ETH, SOL...' },
  bond:   { label: '🏦 Bonds',   desc: 'Fixed income & gilts',   color: 'bg-purple-600', searchPlaceholder: 'E.g. IE-10Y, UK-GILT...' },
};

const currencySymbol = (c = 'EUR') => c === 'GBP' ? '£' : c === 'USD' ? '$' : '€';

type AssetType = keyof typeof POPULAR_ASSETS;

export const AddAssetToPortfolio = ({ onBack }) => {
  const { addAsset } = usePortfolio();
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [searchResults, setSearchResults] = useState<typeof POPULAR_ASSETS.stock>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const totalInvested = quantity && avgPrice
    ? parseFloat(quantity) * parseFloat(avgPrice)
    : 0;

  const canSave = ticker.trim() && quantity && avgPrice &&
    parseFloat(quantity) > 0 && parseFloat(avgPrice) > 0;

  const handleSearch = (query: string) => {
    setTicker(query.toUpperCase());
    setSaved(false);
    setError('');
    if (query.length >= 1) {
      const results = POPULAR_ASSETS[assetType].filter(a =>
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  const selectAsset = (asset: typeof POPULAR_ASSETS.stock[0]) => {
    setTicker(asset.code);
    setAvgPrice(asset.price.toString());
    setCurrency(asset.currency);
    setShowSearch(false);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');
    const { error: err } = await addAsset({
      code: ticker.trim(),
      type: assetType,
      quantity: parseFloat(quantity),
      avg_price: parseFloat(avgPrice),
      currency,
    });
    setSaving(false);
    if (err) {
      setError(typeof err === 'string' ? err : 'Failed to add asset. Please try again.');
    } else {
      setSaved(true);
      setTimeout(() => onBack(), 1200);
    }
  };

  const sym = currencySymbol(currency);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white font-semibold text-sm">Cancel</button>
          <h1 className="text-white font-bold text-lg">Add Asset</h1>
          <button
            onClick={handleSave}
            disabled={!canSave || saving || saved}
            className={`text-sm font-bold transition ${canSave && !saving && !saved ? 'text-white' : 'text-white/40'}`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? '✓' : 'Save'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-4">

        {/* Asset Type */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Asset Type</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(TYPE_CONFIG) as [AssetType, typeof TYPE_CONFIG.stock][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { setAssetType(key); setTicker(''); setAvgPrice(''); setShowSearch(false); }}
                className={`p-3 rounded-xl border-2 text-left transition ${
                  assetType === key ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className={`font-semibold text-sm ${assetType === key ? 'text-green-700' : 'text-slate-800'}`}>{cfg.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cfg.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ticker / Symbol</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={ticker}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => ticker.length >= 1 && setShowSearch(true)}
              placeholder={TYPE_CONFIG[assetType].searchPlaceholder}
              className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 z-20 overflow-hidden">
                {searchResults.map(asset => (
                  <button
                    key={asset.code}
                    onClick={() => selectAsset(asset)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{asset.code}</span>
                      <span className="text-slate-500 text-xs ml-2">{asset.name}</span>
                    </div>
                    <span className="text-slate-600 text-xs font-medium">
                      {currencySymbol(asset.currency)}{asset.price.toLocaleString('en-IE')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Popular suggestions */}
          {!ticker && (
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-2">Popular</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_ASSETS[assetType].slice(0, 6).map(a => (
                  <button
                    key={a.code}
                    onClick={() => selectAsset(a)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:border-green-500 hover:text-green-700 transition"
                  >
                    {a.code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Currency */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Currency</p>
          <div className="flex gap-2">
            {['EUR', 'GBP', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition ${
                  currency === c ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {c === 'EUR' ? '€ EUR' : c === 'GBP' ? '£ GBP' : '$ USD'}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quantity</p>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              step="any"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Avg Price ({sym})</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
              <input
                type="number"
                value={avgPrice}
                onChange={e => setAvgPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className="w-full pl-7 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Total */}
        {totalInvested > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Total Invested</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {sym}{totalInvested.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
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
            <p className="text-sm text-green-700 font-semibold">{ticker} added to your portfolio!</p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!canSave || saving || saved}
          className={`w-full py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 ${
            canSave && !saving && !saved
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
           : saved ? <><CheckCircle className="w-5 h-5" /> Saved!</>
           : 'Add to Portfolio'}
        </button>

        {/* Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong>{' '}
            {assetType === 'stock' && 'Diversify across sectors and geographies to reduce risk.'}
            {assetType === 'etf' && 'ETFs like VWCE give you global diversification in a single fund.'}
            {assetType === 'crypto' && 'Crypto is highly volatile. Only invest what you can afford to lose.'}
            {assetType === 'bond' && 'Bonds and gilts provide stability and predictable income.'}
          </p>
        </div>

      </div>
    </div>
  );
};

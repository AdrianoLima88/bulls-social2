import React, { useState } from 'react';
import {
  ArrowLeft, Filter, Search, X, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  DollarSign
} from 'lucide-react';
import { AssetDetailsModal } from './AssetDetailsModal';
import { useMarket, type MarketTab, type MarketAsset } from '../../hooks/useMarket';

// ─── Logo com fallback encadeado ─────────────────────────────
const CRYPTO_CODES = new Set(['BTC','ETH','BNB','SOL','XRP','ADA','DOT','AVAX','DOGE','USDT','USDC','MATIC','LTC','LINK']);

const DOMAIN_MAP: Record<string, string> = {
  // UK / LSE
  SHEL: 'shell.com', AZN: 'astrazeneca.com', HSBA: 'hsbc.com',
  BP: 'bp.com', ULVR: 'unilever.com', RIO: 'riotinto.com',
  DGE: 'diageo.com', GSK: 'gsk.com',
  // Europe
  MC: 'lvmh.com', ASML: 'asml.com', OR: 'loreal.com',
  SAP: 'sap.com', SIE: 'siemens.com', NESN: 'nestle.com',
  NOVN: 'novartis.com', AIR: 'airbus.com',
  // US
  AAPL: 'apple.com', MSFT: 'microsoft.com', NVDA: 'nvidia.com',
  GOOGL: 'google.com', AMZN: 'amazon.com', TSLA: 'tesla.com',
  META: 'meta.com', JPM: 'jpmorganchase.com',
};

function logoSources(code: string): string[] {
  const c = code.toUpperCase();
  if (CRYPTO_CODES.has(c)) {
    return [`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${c.toLowerCase()}.svg`];
  }
  const sources: string[] = [];
  if (DOMAIN_MAP[c]) sources.push(`https://logo.clearbit.com/${DOMAIN_MAP[c]}`);
  sources.push(`https://financialmodelingprep.com/image-stock/${c}.png`);
  return sources;
}

const StockLogo = ({ code, name, size = 10 }: { code: string; name: string; size?: number }) => {
  const sources = logoSources(code);
  const [idx, setIdx] = useState(0);
  const initials = code.substring(0, 2).toUpperCase();
  const sizeClass = `w-${size} h-${size}`;

  if (idx >= sources.length) {
    return (
      <div className={`${sizeClass} rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0`}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={sources[idx]}
      alt={name}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      onError={() => setIdx(i => i + 1)}
    />
  );
};

// ─── Helpers ──────────────────────────────────────────────────
const currencySymbol = (c: string) =>
  c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';

const formatPrice = (price: number, currency: string) => {
  if (!price) return '—';
  const sym = currencySymbol(currency);
  if (price >= 1000) return `${sym}${price.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price < 1)    return `${sym}${price.toFixed(4)}`;
  return `${sym}${price.toFixed(2)}`;
};

// ─── Skeleton loader ──────────────────────────────────────────
const AssetSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between animate-pulse">
    <div className="flex-1">
      <div className="h-4 w-16 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
    <div className="text-right">
      <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
    </div>
  </div>
);

// ─── Card de ativo ─────────────────────────────────────────────
const AssetRow = ({ asset, onPress }: { asset: MarketAsset; onPress: () => void }) => {
  const isPositive = asset.change >= 0;

  if (asset.loading) return <AssetSkeleton />;

  if (asset.error) return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 opacity-60">
      <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div>
        <span className="font-bold text-slate-700 text-sm">{asset.code}</span>
        <span className="text-xs text-slate-400 ml-2">{asset.name}</span>
      </div>
      <p className="ml-auto text-xs text-slate-400">Unavailable</p>
    </div>
  );

  return (
    <div
      onClick={onPress}
      className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition cursor-pointer active:scale-[0.99]"
    >
      <div className="mr-3">
        <StockLogo code={asset.code.split('.')[0]} name={asset.name} size={10} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">{asset.code.split('.')[0]}</span>
          <span className="text-xs text-slate-500 truncate">{asset.name}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{asset.exchange}</p>
      </div>

      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-bold text-slate-900 text-sm">
          {formatPrice(asset.price, asset.currency)}
        </p>
        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive
            ? <TrendingUp className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />
          }
          <span className="text-xs font-semibold">
            {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 ml-2 flex-shrink-0" />
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────
export const MarketScreen = ({ onBack, onNavigateToCurrencies }) => {
  const [tab, setTab] = useState<MarketTab>('us');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'change_high' | 'change_low' | 'price' | 'name'>('change_high');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers'>('gainers');

  const { assets, forex, loading, lastUpdated, refetch } = useMarket(tab);

  const tabs: { key: MarketTab; label: string; flag: string }[] = [
    { key: 'uk',     label: 'UK',      flag: '🇬🇧' },
    { key: 'europe', label: 'Europe',  flag: '🇪🇺' },
    { key: 'us',     label: 'US',      flag: '🇺🇸' },
    { key: 'crypto', label: 'Crypto',  flag: '₿' },
  ];

  // Filtra e ordena
  const displayed = [...assets]
    .filter(a =>
      !searchQuery ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'change_high') return b.change - a.change;
      if (sortBy === 'change_low')  return a.change - b.change;
      if (sortBy === 'price')       return b.price - a.price;
      if (sortBy === 'name')        return a.name.localeCompare(b.name);
      return 0;
    });

  // Top movers from current tab data
  const readyAssets = assets.filter(a => !a.loading && !a.error && a.price > 0);
  const topMovers = [...readyAssets]
    .sort((a, b) => moversTab === 'gainers' ? b.change - a.change : a.change - b.change)
    .slice(0, 6);

  // Mapeia para o modal existente (mantém compatibilidade)
  const assetForModal = selectedAsset ? {
    code: selectedAsset.code.split('.')[0],
    name: selectedAsset.name,
    price: selectedAsset.price,
    change: selectedAsset.change,
    volume: '—',
    description: selectedAsset.description || '',
    sector: selectedAsset.exchange,
  } : null;

  const getAssetType = () => {
    if (tab === 'crypto')  return 'crypto';
    if (tab === 'us')      return 'international';
    return 'international';
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg leading-tight">Markets</h1>
            {lastUpdated && (
              <p className="text-white/70 text-[10px]">
                Updated {lastUpdated.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => refetch()}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search stocks, crypto..."
              className="w-full pl-9 pr-8 py-2.5 bg-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">

        {/* Today's Movers */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 text-sm">Today's Movers</h2>
            <div className="flex gap-1 bg-slate-100 rounded-full p-0.5">
              <button
                onClick={() => setMoversTab('gainers')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${moversTab === 'gainers' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
              >
                Gainers
              </button>
              <button
                onClick={() => setMoversTab('losers')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${moversTab === 'losers' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}
              >
                Losers
              </button>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3">
            {topMovers.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-20 bg-white rounded-2xl p-3 shadow-sm animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-10 mx-auto mb-1" />
                    <div className="h-3 bg-slate-100 rounded w-8 mx-auto" />
                  </div>
                ))
              : topMovers.map(asset => {
                  const isPos = asset.change >= 0;
                  const code = asset.code.split('.')[0];
                  return (
                    <button
                      key={asset.code}
                      onClick={() => setSelectedAsset(asset)}
                      className="flex-shrink-0 w-20 bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-1.5 active:scale-95 transition"
                    >
                      <StockLogo code={code} name={asset.name} size={12} />
                      <span className="font-bold text-slate-900 text-xs">{code}</span>
                      <span className={`text-[11px] font-bold ${isPos ? 'text-green-600' : 'text-red-500'}`}>
                        {isPos ? '+' : ''}{asset.change.toFixed(2)}%
                      </span>
                    </button>
                  );
                })
            }
          </div>
        </div>

        {/* Forex */}
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">FX Rates</p>
                  <p className="text-white/70 text-xs">Live exchange rates</p>
                </div>
              </div>
              <button
                onClick={onNavigateToCurrencies}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {forex.map(fx => (
                <div key={fx.pair} className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/80 text-xs font-semibold mb-1">{fx.flag} {fx.label}</p>
                  <p className="text-white font-bold text-sm">
                    {fx.rate ? fx.rate.toFixed(4) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition ${
                  tab === t.key
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{t.flag}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="px-4 space-y-2">
          {loading && assets.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <AssetSkeleton key={i} />)
            : displayed.length === 0
              ? (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-500">No results found</p>
                  <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                </div>
              )
              : displayed.map(asset => (
                <AssetRow
                  key={asset.code}
                  asset={asset}
                  onPress={() => setSelectedAsset(asset)}
                />
              ))
          }
        </div>

        {/* Aviso quando sem API key */}
        {!import.meta.env.VITE_FINNHUB_API_KEY && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Showing demo data. Add your free Finnhub API key in{' '}
              <span className="font-mono font-semibold">.env</span> as{' '}
              <span className="font-mono font-semibold">VITE_FINNHUB_API_KEY</span> to get live prices.{' '}
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Get free key →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Sort & Filter</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <h3 className="font-semibold text-slate-700 text-sm mb-3">Sort by</h3>
            <div className="space-y-2 mb-6">
              {[
                { value: 'change_high', label: 'Biggest gainers', icon: '📈' },
                { value: 'change_low',  label: 'Biggest losers',  icon: '📉' },
                { value: 'price',       label: 'Highest price',   icon: '💰' },
                { value: 'name',        label: 'Alphabetical',    icon: '🔤' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition ${
                    sortBy === opt.value
                      ? 'border-green-600 bg-green-50'
                      : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.icon}</span>
                    <span className={`font-medium text-sm ${sortBy === opt.value ? 'text-green-700' : 'text-slate-700'}`}>
                      {opt.label}
                    </span>
                  </div>
                  {sortBy === opt.value && (
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => { setSortBy('change_high'); setShowFilterModal(false); }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && assetForModal && (
        <AssetDetailsModal
          asset={assetForModal}
          assetType={getAssetType()}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

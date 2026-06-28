import React, { useState } from 'react';
import {
  ArrowLeft, Filter, Search, X, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  DollarSign, Loader2
} from 'lucide-react';
import { AssetDetailsModal } from './AssetDetailsModal';
import { useMarket, MARKET_INDICES, type MarketTab, type MarketAsset } from '../../hooks/useMarket';

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
      {/* Ícone de letra */}
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0 mr-3">
        {asset.code.replace('.L', '').replace('.PA', '').replace('.AS', '').replace('.DE', '').replace('.SW', '').substring(0, 2)}
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
  const [tab, setTab] = useState<MarketTab>('uk');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'change_high' | 'change_low' | 'price' | 'name'>('change_high');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);

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

        {/* Índices */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {MARKET_INDICES.map(idx => (
              <div key={idx.name} className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-slate-500 text-xs mb-1">{idx.name}</p>
                <p className="font-bold text-slate-900 text-base">{idx.value}</p>
                <p className={`text-xs font-semibold ${idx.positive ? 'text-green-600' : 'text-red-500'}`}>
                  {idx.change}
                </p>
              </div>
            ))}
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

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Filter, Search, X, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  DollarSign, Plus, Trash2, RotateCcw, Settings2,
} from 'lucide-react';
import { AssetDetailsModal } from './AssetDetailsModal';
import {
  useMarket, useWatchlist, getAllMockAssets,
  STOCKS_CATALOG, DEFAULT_WATCHLISTS,
  type MarketTab, type MarketAsset,
} from '../../hooks/useMarket';

// ─── Logo helpers ─────────────────────────────────────────────
const CRYPTO_CODES = new Set(['BTC','ETH','BNB','SOL','XRP','ADA','DOT','AVAX','DOGE','USDT','USDC','MATIC','LTC','LINK']);

const FMP_ALIAS: Record<string,string> = {
  HSBA:'HSBC', ULVR:'UL',    DGE:'DEO',   RIO:'RIO',   GSK:'GSK',
  SIE:'SIEGY', MC:'LVMUY',   ASML:'ASML', OR:'LRLCY',  SAP:'SAP',
  NESN:'NSRGY',NOVN:'NVS',   AIR:'EADSY', VOD:'VOD',   BAE:'BAESY',
  PRU:'PUK',   BNP:'BNPQY',  TTE:'TTE',   BMW:'BMWYY',
  VUSA:'VOO',  CSPX:'IVV',   IWDA:'URTH', VWRL:'VT',
};

function logoSources(code: string): string[] {
  const c = code.toUpperCase();
  if (CRYPTO_CODES.has(c))
    return [`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${c.toLowerCase()}.svg`];
  const alias = FMP_ALIAS[c];
  const srcs = [`https://financialmodelingprep.com/image-stock/${c}.png`];
  if (alias && alias !== c) srcs.push(`https://financialmodelingprep.com/image-stock/${alias}.png`);
  return srcs;
}

const StockLogo = ({ code, name, size = 10 }: { code: string; name: string; size?: number }) => {
  const sources = logoSources(code);
  const [idx, setIdx] = useState(0);
  const sizeClass = `w-${size} h-${size}`;
  if (idx >= sources.length)
    return <div className={`${sizeClass} rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs flex-shrink-0`}>{code.substring(0,2)}</div>;
  return <img src={sources[idx]} alt={name} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} onError={() => setIdx(i => i+1)} />;
};

// ─── Formatters ───────────────────────────────────────────────
const currencySymbol = (c: string) => c==='GBP'?'£':c==='EUR'?'€':'$';

const formatPrice = (price: number, currency: string) => {
  if (!price) return '—';
  const sym = currencySymbol(currency);
  if (price >= 1000) return `${sym}${price.toLocaleString('en-IE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  if (price < 1)     return `${sym}${price.toFixed(4)}`;
  return `${sym}${price.toFixed(2)}`;
};

// ─── Skeleton ─────────────────────────────────────────────────
const AssetSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between animate-pulse">
    <div className="flex-1"><div className="h-4 w-16 bg-slate-200 rounded mb-2"/><div className="h-3 w-24 bg-slate-100 rounded"/></div>
    <div className="text-right"><div className="h-4 w-20 bg-slate-200 rounded mb-2"/><div className="h-3 w-12 bg-slate-100 rounded ml-auto"/></div>
  </div>
);

// ─── Asset row ────────────────────────────────────────────────
const AssetRow = ({ asset, onPress }: { asset: MarketAsset; onPress: () => void }) => {
  const isPos = asset.change >= 0;
  if (asset.loading) return <AssetSkeleton/>;
  if (asset.error)   return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 opacity-60">
      <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0"/>
      <span className="font-bold text-slate-700 text-sm">{asset.code}</span>
      <span className="text-xs text-slate-400 ml-1">{asset.name}</span>
      <p className="ml-auto text-xs text-slate-400">Unavailable</p>
    </div>
  );
  return (
    <div onClick={onPress} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition cursor-pointer active:scale-[0.99]">
      <div className="mr-3"><StockLogo code={asset.code.split('.')[0]} name={asset.name} size={10}/></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">{asset.code.split('.')[0]}</span>
          <span className="text-xs text-slate-500 truncate">{asset.name}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{asset.exchange}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-bold text-slate-900 text-sm">{formatPrice(asset.price, asset.currency)}</p>
        <div className={`flex items-center justify-end gap-1 ${isPos?'text-green-600':'text-red-500'}`}>
          {isPos ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
          <span className="text-xs font-semibold">{isPos?'+':''}{asset.change.toFixed(2)}%</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 ml-2 flex-shrink-0"/>
    </div>
  );
};

const TAB_LABELS: Record<MarketTab, string> = { us:'🇺🇸 US', uk:'🇬🇧 UK', europe:'🇪🇺 EU', crypto:'₿ Crypto' };

// ─── Main component ───────────────────────────────────────────
export const MarketScreen = ({ onBack, onNavigateToCurrencies }: any) => {
  const [tab, setTab]             = useState<MarketTab>('us');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]       = useState<'change_high'|'change_low'|'price'|'name'>('change_high');
  const [showFilterModal, setShowFilterModal]     = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizeSearch, setCustomizeSearch]       = useState('');
  const [selectedAsset, setSelectedAsset]           = useState<MarketAsset | null>(null);
  const [moversTab, setMoversTab] = useState<'gainers'|'losers'>('gainers');

  const { watchlists, addSymbol, removeSymbol, resetTab } = useWatchlist();
  const { assets, forex, loading, lastUpdated, refetch }  = useMarket(tab, watchlists[tab]);

  const tabs: { key: MarketTab; label: string; flag: string }[] = [
    { key:'uk',     label:'UK',     flag:'🇬🇧' },
    { key:'europe', label:'Europe', flag:'🇪🇺' },
    { key:'us',     label:'US',     flag:'🇺🇸' },
    { key:'crypto', label:'Crypto', flag:'₿'  },
  ];

  // ── Search: filter catalog-wide ──
  const catalogResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return STOCKS_CATALOG.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Current-tab assets matching the search
  const watchlistMatches = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(a => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  }, [assets, searchQuery]);

  // Catalog items NOT in the current tab's watchlist (for "add" suggestions)
  const catalogSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const inWatchlist = new Set(watchlists[tab]);
    return catalogResults.filter(c => !inWatchlist.has(c.code));
  }, [catalogResults, watchlists, tab, searchQuery]);

  // Sort watchlist matches
  const displayed = useMemo(() => [...watchlistMatches].sort((a,b) => {
    if (sortBy==='change_high') return b.change - a.change;
    if (sortBy==='change_low')  return a.change - b.change;
    if (sortBy==='price')       return b.price  - a.price;
    if (sortBy==='name')        return a.name.localeCompare(b.name);
    return 0;
  }), [watchlistMatches, sortBy]);

  // Movers pool
  const liveAssets = assets.filter(a => !a.loading && !a.error && a.price > 0);
  const liveCodes  = new Set(liveAssets.map(a => a.code));
  const moversPool = [...liveAssets, ...getAllMockAssets().filter(a => !liveCodes.has(a.code))];
  const topMovers  = [...moversPool].sort((a,b) => moversTab==='gainers' ? b.change-a.change : a.change-b.change).slice(0,8);

  const assetForModal = selectedAsset ? {
    code: selectedAsset.code.split('.')[0], name: selectedAsset.name,
    price: selectedAsset.price, change: selectedAsset.change,
    volume: '—', description: selectedAsset.description || '', sector: selectedAsset.exchange,
  } : null;

  // ── Customize modal items ──
  const customizeSuggestions = useMemo(() => {
    const inWatchlist = new Set(watchlists[tab]);
    if (!customizeSearch.trim()) return [];
    const q = customizeSearch.toLowerCase();
    return STOCKS_CATALOG.filter(c =>
      !inWatchlist.has(c.code) &&
      (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [customizeSearch, watchlists, tab]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white"/>
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg leading-tight">Markets</h1>
            {lastUpdated && (
              <p className="text-white/70 text-[10px]">Updated {lastUpdated.toLocaleTimeString('en-IE',{hour:'2-digit',minute:'2-digit'})}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => refetch()} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <RefreshCw className={`w-5 h-5 text-white ${loading?'animate-spin':''}`}/>
            </button>
            <button onClick={() => { setShowCustomizeModal(true); setCustomizeSearch(''); }} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <Settings2 className="w-5 h-5 text-white"/>
            </button>
            <button onClick={() => setShowFilterModal(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <Filter className="w-5 h-5 text-white"/>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60"/>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search any stock, crypto…"
              className="w-full pl-9 pr-8 py-2.5 bg-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-white/70"/>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">

        {/* Today's Movers */}
        {!searchQuery && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900 text-sm">Today's Movers</h2>
              <div className="flex gap-1 bg-slate-100 rounded-full p-0.5">
                {(['gainers','losers'] as const).map(m => (
                  <button key={m} onClick={() => setMoversTab(m)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${moversTab===m?(m==='gainers'?'bg-white text-green-600 shadow-sm':'bg-white text-red-500 shadow-sm'):'text-slate-500'}`}>
                    {m.charAt(0).toUpperCase()+m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3">
              {topMovers.map(asset => {
                const isPos = asset.change >= 0;
                const code = asset.code.split('.')[0];
                return (
                  <button key={asset.code} onClick={() => setSelectedAsset(asset)}
                    className="flex-shrink-0 w-20 bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-1.5 active:scale-95 transition">
                    <StockLogo code={code} name={asset.name} size={12}/>
                    <span className="font-bold text-slate-900 text-xs">{code}</span>
                    <span className={`text-[11px] font-bold ${isPos?'text-green-600':'text-red-500'}`}>
                      {isPos?'+':''}{asset.change.toFixed(2)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Forex */}
        {!searchQuery && (
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">FX Rates</p>
                    <p className="text-white/70 text-xs">Live exchange rates</p>
                  </div>
                </div>
                <button onClick={onNavigateToCurrencies} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition">
                  View all <ChevronRight className="w-3 h-3"/>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {forex.map(fx => (
                  <div key={fx.pair} className="bg-white/10 rounded-xl p-3">
                    <p className="text-white/80 text-xs font-semibold mb-1">{fx.flag} {fx.label}</p>
                    <p className="text-white font-bold text-sm">{fx.rate ? fx.rate.toFixed(4) : '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition ${tab===t.key?'bg-green-600 text-white shadow-md':'bg-white text-slate-600 hover:bg-slate-100'}`}>
                <span>{t.flag}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main list */}
        <div className="px-4 space-y-2">
          {loading && assets.length === 0
            ? Array.from({length:6}).map((_,i) => <AssetSkeleton key={i}/>)
            : displayed.map(asset => (
                <AssetRow key={asset.code} asset={asset} onPress={() => setSelectedAsset(asset)}/>
              ))
          }

          {/* Catalog suggestions when search finds extra items not in watchlist */}
          {searchQuery && catalogSuggestions.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                Not in your {TAB_LABELS[tab]} watchlist
              </p>
              {catalogSuggestions.map(item => (
                <div key={item.code} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 mb-2">
                  <StockLogo code={item.code} name={item.name} size={10}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.code}</span>
                      <span className="text-xs text-slate-500 truncate">{item.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.exchange} · {item.region.toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.mockChange>=0?'text-green-600':'text-red-500'} mr-2`}>
                    ~{item.mockChange>=0?'+':''}{item.mockChange.toFixed(2)}%
                  </span>
                  <button
                    onClick={() => { addSymbol(item.region, item.code); setTab(item.region); setSearchQuery(''); }}
                    className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4 text-white"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {searchQuery && displayed.length === 0 && catalogSuggestions.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
              <p className="font-semibold text-slate-500">No results for "{searchQuery}"</p>
              <p className="text-sm text-slate-400 mt-1">Try a different ticker or company name</p>
            </div>
          )}
        </div>

        {/* Demo banner */}
        {!import.meta.env.VITE_FINNHUB_API_KEY && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-700">
              Showing demo data. Add your free Finnhub API key in{' '}
              <span className="font-mono font-semibold">.env</span> as{' '}
              <span className="font-mono font-semibold">VITE_FINNHUB_API_KEY</span>.{' '}
              <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Get free key →</a>
            </p>
          </div>
        )}
      </div>

      {/* ── Sort modal ── */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Sort by</h2>
              <button onClick={() => setShowFilterModal(false)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-600"/>
              </button>
            </div>
            <div className="space-y-2 mb-6">
              {([
                { value:'change_high', label:'Biggest gainers', icon:'📈' },
                { value:'change_low',  label:'Biggest losers',  icon:'📉' },
                { value:'price',       label:'Highest price',   icon:'💰' },
                { value:'name',        label:'Alphabetical',    icon:'🔤' },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => setSortBy(opt.value)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition ${sortBy===opt.value?'border-green-600 bg-green-50':'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.icon}</span>
                    <span className={`font-medium text-sm ${sortBy===opt.value?'text-green-700':'text-slate-700'}`}>{opt.label}</span>
                  </div>
                  {sortBy===opt.value && <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => { setSortBy('change_high'); setShowFilterModal(false); }} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl">Reset</button>
              <button onClick={() => setShowFilterModal(false)} className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Customize watchlist modal ── */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl flex flex-col" style={{maxHeight:'85vh'}}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Customise Watchlist</h2>
                <p className="text-xs text-slate-500 mt-0.5">Showing {TAB_LABELS[tab]} tab</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { resetTab(tab); }}
                  className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600"/>
                </button>
                <button onClick={() => setShowCustomizeModal(false)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-600"/>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8">
              {/* Current watchlist */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
                Your watchlist ({watchlists[tab].length})
              </h3>
              {watchlists[tab].length === 0 ? (
                <p className="text-sm text-slate-400 mb-4">No assets yet. Search below to add some.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {watchlists[tab].map(code => {
                    const item = STOCKS_CATALOG.find(c => c.code === code);
                    if (!item) return null;
                    return (
                      <div key={code} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                        <StockLogo code={code} name={item.name} size={8}/>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-900 text-sm">{code}</span>
                          <span className="text-xs text-slate-500 ml-2 truncate">{item.name}</span>
                        </div>
                        <button
                          onClick={() => removeSymbol(tab, code)}
                          className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center active:scale-95 transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500"/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100 my-4"/>

              {/* Search to add */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add assets</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input
                  value={customizeSearch}
                  onChange={e => setCustomizeSearch(e.target.value)}
                  placeholder="Search ticker or company name…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition"
                  autoFocus
                />
              </div>

              {customizeSearch.trim() === '' ? (
                <div className="space-y-2">
                  {STOCKS_CATALOG.filter(c => !watchlists[tab].includes(c.code) && c.region === tab).map(item => (
                    <div key={item.code} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                      <StockLogo code={item.code} name={item.name} size={8}/>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 text-sm">{item.code}</span>
                        <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{item.exchange}</span>
                      <button onClick={() => { addSymbol(tab, item.code); setCustomizeSearch(''); }}
                        className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-2 active:scale-95 transition">
                        <Plus className="w-4 h-4 text-white"/>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {customizeSuggestions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No results for "{customizeSearch}"</p>
                  ) : (
                    customizeSuggestions.map(item => (
                      <div key={item.code} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                        <StockLogo code={item.code} name={item.name} size={8}/>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 text-sm">{item.code}</span>
                          <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                        </div>
                        <span className={`text-xs font-semibold ${item.region==='us'?'bg-blue-50 text-blue-600':item.region==='uk'?'bg-red-50 text-red-600':item.region==='europe'?'bg-yellow-50 text-yellow-700':'bg-purple-50 text-purple-600'} px-2 py-0.5 rounded-full`}>
                          {item.region.toUpperCase()}
                        </span>
                        <button
                          onClick={() => { addSymbol(item.region, item.code); if(item.region !== tab) setTab(item.region); setCustomizeSearch(''); }}
                          className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-2 active:scale-95 transition"
                        >
                          <Plus className="w-4 h-4 text-white"/>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setShowCustomizeModal(false)} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Asset detail modal */}
      {selectedAsset && assetForModal && (
        <AssetDetailsModal
          asset={assetForModal}
          assetType={tab === 'crypto' ? 'crypto' : 'international'}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

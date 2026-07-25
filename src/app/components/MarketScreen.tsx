import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Filter, Search, X, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  DollarSign, Plus, Trash2, RotateCcw, Settings2, Lock,
} from 'lucide-react';
import { AssetDetailsModal } from './AssetDetailsModal';
import {
  useMarket, useWatchlist, getAllMockAssets,
  STOCKS_CATALOG, DEFAULT_WATCHLISTS, getCatalogForPlan, getRequiredPlan,
  PLAN_CATALOG_SIZES,
  type MarketTab, type MarketAsset, type UserPlan,
} from '../../hooks/useMarket';
import { useSubscription } from '../../hooks/useSubscription';

// ─── Plan labels & colours ────────────────────────────────────
const PLAN_LABEL: Record<string, string> = {
  pro: 'Pro', premium: 'Premium', business: 'Business',
};
const PLAN_PILL: Record<string, string> = {
  pro:      'bg-blue-100 text-blue-700',
  premium:  'bg-purple-100 text-purple-700',
  business: 'bg-amber-100 text-amber-700',
};

// ─── Logo helpers ─────────────────────────────────────────────
const CRYPTO_CODES = new Set([
  'BTC','ETH','BNB','SOL','XRP','ADA','DOT','AVAX','DOGE','USDT','USDC',
  'MATIC','LTC','LINK','UNI','ATOM','NEAR','ARB','OP','MKR','AAVE','TRX',
  'FIL','APT','INJ','RUNE','LDO','SNX','IMX','BLUR','PENDLE','JTO','PYTH',
  'W','FLOKI','PEPE','WIF','BONK','NOT','IO','ZK','ENA',
]);

// CoinMarketCap IDs for tokens not in cryptocurrency-icons@0.18.1 (pre-2022 package)
const CMC_IDS: Record<string, number> = {
  PEPE:24478, BONK:23095, WIF:28752,  FLOKI:10804, NOT:28451,
  ARB:11841,  OP:11840,   APT:21794,  LDO:8000,    BLUR:20058,
  JTO:29733,  PYTH:28177, PENDLE:22415,W:29587,    ENA:29908,
  IO:29921,   ZK:24091,   IMX:10603,  INJ:7226,    RUNE:4157,
};

// Company domain map — used to fetch logos via Google's favicon CDN
// (free, reliable, no auth, works for any company with a web presence)
const STOCK_DOMAINS: Record<string, string> = {
  // ── US default watchlist ──
  AAPL:'apple.com',       MSFT:'microsoft.com',    NVDA:'nvidia.com',
  GOOGL:'abc.xyz',        AMZN:'aboutamazon.com',  META:'meta.com',
  TSLA:'tesla.com',       NFLX:'netflix.com',      JPM:'jpmorganchase.com',
  // ── US blue-chips ──
  V:'visa.com',           MA:'mastercard.com',      JNJ:'jnj.com',
  WMT:'walmart.com',      XOM:'exxonmobil.com',     BAC:'bankofamerica.com',
  HD:'homedepot.com',     LLY:'lilly.com',          AMD:'amd.com',
  DIS:'disney.com',       ADBE:'adobe.com',         ORCL:'oracle.com',
  COIN:'coinbase.com',
  // ── US growth / mid-cap ──
  UBER:'uber.com',        SPOT:'spotify.com',       ABNB:'airbnb.com',
  SHOP:'shopify.com',     AVGO:'broadcom.com',      COST:'costco.com',
  PYPL:'paypal.com',      CRM:'salesforce.com',     INTC:'intel.com',
  SBUX:'starbucks.com',   PLTR:'palantir.com',      SNAP:'snap.com',
  PINS:'pinterest.com',   HOOD:'robinhood.com',     SOFI:'sofi.com',
  F:'ford.com',           GM:'gm.com',              BA:'boeing.com',
  CAT:'caterpillar.com',  PFE:'pfizer.com',         ABBV:'abbvie.com',
  MRK:'merck.com',        CVX:'chevron.com',        RTX:'rtx.com',
  UNH:'unitedhealthgroup.com',
  // ── Cybersecurity / cloud ──
  CRWD:'crowdstrike.com', ZS:'zscaler.com',         PANW:'paloaltonetworks.com',
  DDOG:'datadoghq.com',   SNOW:'snowflake.com',     MDB:'mongodb.com',
  SMCI:'supermicro.com',  ARM:'arm.com',            PATH:'uipath.com',
  // ── Biotech / pharma ──
  MRNA:'modernatx.com',   GILD:'gilead.com',        BMY:'bms.com',
  CVS:'cvshealth.com',
  // ── EV & speculative ──
  RIVN:'rivian.com',      LCID:'lucidmotors.com',   NIO:'nio.com',
  RKLB:'rocketlabusa.com',GME:'gamestop.com',       AMC:'amctheatres.com',
  SPCE:'virgingalactic.com', TLRY:'tilray.com',     NKLA:'nikolamotor.com',
  WISH:'wish.com',
  // ── Quantum / AI ──
  AI:'c3.ai',             BBAI:'bigbear.ai',         IONQ:'ionq.com',
  RGTI:'rigetti.com',     RCAT:'redcatholdings.com',
  // ── LATAM ADRs ──
  PBR:'petrobras.com.br', VALE:'vale.com',          ITUB:'itau.com.br',
  ABEV:'ambev.com.br',
  // ── APAC ADRs ──
  TM:'toyota.com',        SONY:'sony.com',          BABA:'alibaba.com',
  BIDU:'baidu.com',       JD:'jd.com',              PDD:'pddholdings.com',
  TSM:'tsmc.com',         SE:'sea.com',
  // ── ETFs ──
  SPY:'ssga.com',         QQQ:'invesco.com',        IWM:'ishares.com',
  VTI:'vanguard.com',     GLD:'ssga.com',           SLV:'ishares.com',
  ARKK:'ark-invest.com',  XLK:'ssga.com',           XLF:'ssga.com',
  KWEB:'kraneshares.com',
  // ── REITs ──
  AMT:'americantower.com',PLD:'prologis.com',       EQIX:'equinix.com',
  O:'realtyincome.com',   SPG:'simon.com',
  // ── UK ──
  SHEL:'shell.com',       AZN:'astrazeneca.com',    HSBA:'hsbc.com',
  BP:'bp.com',            ULVR:'unilever.com',      RIO:'riotinto.com',
  DGE:'diageo.com',       GSK:'gsk.com',            VOD:'vodafone.com',
  BAE:'baesystems.com',   PRU:'prudential.com',     NWG:'natwest.com',
  LLOY:'lloydsbankinggroup.com', LSEG:'lseg.com',  BATS:'bat.com',
  STAN:'sc.com',          MNG:'mandg.com',          IMB:'imperialbrands.com',
  SGRO:'segro.com',       EXPN:'experianplc.com',   CRH:'crh.com',
  HL:'hl.co.uk',          RKT:'reckitt.com',        TSCO:'tescoplc.com',
  LAND:'landsec.com',     RR:'rolls-royce.com',
  // ── Europe ──
  MC:'lvmh.com',          ASML:'asml.com',          OR:'loreal.com',
  SAP:'sap.com',          SIE:'siemens.com',        NESN:'nestle.com',
  NOVN:'novartis.com',    AIR:'airbus.com',         BMW:'bmwgroup.com',
  BNP:'bnpparibas.com',   TTE:'totalenergies.com',  ALV:'allianz.com',
  BAS:'basf.com',         VOW3:'volkswagenag.com',  ABI:'ab-inbev.com',
  ENI:'eni.com',          IBE:'iberdrola.com',      STM:'st.com',
  INGA:'ing.com',         AIL:'airliquide.com',     EDF:'edf.fr',
  BAYN:'bayer.com',       DHER:'deliveryhero.com',  MUV2:'munichre.com',
  ADYEN:'adyen.com',      UMG:'universalmusic.com', HLAG:'hapag-lloyd.com',
  DHL:'dhl.com',          WDP:'wdp.be',
};

// Google favicon CDN — extremely reliable, no auth, great quality for known brands
function gfavicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function logoSources(code: string): string[] {
  const c = code.toUpperCase();
  if (CRYPTO_CODES.has(c)) {
    const srcs = [`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${c.toLowerCase()}.svg`];
    if (CMC_IDS[c]) srcs.push(`https://s2.coinmarketcap.com/static/img/coins/64x64/${CMC_IDS[c]}.png`);
    return srcs;
  }
  const domain = STOCK_DOMAINS[c];
  const srcs: string[] = [];
  if (domain) srcs.push(gfavicon(domain));           // Google favicon — primary
  srcs.push(`https://financialmodelingprep.com/image-stock/${c}.png`); // FMP — backup
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

// ─── Upgrade banner ───────────────────────────────────────────
const NEXT_PLAN: Record<string, UserPlan | null> = {
  free: 'pro', pro: 'premium', premium: 'business', business: null,
};
const NEXT_PLAN_SIZE: Record<string, number> = {
  free: PLAN_CATALOG_SIZES.pro   - PLAN_CATALOG_SIZES.free,
  pro:  PLAN_CATALOG_SIZES.premium - PLAN_CATALOG_SIZES.pro,
  premium: PLAN_CATALOG_SIZES.business - PLAN_CATALOG_SIZES.premium,
};

const UpgradeBanner = ({ currentPlan }: { currentPlan: string }) => {
  const next = NEXT_PLAN[currentPlan];
  if (!next) return null;
  const extra = NEXT_PLAN_SIZE[currentPlan];
  const pillStyle = PLAN_PILL[next] || 'bg-slate-100 text-slate-700';
  return (
    <div className="mx-0 mb-4 p-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl flex items-center justify-between gap-3">
      <div>
        <p className="text-white text-xs font-bold">Unlock {extra}+ more assets</p>
        <p className="text-slate-400 text-[11px] mt-0.5">Upgrade your plan to access more markets</p>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${pillStyle}`}>
        {PLAN_LABEL[next]}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────
export const MarketScreen = ({ onBack, onNavigateToCurrencies }: any) => {
  const [tab, setTab]             = useState<MarketTab>('us');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]       = useState<'change_high'|'change_low'|'price'|'name'>('change_high');
  const [showFilterModal, setShowFilterModal]       = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizeSearch, setCustomizeSearch]       = useState('');
  const [selectedAsset, setSelectedAsset]           = useState<MarketAsset | null>(null);
  const [moversTab, setMoversTab] = useState<'gainers'|'losers'>('gainers');

  const { currentPlan = 'free' } = useSubscription() as any;
  const plan = (currentPlan || 'free') as UserPlan;

  // Set of codes accessible to this plan
  const accessibleCodes = useMemo(
    () => new Set(getCatalogForPlan(plan).map(c => c.code)),
    [plan]
  );

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

  const watchlistMatches = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(a => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  }, [assets, searchQuery]);

  const catalogSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const inWatchlist = new Set(watchlists[tab]);
    return catalogResults.filter(c => !inWatchlist.has(c.code));
  }, [catalogResults, watchlists, tab, searchQuery]);

  const displayed = useMemo(() => [...watchlistMatches].sort((a,b) => {
    if (sortBy==='change_high') return b.change - a.change;
    if (sortBy==='change_low')  return a.change - b.change;
    if (sortBy==='price')       return b.price  - a.price;
    if (sortBy==='name')        return a.name.localeCompare(b.name);
    return 0;
  }), [watchlistMatches, sortBy]);

  const liveAssets = assets.filter(a => !a.loading && !a.error && a.price > 0);
  const liveCodes  = new Set(liveAssets.map(a => a.code));
  const moversPool = [...liveAssets, ...getAllMockAssets().filter(a => !liveCodes.has(a.code))];
  const topMovers  = [...moversPool].sort((a,b) => moversTab==='gainers' ? b.change-a.change : a.change-b.change).slice(0,8);

  const assetForModal = selectedAsset ? {
    code: selectedAsset.code.split('.')[0], name: selectedAsset.name,
    price: selectedAsset.price, change: selectedAsset.change,
    currency: selectedAsset.currency || 'USD',
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
    ).slice(0, 30);
  }, [customizeSearch, watchlists, tab]);

  // Helper: get required plan label for a code
  const getLockedPlan = (code: string): string | null => {
    if (accessibleCodes.has(code)) return null;
    const idx = STOCKS_CATALOG.findIndex(c => c.code === code);
    if (idx === -1) return null;
    return getRequiredPlan(idx);
  };

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

          {/* Catalog suggestions when searching */}
          {searchQuery && catalogSuggestions.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                Not in your {TAB_LABELS[tab]} watchlist
              </p>
              {catalogSuggestions.map(item => {
                const locked = !accessibleCodes.has(item.code);
                const reqPlan = locked ? getLockedPlan(item.code) : null;
                return (
                  <div key={item.code} className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 mb-2 ${locked ? 'opacity-70' : ''}`}>
                    <div className="relative">
                      <StockLogo code={item.code} name={item.name} size={10}/>
                      {locked && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-700 rounded-full flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-white"/>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.code}</span>
                        <span className="text-xs text-slate-500 truncate">{item.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.exchange} · {item.region.toUpperCase()}</p>
                    </div>
                    {locked && reqPlan ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PLAN_PILL[reqPlan] || 'bg-slate-100 text-slate-600'}`}>
                        {PLAN_LABEL[reqPlan]}
                      </span>
                    ) : (
                      <>
                        <span className={`text-xs font-semibold ${item.mockChange>=0?'text-green-600':'text-red-500'} mr-2`}>
                          ~{item.mockChange>=0?'+':''}{item.mockChange.toFixed(2)}%
                        </span>
                        <button
                          onClick={() => { addSymbol(item.region, item.code); setTab(item.region); setSearchQuery(''); }}
                          className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition"
                        >
                          <Plus className="w-4 h-4 text-white"/>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
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
          <div className="bg-white w-full rounded-t-3xl flex flex-col" style={{maxHeight:'90vh'}}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Customise Watchlist</h2>
                <p className="text-xs text-slate-500 mt-0.5">Showing {TAB_LABELS[tab]} tab</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { resetTab(tab); }} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center" title="Reset to defaults">
                  <RotateCcw className="w-4 h-4 text-slate-600"/>
                </button>
                <button onClick={() => setShowCustomizeModal(false)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-600"/>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8">

              {/* Upgrade banner */}
              <div className="mt-4">
                <UpgradeBanner currentPlan={plan}/>
              </div>

              {/* Current watchlist */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                        <button onClick={() => removeSymbol(tab, code)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center active:scale-95 transition">
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

              {/* Asset list with lock gating */}
              {customizeSearch.trim() === '' ? (
                <div className="space-y-2">
                  {STOCKS_CATALOG.filter(c => !watchlists[tab].includes(c.code) && c.region === tab).map(item => {
                    const locked = !accessibleCodes.has(item.code);
                    const reqPlan = locked ? getLockedPlan(item.code) : null;
                    return (
                      <div key={item.code} className={`bg-slate-50 rounded-xl p-3 flex items-center gap-3 ${locked?'opacity-60':''}`}>
                        <div className="relative">
                          <StockLogo code={item.code} name={item.name} size={8}/>
                          {locked && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-600 rounded-full flex items-center justify-center">
                              <Lock className="w-2 h-2 text-white"/>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 text-sm">{item.code}</span>
                          <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                        </div>
                        {locked && reqPlan ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PLAN_PILL[reqPlan] || 'bg-slate-100 text-slate-600'}`}>
                            {PLAN_LABEL[reqPlan]}
                          </span>
                        ) : (
                          <>
                            <span className="text-xs text-slate-400 mr-1">{item.exchange}</span>
                            <button onClick={() => { addSymbol(tab, item.code); setCustomizeSearch(''); }}
                              className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-1 active:scale-95 transition">
                              <Plus className="w-4 h-4 text-white"/>
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {customizeSuggestions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No results for "{customizeSearch}"</p>
                  ) : (
                    customizeSuggestions.map(item => {
                      const locked = !accessibleCodes.has(item.code);
                      const reqPlan = locked ? getLockedPlan(item.code) : null;
                      return (
                        <div key={item.code} className={`bg-slate-50 rounded-xl p-3 flex items-center gap-3 ${locked?'opacity-60':''}`}>
                          <div className="relative">
                            <StockLogo code={item.code} name={item.name} size={8}/>
                            {locked && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-600 rounded-full flex items-center justify-center">
                                <Lock className="w-2 h-2 text-white"/>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-800 text-sm">{item.code}</span>
                            <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                          </div>
                          {locked && reqPlan ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PLAN_PILL[reqPlan] || 'bg-slate-100 text-slate-600'}`}>
                              {PLAN_LABEL[reqPlan]}
                            </span>
                          ) : (
                            <>
                              <span className={`text-xs font-semibold ${item.region==='us'?'bg-blue-50 text-blue-600':item.region==='uk'?'bg-red-50 text-red-600':item.region==='europe'?'bg-yellow-50 text-yellow-700':'bg-purple-50 text-purple-600'} px-2 py-0.5 rounded-full`}>
                                {item.region.toUpperCase()}
                              </span>
                              <button
                                onClick={() => { addSymbol(item.region, item.code); if(item.region !== tab) setTab(item.region); setCustomizeSearch(''); }}
                                className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-2 active:scale-95 transition"
                              >
                                <Plus className="w-4 h-4 text-white"/>
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })
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

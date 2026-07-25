import { useState, useEffect, useCallback, useRef } from 'react';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000;

async function finnhub(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ ...params, token: API_KEY }).toString();
  const key = `${path}?${qs}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  const res = await fetch(`${BASE_URL}${path}?${qs}`);
  if (res.status === 401) throw new Error('FINNHUB_UNAUTHORIZED');
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  const data = await res.json();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export interface MarketAsset {
  code: string;
  name: string;
  price: number;
  change: number;
  changeAbs: number;
  currency: string;
  exchange: string;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  description?: string;
  loading?: boolean;
  error?: boolean;
}

export interface ForexRate {
  pair: string;
  label: string;
  rate: number;
  change: number;
  flag: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
  positive: boolean;
}

export type MarketTab = 'uk' | 'europe' | 'us' | 'crypto';

export interface CatalogItem {
  code: string;
  finnhubSymbol: string;
  name: string;
  exchange: string;
  region: MarketTab;
  currency: string;
  description: string;
  mockPrice: number;
  mockChange: number;
  isCrypto?: boolean;
}

// ─── Global catalog (~70 assets across all regions) ──────────
export const STOCKS_CATALOG: CatalogItem[] = [
  // ── US ──
  { code:'AAPL',  finnhubSymbol:'AAPL',  name:'Apple',          exchange:'NASDAQ', region:'us', currency:'USD', description:'Global technology leader, maker of iPhone and Mac.',   mockPrice:213.45,  mockChange:1.24  },
  { code:'MSFT',  finnhubSymbol:'MSFT',  name:'Microsoft',      exchange:'NASDAQ', region:'us', currency:'USD', description:'Software and cloud computing services.',               mockPrice:432.80,  mockChange:0.85  },
  { code:'NVDA',  finnhubSymbol:'NVDA',  name:'NVIDIA',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Leader in GPUs and AI chip technology.',              mockPrice:1245.60, mockChange:4.23  },
  { code:'GOOGL', finnhubSymbol:'GOOGL', name:'Alphabet',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Parent company of Google.',                           mockPrice:178.90,  mockChange:-0.45 },
  { code:'AMZN',  finnhubSymbol:'AMZN',  name:'Amazon',         exchange:'NASDAQ', region:'us', currency:'USD', description:'E-commerce and cloud computing leader.',              mockPrice:195.40,  mockChange:1.56  },
  { code:'META',  finnhubSymbol:'META',  name:'Meta',           exchange:'NASDAQ', region:'us', currency:'USD', description:'Owner of Facebook, Instagram and WhatsApp.',         mockPrice:523.80,  mockChange:2.67  },
  { code:'TSLA',  finnhubSymbol:'TSLA',  name:'Tesla',          exchange:'NASDAQ', region:'us', currency:'USD', description:'Electric vehicles and clean energy.',                 mockPrice:182.50,  mockChange:-1.23 },
  { code:'NFLX',  finnhubSymbol:'NFLX',  name:'Netflix',        exchange:'NASDAQ', region:'us', currency:'USD', description:'Global streaming entertainment service.',             mockPrice:690.20,  mockChange:2.15  },
  { code:'JPM',   finnhubSymbol:'JPM',   name:'JPMorgan Chase', exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US bank by assets.',                         mockPrice:220.60,  mockChange:0.78  },
  { code:'V',     finnhubSymbol:'V',     name:'Visa',           exchange:'NYSE',   region:'us', currency:'USD', description:'Global payments technology company.',                mockPrice:275.40,  mockChange:1.02  },
  { code:'MA',    finnhubSymbol:'MA',    name:'Mastercard',     exchange:'NYSE',   region:'us', currency:'USD', description:'Global payment technology company.',                 mockPrice:470.80,  mockChange:0.95  },
  { code:'JNJ',   finnhubSymbol:'JNJ',   name:'Johnson & Johnson', exchange:'NYSE', region:'us', currency:'USD', description:'Diversified healthcare company.',                   mockPrice:155.20,  mockChange:-0.32 },
  { code:'WMT',   finnhubSymbol:'WMT',   name:'Walmart',        exchange:'NYSE',   region:'us', currency:'USD', description:"World's largest retailer.",                          mockPrice:68.50,   mockChange:0.45  },
  { code:'XOM',   finnhubSymbol:'XOM',   name:'ExxonMobil',     exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US oil and gas company.',                    mockPrice:118.30,  mockChange:1.80  },
  { code:'BAC',   finnhubSymbol:'BAC',   name:'Bank of America', exchange:'NYSE',  region:'us', currency:'USD', description:'One of the largest US banks.',                       mockPrice:40.20,   mockChange:0.55  },
  { code:'HD',    finnhubSymbol:'HD',    name:'Home Depot',     exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US home improvement retailer.',              mockPrice:360.80,  mockChange:0.90  },
  { code:'LLY',   finnhubSymbol:'LLY',   name:'Eli Lilly',      exchange:'NYSE',   region:'us', currency:'USD', description:'Global pharmaceutical company.',                     mockPrice:800.20,  mockChange:1.34  },
  { code:'AMD',   finnhubSymbol:'AMD',   name:'AMD',            exchange:'NASDAQ', region:'us', currency:'USD', description:'Semiconductor company, CPUs and GPUs.',              mockPrice:165.80,  mockChange:3.45  },
  { code:'INTC',  finnhubSymbol:'INTC',  name:'Intel',          exchange:'NASDAQ', region:'us', currency:'USD', description:"World's largest semiconductor chip maker.",          mockPrice:30.40,   mockChange:-1.20 },
  { code:'DIS',   finnhubSymbol:'DIS',   name:'Disney',         exchange:'NYSE',   region:'us', currency:'USD', description:'Entertainment and media conglomerate.',              mockPrice:92.60,   mockChange:0.34  },
  { code:'ADBE',  finnhubSymbol:'ADBE',  name:'Adobe',          exchange:'NASDAQ', region:'us', currency:'USD', description:'Creative and document software.',                    mockPrice:560.20,  mockChange:1.56  },
  { code:'ORCL',  finnhubSymbol:'ORCL',  name:'Oracle',         exchange:'NYSE',   region:'us', currency:'USD', description:'Enterprise software and cloud services.',            mockPrice:140.80,  mockChange:0.78  },
  { code:'COIN',  finnhubSymbol:'COIN',  name:'Coinbase',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Largest US cryptocurrency exchange.',                mockPrice:230.40,  mockChange:4.56  },
  { code:'UBER',  finnhubSymbol:'UBER',  name:'Uber',           exchange:'NYSE',   region:'us', currency:'USD', description:'Ride-sharing and food delivery platform.',           mockPrice:80.40,   mockChange:1.23  },
  { code:'SPOT',  finnhubSymbol:'SPOT',  name:'Spotify',        exchange:'NYSE',   region:'us', currency:'USD', description:'Music and podcast streaming platform.',              mockPrice:380.20,  mockChange:2.34  },
  { code:'CRM',   finnhubSymbol:'CRM',   name:'Salesforce',     exchange:'NYSE',   region:'us', currency:'USD', description:'Cloud-based CRM software leader.',                   mockPrice:285.40,  mockChange:0.90  },
  { code:'COST',  finnhubSymbol:'COST',  name:'Costco',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Membership warehouse club.',                         mockPrice:890.40,  mockChange:0.78  },
  { code:'AVGO',  finnhubSymbol:'AVGO',  name:'Broadcom',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Semiconductor and infrastructure software.',          mockPrice:1850.00, mockChange:2.45  },
  { code:'PYPL',  finnhubSymbol:'PYPL',  name:'PayPal',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Digital payments platform.',                         mockPrice:70.20,   mockChange:-0.45 },
  { code:'SBUX',  finnhubSymbol:'SBUX',  name:'Starbucks',      exchange:'NASDAQ', region:'us', currency:'USD', description:"World's largest coffeehouse chain.",                 mockPrice:80.60,   mockChange:-0.56 },

  // ── UK ──
  { code:'SHEL',  finnhubSymbol:'SHEL.L',  name:'Shell',         exchange:'LSE', region:'uk', currency:'GBP', description:'Global energy and petrochemicals company.',         mockPrice:2856.50,  mockChange:1.24  },
  { code:'AZN',   finnhubSymbol:'AZN.L',   name:'AstraZeneca',   exchange:'LSE', region:'uk', currency:'GBP', description:'British-Swedish multinational pharmaceutical.',      mockPrice:12845.00, mockChange:0.85  },
  { code:'HSBA',  finnhubSymbol:'HSBA.L',  name:'HSBC Holdings', exchange:'LSE', region:'uk', currency:'GBP', description:"One of the world's largest banking groups.",        mockPrice:734.80,   mockChange:-0.45 },
  { code:'BP',    finnhubSymbol:'BP.L',    name:'BP',            exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational oil and gas company.',         mockPrice:425.60,   mockChange:2.10  },
  { code:'ULVR',  finnhubSymbol:'ULVR.L',  name:'Unilever',      exchange:'LSE', region:'uk', currency:'GBP', description:'British consumer goods company.',                   mockPrice:4215.00,  mockChange:-0.32 },
  { code:'RIO',   finnhubSymbol:'RIO.L',   name:'Rio Tinto',     exchange:'LSE', region:'uk', currency:'GBP', description:'British-Australian multinational metals group.',     mockPrice:5680.00,  mockChange:0.56  },
  { code:'DGE',   finnhubSymbol:'DGE.L',   name:'Diageo',        exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational beverages company.',           mockPrice:2548.00,  mockChange:0.67  },
  { code:'GSK',   finnhubSymbol:'GSK.L',   name:'GSK',           exchange:'LSE', region:'uk', currency:'GBP', description:'Global healthcare and pharmaceuticals.',             mockPrice:1780.00,  mockChange:1.10  },
  { code:'VOD',   finnhubSymbol:'VOD.L',   name:'Vodafone',      exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational telecoms company.',            mockPrice:78.40,    mockChange:-0.78 },
  { code:'BAE',   finnhubSymbol:'BA.L',    name:'BAE Systems',   exchange:'LSE', region:'uk', currency:'GBP', description:'British aerospace and defence company.',            mockPrice:1250.00,  mockChange:2.45  },
  { code:'PRU',   finnhubSymbol:'PRU.L',   name:'Prudential',    exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational insurance company.',          mockPrice:1450.00,  mockChange:-0.23 },

  // ── Europe ──
  { code:'MC',    finnhubSymbol:'MC.PA',    name:'LVMH',          exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:"World's largest luxury goods conglomerate.",   mockPrice:782.40,  mockChange:1.56  },
  { code:'ASML',  finnhubSymbol:'ASML.AS',  name:'ASML Holding',  exchange:'Euronext Amsterdam', region:'europe', currency:'EUR', description:'Semiconductor equipment manufacturer.',         mockPrice:845.20,  mockChange:2.34  },
  { code:'OR',    finnhubSymbol:'OR.PA',    name:"L'Oréal",       exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:"World's largest cosmetics company.",           mockPrice:412.65,  mockChange:0.78  },
  { code:'SAP',   finnhubSymbol:'SAP.DE',   name:'SAP',           exchange:'XETRA',              region:'europe', currency:'EUR', description:'German multinational enterprise software.',     mockPrice:238.90,  mockChange:-0.45 },
  { code:'SIE',   finnhubSymbol:'SIE.DE',   name:'Siemens',       exchange:'XETRA',              region:'europe', currency:'EUR', description:'German multinational technology conglomerate.', mockPrice:189.40,  mockChange:1.12  },
  { code:'NESN',  finnhubSymbol:'NESN.SW',  name:'Nestlé',        exchange:'SIX Swiss',          region:'europe', currency:'EUR', description:'Swiss multinational food and beverage.',        mockPrice:96.30,   mockChange:0.23  },
  { code:'NOVN',  finnhubSymbol:'NOVN.SW',  name:'Novartis',      exchange:'SIX Swiss',          region:'europe', currency:'EUR', description:'Swiss multinational pharmaceutical.',           mockPrice:98.50,   mockChange:0.45  },
  { code:'AIR',   finnhubSymbol:'AIR.PA',   name:'Airbus',        exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:'European aerospace and defence corporation.',   mockPrice:172.80,  mockChange:3.45  },
  { code:'BMW',   finnhubSymbol:'BMW.DE',   name:'BMW',           exchange:'XETRA',              region:'europe', currency:'EUR', description:'German premium car manufacturer.',             mockPrice:92.40,   mockChange:-0.67 },
  { code:'BNP',   finnhubSymbol:'BNP.PA',   name:'BNP Paribas',   exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:'French multinational banking group.',          mockPrice:65.80,   mockChange:0.89  },
  { code:'TTE',   finnhubSymbol:'TTE.PA',   name:'TotalEnergies', exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:'French multinational energy company.',         mockPrice:58.40,   mockChange:1.23  },

  // ── Crypto ──
  { code:'BTC',   finnhubSymbol:'BINANCE:BTCUSDT',   name:'Bitcoin',   exchange:'Crypto', region:'crypto', currency:'USD', description:'The first and most widely known cryptocurrency.', mockPrice:67820.00, mockChange:3.45,  isCrypto:true },
  { code:'ETH',   finnhubSymbol:'BINANCE:ETHUSDT',   name:'Ethereum',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain platform for smart contracts.',        mockPrice:3845.00,  mockChange:2.12,  isCrypto:true },
  { code:'BNB',   finnhubSymbol:'BINANCE:BNBUSDT',   name:'BNB',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Native token of the Binance ecosystem.',         mockPrice:612.00,   mockChange:-0.85, isCrypto:true },
  { code:'SOL',   finnhubSymbol:'BINANCE:SOLUSDT',   name:'Solana',    exchange:'Crypto', region:'crypto', currency:'USD', description:'High-performance blockchain for DeFi and NFTs.', mockPrice:178.40,   mockChange:5.34,  isCrypto:true },
  { code:'XRP',   finnhubSymbol:'BINANCE:XRPUSDT',   name:'XRP',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Global payments network for fast transfers.',    mockPrice:0.612,    mockChange:1.23,  isCrypto:true },
  { code:'ADA',   finnhubSymbol:'BINANCE:ADAUSDT',   name:'Cardano',   exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain focused on sustainability.',          mockPrice:0.485,    mockChange:2.45,  isCrypto:true },
  { code:'DOT',   finnhubSymbol:'BINANCE:DOTUSDT',   name:'Polkadot',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Protocol for blockchain interoperability.',      mockPrice:8.50,     mockChange:3.12,  isCrypto:true },
  { code:'AVAX',  finnhubSymbol:'BINANCE:AVAXUSDT',  name:'Avalanche', exchange:'Crypto', region:'crypto', currency:'USD', description:'High-throughput decentralised app platform.',   mockPrice:35.40,    mockChange:4.23,  isCrypto:true },
  { code:'DOGE',  finnhubSymbol:'BINANCE:DOGEUSDT',  name:'Dogecoin',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Meme-inspired cryptocurrency.',                  mockPrice:0.155,    mockChange:-1.23, isCrypto:true },
  { code:'MATIC', finnhubSymbol:'BINANCE:MATICUSDT', name:'Polygon',   exchange:'Crypto', region:'crypto', currency:'USD', description:'Ethereum scaling solution.',                     mockPrice:0.78,     mockChange:2.89,  isCrypto:true },
  { code:'LTC',   finnhubSymbol:'BINANCE:LTCUSDT',   name:'Litecoin',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Peer-to-peer cryptocurrency.',                   mockPrice:85.40,    mockChange:1.45,  isCrypto:true },
  { code:'LINK',  finnhubSymbol:'BINANCE:LINKUSDT',  name:'Chainlink', exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain oracle network.',                     mockPrice:17.80,    mockChange:3.45,  isCrypto:true },
];

const CATALOG_MAP = new Map<string, CatalogItem>(STOCKS_CATALOG.map(c => [c.code, c]));

export const DEFAULT_WATCHLISTS: Record<MarketTab, string[]> = {
  us:     ['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','NFLX','JPM'],
  uk:     ['SHEL','AZN','HSBA','BP','ULVR','RIO','DGE','GSK'],
  europe: ['MC','ASML','OR','SAP','SIE','NESN','NOVN','AIR'],
  crypto: ['BTC','ETH','BNB','SOL','XRP','ADA','DOT','AVAX'],
};

// ─── Watchlist hook (localStorage) ───────────────────────────
export function useWatchlist() {
  const [watchlists, setWatchlists] = useState<Record<MarketTab, string[]>>(() => {
    try {
      const s = localStorage.getItem('bullsgo_watchlist');
      if (s) return JSON.parse(s);
    } catch {}
    return { ...DEFAULT_WATCHLISTS };
  });

  const save = (next: Record<MarketTab, string[]>) => {
    setWatchlists(next);
    try { localStorage.setItem('bullsgo_watchlist', JSON.stringify(next)); } catch {}
  };

  return {
    watchlists,
    addSymbol:    (tab: MarketTab, code: string) => {
      if (!watchlists[tab].includes(code))
        save({ ...watchlists, [tab]: [...watchlists[tab], code] });
    },
    removeSymbol: (tab: MarketTab, code: string) =>
      save({ ...watchlists, [tab]: watchlists[tab].filter(c => c !== code) }),
    resetTab:     (tab: MarketTab) =>
      save({ ...watchlists, [tab]: [...DEFAULT_WATCHLISTS[tab]] }),
  };
}

// ─── Quote fetchers ───────────────────────────────────────────
async function fetchQuote(item: CatalogItem): Promise<Partial<MarketAsset> & { error?: boolean }> {
  try {
    if (item.isCrypto) {
      const data = await finnhub('/crypto/candle', {
        symbol: item.finnhubSymbol,
        resolution: 'D',
        from: String(Math.floor(Date.now() / 1000) - 86400),
        to:   String(Math.floor(Date.now() / 1000)),
      });
      if (data.s === 'no_data' || !data.c?.length) throw new Error('no data');
      const price = data.c[data.c.length - 1];
      const prevClose = data.c[0];
      const changeAbs = price - prevClose;
      const change = prevClose > 0 ? (changeAbs / prevClose) * 100 : 0;
      return { price, changeAbs, change, prevClose, high: Math.max(...data.h), low: Math.min(...data.l) };
    } else {
      const data = await finnhub('/quote', { symbol: item.finnhubSymbol });
      if (!data.c) throw new Error('no data');
      return { price: data.c, changeAbs: data.d ?? 0, change: data.dp ?? 0, high: data.h, low: data.l, open: data.o, prevClose: data.pc };
    }
  } catch {
    return { error: true };
  }
}

async function fetchForex(): Promise<ForexRate[]> {
  const pairs = [
    { from: 'USD', to: 'EUR', label: 'USD/EUR', flag: '🇺🇸' },
    { from: 'GBP', to: 'EUR', label: 'GBP/EUR', flag: '🇬🇧' },
    { from: 'USD', to: 'GBP', label: 'USD/GBP', flag: '💵' },
  ];
  const results: ForexRate[] = [];
  for (const p of pairs) {
    try {
      const data = await finnhub('/forex/rates', { base: p.from });
      const rate = data.quote?.[p.to];
      if (rate) results.push({ pair: `${p.from}/${p.to}`, label: p.label, rate, change: 0, flag: p.flag });
    } catch {
      results.push({ pair: p.label, label: p.label, rate: 0, change: 0, flag: p.flag });
    }
  }
  return results;
}

// ─── Main hook ────────────────────────────────────────────────
export function useMarket(tab: MarketTab, watchlistCodes: string[]) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [forex, setForex]   = useState<ForexRate[]>([]);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef(false);

  const fetchAssets = useCallback(async () => {
    abortRef.current = false;
    setLoading(true);

    const items = watchlistCodes
      .map(c => CATALOG_MAP.get(c))
      .filter((c): c is CatalogItem => !!c && c.region === tab);

    if (!API_KEY) {
      setAssets(items.map(item => ({
        code: item.code, name: item.name,
        price: item.mockPrice, change: item.mockChange,
        changeAbs: (item.mockChange / 100) * item.mockPrice,
        currency: item.currency, exchange: item.exchange,
        description: item.description, loading: false, error: false,
      })));
      setLoading(false);
      return;
    }

    // Live mode: show placeholders, then fill in
    setAssets(items.map(item => ({
      code: item.code, name: item.name, price: 0, change: 0, changeAbs: 0,
      currency: item.currency, exchange: item.exchange, description: item.description, loading: true,
    })));

    const results: MarketAsset[] = [];
    for (let i = 0; i < items.length; i += 4) {
      if (abortRef.current) break;
      const chunk = items.slice(i, i + 4);
      const quotes = await Promise.all(chunk.map(fetchQuote));
      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j]; const q = quotes[j];
        results.push({
          code: item.code, name: item.name,
          price:     q.error ? item.mockPrice  : (q.price     ?? item.mockPrice),
          change:    q.error ? item.mockChange : (q.change    ?? item.mockChange),
          changeAbs: q.error ? 0               : (q.changeAbs ?? 0),
          currency: item.currency, exchange: item.exchange,
          high: q.high, low: q.low, open: q.open, prevClose: q.prevClose,
          description: item.description, loading: false, error: q.error,
        });
      }
      setAssets([...results, ...items.slice(results.length).map(item => ({
        code: item.code, name: item.name, price: 0, change: 0, changeAbs: 0,
        currency: item.currency, exchange: item.exchange, loading: true,
      }))]);
    }

    if (!abortRef.current) {
      setAssets(results);
      setLastUpdated(new Date());
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, watchlistCodes.join(',')]);

  useEffect(() => {
    if (API_KEY) fetchForex().then(setForex);
    else setForex([
      { pair: 'USD/EUR', label: 'USD/EUR', rate: 0.9200, change: 0, flag: '🇺🇸' },
      { pair: 'GBP/EUR', label: 'GBP/EUR', rate: 1.1700, change: 0, flag: '🇬🇧' },
      { pair: 'USD/GBP', label: 'USD/GBP', rate: 0.7900, change: 0, flag: '💵' },
    ]);
  }, []);

  useEffect(() => {
    abortRef.current = true;
    fetchAssets();
    const iv = setInterval(fetchAssets, 120_000);
    return () => { abortRef.current = true; clearInterval(iv); };
  }, [fetchAssets]);

  return { assets, forex, loading, lastUpdated, refetch: fetchAssets };
}

// Cross-tab movers for the "Today's Movers" section
export function getAllMockAssets(): MarketAsset[] {
  return STOCKS_CATALOG.map(item => ({
    code: item.code, name: item.name,
    price: item.mockPrice, change: item.mockChange,
    changeAbs: (item.mockChange / 100) * item.mockPrice,
    currency: item.currency, exchange: item.exchange,
    description: item.description, loading: false, error: false,
  }));
}

export const MARKET_INDICES: MarketIndex[] = [
  { name: 'FTSE 100',      value: '8,421',  change: '+0.84%', positive: true  },
  { name: 'Euro Stoxx 50', value: '5,124',  change: '+1.12%', positive: true  },
  { name: 'DAX',           value: '18,765', change: '-0.23%', positive: false },
  { name: 'S&P 500',       value: '5,487',  change: '+0.56%', positive: true  },
];

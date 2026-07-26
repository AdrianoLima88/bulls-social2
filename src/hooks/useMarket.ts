import { useState, useEffect, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────
// CONFIGURAÇÃO
// Obtenha sua chave gratuita em: https://finnhub.io/register
// Depois crie o arquivo .env na raiz do projeto com:
//   VITE_FINNHUB_API_KEY=sua_chave_aqui
// ─────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

// Cache simples em memória para evitar chamadas repetidas
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000; // 1 minuto

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

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
export interface MarketAsset {
  code: string;
  name: string;
  price: number;
  change: number;       // % change
  changeAbs: number;    // absolute change
  currency: string;
  exchange: string;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  marketCap?: string;
  description?: string;
  loading?: boolean;
  error?: boolean;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface ForexRate {
  pair: string;
  label: string;
  rate: number;
  change: number;
  flag: string;
}

// ─────────────────────────────────────────────────────────────
// ACTIVOS POR CATEGORIA (símbolos Finnhub)
// ─────────────────────────────────────────────────────────────

// UK / LSE (sufixo .L no Finnhub)
const UK_STOCKS = [
  { code: 'SHEL.L',  name: 'Shell',            exchange: 'LSE',     description: 'Global energy and petrochemicals company.' },
  { code: 'AZN.L',   name: 'AstraZeneca',      exchange: 'LSE',     description: 'British-Swedish multinational pharmaceutical.' },
  { code: 'HSBA.L',  name: 'HSBC Holdings',    exchange: 'LSE',     description: 'One of the world\'s largest banking groups.' },
  { code: 'BP.L',    name: 'BP',               exchange: 'LSE',     description: 'British multinational oil and gas company.' },
  { code: 'ULVR.L',  name: 'Unilever',         exchange: 'LSE',     description: 'British consumer goods company.' },
  { code: 'RIO.L',   name: 'Rio Tinto',        exchange: 'LSE',     description: 'British-Australian multinational metals group.' },
  { code: 'DGE.L',   name: 'Diageo',           exchange: 'LSE',     description: 'British multinational beverages company.' },
  { code: 'GSK.L',   name: 'GSK',              exchange: 'LSE',     description: 'Global healthcare and pharmaceuticals group.' },
];

// Europe / Euronext
const EU_STOCKS = [
  { code: 'MC.PA',   name: 'LVMH',             exchange: 'Euronext Paris',   description: 'World\'s largest luxury goods conglomerate.' },
  { code: 'ASML.AS', name: 'ASML Holding',     exchange: 'Euronext Amsterdam', description: 'Semiconductor equipment manufacturer.' },
  { code: 'OR.PA',   name: "L'Oréal",          exchange: 'Euronext Paris',   description: 'World\'s largest cosmetics company.' },
  { code: 'SAP.DE',  name: 'SAP',              exchange: 'XETRA',            description: 'German multinational enterprise software.' },
  { code: 'SIE.DE',  name: 'Siemens',          exchange: 'XETRA',            description: 'German multinational technology conglomerate.' },
  { code: 'NESN.SW', name: 'Nestlé',           exchange: 'SIX Swiss',        description: 'Swiss multinational food and beverage company.' },
  { code: 'NOVN.SW', name: 'Novartis',         exchange: 'SIX Swiss',        description: 'Swiss multinational pharmaceutical company.' },
  { code: 'AIR.PA',  name: 'Airbus',           exchange: 'Euronext Paris',   description: 'European aerospace and defence corporation.' },
];

// US Tech (relevante para investidores europeus)
const US_STOCKS = [
  { code: 'AAPL',  name: 'Apple',        exchange: 'NASDAQ', description: 'Global technology leader, maker of iPhone and Mac.' },
  { code: 'MSFT',  name: 'Microsoft',    exchange: 'NASDAQ', description: 'Software and cloud services, creator of Windows.' },
  { code: 'NVDA',  name: 'NVIDIA',       exchange: 'NASDAQ', description: 'Leader in GPUs and AI chip technology.' },
  { code: 'GOOGL', name: 'Alphabet',     exchange: 'NASDAQ', description: 'Parent company of Google.' },
  { code: 'AMZN',  name: 'Amazon',       exchange: 'NASDAQ', description: 'E-commerce and cloud computing leader.' },
  { code: 'TSLA',  name: 'Tesla',        exchange: 'NASDAQ', description: 'Electric vehicles and clean energy.' },
  { code: 'META',  name: 'Meta',         exchange: 'NASDAQ', description: 'Owner of Facebook, Instagram and WhatsApp.' },
  { code: 'NFLX',  name: 'Netflix',      exchange: 'NASDAQ', description: 'Global streaming entertainment service.' },
  { code: 'JPM',   name: 'JPMorgan',     exchange: 'NYSE',   description: 'Largest US bank by assets.' },
];

// Crypto (via Finnhub crypto endpoint)
const CRYPTO_ASSETS = [
  { code: 'BINANCE:BTCUSDT',  name: 'Bitcoin',   shortCode: 'BTC',  description: 'The first and most widely known cryptocurrency.' },
  { code: 'BINANCE:ETHUSDT',  name: 'Ethereum',  shortCode: 'ETH',  description: 'Blockchain platform for smart contracts.' },
  { code: 'BINANCE:BNBUSDT',  name: 'BNB',       shortCode: 'BNB',  description: 'Native token of the Binance ecosystem.' },
  { code: 'BINANCE:SOLUSDT',  name: 'Solana',    shortCode: 'SOL',  description: 'High-performance blockchain for DeFi and NFTs.' },
  { code: 'BINANCE:XRPUSDT',  name: 'XRP',       shortCode: 'XRP',  description: 'Global payments network for fast transfers.' },
  { code: 'BINANCE:ADAUSDT',  name: 'Cardano',   shortCode: 'ADA',  description: 'Blockchain focused on sustainability.' },
  { code: 'BINANCE:DOTUSDT',  name: 'Polkadot',  shortCode: 'DOT',  description: 'Protocol for blockchain interoperability.' },
  { code: 'BINANCE:AVAXUSDT', name: 'Avalanche', shortCode: 'AVAX', description: 'High-throughput decentralised app platform.' },
];

export type MarketTab = 'uk' | 'europe' | 'us' | 'crypto';

// ─────────────────────────────────────────────────────────────
// FUNÇÃO: busca cotação de um símbolo
// ─────────────────────────────────────────────────────────────
async function fetchQuote(symbol: string, isCrypto = false): Promise<Partial<MarketAsset>> {
  try {
    if (isCrypto) {
      const data = await finnhub('/crypto/candle', {
        symbol,
        resolution: 'D',
        from: String(Math.floor(Date.now() / 1000) - 86400),
        to: String(Math.floor(Date.now() / 1000)),
      });
      if (data.s === 'no_data' || !data.c?.length) throw new Error('no data');
      const price = data.c[data.c.length - 1];
      const prevClose = data.c[0];
      const changeAbs = price - prevClose;
      const change = prevClose > 0 ? (changeAbs / prevClose) * 100 : 0;
      return { price, changeAbs, change, prevClose, high: Math.max(...data.h), low: Math.min(...data.l) };
    } else {
      const data = await finnhub('/quote', { symbol });
      if (!data.c) throw new Error('no data');
      return {
        price: data.c,
        changeAbs: data.d ?? 0,
        change: data.dp ?? 0,
        high: data.h,
        low: data.l,
        open: data.o,
        prevClose: data.pc,
      };
    }
  } catch {
    return { error: true };
  }
}

// ─────────────────────────────────────────────────────────────
// FUNÇÃO: busca taxas forex
// ─────────────────────────────────────────────────────────────
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
      if (rate) {
        results.push({
          pair: `${p.from}/${p.to}`,
          label: p.label,
          rate,
          change: 0, // Finnhub free tier não dá change para forex
          flag: p.flag,
        });
      }
    } catch {
      results.push({ pair: p.label, label: p.label, rate: 0, change: 0, flag: p.flag });
    }
  }
  return results;
}

// ─────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────
export function useMarket(tab: MarketTab) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [forex, setForex] = useState<ForexRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef(false);

  const getTabConfig = useCallback(() => {
    switch (tab) {
      case 'uk':      return { list: UK_STOCKS,     isCrypto: false, currency: 'GBP' };
      case 'europe':  return { list: EU_STOCKS,      isCrypto: false, currency: 'EUR' };
      case 'us':      return { list: US_STOCKS,      isCrypto: false, currency: 'USD' };
      case 'crypto':  return { list: CRYPTO_ASSETS,  isCrypto: true,  currency: 'USD' };
    }
  }, [tab]);

  const fetchAssets = useCallback(async () => {
    abortRef.current = false;
    const { list, isCrypto, currency } = getTabConfig();
    setLoading(true);

    // Mostra placeholders imediatamente
    const placeholders: MarketAsset[] = list.map(a => ({
      code: isCrypto ? (a as any).shortCode : a.code,
      name: a.name,
      price: 0,
      change: 0,
      changeAbs: 0,
      currency,
      exchange: isCrypto ? 'Crypto' : a.exchange,
      description: a.description,
      loading: true,
    }));
    setAssets(placeholders);

    // Busca cotações em paralelo (max 4 por vez para respeitar rate limit free tier)
    const results: MarketAsset[] = [];
    const chunkSize = 4;
    for (let i = 0; i < list.length; i += chunkSize) {
      if (abortRef.current) break;
      const chunk = list.slice(i, i + chunkSize);
      const quotes = await Promise.all(
        chunk.map(a => fetchQuote(a.code, isCrypto))
      );
      for (let j = 0; j < chunk.length; j++) {
        const a = chunk[j];
        const q = quotes[j];
        results.push({
          code: isCrypto ? (a as any).shortCode : a.code,
          name: a.name,
          price: q.price ?? 0,
          change: q.change ?? 0,
          changeAbs: q.changeAbs ?? 0,
          currency,
          exchange: isCrypto ? 'Crypto' : a.exchange,
          high: q.high,
          low: q.low,
          open: q.open,
          prevClose: q.prevClose,
          description: a.description,
          loading: false,
          error: q.error,
        });
      }
      setAssets([...results, ...placeholders.slice(results.length)]);
    }

    if (!abortRef.current) {
      // If every result failed (e.g. invalid API key), fall back to mock data
      const allFailed = results.length > 0 && results.every(r => r.error);
      setAssets(allFailed ? getMockAssets(tab) : results);
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, [getTabConfig, tab]);

  // Busca forex apenas uma vez
  useEffect(() => {
    if (API_KEY) fetchForex().then(setForex);
    else {
      // Dados de fallback quando não há API key configurada
      setForex([
        { pair: 'USD/EUR', label: 'USD/EUR', rate: 0.92, change: 0, flag: '🇺🇸' },
        { pair: 'GBP/EUR', label: 'GBP/EUR', rate: 1.17, change: 0, flag: '🇬🇧' },
        { pair: 'USD/GBP', label: 'USD/GBP', rate: 0.79, change: 0, flag: '💵' },
      ]);
    }
  }, []);

  useEffect(() => {
    if (!API_KEY) {
      // Sem chave: usa dados mock europeus para não quebrar a UI
      setAssets(getMockAssets(tab));
      setLoading(false);
      return;
    }
    abortRef.current = true; // cancela fetch anterior
    fetchAssets();
    // Atualiza a cada 2 minutos
    const interval = setInterval(fetchAssets, 120_000);
    return () => {
      abortRef.current = true;
      clearInterval(interval);
    };
  }, [fetchAssets, tab]);

  return { assets, forex, loading, lastUpdated, refetch: fetchAssets };
}

// ─────────────────────────────────────────────────────────────
// DADOS MOCK (fallback sem API key)
// ─────────────────────────────────────────────────────────────
function getMockAssets(tab: MarketTab): MarketAsset[] {
  const mock: Record<MarketTab, MarketAsset[]> = {
    uk: [
      { code: 'SHEL', name: 'Shell',         price: 2856.50, change: 1.24,  changeAbs: 34.90, currency: 'GBP', exchange: 'LSE', description: 'Global energy company.' },
      { code: 'AZN',  name: 'AstraZeneca',   price: 12845.0, change: 0.85,  changeAbs: 108.5, currency: 'GBP', exchange: 'LSE', description: 'Pharmaceutical group.' },
      { code: 'HSBA', name: 'HSBC Holdings', price: 734.80,  change: -0.45, changeAbs: -3.32, currency: 'GBP', exchange: 'LSE', description: 'Global banking group.' },
      { code: 'BP',   name: 'BP',            price: 425.60,  change: 2.10,  changeAbs: 8.76,  currency: 'GBP', exchange: 'LSE', description: 'British oil and gas.' },
      { code: 'ULVR', name: 'Unilever',      price: 4215.0,  change: -0.32, changeAbs: -13.6, currency: 'GBP', exchange: 'LSE', description: 'Consumer goods company.' },
      { code: 'DGE',  name: 'Diageo',        price: 2548.0,  change: 0.67,  changeAbs: 17.0,  currency: 'GBP', exchange: 'LSE', description: 'Beverages company.' },
    ],
    europe: [
      { code: 'MC',   name: 'LVMH',          price: 782.40, change: 1.56,  changeAbs: 12.04, currency: 'EUR', exchange: 'Euronext Paris',     description: 'Luxury goods group.' },
      { code: 'ASML', name: 'ASML Holding',  price: 845.20, change: 2.34,  changeAbs: 19.30, currency: 'EUR', exchange: 'Euronext Amsterdam',  description: 'Semiconductor equipment.' },
      { code: 'OR',   name: "L'Oréal",       price: 412.65, change: 0.78,  changeAbs: 3.20,  currency: 'EUR', exchange: 'Euronext Paris',     description: 'Cosmetics leader.' },
      { code: 'SAP',  name: 'SAP',           price: 238.90, change: -0.45, changeAbs: -1.08, currency: 'EUR', exchange: 'XETRA',              description: 'Enterprise software.' },
      { code: 'SIE',  name: 'Siemens',       price: 189.40, change: 1.12,  changeAbs: 2.10,  currency: 'EUR', exchange: 'XETRA',              description: 'Technology conglomerate.' },
      { code: 'AIR',  name: 'Airbus',        price: 172.80, change: 3.45,  changeAbs: 5.76,  currency: 'EUR', exchange: 'Euronext Paris',     description: 'Aerospace leader.' },
    ],
    us: [
      { code: 'AAPL',  name: 'Apple',     price: 213.45, change: 1.24,  changeAbs: 2.61,  currency: 'USD', exchange: 'NASDAQ', description: 'Technology leader.' },
      { code: 'MSFT',  name: 'Microsoft', price: 432.80, change: 0.85,  changeAbs: 3.66,  currency: 'USD', exchange: 'NASDAQ', description: 'Software and cloud.' },
      { code: 'NVDA',  name: 'NVIDIA',    price: 1245.6, change: 4.23,  changeAbs: 50.58, currency: 'USD', exchange: 'NASDAQ', description: 'AI chip leader.' },
      { code: 'GOOGL', name: 'Alphabet',  price: 178.90, change: -0.45, changeAbs: -0.81, currency: 'USD', exchange: 'NASDAQ', description: 'Parent of Google.' },
      { code: 'AMZN',  name: 'Amazon',    price: 195.40, change: 1.56,  changeAbs: 3.01,  currency: 'USD', exchange: 'NASDAQ', description: 'E-commerce and cloud.' },
      { code: 'META',  name: 'Meta',      price: 523.80, change: 2.67,  changeAbs: 13.63, currency: 'USD', exchange: 'NASDAQ', description: 'Social media group.' },
    ],
    crypto: [
      { code: 'BTC',  name: 'Bitcoin',   price: 67820,  change: 3.45,  changeAbs: 2256.8, currency: 'USD', exchange: 'Crypto', description: 'First cryptocurrency.' },
      { code: 'ETH',  name: 'Ethereum',  price: 3845,   change: 2.12,  changeAbs: 79.87,  currency: 'USD', exchange: 'Crypto', description: 'Smart contract platform.' },
      { code: 'BNB',  name: 'BNB',       price: 612,    change: -0.85, changeAbs: -5.24,  currency: 'USD', exchange: 'Crypto', description: 'Binance ecosystem token.' },
      { code: 'SOL',  name: 'Solana',    price: 178.40, change: 5.34,  changeAbs: 9.05,   currency: 'USD', exchange: 'Crypto', description: 'High-performance blockchain.' },
      { code: 'XRP',  name: 'XRP',       price: 0.612,  change: 1.23,  changeAbs: 0.0074, currency: 'USD', exchange: 'Crypto', description: 'Global payments network.' },
      { code: 'ADA',  name: 'Cardano',   price: 0.485,  change: 2.45,  changeAbs: 0.0116, currency: 'USD', exchange: 'Crypto', description: 'Sustainable blockchain.' },
    ],
  };
  return mock[tab];
}

// Export combined mock from all regions (used for cross-market movers fallback)
export function getAllMockAssets(): MarketAsset[] {
  return [
    ...getMockAssets('uk'),
    ...getMockAssets('europe'),
    ...getMockAssets('us'),
    ...getMockAssets('crypto'),
  ];
}

// ─────────────────────────────────────────────────────────────
// ÍNDICES EUROPEUS (estáticos com label, para o header)
// Num próximo passo podem ser buscados via Finnhub também
// ─────────────────────────────────────────────────────────────
export const MARKET_INDICES: MarketIndex[] = [
  { name: 'FTSE 100',  value: '8,421',  change: '+0.84%', positive: true  },
  { name: 'Euro Stoxx 50', value: '5,124', change: '+1.12%', positive: true  },
  { name: 'DAX',       value: '18,765', change: '-0.23%', positive: false },
  { name: 'S&P 500',   value: '5,487',  change: '+0.56%', positive: true  },
];

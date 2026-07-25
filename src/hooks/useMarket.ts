import { useState, useEffect, useCallback, useRef } from 'react';

const API_KEY  = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';
const cache    = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000;

async function finnhub(path: string, params: Record<string, string> = {}) {
  const qs  = new URLSearchParams({ ...params, token: API_KEY }).toString();
  const key = `${path}?${qs}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
  const res  = await fetch(`${BASE_URL}${path}?${qs}`);
  if (res.status === 401) throw new Error('FINNHUB_UNAUTHORIZED');
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  const data = await res.json();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export interface MarketAsset {
  code: string; name: string; price: number; change: number; changeAbs: number;
  currency: string; exchange: string;
  high?: number; low?: number; open?: number; prevClose?: number;
  description?: string; loading?: boolean; error?: boolean;
}

export interface ForexRate  { pair: string; label: string; rate: number; change: number; flag: string; }
export interface MarketIndex { name: string; value: string; change: string; positive: boolean; }
export type MarketTab = 'uk' | 'europe' | 'us' | 'crypto';

export interface CatalogItem {
  code: string; finnhubSymbol: string; name: string; exchange: string;
  region: MarketTab; currency: string; description: string;
  mockPrice: number; mockChange: number; isCrypto?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG  (ordered by tier: 0-69 = Free · 70-149 = Pro · 150-299 = Premium
//           · 300+ = Business)
// ─────────────────────────────────────────────────────────────────────────────
export const STOCKS_CATALOG: CatalogItem[] = [

  // ══════════════════════════ FREE TIER (0-69) ══════════════════════════════

  // — US Blue-chips —
  { code:'AAPL',  finnhubSymbol:'AAPL',  name:'Apple',          exchange:'NASDAQ', region:'us', currency:'USD', description:'Global technology leader, maker of iPhone and Mac.',   mockPrice:213.45,  mockChange: 1.24  },
  { code:'MSFT',  finnhubSymbol:'MSFT',  name:'Microsoft',      exchange:'NASDAQ', region:'us', currency:'USD', description:'Software and cloud computing services.',              mockPrice:432.80,  mockChange: 0.85  },
  { code:'NVDA',  finnhubSymbol:'NVDA',  name:'NVIDIA',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Leader in GPUs and AI chip technology.',             mockPrice:1245.60, mockChange: 4.23  },
  { code:'GOOGL', finnhubSymbol:'GOOGL', name:'Alphabet',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Parent company of Google.',                          mockPrice:178.90,  mockChange:-0.45  },
  { code:'AMZN',  finnhubSymbol:'AMZN',  name:'Amazon',         exchange:'NASDAQ', region:'us', currency:'USD', description:'E-commerce and cloud computing leader.',             mockPrice:195.40,  mockChange: 1.56  },
  { code:'META',  finnhubSymbol:'META',  name:'Meta',           exchange:'NASDAQ', region:'us', currency:'USD', description:'Owner of Facebook, Instagram and WhatsApp.',        mockPrice:523.80,  mockChange: 2.67  },
  { code:'TSLA',  finnhubSymbol:'TSLA',  name:'Tesla',          exchange:'NASDAQ', region:'us', currency:'USD', description:'Electric vehicles and clean energy.',                mockPrice:182.50,  mockChange:-1.23  },
  { code:'NFLX',  finnhubSymbol:'NFLX',  name:'Netflix',        exchange:'NASDAQ', region:'us', currency:'USD', description:'Global streaming entertainment service.',            mockPrice:690.20,  mockChange: 2.15  },
  { code:'JPM',   finnhubSymbol:'JPM',   name:'JPMorgan Chase', exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US bank by assets.',                        mockPrice:220.60,  mockChange: 0.78  },
  { code:'V',     finnhubSymbol:'V',     name:'Visa',           exchange:'NYSE',   region:'us', currency:'USD', description:'Global payments technology company.',               mockPrice:275.40,  mockChange: 1.02  },
  { code:'MA',    finnhubSymbol:'MA',    name:'Mastercard',     exchange:'NYSE',   region:'us', currency:'USD', description:'Global payment technology company.',                mockPrice:470.80,  mockChange: 0.95  },
  { code:'JNJ',   finnhubSymbol:'JNJ',   name:'Johnson & Johnson', exchange:'NYSE', region:'us', currency:'USD', description:'Diversified healthcare company.',                  mockPrice:155.20,  mockChange:-0.32  },
  { code:'WMT',   finnhubSymbol:'WMT',   name:'Walmart',        exchange:'NYSE',   region:'us', currency:'USD', description:"World's largest retailer.",                         mockPrice:68.50,   mockChange: 0.45  },
  { code:'XOM',   finnhubSymbol:'XOM',   name:'ExxonMobil',     exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US oil and gas company.',                   mockPrice:118.30,  mockChange: 1.80  },
  { code:'BAC',   finnhubSymbol:'BAC',   name:'Bank of America', exchange:'NYSE',  region:'us', currency:'USD', description:'One of the largest US banks.',                      mockPrice:40.20,   mockChange: 0.55  },

  // — UK Blue-chips —
  { code:'SHEL',  finnhubSymbol:'SHEL.L',  name:'Shell',         exchange:'LSE', region:'uk', currency:'GBP', description:'Global energy and petrochemicals company.',        mockPrice:2856.50, mockChange: 1.24  },
  { code:'AZN',   finnhubSymbol:'AZN.L',   name:'AstraZeneca',   exchange:'LSE', region:'uk', currency:'GBP', description:'British-Swedish multinational pharmaceutical.',    mockPrice:12845.0, mockChange: 0.85  },
  { code:'HSBA',  finnhubSymbol:'HSBA.L',  name:'HSBC Holdings', exchange:'LSE', region:'uk', currency:'GBP', description:"One of the world's largest banking groups.",       mockPrice:734.80,  mockChange:-0.45  },
  { code:'BP',    finnhubSymbol:'BP.L',    name:'BP',            exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational oil and gas company.',       mockPrice:425.60,  mockChange: 2.10  },
  { code:'ULVR',  finnhubSymbol:'ULVR.L',  name:'Unilever',      exchange:'LSE', region:'uk', currency:'GBP', description:'British consumer goods company.',                 mockPrice:4215.00, mockChange:-0.32  },
  { code:'RIO',   finnhubSymbol:'RIO.L',   name:'Rio Tinto',     exchange:'LSE', region:'uk', currency:'GBP', description:'British-Australian multinational metals group.',   mockPrice:5680.00, mockChange: 0.56  },
  { code:'DGE',   finnhubSymbol:'DGE.L',   name:'Diageo',        exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational beverages company.',         mockPrice:2548.00, mockChange: 0.67  },
  { code:'GSK',   finnhubSymbol:'GSK.L',   name:'GSK',           exchange:'LSE', region:'uk', currency:'GBP', description:'Global healthcare and pharmaceuticals.',           mockPrice:1780.00, mockChange: 1.10  },

  // — EU Blue-chips —
  { code:'MC',    finnhubSymbol:'MC.PA',   name:'LVMH',          exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:"World's largest luxury goods conglomerate.",   mockPrice:782.40, mockChange: 1.56 },
  { code:'ASML',  finnhubSymbol:'ASML.AS', name:'ASML Holding',  exchange:'Euronext Amsterdam', region:'europe', currency:'EUR', description:'Semiconductor equipment manufacturer.',         mockPrice:845.20, mockChange: 2.34 },
  { code:'OR',    finnhubSymbol:'OR.PA',   name:"L'Oréal",       exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:"World's largest cosmetics company.",           mockPrice:412.65, mockChange: 0.78 },
  { code:'SAP',   finnhubSymbol:'SAP.DE',  name:'SAP',           exchange:'XETRA',              region:'europe', currency:'EUR', description:'German multinational enterprise software.',    mockPrice:238.90, mockChange:-0.45 },
  { code:'SIE',   finnhubSymbol:'SIE.DE',  name:'Siemens',       exchange:'XETRA',              region:'europe', currency:'EUR', description:'German multinational technology.',             mockPrice:189.40, mockChange: 1.12 },
  { code:'NESN',  finnhubSymbol:'NESN.SW', name:'Nestlé',        exchange:'SIX Swiss',          region:'europe', currency:'EUR', description:'Swiss multinational food and beverage.',       mockPrice:96.30,  mockChange: 0.23 },
  { code:'NOVN',  finnhubSymbol:'NOVN.SW', name:'Novartis',      exchange:'SIX Swiss',          region:'europe', currency:'EUR', description:'Swiss multinational pharmaceutical.',          mockPrice:98.50,  mockChange: 0.45 },
  { code:'AIR',   finnhubSymbol:'AIR.PA',  name:'Airbus',        exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:'European aerospace and defence corporation.',  mockPrice:172.80, mockChange: 3.45 },

  // — Crypto Core —
  { code:'BTC',  finnhubSymbol:'BINANCE:BTCUSDT',  name:'Bitcoin',   exchange:'Crypto', region:'crypto', currency:'USD', description:'First and most widely known cryptocurrency.',  mockPrice:67820.0, mockChange: 3.45, isCrypto:true },
  { code:'ETH',  finnhubSymbol:'BINANCE:ETHUSDT',  name:'Ethereum',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain platform for smart contracts.',      mockPrice:3845.00, mockChange: 2.12, isCrypto:true },
  { code:'BNB',  finnhubSymbol:'BINANCE:BNBUSDT',  name:'BNB',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Native token of the Binance ecosystem.',       mockPrice:612.00,  mockChange:-0.85, isCrypto:true },
  { code:'SOL',  finnhubSymbol:'BINANCE:SOLUSDT',  name:'Solana',    exchange:'Crypto', region:'crypto', currency:'USD', description:'High-performance blockchain for DeFi.',        mockPrice:178.40,  mockChange: 5.34, isCrypto:true },
  { code:'XRP',  finnhubSymbol:'BINANCE:XRPUSDT',  name:'XRP',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Global payments network for fast transfers.',  mockPrice:0.612,   mockChange: 1.23, isCrypto:true },
  { code:'ADA',  finnhubSymbol:'BINANCE:ADAUSDT',  name:'Cardano',   exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain focused on sustainability.',        mockPrice:0.485,   mockChange: 2.45, isCrypto:true },
  { code:'DOT',  finnhubSymbol:'BINANCE:DOTUSDT',  name:'Polkadot',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Protocol for blockchain interoperability.',    mockPrice:8.50,    mockChange: 3.12, isCrypto:true },
  { code:'AVAX', finnhubSymbol:'BINANCE:AVAXUSDT', name:'Avalanche', exchange:'Crypto', region:'crypto', currency:'USD', description:'High-throughput decentralised app platform.', mockPrice:35.40,   mockChange: 4.23, isCrypto:true },

  // more free US
  { code:'HD',   finnhubSymbol:'HD',   name:'Home Depot',  exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US home improvement retailer.',  mockPrice:360.80, mockChange: 0.90 },
  { code:'LLY',  finnhubSymbol:'LLY',  name:'Eli Lilly',   exchange:'NYSE',   region:'us', currency:'USD', description:'Global pharmaceutical company.',          mockPrice:800.20, mockChange: 1.34 },
  { code:'AMD',  finnhubSymbol:'AMD',  name:'AMD',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Semiconductor company, CPUs and GPUs.',   mockPrice:165.80, mockChange: 3.45 },
  { code:'DIS',  finnhubSymbol:'DIS',  name:'Disney',      exchange:'NYSE',   region:'us', currency:'USD', description:'Entertainment and media conglomerate.',   mockPrice:92.60,  mockChange: 0.34 },
  { code:'ADBE', finnhubSymbol:'ADBE', name:'Adobe',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Creative and document software.',         mockPrice:560.20, mockChange: 1.56 },
  { code:'ORCL', finnhubSymbol:'ORCL', name:'Oracle',      exchange:'NYSE',   region:'us', currency:'USD', description:'Enterprise software and cloud services.', mockPrice:140.80, mockChange: 0.78 },
  { code:'COIN', finnhubSymbol:'COIN', name:'Coinbase',    exchange:'NASDAQ', region:'us', currency:'USD', description:'Largest US cryptocurrency exchange.',      mockPrice:230.40, mockChange: 4.56 },

  // more free UK
  { code:'VOD',  finnhubSymbol:'VOD.L', name:'Vodafone',   exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational telecoms company.',   mockPrice:78.40,  mockChange:-0.78 },
  { code:'BAE',  finnhubSymbol:'BA.L',  name:'BAE Systems',exchange:'LSE', region:'uk', currency:'GBP', description:'British aerospace and defence company.',   mockPrice:1250.0, mockChange: 2.45 },
  { code:'PRU',  finnhubSymbol:'PRU.L', name:'Prudential', exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational insurance company.', mockPrice:1450.0, mockChange:-0.23 },

  // more free EU
  { code:'BMW',  finnhubSymbol:'BMW.DE', name:'BMW',           exchange:'XETRA',          region:'europe', currency:'EUR', description:'German premium car manufacturer.',     mockPrice:92.40, mockChange:-0.67 },
  { code:'BNP',  finnhubSymbol:'BNP.PA', name:'BNP Paribas',  exchange:'Euronext Paris',  region:'europe', currency:'EUR', description:'French multinational banking group.',  mockPrice:65.80, mockChange: 0.89 },
  { code:'TTE',  finnhubSymbol:'TTE.PA', name:'TotalEnergies',exchange:'Euronext Paris',  region:'europe', currency:'EUR', description:'French multinational energy company.', mockPrice:58.40, mockChange: 1.23 },

  // more free Crypto
  { code:'DOGE', finnhubSymbol:'BINANCE:DOGEUSDT',  name:'Dogecoin', exchange:'Crypto', region:'crypto', currency:'USD', description:'Meme-inspired cryptocurrency.',   mockPrice:0.155, mockChange:-1.23, isCrypto:true },
  { code:'MATIC',finnhubSymbol:'BINANCE:MATICUSDT', name:'Polygon',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Ethereum scaling solution.',      mockPrice:0.78,  mockChange: 2.89, isCrypto:true },
  { code:'LTC',  finnhubSymbol:'BINANCE:LTCUSDT',   name:'Litecoin', exchange:'Crypto', region:'crypto', currency:'USD', description:'Peer-to-peer cryptocurrency.',    mockPrice:85.40, mockChange: 1.45, isCrypto:true },
  { code:'LINK', finnhubSymbol:'BINANCE:LINKUSDT',  name:'Chainlink',exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain oracle network.',      mockPrice:17.80, mockChange: 3.45, isCrypto:true },

  // ══════════════════════════ PRO TIER (70-149) ═════════════════════════════

  // — US Mid-cap & growth —
  { code:'UBER',  finnhubSymbol:'UBER',  name:'Uber',         exchange:'NYSE',   region:'us', currency:'USD', description:'Ride-sharing and food delivery platform.',       mockPrice:80.40,  mockChange: 1.23 },
  { code:'SPOT',  finnhubSymbol:'SPOT',  name:'Spotify',      exchange:'NYSE',   region:'us', currency:'USD', description:'Music and podcast streaming platform.',          mockPrice:380.20, mockChange: 2.34 },
  { code:'ABNB',  finnhubSymbol:'ABNB',  name:'Airbnb',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Online marketplace for lodging.',                mockPrice:130.60, mockChange: 0.67 },
  { code:'SHOP',  finnhubSymbol:'SHOP',  name:'Shopify',      exchange:'NYSE',   region:'us', currency:'USD', description:'E-commerce platform for merchants.',             mockPrice:80.40,  mockChange: 1.89 },
  { code:'AVGO',  finnhubSymbol:'AVGO',  name:'Broadcom',     exchange:'NASDAQ', region:'us', currency:'USD', description:'Semiconductor and infrastructure software.',     mockPrice:1850.0, mockChange: 2.45 },
  { code:'COST',  finnhubSymbol:'COST',  name:'Costco',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Membership warehouse club.',                     mockPrice:890.40, mockChange: 0.78 },
  { code:'PYPL',  finnhubSymbol:'PYPL',  name:'PayPal',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Digital payments platform.',                    mockPrice:70.20,  mockChange:-0.45 },
  { code:'CRM',   finnhubSymbol:'CRM',   name:'Salesforce',   exchange:'NYSE',   region:'us', currency:'USD', description:'Cloud-based CRM software leader.',              mockPrice:285.40, mockChange: 0.90 },
  { code:'INTC',  finnhubSymbol:'INTC',  name:'Intel',        exchange:'NASDAQ', region:'us', currency:'USD', description:"World's largest semiconductor chip maker.",     mockPrice:30.40,  mockChange:-1.20 },
  { code:'SBUX',  finnhubSymbol:'SBUX',  name:'Starbucks',    exchange:'NASDAQ', region:'us', currency:'USD', description:"World's largest coffeehouse chain.",            mockPrice:80.60,  mockChange:-0.56 },
  { code:'PLTR',  finnhubSymbol:'PLTR',  name:'Palantir',     exchange:'NYSE',   region:'us', currency:'USD', description:'Big data analytics and AI platform.',           mockPrice:25.80,  mockChange: 4.12 },
  { code:'SNAP',  finnhubSymbol:'SNAP',  name:'Snap',         exchange:'NYSE',   region:'us', currency:'USD', description:'Camera and social media company.',              mockPrice:12.40,  mockChange:-2.10 },
  { code:'PINS',  finnhubSymbol:'PINS',  name:'Pinterest',    exchange:'NYSE',   region:'us', currency:'USD', description:'Visual discovery and shopping platform.',       mockPrice:28.60,  mockChange: 1.34 },
  { code:'HOOD',  finnhubSymbol:'HOOD',  name:'Robinhood',    exchange:'NASDAQ', region:'us', currency:'USD', description:'Commission-free investing platform.',           mockPrice:18.40,  mockChange: 3.56 },
  { code:'SOFI',  finnhubSymbol:'SOFI',  name:'SoFi',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Digital personal finance company.',             mockPrice:8.20,   mockChange: 2.45 },
  { code:'F',     finnhubSymbol:'F',     name:'Ford',         exchange:'NYSE',   region:'us', currency:'USD', description:'American multinational automaker.',             mockPrice:12.80,  mockChange:-0.78 },
  { code:'GM',    finnhubSymbol:'GM',    name:'GM',           exchange:'NYSE',   region:'us', currency:'USD', description:'American multinational automaker.',             mockPrice:46.20,  mockChange: 0.56 },
  { code:'BA',    finnhubSymbol:'BA',    name:'Boeing',       exchange:'NYSE',   region:'us', currency:'USD', description:'Largest aerospace and defence company.',       mockPrice:175.40, mockChange:-1.56 },
  { code:'CAT',   finnhubSymbol:'CAT',   name:'Caterpillar',  exchange:'NYSE',   region:'us', currency:'USD', description:'World\'s largest construction equipment maker.',mockPrice:360.80, mockChange: 1.23 },
  { code:'PFE',   finnhubSymbol:'PFE',   name:'Pfizer',       exchange:'NYSE',   region:'us', currency:'USD', description:'Global pharmaceutical company.',               mockPrice:28.40,  mockChange:-0.89 },
  { code:'ABBV',  finnhubSymbol:'ABBV',  name:'AbbVie',       exchange:'NYSE',   region:'us', currency:'USD', description:'Global biopharmaceutical company.',            mockPrice:165.60, mockChange: 0.67 },
  { code:'MRK',   finnhubSymbol:'MRK',   name:'Merck',        exchange:'NYSE',   region:'us', currency:'USD', description:'Global healthcare company.',                   mockPrice:128.40, mockChange: 0.34 },
  { code:'CVX',   finnhubSymbol:'CVX',   name:'Chevron',      exchange:'NYSE',   region:'us', currency:'USD', description:'Global integrated energy company.',            mockPrice:160.40, mockChange: 0.67 },
  { code:'RTX',   finnhubSymbol:'RTX',   name:'RTX Corp',     exchange:'NYSE',   region:'us', currency:'USD', description:'Aerospace and defence company.',               mockPrice:113.40, mockChange: 1.12 },
  { code:'UNH',   finnhubSymbol:'UNH',   name:'UnitedHealth', exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US health insurer.',                   mockPrice:530.40, mockChange:-0.68 },

  // — UK Pro —
  { code:'LSEG',  finnhubSymbol:'LSEG.L', name:'LSEG',         exchange:'LSE', region:'uk', currency:'GBP', description:'London Stock Exchange Group.',                mockPrice:9500.0, mockChange: 0.34 },
  { code:'BATS',  finnhubSymbol:'BATS.L', name:'BAT',           exchange:'LSE', region:'uk', currency:'GBP', description:'British American Tobacco.',                   mockPrice:2460.0, mockChange:-0.45 },
  { code:'STAN',  finnhubSymbol:'STAN.L', name:'Standard Chartered', exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational banking group.', mockPrice:890.40, mockChange: 1.23 },
  { code:'NWG',   finnhubSymbol:'NWG.L',  name:'NatWest Group', exchange:'LSE', region:'uk', currency:'GBP', description:'British banking and insurance company.',      mockPrice:415.60, mockChange: 0.89 },
  { code:'LLOY',  finnhubSymbol:'LLOY.L', name:'Lloyds Bank',   exchange:'LSE', region:'uk', currency:'GBP', description:'UK\'s largest retail bank.',                  mockPrice:56.40,  mockChange: 0.34 },
  { code:'MNG',   finnhubSymbol:'MNG.L',  name:'M&G',           exchange:'LSE', region:'uk', currency:'GBP', description:'Investment management company.',              mockPrice:215.60, mockChange:-0.23 },

  // — EU Pro —
  { code:'ALV',   finnhubSymbol:'ALV.DE',  name:'Allianz',      exchange:'XETRA',          region:'europe', currency:'EUR', description:'World\'s largest insurance company.', mockPrice:275.40, mockChange: 0.67 },
  { code:'BAS',   finnhubSymbol:'BAS.DE',  name:'BASF',         exchange:'XETRA',          region:'europe', currency:'EUR', description:'World\'s largest chemical company.',  mockPrice:48.60,  mockChange:-1.23 },
  { code:'VOW3',  finnhubSymbol:'VOW3.DE', name:'Volkswagen',   exchange:'XETRA',          region:'europe', currency:'EUR', description:'German multinational automaker.',     mockPrice:115.40, mockChange:-0.89 },
  { code:'ABI',   finnhubSymbol:'ABI.BR',  name:'AB InBev',     exchange:'Euronext Brussels', region:'europe', currency:'EUR', description:'World\'s largest brewer.',         mockPrice:55.80,  mockChange: 0.45 },
  { code:'ENI',   finnhubSymbol:'ENI.MI',  name:'Eni',          exchange:'Borsa Italiana', region:'europe', currency:'EUR', description:'Italian multinational oil and gas.', mockPrice:13.80,  mockChange: 1.12 },
  { code:'IBE',   finnhubSymbol:'IBE.MC',  name:'Iberdrola',    exchange:'BME Madrid',     region:'europe', currency:'EUR', description:'Spanish utility and renewable energy.', mockPrice:12.40, mockChange: 0.78 },

  // — Crypto Pro —
  { code:'UNI',   finnhubSymbol:'BINANCE:UNIUSDT',  name:'Uniswap',     exchange:'Crypto', region:'crypto', currency:'USD', description:'Leading decentralised exchange protocol.',  mockPrice:8.40,   mockChange: 3.12, isCrypto:true },
  { code:'ATOM',  finnhubSymbol:'BINANCE:ATOMUSDT',  name:'Cosmos',      exchange:'Crypto', region:'crypto', currency:'USD', description:'Internet of blockchains ecosystem.',       mockPrice:9.80,   mockChange: 2.45, isCrypto:true },
  { code:'NEAR',  finnhubSymbol:'BINANCE:NEARUSDT',  name:'NEAR',        exchange:'Crypto', region:'crypto', currency:'USD', description:'User-friendly smart contract platform.',   mockPrice:7.20,   mockChange: 4.56, isCrypto:true },
  { code:'ARB',   finnhubSymbol:'BINANCE:ARBUSDT',   name:'Arbitrum',    exchange:'Crypto', region:'crypto', currency:'USD', description:'Ethereum Layer-2 scaling solution.',      mockPrice:1.12,   mockChange: 2.78, isCrypto:true },
  { code:'OP',    finnhubSymbol:'BINANCE:OPUSDT',    name:'Optimism',    exchange:'Crypto', region:'crypto', currency:'USD', description:'Ethereum optimistic rollup network.',     mockPrice:2.34,   mockChange: 3.45, isCrypto:true },
  { code:'MKR',   finnhubSymbol:'BINANCE:MKRUSDT',   name:'Maker',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Decentralised lending protocol.',         mockPrice:2450.0, mockChange: 1.89, isCrypto:true },
  { code:'AAVE',  finnhubSymbol:'BINANCE:AAVEUSDT',  name:'Aave',        exchange:'Crypto', region:'crypto', currency:'USD', description:'Open source liquidity protocol.',         mockPrice:92.40,  mockChange: 2.34, isCrypto:true },
  { code:'TRX',   finnhubSymbol:'BINANCE:TRXUSDT',   name:'TRON',        exchange:'Crypto', region:'crypto', currency:'USD', description:'Blockchain-based operating system.',      mockPrice:0.128,  mockChange: 0.89, isCrypto:true },
  { code:'FIL',   finnhubSymbol:'BINANCE:FILUSDT',   name:'Filecoin',    exchange:'Crypto', region:'crypto', currency:'USD', description:'Decentralised storage network.',          mockPrice:5.80,   mockChange: 3.12, isCrypto:true },
  { code:'APT',   finnhubSymbol:'BINANCE:APTUSDT',   name:'Aptos',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Layer-1 blockchain built with Move.',     mockPrice:8.90,   mockChange: 4.23, isCrypto:true },

  // ════════════════════════ PREMIUM TIER (150-299) ══════════════════════════

  // — US ETFs —
  { code:'SPY',   finnhubSymbol:'SPY',  name:'S&P 500 ETF',     exchange:'NYSE Arca', region:'us', currency:'USD', description:'SPDR S&P 500 ETF — tracks the S&P 500 index.',  mockPrice:545.40,  mockChange: 0.68 },
  { code:'QQQ',   finnhubSymbol:'QQQ',  name:'Nasdaq 100 ETF',  exchange:'NASDAQ',    region:'us', currency:'USD', description:'Invesco QQQ — tracks the Nasdaq-100 index.',    mockPrice:470.80,  mockChange: 1.12 },
  { code:'IWM',   finnhubSymbol:'IWM',  name:'Russell 2000 ETF',exchange:'NYSE Arca', region:'us', currency:'USD', description:'iShares Russell 2000 ETF — small-cap stocks.',  mockPrice:215.40,  mockChange: 0.45 },
  { code:'VTI',   finnhubSymbol:'VTI',  name:'Total Market ETF',exchange:'NYSE Arca', region:'us', currency:'USD', description:'Vanguard Total Stock Market ETF.',              mockPrice:242.80,  mockChange: 0.56 },
  { code:'GLD',   finnhubSymbol:'GLD',  name:'Gold ETF',         exchange:'NYSE Arca', region:'us', currency:'USD', description:'SPDR Gold Shares — tracks gold prices.',       mockPrice:218.40,  mockChange: 0.23 },
  { code:'SLV',   finnhubSymbol:'SLV',  name:'Silver ETF',       exchange:'NYSE Arca', region:'us', currency:'USD', description:'iShares Silver Trust — tracks silver prices.', mockPrice:26.80,   mockChange: 0.89 },
  { code:'ARKK',  finnhubSymbol:'ARKK', name:'ARK Innovation',   exchange:'NYSE Arca', region:'us', currency:'USD', description:'ARK Innovation ETF — disruptive innovation.',  mockPrice:48.60,   mockChange: 2.34 },
  { code:'XLK',   finnhubSymbol:'XLK',  name:'Technology ETF',   exchange:'NYSE Arca', region:'us', currency:'USD', description:'SPDR Technology Select Sector ETF.',           mockPrice:225.60,  mockChange: 1.23 },
  { code:'XLF',   finnhubSymbol:'XLF',  name:'Financial ETF',    exchange:'NYSE Arca', region:'us', currency:'USD', description:'SPDR Financial Select Sector ETF.',            mockPrice:42.80,   mockChange: 0.45 },
  { code:'KWEB',  finnhubSymbol:'KWEB', name:'China Internet ETF',exchange:'NYSE Arca',region:'us', currency:'USD', description:'KraneShares China Internet ETF.',             mockPrice:28.40,   mockChange:-1.23 },

  // — US Emerging & High-growth —
  { code:'RIVN',  finnhubSymbol:'RIVN',  name:'Rivian',       exchange:'NASDAQ', region:'us', currency:'USD', description:'American EV manufacturer.',                     mockPrice:12.80,  mockChange:-2.34 },
  { code:'LCID',  finnhubSymbol:'LCID',  name:'Lucid Motors', exchange:'NASDAQ', region:'us', currency:'USD', description:'Luxury EV manufacturer.',                       mockPrice:2.80,   mockChange:-1.23 },
  { code:'NIO',   finnhubSymbol:'NIO',   name:'NIO',          exchange:'NYSE',   region:'us', currency:'USD', description:'Chinese EV manufacturer.',                      mockPrice:5.40,   mockChange: 2.45 },
  { code:'RKLB',  finnhubSymbol:'RKLB',  name:'Rocket Lab',   exchange:'NASDAQ', region:'us', currency:'USD', description:'Space launch and spacecraft company.',          mockPrice:6.80,   mockChange: 3.56 },
  { code:'PATH',  finnhubSymbol:'PATH',  name:'UiPath',       exchange:'NYSE',   region:'us', currency:'USD', description:'Enterprise automation and AI platform.',        mockPrice:14.60,  mockChange: 1.89 },
  { code:'CRWD',  finnhubSymbol:'CRWD',  name:'CrowdStrike',  exchange:'NASDAQ', region:'us', currency:'USD', description:'Endpoint security and threat intelligence.',    mockPrice:330.80, mockChange: 2.34 },
  { code:'ZS',    finnhubSymbol:'ZS',    name:'Zscaler',      exchange:'NASDAQ', region:'us', currency:'USD', description:'Cloud-native security platform.',               mockPrice:185.40, mockChange: 1.56 },
  { code:'PANW',  finnhubSymbol:'PANW',  name:'Palo Alto Networks', exchange:'NASDAQ', region:'us', currency:'USD', description:'Global cybersecurity company.',          mockPrice:320.60, mockChange: 1.78 },
  { code:'DDOG',  finnhubSymbol:'DDOG',  name:'Datadog',      exchange:'NASDAQ', region:'us', currency:'USD', description:'Cloud monitoring and analytics platform.',     mockPrice:120.40, mockChange: 2.12 },
  { code:'SNOW',  finnhubSymbol:'SNOW',  name:'Snowflake',    exchange:'NYSE',   region:'us', currency:'USD', description:'Cloud data platform company.',                 mockPrice:148.60, mockChange:-0.89 },
  { code:'MDB',   finnhubSymbol:'MDB',   name:'MongoDB',      exchange:'NASDAQ', region:'us', currency:'USD', description:'General purpose document database.',           mockPrice:280.40, mockChange: 1.23 },
  { code:'SMCI',  finnhubSymbol:'SMCI',  name:'Super Micro',  exchange:'NASDAQ', region:'us', currency:'USD', description:'AI and high-performance server solutions.',    mockPrice:820.40, mockChange: 5.67 },
  { code:'ARM',   finnhubSymbol:'ARM',   name:'Arm Holdings', exchange:'NASDAQ', region:'us', currency:'USD', description:'Semiconductor IP company.',                    mockPrice:140.80, mockChange: 3.45 },
  { code:'GME',   finnhubSymbol:'GME',   name:'GameStop',     exchange:'NYSE',   region:'us', currency:'USD', description:'Video game retailer.',                         mockPrice:24.80,  mockChange: 8.90 },
  { code:'AMC',   finnhubSymbol:'AMC',   name:'AMC Entertainment', exchange:'NYSE', region:'us', currency:'USD', description:'Movie theatre chain.',                     mockPrice:3.80,   mockChange: 4.56 },

  // — US Healthcare & Biotech —
  { code:'MRNA',  finnhubSymbol:'MRNA',  name:'Moderna',      exchange:'NASDAQ', region:'us', currency:'USD', description:'mRNA technology and vaccine company.',         mockPrice:78.40,  mockChange:-1.23 },
  { code:'GILD',  finnhubSymbol:'GILD',  name:'Gilead Sciences', exchange:'NASDAQ', region:'us', currency:'USD', description:'Biopharmaceutical company.',               mockPrice:78.60,  mockChange: 0.45 },
  { code:'BMY',   finnhubSymbol:'BMY',   name:'Bristol-Myers', exchange:'NYSE',   region:'us', currency:'USD', description:'Global biopharmaceutical company.',           mockPrice:50.40,  mockChange:-0.34 },
  { code:'CVS',   finnhubSymbol:'CVS',   name:'CVS Health',   exchange:'NYSE',   region:'us', currency:'USD', description:'Retail pharmacy and health services.',        mockPrice:58.40,  mockChange: 0.23 },

  // — LATAM ADRs —
  { code:'PBR',   finnhubSymbol:'PBR',  name:'Petrobras',    exchange:'NYSE',   region:'us', currency:'USD', description:'Brazilian state oil company.',                  mockPrice:15.40,  mockChange: 2.34 },
  { code:'VALE',  finnhubSymbol:'VALE', name:'Vale',         exchange:'NYSE',   region:'us', currency:'USD', description:'Brazilian multinational mining company.',       mockPrice:11.80,  mockChange: 1.12 },
  { code:'ITUB',  finnhubSymbol:'ITUB', name:'Itaú Unibanco',exchange:'NYSE',   region:'us', currency:'USD', description:'Largest bank in Brazil.',                      mockPrice:6.80,   mockChange: 0.89 },
  { code:'ABEV',  finnhubSymbol:'ABEV', name:'Ambev',        exchange:'NYSE',   region:'us', currency:'USD', description:'Largest brewery in Brazil.',                   mockPrice:2.40,   mockChange: 0.45 },

  // — APAC ADRs —
  { code:'TM',    finnhubSymbol:'TM',   name:'Toyota',       exchange:'NYSE',   region:'us', currency:'USD', description:'World\'s largest automaker.',                  mockPrice:190.40, mockChange: 0.78 },
  { code:'SONY',  finnhubSymbol:'SONY', name:'Sony',         exchange:'NYSE',   region:'us', currency:'USD', description:'Japanese multinational technology.',            mockPrice:88.40,  mockChange: 1.12 },
  { code:'BABA',  finnhubSymbol:'BABA', name:'Alibaba',      exchange:'NYSE',   region:'us', currency:'USD', description:'Chinese multinational technology company.',     mockPrice:78.40,  mockChange: 2.34 },
  { code:'BIDU',  finnhubSymbol:'BIDU', name:'Baidu',        exchange:'NASDAQ', region:'us', currency:'USD', description:'Chinese internet search company.',             mockPrice:95.40,  mockChange: 1.56 },
  { code:'JD',    finnhubSymbol:'JD',   name:'JD.com',       exchange:'NASDAQ', region:'us', currency:'USD', description:'Chinese e-commerce company.',                  mockPrice:34.80,  mockChange: 1.89 },
  { code:'PDD',   finnhubSymbol:'PDD',  name:'PDD Holdings', exchange:'NASDAQ', region:'us', currency:'USD', description:'Parent of Pinduoduo and Temu.',                mockPrice:138.40, mockChange: 3.45 },
  { code:'TSM',   finnhubSymbol:'TSM',  name:'TSMC',         exchange:'NYSE',   region:'us', currency:'USD', description:'World\'s largest contract chipmaker.',         mockPrice:175.40, mockChange: 2.12 },
  { code:'SE',    finnhubSymbol:'SE',   name:'Sea Limited',  exchange:'NYSE',   region:'us', currency:'USD', description:'Southeast Asian digital economy leader.',      mockPrice:48.60,  mockChange: 2.78 },

  // — UK Premium —
  { code:'IMB',   finnhubSymbol:'IMB.L',  name:'Imperial Brands', exchange:'LSE', region:'uk', currency:'GBP', description:'British multinational tobacco company.', mockPrice:2080.0, mockChange: 0.56 },
  { code:'SGRO',  finnhubSymbol:'SGRO.L', name:'Segro',            exchange:'LSE', region:'uk', currency:'GBP', description:'UK REIT specialising in warehouses.',    mockPrice:920.40, mockChange: 1.23 },
  { code:'CRH',   finnhubSymbol:'CRH.L',  name:'CRH',              exchange:'LSE', region:'uk', currency:'GBP', description:'Global building materials company.',     mockPrice:6480.0, mockChange: 0.89 },
  { code:'HL',    finnhubSymbol:'HL.L',   name:'Hargreaves Lansdown', exchange:'LSE', region:'uk', currency:'GBP', description:'UK investment platform.',             mockPrice:1020.0, mockChange: 0.34 },
  { code:'RKT',   finnhubSymbol:'RKT.L',  name:'Reckitt',          exchange:'LSE', region:'uk', currency:'GBP', description:'Consumer goods and health company.',    mockPrice:4180.0, mockChange:-0.45 },

  // — EU Premium —
  { code:'STM',   finnhubSymbol:'STM.MI',  name:'STMicroelectronics', exchange:'Borsa Italiana', region:'europe', currency:'EUR', description:'European semiconductor manufacturer.',  mockPrice:24.80, mockChange: 2.34 },
  { code:'INGA',  finnhubSymbol:'INGA.AS', name:'ING Group',          exchange:'Euronext Amsterdam', region:'europe', currency:'EUR', description:'Dutch multinational banking group.', mockPrice:15.40, mockChange: 0.67 },
  { code:'AIL',   finnhubSymbol:'AI.PA',   name:'Air Liquide',        exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:'French industrial gas company.',     mockPrice:168.40, mockChange: 0.89 },
  { code:'EDF',   finnhubSymbol:'EDF.PA',  name:'EDF',                exchange:'Euronext Paris',     region:'europe', currency:'EUR', description:'French state-owned electric utility.',mockPrice:11.20, mockChange:-0.34 },
  { code:'BAYN',  finnhubSymbol:'BAYN.DE', name:'Bayer',              exchange:'XETRA',              region:'europe', currency:'EUR', description:'German pharmaceutical and agro.',    mockPrice:28.80, mockChange:-1.12 },
  { code:'DHER',  finnhubSymbol:'DHER.DE', name:'Delivery Hero',      exchange:'XETRA',              region:'europe', currency:'EUR', description:'International food delivery company.',mockPrice:26.40, mockChange: 2.12 },
  { code:'MUV2',  finnhubSymbol:'MUV2.DE', name:'Munich Re',          exchange:'XETRA',              region:'europe', currency:'EUR', description:'World\'s largest reinsurer.',         mockPrice:465.40,mockChange: 0.78 },

  // — Crypto Premium (DeFi & Layer-2) —
  { code:'INJ',   finnhubSymbol:'BINANCE:INJUSDT',  name:'Injective',  exchange:'Crypto', region:'crypto', currency:'USD', description:'DeFi exchange protocol.',              mockPrice:28.40, mockChange: 5.34, isCrypto:true },
  { code:'RUNE',  finnhubSymbol:'BINANCE:RUNEUSDT', name:'THORChain',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Decentralised cross-chain liquidity.',mockPrice:5.80,  mockChange: 3.45, isCrypto:true },
  { code:'LDO',   finnhubSymbol:'BINANCE:LDOUSDT',  name:'Lido DAO',   exchange:'Crypto', region:'crypto', currency:'USD', description:'Liquid staking protocol for Ethereum.', mockPrice:1.80,  mockChange: 2.12, isCrypto:true },
  { code:'SNX',   finnhubSymbol:'BINANCE:SNXUSDT',  name:'Synthetix',  exchange:'Crypto', region:'crypto', currency:'USD', description:'Derivatives liquidity protocol.',      mockPrice:2.80,  mockChange: 1.89, isCrypto:true },
  { code:'IMX',   finnhubSymbol:'BINANCE:IMXUSDT',  name:'Immutable X',exchange:'Crypto', region:'crypto', currency:'USD', description:'NFT-focused Ethereum Layer-2.',        mockPrice:1.60,  mockChange: 3.78, isCrypto:true },
  { code:'BLUR',  finnhubSymbol:'BINANCE:BLURUSDT', name:'Blur',        exchange:'Crypto', region:'crypto', currency:'USD', description:'NFT marketplace and aggregator.',      mockPrice:0.38,  mockChange: 4.56, isCrypto:true },
  { code:'PENDLE',finnhubSymbol:'BINANCE:PENDLEUSDT',name:'Pendle',    exchange:'Crypto', region:'crypto', currency:'USD', description:'Yield trading protocol.',              mockPrice:5.40,  mockChange: 6.78, isCrypto:true },
  { code:'JTO',   finnhubSymbol:'BINANCE:JTOUSDT',  name:'Jito',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Solana liquid staking protocol.',      mockPrice:2.80,  mockChange: 3.12, isCrypto:true },
  { code:'PYTH',  finnhubSymbol:'BINANCE:PYTHUSDT', name:'Pyth Network',exchange:'Crypto', region:'crypto', currency:'USD', description:'First-party financial data oracle.',  mockPrice:0.42,  mockChange: 2.45, isCrypto:true },
  { code:'W',     finnhubSymbol:'BINANCE:WUSDT',    name:'Wormhole',   exchange:'Crypto', region:'crypto', currency:'USD', description:'Cross-chain messaging protocol.',      mockPrice:0.45,  mockChange: 3.67, isCrypto:true },

  // ════════════════════════ BUSINESS TIER (300+) ═══════════════════════════

  // — US Speculative / Niche —
  { code:'SPCE',  finnhubSymbol:'SPCE',  name:'Virgin Galactic',exchange:'NYSE',   region:'us', currency:'USD', description:'Commercial spaceflight company.',           mockPrice:1.20,  mockChange: 5.67 },
  { code:'TLRY',  finnhubSymbol:'TLRY',  name:'Tilray',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Cannabis and pharmaceutical company.',      mockPrice:1.80,  mockChange:-1.23 },
  { code:'CLOV',  finnhubSymbol:'CLOV',  name:'Clover Health',  exchange:'NASDAQ', region:'us', currency:'USD', description:'Medicare Advantage insurance company.',     mockPrice:2.40,  mockChange: 2.34 },
  { code:'NKLA',  finnhubSymbol:'NKLA',  name:'Nikola',         exchange:'NASDAQ', region:'us', currency:'USD', description:'EV and hydrogen truck manufacturer.',      mockPrice:0.45,  mockChange:-3.45 },
  { code:'WISH',  finnhubSymbol:'WISH',  name:'ContextLogic',   exchange:'NASDAQ', region:'us', currency:'USD', description:'Mobile e-commerce platform.',               mockPrice:0.42,  mockChange:-2.12 },
  { code:'AI',    finnhubSymbol:'AI',    name:'C3.ai',          exchange:'NYSE',   region:'us', currency:'USD', description:'Enterprise AI software company.',           mockPrice:26.80, mockChange: 4.56 },
  { code:'BBAI',  finnhubSymbol:'BBAI',  name:'BigBear.ai',     exchange:'NYSE',   region:'us', currency:'USD', description:'AI-powered decision intelligence.',         mockPrice:1.80,  mockChange: 5.67 },
  { code:'IONQ',  finnhubSymbol:'IONQ',  name:'IonQ',           exchange:'NYSE',   region:'us', currency:'USD', description:'Quantum computing company.',                mockPrice:8.40,  mockChange: 6.78 },
  { code:'RGTI',  finnhubSymbol:'RGTI',  name:'Rigetti',        exchange:'NASDAQ', region:'us', currency:'USD', description:'Quantum computing hardware and software.',  mockPrice:1.60,  mockChange: 7.89 },
  { code:'RCAT',  finnhubSymbol:'RCAT',  name:'Red Cat Holdings',exchange:'NASDAQ',region:'us', currency:'USD', description:'Drone technology company.',                 mockPrice:4.80,  mockChange: 8.90 },
  { code:'WKHS',  finnhubSymbol:'WKHS',  name:'Workhorse Group',exchange:'NASDAQ', region:'us', currency:'USD', description:'Electric commercial vehicles.',             mockPrice:0.65,  mockChange:-1.23 },
  { code:'DFLI',  finnhubSymbol:'DFLI',  name:'Dragonfly Energy',exchange:'NASDAQ',region:'us', currency:'USD', description:'Lithium battery technology.',               mockPrice:1.20,  mockChange: 3.45 },

  // — US REITs —
  { code:'AMT',   finnhubSymbol:'AMT',  name:'American Tower',  exchange:'NYSE',   region:'us', currency:'USD', description:'REIT specialising in wireless towers.',    mockPrice:185.40, mockChange: 0.45 },
  { code:'PLD',   finnhubSymbol:'PLD',  name:'Prologis',        exchange:'NYSE',   region:'us', currency:'USD', description:'Industrial REIT and logistics properties.', mockPrice:118.60, mockChange: 0.67 },
  { code:'EQIX',  finnhubSymbol:'EQIX', name:'Equinix',         exchange:'NASDAQ', region:'us', currency:'USD', description:'Data centre REIT.',                        mockPrice:820.40, mockChange: 0.89 },
  { code:'O',     finnhubSymbol:'O',    name:'Realty Income',   exchange:'NYSE',   region:'us', currency:'USD', description:'Monthly dividend REIT.',                   mockPrice:56.40,  mockChange: 0.34 },
  { code:'SPG',   finnhubSymbol:'SPG',  name:'Simon Property',  exchange:'NYSE',   region:'us', currency:'USD', description:'Largest US retail REIT.',                  mockPrice:148.40, mockChange: 0.56 },

  // — UK Business —
  { code:'TSCO',  finnhubSymbol:'TSCO.L', name:'Tesco',         exchange:'LSE', region:'uk', currency:'GBP', description:'UK\'s largest supermarket chain.',           mockPrice:365.40, mockChange: 0.34 },
  { code:'LAND',  finnhubSymbol:'LAND.L', name:'Land Securities', exchange:'LSE', region:'uk', currency:'GBP', description:'UK REIT and property developer.',          mockPrice:620.40, mockChange: 0.56 },
  { code:'EXPN',  finnhubSymbol:'EXPN.L', name:'Experian',      exchange:'LSE', region:'uk', currency:'GBP', description:'Global data analytics and credit company.',  mockPrice:3580.0, mockChange: 0.78 },
  { code:'RR',    finnhubSymbol:'RR.L',   name:'Rolls-Royce',   exchange:'LSE', region:'uk', currency:'GBP', description:'British aerospace and defence company.',    mockPrice:480.40, mockChange: 2.12 },

  // — EU Business —
  { code:'ADYEN', finnhubSymbol:'ADYEN.AS', name:'Adyen',       exchange:'Euronext Amsterdam', region:'europe', currency:'EUR', description:'Dutch payment technology company.',    mockPrice:1240.0, mockChange: 1.56 },
  { code:'UMG',   finnhubSymbol:'UMG.AS',  name:'Universal Music', exchange:'Euronext Amsterdam', region:'europe', currency:'EUR', description:'World\'s largest music company.',  mockPrice:24.80, mockChange: 0.89 },
  { code:'HLAG',  finnhubSymbol:'HLAG.DE', name:'Hapag-Lloyd',  exchange:'XETRA',              region:'europe', currency:'EUR', description:'German container shipping company.',  mockPrice:128.40, mockChange:-0.45 },
  { code:'DHL',   finnhubSymbol:'DHL.DE',  name:'DHL Group',    exchange:'XETRA',              region:'europe', currency:'EUR', description:'Global logistics company.',           mockPrice:38.40, mockChange: 0.34 },
  { code:'WDP',   finnhubSymbol:'WDP.BR',  name:'WDP',          exchange:'Euronext Brussels',  region:'europe', currency:'EUR', description:'Belgian warehouse REIT.',             mockPrice:24.80, mockChange: 0.56 },

  // — Crypto Business (small cap alts) —
  { code:'FLOKI', finnhubSymbol:'BINANCE:FLOKIUSDT',name:'Floki',       exchange:'Crypto', region:'crypto', currency:'USD', description:'Meme coin with utility ecosystem.',   mockPrice:0.000185, mockChange: 8.90, isCrypto:true },
  { code:'PEPE',  finnhubSymbol:'BINANCE:PEPEUSDT', name:'Pepe',        exchange:'Crypto', region:'crypto', currency:'USD', description:'Popular meme cryptocurrency.',        mockPrice:0.0000125,mockChange:12.34, isCrypto:true },
  { code:'WIF',   finnhubSymbol:'BINANCE:WIFUSDT',  name:'dogwifhat',   exchange:'Crypto', region:'crypto', currency:'USD', description:'Solana-based meme coin.',             mockPrice:2.80,  mockChange: 9.45, isCrypto:true },
  { code:'BONK',  finnhubSymbol:'BINANCE:BONKUSDT', name:'Bonk',        exchange:'Crypto', region:'crypto', currency:'USD', description:'Solana community meme token.',        mockPrice:0.0000285,mockChange:11.23,isCrypto:true },
  { code:'NOT',   finnhubSymbol:'BINANCE:NOTUSDT',  name:'Notcoin',     exchange:'Crypto', region:'crypto', currency:'USD', description:'TON blockchain tap-to-earn token.',   mockPrice:0.018, mockChange: 7.56, isCrypto:true },
  { code:'IO',    finnhubSymbol:'BINANCE:IOUSDT',   name:'io.net',      exchange:'Crypto', region:'crypto', currency:'USD', description:'Decentralised GPU cloud network.',    mockPrice:3.40,  mockChange: 5.67, isCrypto:true },
  { code:'ZK',    finnhubSymbol:'BINANCE:ZKUSDT',   name:'ZKsync',      exchange:'Crypto', region:'crypto', currency:'USD', description:'ZK-rollup scaling for Ethereum.',     mockPrice:0.18,  mockChange: 4.56, isCrypto:true },
  { code:'ENA',   finnhubSymbol:'BINANCE:ENAUSDT',  name:'Ethena',      exchange:'Crypto', region:'crypto', currency:'USD', description:'Synthetic dollar protocol on Ethereum.',mockPrice:0.68,  mockChange: 6.78, isCrypto:true },
];

// ─── Plan limits ──────────────────────────────────────────────
export const PLAN_CATALOG_SIZES = {
  free:     70,
  pro:      150,
  premium:  300,
  business: 9999,
} as const;

export type UserPlan = keyof typeof PLAN_CATALOG_SIZES;

/** Returns the CatalogItems accessible to a given plan */
export function getCatalogForPlan(plan: UserPlan): CatalogItem[] {
  return STOCKS_CATALOG.slice(0, PLAN_CATALOG_SIZES[plan] ?? PLAN_CATALOG_SIZES.free);
}

/** Returns the minimum plan required to access an item at a given catalog index */
export function getRequiredPlan(index: number): UserPlan {
  if (index < 70)  return 'free';
  if (index < 150) return 'pro';
  if (index < 300) return 'premium';
  return 'business';
}

const CATALOG_MAP = new Map<string, CatalogItem>(STOCKS_CATALOG.map(c => [c.code, c]));

export const DEFAULT_WATCHLISTS: Record<MarketTab, string[]> = {
  us:     ['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','NFLX','JPM'],
  uk:     ['SHEL','AZN','HSBA','BP','ULVR','RIO','DGE','GSK'],
  europe: ['MC','ASML','OR','SAP','SIE','NESN','NOVN','AIR'],
  crypto: ['BTC','ETH','BNB','SOL','XRP','ADA','DOT','AVAX'],
};

// ─── Watchlist hook ───────────────────────────────────────────
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
    resetTab: (tab: MarketTab) =>
      save({ ...watchlists, [tab]: [...DEFAULT_WATCHLISTS[tab]] }),
  };
}

// ─── Quote fetchers ───────────────────────────────────────────
async function fetchQuote(item: CatalogItem): Promise<Partial<MarketAsset> & { error?: boolean }> {
  try {
    if (item.isCrypto) {
      const data = await finnhub('/crypto/candle', {
        symbol: item.finnhubSymbol, resolution: 'D',
        from: String(Math.floor(Date.now()/1000) - 86400),
        to:   String(Math.floor(Date.now()/1000)),
      });
      if (data.s === 'no_data' || !data.c?.length) throw new Error('no data');
      const price = data.c[data.c.length - 1]; const prev = data.c[0];
      const changeAbs = price - prev;
      return { price, changeAbs, change: prev > 0 ? (changeAbs/prev)*100 : 0,
               high: Math.max(...data.h), low: Math.min(...data.l) };
    } else {
      const data = await finnhub('/quote', { symbol: item.finnhubSymbol });
      if (!data.c) throw new Error('no data');
      return { price: data.c, changeAbs: data.d ?? 0, change: data.dp ?? 0,
               high: data.h, low: data.l, open: data.o, prevClose: data.pc };
    }
  } catch { return { error: true }; }
}

async function fetchForex(): Promise<ForexRate[]> {
  const pairs = [
    { from:'USD', to:'EUR', label:'USD/EUR', flag:'🇺🇸' },
    { from:'GBP', to:'EUR', label:'GBP/EUR', flag:'🇬🇧' },
    { from:'USD', to:'GBP', label:'USD/GBP', flag:'💵' },
  ];
  const results: ForexRate[] = [];
  for (const p of pairs) {
    try {
      const data = await finnhub('/forex/rates', { base: p.from });
      const rate = data.quote?.[p.to];
      if (rate) results.push({ pair:`${p.from}/${p.to}`, label:p.label, rate, change:0, flag:p.flag });
    } catch {
      results.push({ pair:p.label, label:p.label, rate:0, change:0, flag:p.flag });
    }
  }
  return results;
}

// ─── Main hook ────────────────────────────────────────────────
export function useMarket(tab: MarketTab, watchlistCodes: string[]) {
  const [assets, setAssets]           = useState<MarketAsset[]>([]);
  const [forex,  setForex]            = useState<ForexRate[]>([]);
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
        changeAbs: (item.mockChange/100)*item.mockPrice,
        currency: item.currency, exchange: item.exchange,
        description: item.description, loading: false, error: false,
      })));
      setLoading(false);
      return;
    }

    setAssets(items.map(item => ({
      code: item.code, name: item.name, price: 0, change: 0, changeAbs: 0,
      currency: item.currency, exchange: item.exchange, loading: true,
    })));

    const results: MarketAsset[] = [];
    for (let i = 0; i < items.length; i += 4) {
      if (abortRef.current) break;
      const chunk = items.slice(i, i+4);
      const quotes = await Promise.all(chunk.map(fetchQuote));
      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j]; const q = quotes[j];
        results.push({
          code: item.code, name: item.name,
          price:     q.error ? item.mockPrice  : (q.price     ?? item.mockPrice),
          change:    q.error ? item.mockChange : (q.change    ?? item.mockChange),
          changeAbs: q.error ? 0 : (q.changeAbs ?? 0),
          currency: item.currency, exchange: item.exchange,
          high: q.high, low: q.low, open: q.open, prevClose: q.prevClose,
          description: item.description, loading: false, error: q.error,
        });
      }
      setAssets([...results, ...items.slice(results.length).map(it => ({
        code:it.code, name:it.name, price:0, change:0, changeAbs:0,
        currency:it.currency, exchange:it.exchange, loading:true,
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
      { pair:'USD/EUR', label:'USD/EUR', rate:0.9200, change:0, flag:'🇺🇸' },
      { pair:'GBP/EUR', label:'GBP/EUR', rate:1.1700, change:0, flag:'🇬🇧' },
      { pair:'USD/GBP', label:'USD/GBP', rate:0.7900, change:0, flag:'💵' },
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

export function getAllMockAssets(): MarketAsset[] {
  return STOCKS_CATALOG.map(item => ({
    code: item.code, name: item.name,
    price: item.mockPrice, change: item.mockChange,
    changeAbs: (item.mockChange/100)*item.mockPrice,
    currency: item.currency, exchange: item.exchange,
    description: item.description, loading: false, error: false,
  }));
}

export const MARKET_INDICES: MarketIndex[] = [
  { name:'FTSE 100',      value:'8,421',  change:'+0.84%', positive:true  },
  { name:'Euro Stoxx 50', value:'5,124',  change:'+1.12%', positive:true  },
  { name:'DAX',           value:'18,765', change:'-0.23%', positive:false },
  { name:'S&P 500',       value:'5,487',  change:'+0.56%', positive:true  },
];

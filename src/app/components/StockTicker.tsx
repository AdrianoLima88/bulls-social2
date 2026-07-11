import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

interface TickerItem {
  code: string;
  price: number;
  change: number;
}

const SYMBOLS = [
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'META', 'AMZN', 'GOOGL', 'JPM',
];

const MOCK: TickerItem[] = [
  { code: 'AAPL',  price: 213.45, change: 1.24  },
  { code: 'MSFT',  price: 432.80, change: 0.85  },
  { code: 'NVDA',  price: 1245.6, change: 4.23  },
  { code: 'TSLA',  price: 248.10, change: -2.14 },
  { code: 'META',  price: 523.80, change: 2.67  },
  { code: 'AMZN',  price: 195.40, change: 1.56  },
  { code: 'GOOGL', price: 178.90, change: -0.45 },
  { code: 'JPM',   price: 221.30, change: 0.73  },
  { code: 'BTC',   price: 67820,  change: 3.45  },
  { code: 'ETH',   price: 3845,   change: 2.12  },
  { code: 'SHEL',  price: 2856.5, change: 1.24  },
  { code: 'AZN',   price: 12845,  change: 0.85  },
];

export const StockTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>(MOCK);

  useEffect(() => {
    if (!API_KEY) return;
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const results: TickerItem[] = [];
        for (const sym of SYMBOLS) {
          if (cancelled) break;
          try {
            const res = await fetch(`${BASE_URL}/quote?symbol=${sym}&token=${API_KEY}`);
            const d = await res.json();
            if (d.c) results.push({ code: sym, price: d.c, change: d.dp ?? 0 });
          } catch { /* skip */ }
        }
        if (!cancelled && results.length > 0) setItems(results);
      } catch { /* use mock */ }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="bg-slate-900 border-b border-slate-700 overflow-hidden flex-shrink-0" style={{ height: 36 }}>
      <style>{`
        @keyframes bulls-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .bulls-ticker-track {
          display: flex;
          width: max-content;
          animation: bulls-ticker ${items.length * 4}s linear infinite;
        }
        .bulls-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="bulls-ticker-track h-full items-center flex">
        {doubled.map((item, i) => {
          const pos = item.change >= 0;
          return (
            <span
              key={i}
              className="flex items-center gap-1 px-4 text-xs font-mono whitespace-nowrap"
            >
              <span className="text-slate-400 font-bold">{item.code}</span>
              <span className="text-white">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {pos
                ? <span className="text-green-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{item.change.toFixed(2)}%</span>
                : <span className="text-red-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />{item.change.toFixed(2)}%</span>
              }
              <span className="text-slate-600 ml-2">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

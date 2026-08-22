import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
export interface FinMetric {
  value: number;
  unit?: string; // 'B' | 'M' | 'K' — for revenue / net income
  yoy: number;   // percentage change year-over-year
}

export interface FinancialReportData {
  companyName: string;
  ticker: string;
  quarter: string;   // 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number;
  result: 'beat' | 'inline' | 'miss';
  metrics: {
    revenue: FinMetric;
    netIncome: FinMetric;
    eps: FinMetric;
    grossMargin: FinMetric; // value = %, yoy = pp change
  };
  highlight?: string;
}

// ── Codec ──────────────────────────────────────────────────────────────────
const PREFIX = '__FIN__';

export function encodeFinancialReport(data: FinancialReportData): string {
  return PREFIX + JSON.stringify(data);
}

export function parseFinancialReport(content: string): FinancialReportData | null {
  try {
    if (!content?.startsWith(PREFIX)) return null;
    return JSON.parse(content.slice(PREFIX.length)) as FinancialReportData;
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const RESULT = {
  beat:   { label: 'BEAT',    bg: 'bg-emerald-500' },
  inline: { label: 'IN-LINE', bg: 'bg-amber-500'   },
  miss:   { label: 'MISS',    bg: 'bg-red-500'      },
} as const;

function fmtValue(metric: FinMetric, isPercent: boolean): string {
  if (isPercent) return `${metric.value.toFixed(1)}%`;
  const v = metric.value;
  return `$${v >= 10 ? v.toFixed(1) : v.toFixed(2)}${metric.unit ?? ''}`;
}

function fmtYoy(yoy: number, isPercent: boolean): string {
  const sign = yoy >= 0 ? '+' : '';
  return `${sign}${yoy.toFixed(1)}${isPercent ? 'pp' : '%'} YoY`;
}

// ── Sub-component: single metric tile ─────────────────────────────────────
function Tile({ label, metric, isPercent = false }: {
  label: string;
  metric: FinMetric;
  isPercent?: boolean;
}) {
  const pos = metric.yoy >= 0;
  return (
    <div className="bg-white/8 rounded-2xl p-3 backdrop-blur-sm border border-white/5">
      <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white text-lg font-black leading-none mb-1">{fmtValue(metric, isPercent)}</p>
      <div className={`flex items-center gap-1 ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
        {pos
          ? <TrendingUp className="w-3 h-3 flex-shrink-0" />
          : <TrendingDown className="w-3 h-3 flex-shrink-0" />
        }
        <span className="text-[11px] font-bold">{fmtYoy(metric.yoy, isPercent)}</span>
      </div>
    </div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────
export function FinancialReportCard({ data }: { data: FinancialReportData }) {
  const res = RESULT[data.result] ?? RESULT.inline;
  const initials = data.ticker.slice(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Dark gradient body ── */}
      <div
        className="p-4"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Ticker badge */}
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-black text-base">{initials}</span>
            </div>
            <div>
              <p className="text-white font-black text-xl leading-none">{data.ticker}</p>
              <p className="text-white/50 text-xs mt-0.5">{data.companyName}</p>
            </div>
          </div>

          {/* Period + result */}
          <div className="text-right flex-shrink-0">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black tracking-wider text-white ${res.bg}`}>
              {res.label}
            </span>
            <p className="text-white/40 text-xs mt-1 font-semibold">
              {data.quarter} {data.year} · Earnings
            </p>
          </div>
        </div>

        {/* Metrics 2×2 grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile label="Revenue"     metric={data.metrics.revenue}    />
          <Tile label="Net Income"  metric={data.metrics.netIncome}  />
          <Tile label="EPS"         metric={data.metrics.eps}        />
          <Tile label="Gross Margin" metric={data.metrics.grossMargin} isPercent />
        </div>

        {/* Highlight quote */}
        {data.highlight && (
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/8 mb-3">
            <p className="text-white/70 text-sm leading-relaxed italic">
              "{data.highlight}"
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <p className="text-white/25 text-[10px] font-semibold">
            BullsGo Business · Official Earnings Disclosure
          </p>
        </div>
      </div>
    </div>
  );
}

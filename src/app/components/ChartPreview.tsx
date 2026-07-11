import React from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Layers, Circle } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartPieChart, Pie, Cell,
  ScatterChart, Scatter,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// Theme color map (mirrors AddChartModal)
const THEME_COLORS: Record<string, { bg: string; colors: string[]; isDark: boolean }> = {
  bulls:  { bg: '#f0fdf4', colors: ['#16a34a','#4ade80','#166534','#86efac','#15803d'], isDark: false },
  ocean:  { bg: '#eff6ff', colors: ['#1d4ed8','#60a5fa','#1e40af','#93c5fd','#3b82f6'], isDark: false },
  sunset: { bg: '#fff7ed', colors: ['#ea580c','#fb923c','#c2410c','#fed7aa','#f97316'], isDark: false },
  violet: { bg: '#faf5ff', colors: ['#7c3aed','#a78bfa','#5b21b6','#ddd6fe','#8b5cf6'], isDark: false },
  multi:  { bg: '#f8fafc', colors: ['#16a34a','#1d4ed8','#ea580c','#7c3aed','#0891b2'], isDark: false },
  dark:   { bg: '#0f172a', colors: ['#22d3ee','#a3e635','#f472b6','#fb923c','#818cf8'], isDark: true  },
  // Legacy fallback
  default:{ bg: '#f0fdf4', colors: ['#10b981','#059669','#047857','#065f46','#064e3b'], isDark: false },
};

const TYPE_META = {
  line:     { label: 'Line',     Icon: TrendingUp },
  area:     { label: 'Area',     Icon: Activity },
  bar:      { label: 'Bar',      Icon: BarChart3 },
  composed: { label: 'Combined', Icon: Layers },
  pie:      { label: 'Pie',      Icon: PieChart },
  scatter:  { label: 'Scatter',  Icon: Circle },
};

const CustomTooltip = ({ active, payload, label, unit, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-lg px-3 py-2 shadow-xl text-xs border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {unit}{Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
};

export const ChartPreview = ({ chart, uniqueId = '' }) => {
  const {
    type = 'line',
    title,
    data = [],
    theme: themeName,
    unit = '',
    showGrid = true,
    smoothCurve = true,
    showLegend = true,
    series = [],
  } = chart;

  const reactId = React.useId();
  const instanceId = `${uniqueId}-${reactId}`;

  // Resolve theme (with legacy fallback to 'default')
  const themeKey = (themeName && THEME_COLORS[themeName]) ? themeName : 'default';
  const { bg, colors, isDark } = THEME_COLORS[themeKey];

  const s1Label = series[0]?.label || 'Value';
  const s2Label = series[1]?.label || 'Value 2';
  const hasS2 = series.length > 1 && data.some((d: any) => d.value2 !== undefined);

  const chartData = React.useMemo(() =>
    data.map((item: any, idx: number) => ({
      name: item.label || `#${idx + 1}`,
      [s1Label]: item.value ?? 0,
      ...(hasS2 ? { [s2Label]: item.value2 ?? 0 } : {}),
    })),
    [data, s1Label, s2Label, hasS2]
  );

  const scatterData = React.useMemo(() =>
    data.map((item: any) => ({ x: item.value ?? 0, y: item.value2 ?? 0 })),
    [data]
  );

  const axisStyle = { fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' };
  const gridProps = showGrid ? { strokeDasharray: '3 3', stroke: isDark ? '#1e293b' : '#e2e8f0' } : null;
  const curveType = smoothCurve ? 'monotone' : ('linear' as any);
  const commonProps: any = { data: chartData, margin: { top: 12, right: 16, left: -8, bottom: 0 } };

  const renderChart = () => {
    if (!data.length) {
      return (
        <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
          No data
        </div>
      );
    }

    if (type === 'line') return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart {...commonProps}>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={(v: number) => `${unit}${v.toLocaleString()}`} width={50} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          <Line type={curveType} dataKey={s1Label} stroke={colors[0]} strokeWidth={2.5} dot={{ r: 3.5, fill: colors[0] }} isAnimationActive={false} />
          {hasS2 && <Line type={curveType} dataKey={s2Label} stroke={colors[1]} strokeWidth={2.5} dot={{ r: 3.5, fill: colors[1] }} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    );

    if (type === 'area') return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={`g1-${instanceId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`g2-${instanceId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[1]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[1]} stopOpacity={0} />
            </linearGradient>
          </defs>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={(v: number) => `${unit}${v.toLocaleString()}`} width={50} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          <Area type={curveType} dataKey={s1Label} stroke={colors[0]} fill={`url(#g1-${instanceId})`} strokeWidth={2.5} isAnimationActive={false} />
          {hasS2 && <Area type={curveType} dataKey={s2Label} stroke={colors[1]} fill={`url(#g2-${instanceId})`} strokeWidth={2.5} isAnimationActive={false} />}
        </AreaChart>
      </ResponsiveContainer>
    );

    if (type === 'bar') return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart {...commonProps}>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={(v: number) => `${unit}${v.toLocaleString()}`} width={50} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          <Bar dataKey={s1Label} fill={colors[0]} radius={[4,4,0,0]} isAnimationActive={false} />
          {hasS2 && <Bar dataKey={s2Label} fill={colors[1]} radius={[4,4,0,0]} isAnimationActive={false} />}
        </BarChart>
      </ResponsiveContainer>
    );

    if (type === 'composed') return (
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart {...commonProps}>
          <defs>
            <linearGradient id={`gc-${instanceId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={(v: number) => `${unit}${v.toLocaleString()}`} width={50} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          <Bar dataKey={s1Label} fill={colors[0]} opacity={0.8} radius={[3,3,0,0]} isAnimationActive={false} />
          {hasS2 && <Line type={curveType} dataKey={s2Label} stroke={colors[1]} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    );

    if (type === 'pie') {
      const pieData = data.map((item: any, idx: number) => ({
        name: item.label || `#${idx + 1}`,
        value: item.value ?? 0,
      }));
      const total = pieData.reduce((s: number, d: any) => s + d.value, 0);

      return (
        <ResponsiveContainer width="100%" height={220}>
          <RechartPieChart>
            <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={3}
              isAnimationActive={false}
              label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((_: any, i: number) => (
                <Cell key={`cell-${instanceId}-${i}`} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </RechartPieChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'scatter') return (
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 12, right: 16, left: -8, bottom: 0 }}>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="x" name={s1Label} tick={axisStyle} tickFormatter={(v: number) => `${unit}${v}`} />
          <YAxis dataKey="y" name={s2Label} tick={axisStyle} tickFormatter={(v: number) => `${unit}${v}`} width={50} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          <Scatter data={scatterData} fill={colors[0]} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    );

    // Fallback — unknown type, render as line
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart {...commonProps}>
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} width={50} />
          <Tooltip />
          <Line type="monotone" dataKey={s1Label} stroke={colors[0]} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const meta = TYPE_META[type] || TYPE_META['line'];
  const TypeIcon = meta.Icon;

  return (
    <div
      className="rounded-2xl border overflow-hidden mb-3"
      style={{ borderColor: isDark ? '#1e293b' : '#e2e8f0' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2 border-b"
        style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}
      >
        <TypeIcon className="w-4 h-4" style={{ color: colors[0] }} />
        <h4 className="font-bold flex-1 text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          {title}
        </h4>
        <span
          className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ backgroundColor: isDark ? '#0f172a' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' }}
        >
          {meta.label}
        </span>
      </div>

      {/* Chart */}
      <div className="p-4" style={{ backgroundColor: bg }}>
        {renderChart()}
      </div>
    </div>
  );
};

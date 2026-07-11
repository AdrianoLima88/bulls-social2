import React, { useState } from 'react';
import {
  X, TrendingUp, BarChart3, PieChart, Plus, Trash2,
  Activity, Layers, Circle, Settings2, Table2,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartPie, Pie, Cell,
  ScatterChart, Scatter,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Color themes ─────────────────────────────────────────────────────────────
const THEMES = {
  bulls:   { label: 'Bulls',   bg: '#f0fdf4', colors: ['#16a34a','#4ade80','#166534','#86efac','#15803d'] },
  ocean:   { label: 'Ocean',   bg: '#eff6ff', colors: ['#1d4ed8','#60a5fa','#1e40af','#93c5fd','#3b82f6'] },
  sunset:  { label: 'Sunset',  bg: '#fff7ed', colors: ['#ea580c','#fb923c','#c2410c','#fed7aa','#f97316'] },
  violet:  { label: 'Violet',  bg: '#faf5ff', colors: ['#7c3aed','#a78bfa','#5b21b6','#ddd6fe','#8b5cf6'] },
  multi:   { label: 'Multi',   bg: '#f8fafc', colors: ['#16a34a','#1d4ed8','#ea580c','#7c3aed','#0891b2'] },
  dark:    { label: 'Dark',    bg: '#0f172a', colors: ['#22d3ee','#a3e635','#f472b6','#fb923c','#818cf8'] },
};

const UNITS = ['', '€', '$', '%', 'pts', 'K', 'M', 'B'];

const CHART_TYPES = [
  { id: 'line',     label: 'Line',     Icon: TrendingUp },
  { id: 'area',     label: 'Area',     Icon: Activity },
  { id: 'bar',      label: 'Bar',      Icon: BarChart3 },
  { id: 'composed', label: 'Combined', Icon: Layers },
  { id: 'pie',      label: 'Pie',      Icon: PieChart },
  { id: 'scatter',  label: 'Scatter',  Icon: Circle },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DEFAULT_POINTS = [
  { label: 'Jan', v1: '', v2: '' },
  { label: 'Feb', v1: '', v2: '' },
  { label: 'Mar', v1: '', v2: '' },
  { label: 'Apr', v1: '', v2: '' },
  { label: 'May', v1: '', v2: '' },
  { label: 'Jun', v1: '', v2: '' },
];

// ─── Tooltip custom ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-lg px-3 py-2 shadow-xl text-xs border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {unit}{Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
export const AddChartModal = ({ onClose, onAddChart }) => {
  const [tab, setTab] = useState<'data' | 'style'>('data');
  const [chartType, setChartType] = useState('area');
  const [chartTitle, setChartTitle] = useState('');
  const [series1Label, setSeries1Label] = useState('Series 1');
  const [series2Label, setSeries2Label] = useState('Series 2');
  const [showSeries2, setShowSeries2] = useState(false);
  const [points, setPoints] = useState(DEFAULT_POINTS);
  const [theme, setTheme] = useState<keyof typeof THEMES>('bulls');
  const [unit, setUnit] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [smoothCurve, setSmoothCurve] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  const isDark = theme === 'dark';
  const colors = THEMES[theme].colors;
  const previewBg = THEMES[theme].bg;

  const validPoints = points.filter(p => p.label && p.v1);
  const chartData = validPoints.map(p => ({
    name: p.label,
    [series1Label]: parseFloat(p.v1) || 0,
    ...(showSeries2 && p.v2 ? { [series2Label]: parseFloat(p.v2) || 0 } : {}),
  }));
  const scatterData = validPoints.map(p => ({ x: parseFloat(p.v1) || 0, y: parseFloat(p.v2) || 0, name: p.label }));

  const addPoint = () => setPoints(prev => [...prev, { label: '', v1: '', v2: '' }]);
  const removePoint = (i: number) => setPoints(prev => prev.filter((_, idx) => idx !== i));
  const updatePoint = (i: number, field: 'label' | 'v1' | 'v2', val: string) =>
    setPoints(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const handleCreate = () => {
    if (!chartTitle.trim()) { alert('Please enter a chart title'); return; }
    if (validPoints.length < 2) { alert('Add at least 2 data points'); return; }
    onAddChart({
      type: chartType,
      title: chartTitle,
      theme,
      unit,
      showGrid,
      smoothCurve,
      showLegend,
      series: showSeries2
        ? [{ label: series1Label }, { label: series2Label }]
        : [{ label: series1Label }],
      data: validPoints.map(p => ({
        label: p.label,
        value: parseFloat(p.v1) || 0,
        value2: showSeries2 ? (parseFloat(p.v2) || 0) : undefined,
      })),
    });
    onClose();
  };

  // ─── Shared axis props ───────────────────────────────────────────────────
  const axisStyle = { fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' };
  const gridProps = showGrid ? { strokeDasharray: '3 3', stroke: isDark ? '#1e293b' : '#e2e8f0' } : null;

  const renderPreview = () => {
    if (validPoints.length < 2) {
      return (
        <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
          Add at least 2 data points to see preview
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 8, right: 12, left: -10, bottom: 0 },
    };

    const curveType = smoothCurve ? 'monotone' : 'linear';

    if (chartType === 'line') return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart {...commonProps}>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={v => `${unit}${v}`} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
          <Line type={curveType} dataKey={series1Label} stroke={colors[0]} strokeWidth={2.5} dot={{ r: 3, fill: colors[0] }} />
          {showSeries2 && <Line type={curveType} dataKey={series2Label} stroke={colors[1]} strokeWidth={2.5} dot={{ r: 3, fill: colors[1] }} />}
        </LineChart>
      </ResponsiveContainer>
    );

    if (chartType === 'area') return (
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[1]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[1]} stopOpacity={0} />
            </linearGradient>
          </defs>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={v => `${unit}${v}`} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
          <Area type={curveType} dataKey={series1Label} stroke={colors[0]} fill="url(#grad1)" strokeWidth={2.5} />
          {showSeries2 && <Area type={curveType} dataKey={series2Label} stroke={colors[1]} fill="url(#grad2)" strokeWidth={2.5} />}
        </AreaChart>
      </ResponsiveContainer>
    );

    if (chartType === 'bar') return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart {...commonProps}>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={v => `${unit}${v}`} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
          <Bar dataKey={series1Label} fill={colors[0]} radius={[4,4,0,0]} />
          {showSeries2 && <Bar dataKey={series2Label} fill={colors[1]} radius={[4,4,0,0]} />}
        </BarChart>
      </ResponsiveContainer>
    );

    if (chartType === 'composed') return (
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart {...commonProps}>
          <defs>
            <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={v => `${unit}${v}`} />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
          <Bar dataKey={series1Label} fill={colors[0]} opacity={0.8} radius={[3,3,0,0]} />
          {showSeries2 && <Line type={curveType} dataKey={series2Label} stroke={colors[1]} strokeWidth={2.5} dot={{ r: 3 }} />}
        </ComposedChart>
      </ResponsiveContainer>
    );

    if (chartType === 'pie') {
      const pieData = validPoints.map(p => ({ name: p.label, value: parseFloat(p.v1) || 0 }));
      return (
        <ResponsiveContainer width="100%" height={180}>
          <RechartPie>
            <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
              innerRadius={40} outerRadius={75} paddingAngle={3}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </RechartPie>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={180}>
          <ScatterChart margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            {gridProps && <CartesianGrid {...gridProps} />}
            <XAxis dataKey="x" name={series1Label} tick={axisStyle} tickFormatter={v => `${unit}${v}`} />
            <YAxis dataKey="y" name={series2Label} tick={axisStyle} tickFormatter={v => `${unit}${v}`} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip unit={unit} isDark={isDark} />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
            <Scatter data={scatterData} fill={colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chart Builder</h2>
            <p className="text-xs text-slate-500">Professional financial chart</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setTab('data')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
              tab === 'data' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Table2 className="w-4 h-4" /> Data
          </button>
          <button
            onClick={() => setTab('style')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
              tab === 'style' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Style
          </button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto">

          {tab === 'data' && (
            <div className="p-5 space-y-5">

              {/* Chart type */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Chart Type</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {CHART_TYPES.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setChartType(id)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition text-xs font-semibold ${
                        chartType === id
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${chartType === id ? 'text-green-600' : 'text-slate-400'}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Title</label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={e => setChartTitle(e.target.value)}
                  placeholder="E.g. PETR4 — 12-month performance"
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-green-500 transition"
                />
              </div>

              {/* Series labels */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Series</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={series1Label}
                    onChange={e => setSeries1Label(e.target.value)}
                    placeholder="Series 1 name"
                    className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-green-500"
                  />
                  {chartType !== 'pie' && (
                    <button
                      onClick={() => setShowSeries2(!showSeries2)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${
                        showSeries2
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-dashed border-slate-300 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {showSeries2 ? '− Remove 2nd' : '+ Add 2nd'}
                    </button>
                  )}
                </div>
                {showSeries2 && chartType !== 'pie' && (
                  <input
                    type="text"
                    value={series2Label}
                    onChange={e => setSeries2Label(e.target.value)}
                    placeholder="Series 2 name"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-green-500"
                  />
                )}
              </div>

              {/* Data points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data Points</label>
                  <button onClick={addPoint} className="text-green-600 hover:text-green-700 text-xs font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add row
                  </button>
                </div>

                {/* Header row */}
                <div className={`grid gap-2 mb-1 text-xs font-semibold text-slate-400 px-1 ${showSeries2 && chartType !== 'pie' ? 'grid-cols-[1fr_1fr_1fr_20px]' : 'grid-cols-[1fr_1fr_20px]'}`}>
                  <span>Label</span>
                  <span>{chartType === 'scatter' ? 'X value' : series1Label}</span>
                  {showSeries2 && chartType !== 'pie' && <span>{chartType === 'scatter' ? 'Y value' : series2Label}</span>}
                  <span />
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {points.map((point, i) => (
                    <div key={i} className={`grid gap-2 items-center ${showSeries2 && chartType !== 'pie' ? 'grid-cols-[1fr_1fr_1fr_20px]' : 'grid-cols-[1fr_1fr_20px]'}`}>
                      <input
                        type="text"
                        value={point.label}
                        onChange={e => updatePoint(i, 'label', e.target.value)}
                        placeholder="Jan / Q1 / ..."
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-green-400 bg-slate-50"
                      />
                      <input
                        type="number"
                        value={point.v1}
                        onChange={e => updatePoint(i, 'v1', e.target.value)}
                        placeholder="0"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-green-400 bg-slate-50"
                      />
                      {showSeries2 && chartType !== 'pie' && (
                        <input
                          type="number"
                          value={point.v2}
                          onChange={e => updatePoint(i, 'v2', e.target.value)}
                          placeholder="0"
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-green-400 bg-slate-50"
                        />
                      )}
                      <button
                        onClick={() => removePoint(i)}
                        disabled={points.length <= 2}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-0 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'style' && (
            <div className="p-5 space-y-5">

              {/* Color theme */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition ${
                        theme === key ? 'border-green-600 bg-green-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {t.colors.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Y-axis unit */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Y-Axis Unit</label>
                <div className="flex flex-wrap gap-2">
                  {UNITS.map(u => (
                    <button
                      key={u || 'none'}
                      onClick={() => setUnit(u)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition ${
                        unit === u ? 'border-green-600 bg-green-50 text-green-800' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {u || 'None'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Options</label>

                {[
                  { label: 'Show grid lines', value: showGrid, setter: setShowGrid },
                  { label: 'Smooth curves', value: smoothCurve, setter: setSmoothCurve, hide: !['line','area','composed'].includes(chartType) },
                  { label: 'Show legend', value: showLegend, setter: setShowLegend },
                ].filter(o => !o.hide).map(({ label, value, setter }) => (
                  <div key={label} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <button
                      onClick={() => setter(!value)}
                      className={`w-10 h-5 rounded-full transition relative ${value ? 'bg-green-600' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${value ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview */}
          <div className="mx-5 mb-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Live Preview</p>
            <div
              className="rounded-2xl p-4 border-2 transition"
              style={{
                backgroundColor: previewBg,
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
            >
              {chartTitle && (
                <p className={`text-sm font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {chartTitle}
                </p>
              )}
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!chartTitle.trim() || validPoints.length < 2}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-40 text-sm"
          >
            Add Chart
          </button>
        </div>
      </div>
    </div>
  );
};

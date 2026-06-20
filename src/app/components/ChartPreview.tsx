import React from 'react';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ChartPreview = ({ chart, uniqueId = '' }) => {
  const { type, title, data } = chart;

  const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#0d9488'];

  // Usar useId do React para garantir IDs únicos
  const reactId = React.useId();
  const instanceId = `${uniqueId}-${reactId}`;

  // Memoizar dados do gráfico para evitar recriação
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item, idx) => ({
      ...item,
      _uniqueKey: `${instanceId}-data-${idx}`
    }));
  }, [data, instanceId]);

  const renderChart = () => {
    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={250} key={`rc-${instanceId}`}>
          <LineChart id={`linechart-${instanceId}`} data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="_uniqueKey"
              tickFormatter={(value, index) => chartData[index]?.label || ''}
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <Tooltip
              labelFormatter={(value, payload) => {
                const item = payload?.[0]?.payload;
                return item?.label || value;
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={250} key={`rc-${instanceId}`}>
          <BarChart id={`barchart-${instanceId}`} data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="_uniqueKey"
              tickFormatter={(value, index) => chartData[index]?.label || ''}
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: '500' }}
            />
            <Tooltip
              labelFormatter={(value, payload) => {
                const item = payload?.[0]?.payload;
                return item?.label || value;
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      const total = chartData.reduce((sum, d) => sum + d.value, 0);
      const pieData = chartData.map((item, index) => ({
        name: item.label,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(1),
        _uniqueKey: `${instanceId}-pie-${index}`
      }));

      return (
        <ResponsiveContainer width="100%" height={280} key={`rc-${instanceId}`}>
          <RechartPieChart id={`piechart-${instanceId}`}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry._uniqueKey} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => `${value}: ${entry.payload.value} (${entry.payload.percentage}%)`}
            />
          </RechartPieChart>
        </ResponsiveContainer>
      );
    }
  };

  const getIcon = () => {
    if (type === 'line') return <TrendingUp className="w-5 h-5" />;
    if (type === 'bar') return <BarChart3 className="w-5 h-5" />;
    if (type === 'pie') return <PieChart className="w-5 h-5" />;
  };

  const getTypeLabel = () => {
    if (type === 'line') return 'Linha';
    if (type === 'bar') return 'Barras';
    if (type === 'pie') return 'Pizza';
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-2xl border border-slate-200 overflow-hidden mb-3">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-2">
        <div className="text-green-600">
          {getIcon()}
        </div>
        <h4 className="font-bold text-slate-900 flex-1">{title}</h4>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {getTypeLabel()}
        </span>
      </div>
      
      {/* Chart */}
      <div className="p-4 bg-white">
        {renderChart()}
      </div>
    </div>
  );
};
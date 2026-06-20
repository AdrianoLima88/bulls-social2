import React, { useState } from 'react';
import { X, TrendingUp, BarChart3, PieChart, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AddChartModal = ({ onClose, onAddChart }) => {
  const [chartType, setChartType] = useState('line');
  const [chartTitle, setChartTitle] = useState('');
  const [dataPoints, setDataPoints] = useState([
    { label: 'Jan', value: '' },
    { label: 'Feb', value: '' },
    { label: 'Mar', value: '' },
  ]);

  const handleAddDataPoint = () => {
    setDataPoints([...dataPoints, { label: '', value: '' }]);
  };

  const handleRemoveDataPoint = (index) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  const handleUpdateDataPoint = (index, field, value) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index][field] = value;
    setDataPoints(newDataPoints);
  };

  const handleCreate = () => {
    if (!chartTitle.trim()) {
      alert('Digite um título para o gráfico');
      return;
    }

    const validDataPoints = dataPoints.filter(dp => dp.label && dp.value);
    if (validDataPoints.length < 2) {
      alert('Add at least 2 valid data points');
      return;
    }

    onAddChart({
      type: chartType,
      title: chartTitle,
      data: validDataPoints.map(dp => ({
        label: dp.label,
        value: parseFloat(dp.value),
      })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Add Chart</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Chart Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Chart Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  chartType === 'line'
                    ? 'border-green-600 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <TrendingUp className={`w-6 h-6 ${chartType === 'line' ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${chartType === 'line' ? 'text-green-900' : 'text-slate-600'}`}>
                  Line
                </span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  chartType === 'bar'
                    ? 'border-green-600 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <BarChart3 className={`w-6 h-6 ${chartType === 'bar' ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${chartType === 'bar' ? 'text-green-900' : 'text-slate-600'}`}>
                  Bar
                </span>
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  chartType === 'pie'
                    ? 'border-green-600 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <PieChart className={`w-6 h-6 ${chartType === 'pie' ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${chartType === 'pie' ? 'text-green-900' : 'text-slate-600'}`}>
                  Pie
                </span>
              </button>
            </div>
          </div>

          {/* Chart Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Chart Title
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="E.g. Portfolio Growth 2024"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Dados */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-900">
                Chart Data
              </label>
              <button
                onClick={handleAddDataPoint}
                className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {dataPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={point.label}
                    onChange={(e) => handleUpdateDataPoint(index, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) => handleUpdateDataPoint(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  {dataPoints.length > 2 && (
                    <button
                      onClick={() => handleRemoveDataPoint(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Preview</p>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 text-center">
                {chartTitle || 'Chart Title'}
              </h4>
              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={dataPoints.filter(dp => dp.label && dp.value).map(dp => ({ name: dp.label, value: parseFloat(dp.value) || 0 }))}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={dataPoints.filter(dp => dp.label && dp.value).map(dp => ({ name: dp.label, value: parseFloat(dp.value) || 0 }))}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height={150}>
                  <RechartPieChart data={dataPoints.filter(dp => dp.label && dp.value).map(dp => ({ name: dp.label, value: parseFloat(dp.value) || 0 }))}>
                    <Tooltip />
                    <Legend />
                    <Pie
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {dataPoints.filter(dp => dp.label && dp.value).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? ['#8884d8', '#82ca9d', '#ffc658'][index] : '#8884d8'} />
                      ))}
                    </Pie>
                  </RechartPieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
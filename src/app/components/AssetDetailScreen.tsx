import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, TrendingUp, TrendingDown, Plus, Minus, Calendar,
  DollarSign, BarChart3, AlertCircle, Trash2, X, Bell, BellOff,
  Crown, ChevronDown, ChevronUp, Check,
} from 'lucide-react';
import { usePriceAlerts } from '../../hooks/usePriceAlerts';
import { useSubscription } from '../../hooks/useSubscription';

// ─── Componente de modal para criar alerta ───────────────────────────────────
const CreateAlertModal: React.FC<{
  asset: any;
  onClose: () => void;
  onCreate: (target: number, direction: 'above' | 'below') => Promise<void>;
}> = ({ asset, onClose, onCreate }) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [saving, setSaving] = useState(false);
  const currency = asset.type === 'crypto' || asset.type === 'international' ? '$' : '€';

  const handleSave = async () => {
    const val = parseFloat(targetPrice.replace(',', '.'));
    if (!val || val <= 0) return;
    setSaving(true);
    await onCreate(val, direction);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> New Price Alert
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          You will be notified when <span className="font-semibold text-slate-800">{asset.code}</span> reaches your target price.
        </p>

        {/* Direcção */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setDirection('above')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              direction === 'above'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Price rises above
          </button>
          <button
            onClick={() => setDirection('below')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              direction === 'below'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" /> Price falls below
          </button>
        </div>

        {/* Preço alvo */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Target price ({currency})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{currency}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder={`e.g. ${asset.currentPrice?.toFixed(2) ?? '0.00'}`}
              className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Current price: {currency}{asset.currentPrice?.toFixed(2) ?? '—'}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!targetPrice || saving}
            className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            Set Alert
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
export const AssetDetailScreen = ({ asset, onBack, onAddMore, onSell, onNavigateToPremium }: {
  asset: any;
  onBack: () => void;
  onAddMore: (asset: any) => void;
  onSell: (asset: any) => void;
  onNavigateToPremium?: () => void;
}) => {
  const [showActions, setShowActions]     = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showAlerts, setShowAlerts]       = useState(true);

  const { isPremium } = useSubscription();
  const { alertsForAsset, createAlert, deleteAlert, checkAlerts } = usePriceAlerts();
  const assetAlerts = alertsForAsset(asset.code);

  // Verificar alertas ao montar (quando temos preço actual)
  useEffect(() => {
    if (asset.currentPrice) {
      checkAlerts(asset.code, asset.currentPrice);
    }
  }, [asset.code, asset.currentPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateAlert = async (target: number, direction: 'above' | 'below') => {
    await createAlert({
      asset_code: asset.code,
      asset_type: asset.type,
      target_price: target,
      direction,
    });
  };

  const invested   = asset.quantity * asset.avgPrice;
  const current    = asset.quantity * asset.currentPrice;
  const profit     = current - invested;
  const profitPct  = ((profit / invested) * 100);
  const isPositive = profit >= 0;
  const currency   = asset.type === 'crypto' || asset.type === 'international' ? '$' : '€';

  const history = [
    { date: '15/01/2024', type: 'buy', quantity: 50, price: 32.40, total: 1620.00 },
    { date: '22/02/2024', type: 'buy', quantity: 30, price: 36.80, total: 1104.00 },
    { date: '10/03/2024', type: 'buy', quantity: 20, price: 37.20, total: 744.00 },
  ];

  const getAssetInfo = () => {
    switch (asset.type) {
      case 'acao':
        return {
          name:          asset.code === 'PETR4' ? 'Petrobras PN' : asset.code === 'VALE3' ? 'Vale ON' : asset.code === 'ITUB4' ? 'Itaú Unibanco PN' : asset.code,
          sector:        'Petróleo e Gás',
          dividendYield: '8.5%',
          pe:            '4.2x',
        };
      case 'fii':
        return { name: asset.code === 'HGLG11' ? 'CSHG Logística FII' : asset.code, sector: 'Logística', dividendYield: '9.2%', pvp: '0.95x' };
      case 'crypto':
        return { name: asset.code === 'BTC' ? 'Bitcoin' : asset.code === 'ETH' ? 'Ethereum' : asset.code, marketCap: 'US$ 1.2T', volume24h: 'US$ 45.8B' };
      default:
        return { name: asset.code };
    }
  };

  const assetInfo = getAssetInfo();

  const headerBg =
    asset.type === 'acao'    ? 'bg-blue-600' :
    asset.type === 'fii'     ? 'bg-green-600' :
    asset.type === 'crypto'  ? 'bg-orange-600' :
    'bg-purple-600';

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className={`z-50 flex-shrink-0 ${headerBg}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">{asset.code}</h1>
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <BarChart3 className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Card de resumo */}
        <div className={`p-6 text-white ${headerBg}`}>
          <div className="mb-4">
            <h2 className="text-2xl font-black mb-1">{asset.code}</h2>
            <p className="text-white/80 text-sm">{assetInfo.name}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/80 text-sm mb-2">Current Value</p>
            <p className="text-4xl font-black mb-3">
              {currency} {current.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isPositive ? 'bg-white/20' : 'bg-red-500/30'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-bold">
                {isPositive ? '+' : ''}{currency} {Math.abs(profit).toLocaleString('en-IE', { minimumFractionDigits: 2 })} ({profitPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Posição */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Current Position
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 text-sm mb-1">Quantity</p>
                <p className="text-lg font-bold text-slate-900">{asset.quantity.toLocaleString('en-IE', { maximumFractionDigits: 8 })}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Avg Price</p>
                <p className="text-lg font-bold text-slate-900">{currency} {asset.avgPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Current Price</p>
                <p className="text-lg font-bold text-green-600">{currency} {asset.currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Invested</p>
                <p className="text-lg font-bold text-slate-900">{currency} {invested.toLocaleString('en-IE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Fundamentais */}
          {asset.type === 'acao' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Fundamentals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-slate-500 text-sm mb-1">Sector</p><p className="font-semibold text-slate-900">{assetInfo.sector}</p></div>
                <div><p className="text-slate-500 text-sm mb-1">P/E</p><p className="font-semibold text-slate-900">{assetInfo.pe}</p></div>
                <div><p className="text-slate-500 text-sm mb-1">Dividend Yield</p><p className="font-semibold text-green-600">{assetInfo.dividendYield}</p></div>
              </div>
            </div>
          )}

          {asset.type === 'fii' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Indicadores</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-slate-500 text-sm mb-1">Segmento</p><p className="font-semibold text-slate-900">{assetInfo.sector}</p></div>
                <div><p className="text-slate-500 text-sm mb-1">P/VP</p><p className="font-semibold text-slate-900">{assetInfo.pvp}</p></div>
                <div><p className="text-slate-500 text-sm mb-1">Dividend Yield</p><p className="font-semibold text-green-600">{assetInfo.dividendYield}</p></div>
              </div>
            </div>
          )}

          {asset.type === 'crypto' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Market</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-slate-500 text-sm mb-1">Market Cap</p><p className="font-semibold text-slate-900">{assetInfo.marketCap}</p></div>
                <div><p className="text-slate-500 text-sm mb-1">Volume 24h</p><p className="font-semibold text-slate-900">{assetInfo.volume24h}</p></div>
              </div>
            </div>
          )}

          {/* ── ALERTAS DE PREÇO (Premium) ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-full flex items-center justify-between p-4"
            >
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Price Alerts
                {assetAlerts.filter(a => a.is_active).length > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {assetAlerts.filter(a => a.is_active).length}
                  </span>
                )}
                {!isPremium && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
              </h3>
              {showAlerts ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {showAlerts && (
              <div className="px-4 pb-4">
                {!isPremium ? (
                  /* Gate para utilizadores não-premium */
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-semibold text-amber-900 mb-1">Premium feature</p>
                    <p className="text-xs text-amber-700 mb-3">
                      Set custom price alerts and get notified when {asset.code} hits your target.
                    </p>
                    <button
                      onClick={onNavigateToPremium}
                      className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-600 transition"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Alertas activos */}
                    {assetAlerts.filter(a => a.is_active).length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {assetAlerts.filter(a => a.is_active).map(alert => (
                          <div
                            key={alert.id}
                            className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              {alert.direction === 'above' ? (
                                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {alert.direction === 'above' ? 'Above' : 'Below'} {currency}{Number(alert.target_price).toFixed(2)}
                                </p>
                                <p className="text-xs text-slate-400">Active</p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition"
                            >
                              <X className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-3">No active alerts for {asset.code}</p>
                    )}

                    {/* Alertas já disparados */}
                    {assetAlerts.filter(a => !a.is_active && a.triggered_at).length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Triggered</p>
                        {assetAlerts.filter(a => !a.is_active && a.triggered_at).slice(0, 3).map(alert => (
                          <div key={alert.id} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <p className="text-xs text-green-800 font-semibold">
                              {alert.direction === 'above' ? 'Above' : 'Below'} {currency}{Number(alert.target_price).toFixed(2)} — triggered
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setShowCreateAlert(true)}
                      className="w-full py-2.5 border-2 border-dashed border-amber-300 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Alert
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Histórico de transações */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Transaction History
            </h3>
            <div className="space-y-3">
              {history.map((op, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${op.type === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {op.type === 'buy' ? <Plus className="w-5 h-5 text-green-600" /> : <Minus className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{op.type === 'buy' ? 'Buy' : 'Sell'} • {op.quantity} {asset.type === 'crypto' ? 'un' : 'units'}</p>
                      <p className="text-xs text-slate-500">{op.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{currency} {op.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">@ {currency}{op.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dica */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Investment Tip</p>
              <p className="text-sm text-blue-800">
                {asset.type === 'acao'      && 'Monitor company fundamentals and quarterly results.'}
                {asset.type === 'fii'       && 'FIIs distribuem pelo menos 95% dos lucros. Acompanhe os relatórios mensais.'}
                {asset.type === 'crypto'    && 'Criptomoedas são voláteis. Use stop loss para proteger seu capital.'}
                {asset.type === 'renda_fixa'&& 'Verifique a liquidez e o prazo de vencimento antes de investir mais.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões fixos */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3">
        <button
          onClick={() => onAddMore(asset)}
          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add More
        </button>
        <button
          onClick={() => setShowRemoveModal(true)}
          className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition shadow-lg"
        >
          <Trash2 className="w-5 h-5" /> Remove
        </button>
      </div>

      {/* Modal de remoção */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Remove from Portfolio?</h3>
              <button onClick={() => setShowRemoveModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-900">
                  🗑️ You are about to remove <span className="font-bold">{asset.code}</span> from your portfolio. This action cannot be undone.
                </p>
              </div>
              <p className="text-sm text-slate-700">💡 No real transactions will be made. To buy or sell real assets, use your broker.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveModal(false)} className="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => { onSell(asset); setShowRemoveModal(false); }} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de criar alerta */}
      {showCreateAlert && (
        <CreateAlertModal
          asset={asset}
          onClose={() => setShowCreateAlert(false)}
          onCreate={handleCreateAlert}
        />
      )}
    </div>
  );
};

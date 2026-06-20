import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Search, DollarSign, Euro, PoundSterling, Bitcoin } from 'lucide-react';

// Dados de moedas (simulados)
const CURRENCIES = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    icon: DollarSign,
    price: '€ 5,23',
    change: -0.45,
    buy: '€ 5,21',
    sell: '€ 5,25',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    icon: Euro,
    price: '€ 5,67',
    change: +0.32,
    buy: '€ 5,65',
    sell: '€ 5,69',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    icon: PoundSterling,
    price: '€ 6,58',
    change: +0.18,
    buy: '€ 6,55',
    sell: '€ 6,61',
  },
  {
    code: 'ARS',
    name: 'Argentine Peso',
    symbol: '$',
    price: '€ 0,0052',
    change: -1.23,
    buy: '€ 0,0051',
    sell: '€ 0,0053',
  },
  {
    code: 'CAD',
    name: 'Dólar Canadense',
    symbol: 'CA$',
    price: '€ 3,68',
    change: -0.28,
    buy: '€ 3,66',
    sell: '€ 3,70',
  },
  {
    code: 'AUD',
    name: 'Dólar Australiano',
    symbol: 'A$',
    price: '€ 3,32',
    change: +0.15,
    buy: '€ 3,30',
    sell: '€ 3,34',
  },
  {
    code: 'JPY',
    name: 'Iene Japonês',
    symbol: '¥',
    price: '€ 0,034',
    change: -0.52,
    buy: '€ 0,0338',
    sell: '€ 0,0342',
  },
  {
    code: 'CHF',
    name: 'Franco Suíço',
    symbol: 'CHF',
    price: '€ 5,92',
    change: +0.22,
    buy: '€ 5,90',
    sell: '€ 5,94',
  },
  {
    code: 'CNY',
    name: 'Yuan Chinês',
    symbol: '¥',
    price: '€ 0,72',
    change: -0.31,
    buy: '€ 0,71',
    sell: '€ 0,73',
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: 'Mex$',
    price: '€ 0,31',
    change: +0.08,
    buy: '€ 0,30',
    sell: '€ 0,32',
  },
  {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    icon: Bitcoin,
    price: '€ 287.450',
    change: +2.18,
    buy: '€ 287.200',
    sell: '€ 287.700',
    crypto: true,
  },
];

export const CurrencyScreen = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = CURRENCIES.filter(currency => 
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-4 text-white flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Currency Rates</h1>
            <p className="text-sm text-white/90">Track exchange rates in real-time</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search currency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/60 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Live Exchange Rates</h3>
              <p className="text-sm text-blue-700">
                Buy and sell rates for major international currencies. Updated every minute.
              </p>
            </div>
          </div>
        </div>

        {/* Currency List */}
        {filteredCurrencies.map((currency) => {
          const Icon = currency.icon || DollarSign;
          const isPositive = currency.change >= 0;

          return (
            <div 
              key={currency.code}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currency.crypto ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      currency.crypto ? 'text-orange-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{currency.code}</span>
                      {currency.crypto && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                          Cripto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{currency.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{currency.price}</p>
                  <div className={`flex items-center gap-1 justify-end ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">
                      {isPositive ? '+' : ''}{currency.change}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Buy/Sell */}
              <div className="flex gap-3">
                <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-green-700 mb-0.5">Buy</p>
                  <p className="text-sm font-bold text-green-900">{currency.buy}</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-red-700 mb-0.5">Sell</p>
                  <p className="text-sm font-bold text-red-900">{currency.sell}</p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCurrencies.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">Nenhuma moeda encontrada</p>
            <p className="text-sm text-slate-500 mt-1">Tente buscar por outro termo</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Globe, DollarSign, TrendingUp, Check, ChevronRight } from 'lucide-react';
import { useLocale, Language, Region, Currency } from '../contexts/LocaleContext';

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

const REGIONS: { code: Region; name: string; market: string; flag: string; description: string }[] = [
  { code: 'BR', name: 'Brazil', market: 'B3 (São Paulo)', flag: '🇧🇷', description: 'Brazilian stocks, FIIs, and local market data' },
  { code: 'US', name: 'United States', market: 'NYSE / NASDAQ', flag: '🇺🇸', description: 'US stocks, ETFs, and market data' },
  { code: 'EU', name: 'Europe', market: 'Euronext', flag: '🇪🇺', description: 'European stocks and market data' },
  { code: 'UK', name: 'United Kingdom', market: 'LSE (London)', flag: '🇬🇧', description: 'UK stocks and FTSE indices' },
  { code: 'JP', name: 'Japan', market: 'TSE (Tokyo)', flag: '🇯🇵', description: 'Japanese stocks and Nikkei index' },
  { code: 'CN', name: 'China', market: 'SSE (Shanghai)', flag: '🇨🇳', description: 'Chinese stocks and market data' },
  { code: 'LATAM', name: 'Latin America', market: 'Regional Markets', flag: '🌎', description: 'Latin American stocks and regional data' },
  { code: 'GLOBAL', name: 'Global', market: 'All Markets', flag: '🌍', description: 'Access to all global markets' },
];

const CURRENCIES: { code: Currency; name: string; symbol: string }[] = [
  { code: 'BRL', name: 'Brazilian Real', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'A€' },
];

export const LanguageRegionScreen = ({ onBack }) => {
  const { locale, setLanguage, setRegion, setCurrency, t } = useLocale();
  const [activeTab, setActiveTab] = useState<'language' | 'region' | 'currency'>('language');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleRegionChange = (region: Region) => {
    setRegion(region);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setCurrency(currency);
  };

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
            <h1 className="text-xl font-bold">{t('settings.language')}</h1>
            <p className="text-sm text-white/90">{t('settings.languageDesc')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('language')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
              activeTab === 'language'
                ? 'bg-white text-green-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Globe className="w-4 h-4 mx-auto mb-1" />
            {t('settings.selectLanguage')}
          </button>
          <button
            onClick={() => setActiveTab('region')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
              activeTab === 'region'
                ? 'bg-white text-green-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <TrendingUp className="w-4 h-4 mx-auto mb-1" />
            {t('settings.selectRegion')}
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
              activeTab === 'currency'
                ? 'bg-white text-green-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <DollarSign className="w-4 h-4 mx-auto mb-1" />
            {t('settings.selectCurrency')}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">{t('settings.interfaceLanguage')}</h3>
                  <p className="text-sm text-blue-700">
                    {t('settings.interfaceLanguageDesc')}
                  </p>
                </div>
              </div>
            </div>

            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between ${
                  locale.language === lang.code ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{lang.nativeName}</p>
                    <p className="text-sm text-slate-600">{lang.name}</p>
                  </div>
                </div>
                {locale.language === lang.code && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Region Tab */}
        {activeTab === 'region' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 mb-1">{t('settings.marketRegion')}</h3>
                  <p className="text-sm text-purple-700">
                    {t('settings.marketRegionDesc')}
                  </p>
                </div>
              </div>
            </div>

            {REGIONS.map((region) => (
              <button
                key={region.code}
                onClick={() => handleRegionChange(region.code)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition ${
                  locale.region === region.code ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{region.flag}</span>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{region.name}</p>
                      <p className="text-sm text-green-600 font-semibold">{region.market}</p>
                    </div>
                  </div>
                  {locale.region === region.code && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 text-left">{region.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Currency Tab */}
        {activeTab === 'currency' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 mb-1">{t('settings.displayCurrency')}</h3>
                  <p className="text-sm text-green-700">
                    {t('settings.displayCurrencyDesc')}
                  </p>
                </div>
              </div>
            </div>

            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between ${
                  locale.currency === currency.code ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-green-600">{currency.symbol}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{currency.code}</p>
                    <p className="text-sm text-slate-600">{currency.name}</p>
                  </div>
                </div>
                {locale.currency === currency.code && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Current Selection Summary */}
        <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {t('settings.currentConfiguration')}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">{t('settings.currentLanguage')}</span>
              <span className="font-semibold">
                {LANGUAGES.find(l => l.code === locale.language)?.nativeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">{t('settings.currentRegion')}</span>
              <span className="font-semibold">
                {REGIONS.find(r => r.code === locale.region)?.name} ({locale.marketCode})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">{t('settings.currentCurrency')}</span>
              <span className="font-semibold">
                {locale.currency} ({CURRENCIES.find(c => c.code === locale.currency)?.symbol})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import { Currency } from '../contexts/LocaleContext';

// Taxas de câmbio em tempo real (mockadas - em produção usar API real)
// APIs sugeridas: ExchangeRate-API, Fixer.io, Open Exchange Rates

interface ExchangeRates {
  base: Currency;
  timestamp: number;
  rates: Record<Currency, number>;
}

// Cache de taxas de câmbio
let exchangeRatesCache: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minuto

// Taxas de câmbio base (USD como referência)
const BASE_RATES: Record<Currency, number> = {
  USD: 1.0,
  BRL: 5.23,      // 1 USD = 5.23 BRL
  EUR: 0.92,      // 1 USD = 0.92 EUR
  GBP: 0.79,      // 1 USD = 0.79 GBP
  JPY: 149.50,    // 1 USD = 149.50 JPY
  CNY: 7.24,      // 1 USD = 7.24 CNY
  MXN: 17.05,     // 1 USD = 17.05 MXN
  ARS: 850.00,    // 1 USD = 850.00 ARS
};

/**
 * Simula variação de mercado em tempo real
 * Em produção, isso viria de uma API real
 */
const simulateMarketVariation = (baseRate: number): number => {
  const variation = (Math.random() - 0.5) * 0.02; // Variação de +/- 1%
  return baseRate * (1 + variation);
};

/**
 * Busca taxas de câmbio atualizadas
 * Em produção, isso chamaria uma API real como:
 * - https://api.exchangerate-api.com/v4/latest/USD
 * - https://api.fixer.io/latest
 * - https://openexchangerates.org/api/latest.json
 */
export const fetchExchangeRates = async (baseCurrency: Currency = 'USD'): Promise<ExchangeRates> => {
  const now = Date.now();
  
  // Retorna cache se ainda válido
  if (exchangeRatesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return exchangeRatesCache;
  }

  // Simula chamada de API
  await new Promise(resolve => setTimeout(resolve, 300));

  // Gera taxas com pequenas variações para simular mercado real
  const rates: Record<Currency, number> = {} as Record<Currency, number>;
  
  Object.keys(BASE_RATES).forEach((currency) => {
    const curr = currency as Currency;
    if (curr === baseCurrency) {
      rates[curr] = 1.0;
    } else {
      // Converte para a moeda base
      const usdRate = BASE_RATES[curr];
      const baseUsdRate = BASE_RATES[baseCurrency];
      rates[curr] = simulateMarketVariation(usdRate / baseUsdRate);
    }
  });

  exchangeRatesCache = {
    base: baseCurrency,
    timestamp: now,
    rates,
  };
  
  lastFetchTime = now;
  
  return exchangeRatesCache;
};

/**
 * Converte valor entre duas moedas
 */
export const convertCurrency = async (
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> => {
  if (from === to) return amount;

  const rates = await fetchExchangeRates('USD');
  
  // Converte para USD primeiro, depois para moeda de destino
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  
  return convertedAmount;
};

/**
 * Formata valor convertido com símbolo da moeda
 */
export const formatConvertedValue = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string => {
  const symbols: Record<Currency, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    MXN: 'Mex$',
    ARS: 'AR$',
  };

  const symbol = symbols[currency];
  
  // Formatação específica para cada moeda
  if (currency === 'JPY' || currency === 'CNY' || currency === 'ARS') {
    return `${symbol} ${Math.round(amount).toLocaleString(locale)}`;
  }
  
  return `${symbol} ${amount.toLocaleString(locale, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Obtém taxa de câmbio entre duas moedas
 */
export const getExchangeRate = async (from: Currency, to: Currency): Promise<number> => {
  if (from === to) return 1.0;
  
  const rates = await fetchExchangeRates('USD');
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  
  return toRate / fromRate;
};

/**
 * Obtém variação percentual da moeda nas últimas 24h
 * Em produção, viria de dados históricos da API
 */
export const getCurrencyChange24h = (currency: Currency): number => {
  // Simulado - em produção viria de API com dados históricos
  const changes: Record<Currency, number> = {
    USD: 0,
    BRL: -0.45,
    EUR: 0.32,
    GBP: 0.18,
    JPY: -0.52,
    CNY: -0.31,
    MXN: 0.08,
    ARS: -1.23,
  };
  
  return changes[currency] || 0;
};

/**
 * Classe para gerenciar conversões em lote
 */
export class CurrencyConverter {
  private rates: ExchangeRates | null = null;
  
  async initialize(baseCurrency: Currency = 'USD') {
    this.rates = await fetchExchangeRates(baseCurrency);
  }
  
  convert(amount: number, from: Currency, to: Currency): number {
    if (!this.rates) {
      throw new Error('Currency converter not initialized');
    }
    
    if (from === to) return amount;
    
    const fromRate = this.rates.rates[from];
    const toRate = this.rates.rates[to];
    
    const amountInBase = amount / fromRate;
    return amountInBase * toRate;
  }
  
  getRate(from: Currency, to: Currency): number {
    if (!this.rates) {
      throw new Error('Currency converter not initialized');
    }
    
    if (from === to) return 1.0;
    
    const fromRate = this.rates.rates[from];
    const toRate = this.rates.rates[to];
    
    return toRate / fromRate;
  }
  
  isStale(): boolean {
    if (!this.rates) return true;
    return (Date.now() - this.rates.timestamp) > CACHE_DURATION;
  }
}

/**
 * Instância singleton do conversor
 */
export const currencyConverter = new CurrencyConverter();

/**
 * Hook React para conversão de moeda
 */
export const useCurrencyConverter = (targetCurrency: Currency) => {
  return {
    convert: async (amount: number, from: Currency) => {
      return await convertCurrency(amount, from, targetCurrency);
    },
    format: (amount: number) => {
      return formatConvertedValue(amount, targetCurrency);
    },
    getRate: async (from: Currency) => {
      return await getExchangeRate(from, targetCurrency);
    },
  };
};

/**
 * Atualiza taxas automaticamente em intervalo
 */
export const startAutoUpdate = (interval: number = 60000): NodeJS.Timeout => {
  return setInterval(async () => {
    await fetchExchangeRates();
    console.log('Exchange rates updated at', new Date().toISOString());
  }, interval);
};

/**
 * Para atualização automática
 */
export const stopAutoUpdate = (timer: NodeJS.Timeout) => {
  clearInterval(timer);
};

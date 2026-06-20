import { Language } from '../contexts/LocaleContext';

// Sistema de tradução automática simulado
// Em produção, isso usaria uma API real como Google Translate, DeepL, ou Azure Translator

interface Translation {
  [key: string]: {
    [lang in Language]?: string;
  };
}

// Cache de traduções para performance
const translationCache: Translation = {
  // Exemplo de cache de frases comuns
  'Hello World': {
    'pt-BR': 'Olá Mundo',
    'es-ES': 'Hola Mundo',
    'fr-FR': 'Bonjour le monde',
    'de-DE': 'Hallo Welt',
    'it-IT': 'Ciao Mondo',
    'ja-JP': 'こんにちは世界',
    'zh-CN': '你好世界',
    'ar-SA': 'مرحبا بالعالم',
    'ru-RU': 'Привет мир',
    'ko-KR': '안녕하세요 세계',
  },
};

// Mapeamento de idiomas para nomes nativos
export const LANGUAGE_NAMES: Record<Language, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'it-IT': 'Italiano',
  'ja-JP': '日本語',
  'zh-CN': '简体中文',
  'ar-SA': 'العربية',
  'ru-RU': 'Русский',
  'ko-KR': '한국어',
};

// Traduções mockadas de termos financeiros comuns
const FINANCIAL_TERMS: Record<string, Record<Language, string>> = {
  'stock': {
    'pt-BR': 'ação',
    'en-US': 'stock',
    'es-ES': 'acción',
    'fr-FR': 'action',
    'de-DE': 'Aktie',
    'it-IT': 'azione',
    'ja-JP': '株',
    'zh-CN': '股票',
    'ar-SA': 'سهم',
    'ru-RU': 'акция',
    'ko-KR': '주식',
  },
  'market': {
    'pt-BR': 'mercado',
    'en-US': 'market',
    'es-ES': 'mercado',
    'fr-FR': 'marché',
    'de-DE': 'Markt',
    'it-IT': 'mercato',
    'ja-JP': '市場',
    'zh-CN': '市场',
    'ar-SA': 'سوق',
    'ru-RU': 'рынок',
    'ko-KR': '시장',
  },
  'profit': {
    'pt-BR': 'lucro',
    'en-US': 'profit',
    'es-ES': 'ganancia',
    'fr-FR': 'profit',
    'de-DE': 'Gewinn',
    'it-IT': 'profitto',
    'ja-JP': '利益',
    'zh-CN': '利润',
    'ar-SA': 'ربح',
    'ru-RU': 'прибыль',
    'ko-KR': '이익',
  },
};

/**
 * Traduz um texto de um idioma para outro
 * Em produção, isso chamaria uma API de tradução real
 */
export const translateText = async (
  text: string,
  fromLang: Language,
  toLang: Language
): Promise<string> => {
  // Se os idiomas são iguais, retorna o texto original
  if (fromLang === toLang) {
    return text;
  }

  // Verifica cache primeiro
  if (translationCache[text]?.[toLang]) {
    return translationCache[text][toLang]!;
  }

  // Simulação de API call (em produção seria uma chamada real)
  // Para demonstração, vamos usar traduções mockadas
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula latência da API

  // Mock de tradução baseado em idioma
  const mockTranslations: Record<Language, Record<Language, (text: string) => string>> = {
    'en-US': {
      'pt-BR': (text) => `[PT] ${text}`,
      'es-ES': (text) => `[ES] ${text}`,
      'fr-FR': (text) => `[FR] ${text}`,
      'de-DE': (text) => `[DE] ${text}`,
      'it-IT': (text) => `[IT] ${text}`,
      'ja-JP': (text) => `[JA] ${text}`,
      'zh-CN': (text) => `[ZH] ${text}`,
      'ar-SA': (text) => `[AR] ${text}`,
      'ru-RU': (text) => `[RU] ${text}`,
      'ko-KR': (text) => `[KO] ${text}`,
    },
  };

  // Retorna tradução mockada ou texto original com tag
  const translator = mockTranslations[fromLang]?.[toLang];
  const translated = translator ? translator(text) : `[Translated to ${toLang}] ${text}`;

  // Salva no cache
  if (!translationCache[text]) {
    translationCache[text] = {};
  }
  translationCache[text][toLang] = translated;

  return translated;
};

/**
 * Detecta o idioma de um texto
 * Em produção, usaria uma API de detecção de idioma
 */
export const detectLanguage = (text: string): Language => {
  // Detecção simples baseada em caracteres
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh-CN'; // Chinês
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja-JP'; // Japonês
  if (/[\uac00-\ud7af]/.test(text)) return 'ko-KR'; // Coreano
  if (/[\u0600-\u06ff]/.test(text)) return 'ar-SA'; // Árabe
  if (/[\u0400-\u04ff]/.test(text)) return 'ru-RU'; // Russo
  
  // Para idiomas latinos, análise de palavras comuns
  const lowerText = text.toLowerCase();
  if (lowerText.includes('que') || lowerText.includes('não') || lowerText.includes('é')) return 'pt-BR';
  if (lowerText.includes('que') || lowerText.includes('es') || lowerText.includes('está')) return 'es-ES';
  if (lowerText.includes('le') || lowerText.includes('est') || lowerText.includes('vous')) return 'fr-FR';
  if (lowerText.includes('ist') || lowerText.includes('das') || lowerText.includes('und')) return 'de-DE';
  if (lowerText.includes('che') || lowerText.includes('per') || lowerText.includes('sono')) return 'it-IT';
  
  return 'en-US'; // Fallback
};

/**
 * Verifica se uma tradução está disponível
 */
export const isTranslationAvailable = (fromLang: Language, toLang: Language): boolean => {
  // Em produção, verificaria se a API suporta esse par de idiomas
  return true; // Por enquanto, assumimos que todos os pares são suportados
};

/**
 * Traduz termos financeiros específicos
 */
export const translateFinancialTerm = (term: string, toLang: Language): string => {
  const lowerTerm = term.toLowerCase();
  return FINANCIAL_TERMS[lowerTerm]?.[toLang] || term;
};

/**
 * Formata texto traduzido com indicador visual
 */
export const formatTranslatedText = (
  originalText: string,
  translatedText: string,
  fromLang: Language,
  toLang: Language,
  showOriginal: boolean = false
): string => {
  if (showOriginal) {
    return `${translatedText}\n\n[Original em ${LANGUAGE_NAMES[fromLang]}]: ${originalText}`;
  }
  return translatedText;
};

/**
 * Hook simulado de tradução para componentes React
 */
export const useTranslation = (targetLang: Language) => {
  return {
    translate: async (text: string, fromLang: Language) => {
      return await translateText(text, fromLang, targetLang);
    },
    detectLanguage,
    isAvailable: (fromLang: Language) => isTranslationAvailable(fromLang, targetLang),
  };
};

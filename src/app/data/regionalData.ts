import { Region, Language } from '../contexts/LocaleContext';

// Posts regionalizados por idioma e região
export const REGIONAL_POSTS = {
  'pt-BR': [
    {
      id: 1,
      author: { name: 'Ana Silva', username: '@anasilva', avatar: 'https://i.pravatar.cc/150?img=1', verified: true },
      content: 'Análise completa da Petrobras (PETR4): Balanço do Q1 2026 superou expectativas com lucro líquido de R$ 28,3 bilhões. Dividendos em alta! 📊📈 #Petrobras #LSE',
      timestamp: '2h',
      likes: 324,
      comments: 45,
      region: 'BR' as Region,
      language: 'pt-BR' as Language,
    },
    {
      id: 2,
      author: { name: 'Carlos Investor', username: '@carlosinvest', avatar: 'https://i.pravatar.cc/150?img=12', verified: false },
      content: 'VALE3 batendo máximas históricas! Minério de ferro em alta com demanda chinesa forte. Posição de longo prazo mantida 💎🙌',
      timestamp: '4h',
      likes: 156,
      comments: 28,
      region: 'BR' as Region,
      language: 'pt-BR' as Language,
    },
  ],
  'en-US': [
    {
      id: 101,
      author: { name: 'Michael Chen', username: '@mchen', avatar: 'https://i.pravatar.cc/150?img=33', verified: true },
      content: 'NVIDIA ($NVDA) earnings report crushing it again! AI chip demand off the charts. Up 15% after-hours 🚀📈 #NVDA #AI',
      timestamp: '1h',
      likes: 892,
      comments: 134,
      region: 'US' as Region,
      language: 'en-US' as Language,
    },
    {
      id: 102,
      author: { name: 'Sarah Williams', username: '@sarahw', avatar: 'https://i.pravatar.cc/150?img=45', verified: true },
      content: 'Apple ($AAPL) launching new Vision Pro 2 next month. Could be a game changer for spatial computing. Bullish on tech! 🍎',
      timestamp: '3h',
      likes: 567,
      comments: 89,
      region: 'US' as Region,
      language: 'en-US' as Language,
    },
  ],
  'es-ES': [
    {
      id: 201,
      author: { name: 'María García', username: '@mariagarcia', avatar: 'https://i.pravatar.cc/150?img=23', verified: true },
      content: 'Análisis de Market Libre (MELI): Crecimiento del 45% en Argentina. E-commerce dominando LATAM 🚀📦 #MarketLibre',
      timestamp: '2h',
      likes: 234,
      comments: 45,
      region: 'LATAM' as Region,
      language: 'es-ES' as Language,
    },
    {
      id: 202,
      author: { name: 'Juan Rodríguez', username: '@juanr', avatar: 'https://i.pravatar.cc/150?img=67', verified: false },
      content: 'Bitcoin superando los $95k USD. El mercado cripto está en fuego 🔥 ¿Vamos por los $100k? #Bitcoin #Crypto',
      timestamp: '5h',
      likes: 445,
      comments: 78,
      region: 'LATAM' as Region,
      language: 'es-ES' as Language,
    },
  ],
  'ja-JP': [
    {
      id: 301,
      author: { name: '田中太郎', username: '@tanaka', avatar: 'https://i.pravatar.cc/150?img=14', verified: true },
      content: 'ソニー (SONY) の新しいPS6発表！ゲーム市場が盛り上がっています 🎮📈 #ソニー #東証',
      timestamp: '3h',
      likes: 678,
      comments: 123,
      region: 'JP' as Region,
      language: 'ja-JP' as Language,
    },
  ],
  'zh-CN': [
    {
      id: 401,
      author: { name: '李明', username: '@liming', avatar: 'https://i.pravatar.cc/150?img=56', verified: true },
      content: '阿里巴巴（BABA）第一季度业绩超预期！云计算业务增长强劲 📊💻 #阿里巴巴 #A股',
      timestamp: '4h',
      likes: 892,
      comments: 156,
      region: 'CN' as Region,
      language: 'zh-CN' as Language,
    },
  ],
};

// Companys por região
export const REGIONAL_COMPANIES = {
  BR: [
    { code: 'PETR4', name: 'Petrobras', sector: 'Energia', price: 38.52, change: 2.45 },
    { code: 'VALE3', name: 'Vale', sector: 'Mineração', price: 65.80, change: 1.23 },
    { code: 'ITUB4', name: 'Itaú Unibanco', sector: 'Financeiro', price: 28.90, change: -0.85 },
    { code: 'BBDC4', name: 'Bradesco', sector: 'Financeiro', price: 13.45, change: 0.56 },
    { code: 'WEGE3', name: 'WEG', sector: 'Industrial', price: 42.10, change: 3.45 },
  ],
  US: [
    { code: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 182.45, change: 1.85 },
    { code: 'MSFT', name: 'Microsoft', sector: 'Technology', price: 415.30, change: 2.12 },
    { code: 'NVDA', name: 'NVIDIA', sector: 'Technology', price: 875.20, change: 4.23 },
    { code: 'TSLA', name: 'Tesla', sector: 'Automotive', price: 245.60, change: 3.85 },
    { code: 'GOOGL', name: 'Alphabet', sector: 'Technology', price: 142.80, change: -0.45 },
  ],
  EU: [
    { code: 'SAP', name: 'SAP SE', sector: 'Technology', price: 142.30, change: 1.56 },
    { code: 'ASML', name: 'ASML Holding', sector: 'Technology', price: 785.40, change: 2.34 },
    { code: 'LVMH', name: 'LVMH', sector: 'Luxury', price: 652.80, change: 0.87 },
  ],
  UK: [
    { code: 'HSBA', name: 'HSBC Holdings', sector: 'Financial', price: 6.42, change: 0.78 },
    { code: 'BP', name: 'BP plc', sector: 'Energy', price: 5.23, change: -0.45 },
  ],
  JP: [
    { code: '7203', name: 'Toyota Motor', sector: 'Automotive', price: 2845, change: 1.23 },
    { code: '6758', name: 'Sony Group', sector: 'Technology', price: 12450, change: 2.67 },
    { code: '9984', name: 'SoftBank Group', sector: 'Technology', price: 6234, change: -0.89 },
  ],
  CN: [
    { code: 'BABA', name: 'Alibaba Group', sector: 'Technology', price: 78.45, change: 3.21 },
    { code: 'TCEHY', name: 'Tencent', sector: 'Technology', price: 42.30, change: 1.89 },
  ],
  LATAM: [
    { code: 'MELI', name: 'Market Libre', sector: 'E-commerce', price: 1456.80, change: 2.34 },
    { code: 'VALE', name: 'Vale (ADR)', sector: 'Mining', price: 11.23, change: 1.45 },
  ],
  GLOBAL: [],
};

// Notícias por região e idioma
export const REGIONAL_NEWS = {
  'pt-BR': [
    {
      id: 1,
      title: 'Petrobras anuncia dividendos recordes para 2026',
      summary: 'Company distribui R$ 15 bilhões aos acionistas após balanço histórico',
      source: 'InfoMoney',
      time: '1h atrás',
      region: 'BR' as Region,
    },
    {
      id: 2,
      title: 'Selic deve cair para 9,5% ainda em 2026, prevê mercado',
      summary: 'Analysts apostam em corte de juros com inflação controlada',
      source: 'Valor Econômico',
      time: '3h atrás',
      region: 'BR' as Region,
    },
  ],
  'en-US': [
    {
      id: 101,
      title: 'Fed signals potential rate cuts in Q3 2026',
      summary: 'Powell hints at monetary easing as inflation stabilizes',
      source: 'Bloomberg',
      time: '2h ago',
      region: 'US' as Region,
    },
    {
      id: 102,
      title: 'NVIDIA stock hits all-time high on AI boom',
      summary: 'Chip maker surges 15% after blowout earnings report',
      source: 'CNBC',
      time: '4h ago',
      region: 'US' as Region,
    },
  ],
  'es-ES': [
    {
      id: 201,
      title: 'Market Libre duplica beneficios en Argentina',
      summary: 'La firma de e-commerce reporta crecimiento del 120% interanual',
      source: 'El Economista',
      time: 'hace 2h',
      region: 'LATAM' as Region,
    },
    {
      id: 202,
      title: 'Bitcoin alcanza nuevo récord histórico',
      summary: 'La criptomoneda supera los $95,000 por primera vez',
      source: 'CriptoNoticias',
      time: 'hace 5h',
      region: 'LATAM' as Region,
    },
  ],
  'ja-JP': [
    {
      id: 301,
      title: 'ソニー、過去最高益を記録',
      summary: 'ゲーム事業とエレクトロニクスが好調',
      source: '日本経済新聞',
      time: '3時間前',
      region: 'JP' as Region,
    },
  ],
  'zh-CN': [
    {
      id: 401,
      title: '阿里巴巴云计算业务增长40%',
      summary: '公司第一季度财报超出分析师预期',
      source: '财经网',
      time: '4小时前',
      region: 'CN' as Region,
    },
  ],
};

// Índices de mercado por região
export const REGIONAL_INDICES = {
  BR: { name: 'IBOVESPA', value: 127845, change: 1.24 },
  US: { name: 'S&P 500', value: 5234, change: -0.34 },
  EU: { name: 'EURO STOXX 50', value: 4582, change: 0.67 },
  UK: { name: 'FTSE 100', value: 7856, change: 0.45 },
  JP: { name: 'NIKKEI 225', value: 38945, change: 1.89 },
  CN: { name: 'SSE Composite', value: 3245, change: 0.56 },
  LATAM: { name: 'IPC Mexico', value: 56789, change: 1.12 },
  GLOBAL: { name: 'MSCI World', value: 3456, change: 0.78 },
};

// Função para obter posts por região e idioma
export const getPostsByLocale = (region: Region, language: Language) => {
  // Primeiro tenta buscar por idioma específico
  let posts = REGIONAL_POSTS[language] || [];
  
  // Se não tiver posts no idioma, usa inglês como fallback
  if (posts.length === 0) {
    posts = REGIONAL_POSTS['en-US'] || [];
  }
  
  // Filtra por região se não for GLOBAL
  if (region !== 'GLOBAL') {
    posts = posts.filter(post => post.region === region || post.region === 'GLOBAL');
  }
  
  return posts;
};

// Função para obter empresas por região
export const getCompaniesByRegion = (region: Region) => {
  return REGIONAL_COMPANIES[region] || REGIONAL_COMPANIES['GLOBAL'];
};

// Função para obter notícias por idioma
export const getNewsByLanguage = (language: Language) => {
  return REGIONAL_NEWS[language] || REGIONAL_NEWS['en-US'];
};

// Função para obter índice por região
export const getIndexByRegion = (region: Region) => {
  return REGIONAL_INDICES[region] || REGIONAL_INDICES['GLOBAL'];
};

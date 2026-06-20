// Sistema de Moderação de Conteúdo - Bulls
// Garante que posts sejam apenas sobre finanças, investimentos, negócios e tecnologia

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  suggestedTopics?: string[];
  confidence: number; // 0-100
}

// Themes PERMITIDOS
const ALLOWED_TOPICS = {
  finance: [
    'ação', 'ações', 'bolsa', 'investimento', 'trader', 'dividendo', 'lucro',
    'balanço', 'receita', 'resultado', 'trimestre', 'fiscal', 'imposto',
    'cdi', 'selic', 'juros', 'taxa', 'inflação', 'ipca', 'igpm',
    'bovespa', 'b3', 'nasdaq', 'nyse', 'dow jones', 's&p 500',
    'fii', 'fundos imobiliários', 'reit', 'etf', 'derivativos',
    'opções', 'futuro', 'swap', 'hedge', 'mercado futuro',
    'análise técnica', 'análise fundamentalista', 'valuation', 'múltiplos',
    'p/l', 'p/vp', 'roe', 'roic', 'ebitda', 'ebit', 'margem',
    'dre', 'balanço patrimonial', 'fluxo de caixa', 'dfc',
    'tesouro direto', 'cdb', 'lci', 'lca', 'debênture', 'cri', 'cra',
    'previdência', 'vgbl', 'pgbl', 'aposentadoria', 'reserva',
    'carteira', 'portfólio', 'alocação', 'diversificação', 'rebalanceamento',
    'renda fixa', 'renda variável', 'volatilidade', 'liquidez',
  ],
  crypto: [
    'bitcoin', 'btc', 'ethereum', 'eth', 'cripto', 'criptomoeda',
    'blockchain', 'defi', 'nft', 'web3', 'token', 'altcoin',
    'staking', 'mining', 'mineração', 'hash', 'wallet', 'exchange',
    'binance', 'coinbase', 'metamask', 'ledger', 'cold wallet',
  ],
  business: [
    'startup', 'empreendedorismo', 'negócio', 'empresa', 'corporação',
    'fusão', 'aquisição', 'm&a', 'ipo', 'oferta pública', 'follow on',
    'venture capital', 'private equity', 'valuation', 'pitch',
    'modelo de negócio', 'receita', 'faturamento', 'crescimento',
    'mercado', 'setor', 'indústria', 'concorrência', 'competitividade',
    'estratégia', 'planejamento', 'gestão', 'governança corporativa',
    'conselho', 'diretoria', 'ceo', 'cfo', 'coo', 'cto', 'executivo',
    'inovação', 'disrupção', 'transformação digital',
  ],
  tech: [
    'tecnologia', 'tech', 'software', 'hardware', 'saas', 'paas', 'iaas',
    'inteligência artificial', 'ia', 'ai', 'machine learning', 'ml',
    'big data', 'analytics', 'dados', 'cloud', 'nuvem', 'aws', 'azure',
    'fintech', 'insurtech', 'proptech', 'healthtech', 'edtech',
    'api', 'plataforma', 'aplicativo', 'app', 'sistema',
    'automação', 'robótica', 'iot', 'internet das coisas',
    'cibersegurança', 'segurança digital', 'privacidade',
  ],
  economy: [
    'economia', 'pib', 'crescimento econômico', 'recessão', 'expansão',
    'banco central', 'bacen', 'fed', 'bce', 'política monetária',
    'política fiscal', 'orçamento', 'déficit', 'superávit', 'dívida pública',
    'exportação', 'importação', 'balança comercial', 'câmbio', 'dólar',
    'commodities', 'petróleo', 'ouro', 'minério', 'agrícola',
    'desemprego', 'emprego', 'mercado de trabalho', 'renda',
    'consumo', 'varejo', 'indústria', 'serviços', 'pmi',
  ],
  education: [
    'educação financeira', 'curso', 'livro', 'podcast', 'conteúdo',
    'aprendizado', 'estudo', 'conhecimento', 'ensino',
    'dica', 'tutorial', 'guia', 'explicação', 'conceito',
  ]
};

// Themes PROIBIDOS (off-topic)
const FORBIDDEN_TOPICS = {
  politics: {
    keywords: [
      'eleição', 'político', 'partido', 'governador', 'prefeito', 'vereador',
      'deputado', 'senador', 'presidente', 'lula', 'bolsonaro', 'ministro',
      'esquerda', 'direita', 'ideologia', 'comunismo', 'socialismo',
      'capitalismo selvagem', 'pt', 'pl', 'psdb', 'mdb', 'psd',
      'impeachment', 'golpe', 'ditadura', 'democracia política',
      'manifestação', 'protesto', 'greve política', 'votação política',
    ],
    message: 'A Bulls é uma rede social focada em investimentos e negócios. Evite discussões políticas que não estejam diretamente relacionadas à economia ou mercado financeiro.',
  },
  sports: {
    keywords: [
      'futebol', 'flamengo', 'corinthians', 'palmeiras', 'são paulo',
      'vasco', 'santos', 'internacional', 'grêmio', 'brasileirão',
      'libertadores', 'champions league', 'copa do mundo', 'seleção',
      'jogador', 'técnico', 'gol', 'campeonato', 'jogo', 'partida',
      'vôlei', 'basquete', 'nba', 'nfl', 'fórmula 1', 'f1',
      'mma', 'ufc', 'boxe', 'olimpíadas', 'esporte',
    ],
    message: 'Conteúdo sobre esportes não é permitido na Bulls. Foque em investimentos, mercado financeiro e negócios.',
  },
  entertainment: {
    keywords: [
      'música', 'cantor', 'cantora', 'banda', 'show', 'festival',
      'sertanejo', 'funk', 'rock', 'pop', 'rap', 'hip hop',
      'filme', 'série', 'netflix', 'novela', 'bbb', 'reality show',
      'ator', 'atriz', 'celebridade', 'fofoca', 'famoso',
      'tv', 'globo', 'record', 'sbt', 'streaming de entretenimento',
    ],
    message: 'A Bulls não permite conteúdo de entretenimento. Compartilhe análises financeiras, insights de mercado ou oportunidades de negócio.',
  },
  religion: {
    keywords: [
      'religião', 'igreja', 'pastor', 'padre', 'bispo', 'papa',
      'católico', 'evangélico', 'protestante', 'espírita', 'umbanda',
      'candomblé', 'budismo', 'islamismo', 'judaísmo', 'ateísmo',
      'deus', 'jesus', 'maria', 'santo', 'bíblia', 'culto', 'missa',
      'oração', 'milagre', 'fé religiosa', 'crença religiosa',
    ],
    message: 'Discussões religiosas não são permitidas na Bulls. Mantenha o foco em finanças e negócios.',
  },
  personalLife: {
    keywords: [
      'namoro', 'casamento', 'divórcio', 'relacionamento amoroso',
      'família pessoal', 'filho', 'pai', 'mãe', 'cônjuge',
      'saúde pessoal', 'dieta', 'academia', 'fitness pessoal',
      'beleza', 'moda', 'maquiagem', 'cabelo', 'estética',
      'fofoca', 'treta', 'drama pessoal', 'vida pessoal',
    ],
    message: 'Conteúdo sobre vida pessoal não é relevante para a comunidade Bulls. Compartilhe conhecimento sobre investimentos e negócios.',
  },
  gambling: {
    keywords: [
      'aposta esportiva', 'bet', 'betting', 'jogo de azar',
      'cassino online', 'roleta', 'caça-níquel', 'poker',
      'blaze', 'betano', 'bet365', 'sportingbet',
      'loteria', 'mega-sena', 'quina', 'lotofácil',
    ],
    message: 'Apostas e jogos de azar não são investimentos. A Bulls promove educação financeira responsável.',
  }
};

// Exceções permitidas mesmo com palavras proibidas
const ALLOWED_CONTEXTS = [
  'política monetária',
  'política fiscal',
  'política econômica',
  'risco político',
  'cenário político-econômico',
  'reforma tributária',
  'reforma administrativa',
  'ações de empresa de tecnologia',
  'ações de empresa de entretenimento',
  'mercado de apostas regulamentado',
];

/**
 * Verifica se o conteúdo é permitido na plataforma
 */
export function moderateContent(content: string, ticker?: string): ModerationResult {
  const lowerContent = content.toLowerCase();
  
  // 1. Verifica se está em contexto permitido
  for (const context of ALLOWED_CONTEXTS) {
    if (lowerContent.includes(context.toLowerCase())) {
      return {
        isAllowed: true,
        confidence: 100,
      };
    }
  }

  // 2. Verifica temas proibidos
  for (const [category, data] of Object.entries(FORBIDDEN_TOPICS)) {
    for (const keyword of data.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        // Verifica se não é falso positivo (ex: "político" em "cenário político-econômico")
        const isFalsePositive = ALLOWED_CONTEXTS.some(ctx => 
          lowerContent.includes(ctx.toLowerCase())
        );
        
        if (!isFalsePositive) {
          return {
            isAllowed: false,
            reason: data.message,
            suggestedTopics: [
              'Análise de ações e investimentos',
              'Education financeira',
              'Notícias do mercado',
              'Estratégias de investimento',
              'Tendências de negócios',
            ],
            confidence: 95,
          };
        }
      }
    }
  }

  // 3. Verifica se tem conteúdo financeiro
  let hasFinancialContent = false;
  let financialKeywordsCount = 0;

  for (const topicKeywords of Object.values(ALLOWED_TOPICS)) {
    for (const keyword of topicKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        hasFinancialContent = true;
        financialKeywordsCount++;
      }
    }
  }

  // Se tem ticker, considera conteúdo financeiro
  if (ticker && ticker.length >= 4) {
    hasFinancialContent = true;
    financialKeywordsCount += 2;
  }

  // 4. Análise de confiança
  if (hasFinancialContent) {
    const confidence = Math.min(95, 60 + (financialKeywordsCount * 10));
    return {
      isAllowed: true,
      confidence,
    };
  }

  // 5. Conteúdo neutro/genérico - permite mas com aviso
  if (content.length < 50) {
    return {
      isAllowed: true,
      confidence: 50,
    };
  }

  // 6. Conteúdo sem indicadores financeiros - bloqueia suavemente
  return {
    isAllowed: false,
    reason: 'Seu post não parece estar relacionado a finanças, investimentos, negócios ou tecnologia. A Bulls é uma rede social focada no mercado financeiro.',
    suggestedTopics: [
      'Compartilhe uma análise de investimento',
      'Discuta tendências do mercado',
      'Ensine sobre educação financeira',
      'Comente sobre resultados de empresas',
      'Fale sobre tecnologias financeiras',
    ],
    confidence: 70,
  };
}

/**
 * Obtém sugestões de tópicos permitidos
 */
export function getSuggestedTopics(): string[] {
  return [
    '📊 Analysis de ações e FIIs',
    '💰 Renda fixa e Tesouro Direto',
    '₿ Criptomoedas e blockchain',
    '🚀 Startups e venture capital',
    '💼 Governança corporativa',
    '📈 Análise técnica e gráficos',
    '🏦 Resultados e balanços',
    '🌍 Economia e macroeconomia',
    '💡 Fintech e inovação',
    '📚 Education financeira',
  ];
}

/**
 * Verifica se hashtag é permitida
 */
export function isHashtagAllowed(hashtag: string): boolean {
  const lower = hashtag.toLowerCase();
  
  // Verifica se não está em temas proibidos
  for (const data of Object.values(FORBIDDEN_TOPICS)) {
    for (const keyword of data.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Diretrizes da comunidade
 */
export const COMMUNITY_GUIDELINES = {
  title: 'Diretrizes da Comunidade Bulls',
  sections: [
    {
      title: '✅ Permitido',
      items: [
        'Análises de ações, FIIs, criptomoedas e outros ativos',
        'Education financeira e compartilhamento de conhecimento',
        'Discussões sobre empresas, startups e negócios',
        'Notícias e comments sobre economia e mercado',
        'Tecnologias financeiras (fintech, blockchain, etc)',
        'Resultados, balanços e indicadores financeiros',
        'Estratégias de investimento e gestão de portfólio',
      ],
    },
    {
      title: '❌ Não Permitido',
      items: [
        'Política partidária ou discussões ideológicas',
        'Esportes, futebol, times e competições',
        'Entretenimento, música, filmes e celebridades',
        'Religião e crenças pessoais',
        'Vida pessoal, relacionamentos e fofocas',
        'Apostas esportivas e jogos de azar',
        'Conteúdo ofensivo, discriminatório ou ilegal',
      ],
    },
    {
      title: '⚠️ Política Econômica (Permitido)',
      items: [
        'Discussões sobre política monetária e fiscal',
        'Impacto de reformas na economia',
        'Análise de risco político em investimentos',
        'Decisões de governo que afetam o mercado',
      ],
    },
  ],
};

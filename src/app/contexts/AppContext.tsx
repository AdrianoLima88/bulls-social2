import React, { createContext, useContext, useState, useEffect } from 'react';

// Context API - Bulls Social Network
// Sistema completo de gerenciamento de estado com suporte a tipos de usuário e posts
// Tipos
interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  verified: boolean;
  userType: 'normal' | 'company' | 'media' | 'educator' | 'government'; // Novo campo
  banner?: string;
  avatar?: string;
  // Monetização
  subscriptionPlan?: 'free' | 'premium' | 'pro' | 'business';
  isPremium?: boolean;
  isCreator?: boolean;
  isBusinessAccount?: boolean;
  stripeCustomerId?: string;
  subscriptionEndDate?: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorRole: string;
  authorAvatar?: string;
  type: 'analysis' | 'opinion' | 'education' | 'media' | 'company' | 'news';
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    duration?: string;
  }[];
  charts?: any[]; // Gráficos anexados ao post
  documents?: any[]; // Documentos anexados ao post
  ticker?: string;
  tags?: string[];
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  time: string;
  timestamp: number;
  likedBy: string[];
  savedBy: string[];
  isPinned?: boolean;
  // Monetização
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorLogo?: string;
  isPremiumContent?: boolean;
  tipsReceived?: number;
  tipsAmount?: number;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  time: string;
  timestamp: number;
}

interface Asset {
  code: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  type: 'acao' | 'fii' | 'crypto' | 'renda_fixa';
  purchaseDate?: string;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'market';
  userId: string;
  userName: string;
  content: string;
  postId?: string;
  time: string;
  timestamp: number;
  read: boolean;
}

interface AppContextType {
  // Current User
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
  
  // Authentication
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  
  // Posts
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likedBy' | 'savedBy'>) => void;
  deletePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  togglePinPost: (postId: string) => void;
  getPostById: (postId: string) => Post | undefined;
  getUserPosts: (userId: string) => Post[];
  
  // Comments
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'likedBy'>) => void;
  getPostComments: (postId: string) => Comment[];
  toggleLikeComment: (commentId: string) => void;
  
  // Following
  following: string[];
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  
  // Portfolio - com persistência localStorage
  portfolio: Asset[];
  addAsset: (asset: Asset) => void;
  removeAsset: (code: string) => void;
  updateAsset: (code: string, updates: Partial<Asset>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current User - inicializar com dados do localStorage se existirem
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedProfile = localStorage.getItem('bullsUserProfile');
    const defaultUser = {
      id: 'user-1',
      name: 'Maria Silva',
      username: 'mariasilva',
      bio: '📊 Analyst de Investimentos | 8 anos de mercado financeiro | Especialista em ações e fundos imobiliários',
      location: 'São Paulo, SP',
      website: 'mariasilva.com',
      joinDate: 'Jan 2024',
      following: 1234,
      followers: 5678,
      verified: true,
      userType: 'educator' as const,
    };

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      return {
        ...defaultUser,
        name: profile.name || defaultUser.name,
        username: profile.username || defaultUser.username,
        bio: profile.bio || defaultUser.bio,
        location: profile.location || defaultUser.location,
        website: profile.website || defaultUser.website,
        email: profile.email,
      };
    }

    return defaultUser;
  });

  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Posts
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      authorId: 'user-2',
      authorName: 'Carlos Investor',
      authorUsername: 'carlosinvestidor',
      authorRole: 'Analyst',
      type: 'analysis',
      content: '📈 PETR4 rompeu resistência histórica! Análise técnica indica possível alta de 15% nas próximas semanas. Fundamentos da empresa continuam sólidos com o preço do petróleo em alta.',
      tags: ['PETR4', 'Petroleo', 'Analise'],
      likes: 234,
      comments: 45,
      shares: 23,
      time: 'há 2h',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-2',
      authorId: 'user-3',
      authorName: 'TechCorp Inc.',
      authorUsername: 'techcorp',
      authorRole: 'Company',
      type: 'company',
      content: '🚀 Acabamos de divulgar nossos resultados do Q1 2024! Crescimento de 35% no faturamento. Confira o balanço completo em nosso perfil.',
      tags: ['Balanço', 'Resultados'],
      likes: 512,
      comments: 89,
      shares: 45,
      time: 'há 4h',
      timestamp: Date.now() - 4 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-3',
      authorId: 'user-4',
      authorName: 'Maria Trader',
      authorUsername: 'mariatrader',
      authorRole: 'Day Trader',
      type: 'education',
      content: '💡 Dica para iniciantes: Diversificação é a chave! Não coloque todos os ovos na mesma cesta. Recomendo dividir entre ações, FIIs e renda fixa.',
      tags: ['Education', 'Diversificação'],
      likes: 892,
      comments: 156,
      shares: 78,
      time: 'há 5h',
      timestamp: Date.now() - 5 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-4',
      authorId: 'user-1',
      authorName: 'Maria Silva',
      authorUsername: 'mariasilva',
      authorRole: 'Analyst de Investimentos',
      type: 'analysis',
      content: '📊 Analysis completa de VALE3: empresa apresenta fundamentos sólidos com P/L atrativo de 5.2x. Produção de minério de ferro em alta e demanda chinesa aquecendo. Recomendação de compra! #VALE3 #Mineração',
      tags: ['VALE3', 'Mineração', 'Analise'],
      likes: 445,
      comments: 67,
      shares: 32,
      time: 'há 3h',
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-5',
      authorId: 'user-1',
      authorName: 'Maria Silva',
      authorUsername: 'mariasilva',
      authorRole: 'Analyst de Investimentos',
      type: 'education',
      content: '💰 Como montar uma carteira de dividendos? Thread completa:\n\n1️⃣ Escolha empresas com histórico consistente\n2️⃣ Diversifique entre setores\n3️⃣ Reinvista os dividendos\n4️⃣ Foco no longo prazo\n\n#Dividendos #InvestingLongoPrazo',
      tags: ['Dividendos', 'InvestimentosLongoPrazo', 'Education'],
      likes: 678,
      comments: 124,
      shares: 89,
      time: 'há 1 dia',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-6',
      authorId: 'user-1',
      authorName: 'Maria Silva',
      authorUsername: 'mariasilva',
      authorRole: 'Analyst de Investimentos',
      type: 'analysis',
      content: '🏢 FIIs: HGLG11 divulga resultado mensal com Dividend Yield de 0.95%. Vacância está em apenas 2.1%, excelente gestão de portfólio. Um dos meus favoritos para renda passiva!',
      tags: ['FIIs', 'HGLG11', 'RendaPassiva'],
      likes: 321,
      comments: 52,
      shares: 28,
      time: 'há 2 dias',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-7',
      authorId: 'user-1',
      authorName: 'Maria Silva',
      authorUsername: 'mariasilva',
      authorRole: 'Analyst de Investimentos',
      type: 'media',
      content: '📸 Resumo visual do meu portfólio de investimentos atualizado! Diversificação é fundamental. 💼✨',
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
        }
      ],
      tags: ['Portfolio', 'Investimentos'],
      likes: 892,
      comments: 134,
      shares: 67,
      time: 'há 3 dias',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-8',
      authorId: 'user-1',
      authorName: 'Maria Silva',
      authorUsername: 'mariasilva',
      authorRole: 'Analyst de Investimentos',
      type: 'media',
      content: '📊 Analysis técnica completa de ITUB4! Breakout confirmado com volume. Setup perfeito para swing trade! 🚀',
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=600&fit=crop',
        }
      ],
      tags: ['ITUB4', 'AnaliseGrafica', 'Trading'],
      likes: 1205,
      comments: 189,
      shares: 95,
      time: 'há 5 dias',
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-9',
      authorId: 'user-1',
      authorName: 'Maria Silva',
      authorUsername: 'mariasilva',
      authorRole: 'Analyst de Investimentos',
      type: 'media',
      content: '🎯 Setup de trabalho para análise de mercado! Qual é o seu? Compartilha aí! 💻📈',
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        }
      ],
      tags: ['Setup', 'Trading', 'Workspace'],
      likes: 654,
      comments: 98,
      shares: 45,
      time: 'há 1 semana',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    // POSTS DE NOTÍCIAS
    {
      id: 'post-10',
      authorId: 'user-10',
      authorName: 'InfoMoney',
      authorUsername: 'infomoney',
      authorRole: 'Veículo de Mídia',
      type: 'news',
      content: '🔴 URGENTE: Banco Central mantém taxa Selic em 10.50% ao ano. Copom sinaliza manutenção da taxa nos próximos meses devido à inflação controlada e atividade econômica aquecida.',
      tags: ['Selic', 'BancoCentral', 'Economia'],
      likes: 1834,
      comments: 267,
      shares: 412,
      time: 'há 1h',
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-11',
      authorId: 'user-11',
      authorName: 'Valor Econômico',
      authorUsername: 'valoreconomico',
      authorRole: 'Jornal',
      type: 'news',
      content: '📰 Ibovespa fecha em alta de 1.24% e volta aos 125 mil pontos. Vale e Petrobras puxam a alta com commodities em recuperação no mercado internacional.',
      tags: ['Ibovespa', 'Bolsa', 'Commodities'],
      likes: 923,
      comments: 145,
      shares: 178,
      time: 'há 3h',
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-12',
      authorId: 'user-12',
      authorName: 'Bloomberg Brasil',
      authorUsername: 'bloombergbr',
      authorRole: 'Agência de Notícias',
      type: 'news',
      content: '💵 Dólar cai 0.45% e fecha a R$ 4.92 com entrada de capital estrangeiro. Investores otimistas com aprovação de reformas econômicas no Congresso.',
      tags: ['Dolar', 'Cambio', 'Reformas'],
      likes: 756,
      comments: 98,
      shares: 134,
      time: 'há 6h',
      timestamp: Date.now() - 6 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-13',
      authorId: 'user-13',
      authorName: 'CNN Brasil Business',
      authorUsername: 'cnnbrbusiness',
      authorRole: 'Mídia Especializada',
      type: 'news',
      content: '⚡ Bitcoin sobe 2.18% e volta a negociar acima de US$ 52 mil. Expectativa de aprovação de novos ETFs de criptomoedas nos EUA impulsiona mercado cripto.',
      tags: ['Bitcoin', 'Crypto', 'ETF'],
      likes: 1245,
      comments: 234,
      shares: 189,
      time: 'há 8h',
      timestamp: Date.now() - 8 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    // POSTS DE EMPRESAS
    {
      id: 'post-14',
      authorId: 'user-14',
      authorName: 'Petrobras',
      authorUsername: 'petrobras',
      authorRole: 'Company de Energia',
      type: 'company',
      content: '⛽ Petrobras anuncia novo recorde de produção: 2.8 milhões de barris/dia em fevereiro! Investimentos em pré-sal garantem crescimento sustentável. #PETR4 #PETR3',
      tags: ['Petrobras', 'PreSal', 'Producao'],
      likes: 2134,
      comments: 345,
      shares: 567,
      time: 'há 2h',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-15',
      authorId: 'user-15',
      authorName: 'Magazine Luiza',
      authorUsername: 'magazineluiza',
      authorRole: 'Varejo',
      type: 'company',
      content: '🛍️ Black Friday do Magalu bateu recorde! Vendas online cresceram 47% vs ano anterior. Nosso ecossistema digital continua expandindo. Obrigado pela confiança! 💙',
      tags: ['Varejo', 'Ecommerce', 'MGLU3'],
      likes: 1567,
      comments: 234,
      shares: 298,
      time: 'há 5h',
      timestamp: Date.now() - 5 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-16',
      authorId: 'user-16',
      authorName: 'Itaú Unibanco',
      authorUsername: 'itau',
      authorRole: 'Banco',
      type: 'company',
      content: '🏦 Lucro líquido do Itaú cresce 12.3% no trimestre, alcançando R$ 8.2 bilhões! Portfolio de crédito expandiu com inadimplência controlada. Dividend yield atrativo para acionistas.',
      tags: ['Itau', 'Bancos', 'ITUB4'],
      likes: 1892,
      comments: 278,
      shares: 445,
      time: 'há 1 dia',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-17',
      authorId: 'user-17',
      authorName: 'Vale S.A.',
      authorUsername: 'vale',
      authorRole: 'Mineradora',
      type: 'company',
      content: '⛏️ Vale assina acordo para produção de minério de ferro sustentável com redução de 33% nas emissões de CO2. Investimento de US$ 2 bi em tecnologia verde até 2025.',
      tags: ['Vale', 'Sustentabilidade', 'VALE3'],
      likes: 1456,
      comments: 198,
      shares: 334,
      time: 'há 1 dia',
      timestamp: Date.now() - 26 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    {
      id: 'post-18',
      authorId: 'user-18',
      authorName: 'Nubank',
      authorUsername: 'nubank',
      authorRole: 'Fintech',
      type: 'company',
      content: '💜 70 milhões de clientes no Brasil! Obrigado por fazerem parte da nossa jornada. Agora com investimentos, seguros e shopping integrados no app. #ROXO',
      tags: ['Nubank', 'Fintech', 'Inovacao'],
      likes: 3421,
      comments: 567,
      shares: 892,
      time: 'há 2 dias',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      likedBy: [],
      savedBy: [],
    },
    // POSTS PATROCINADOS
    {
      id: 'post-19-sponsored',
      authorId: 'user-19',
      authorName: 'XP Investimentos',
      authorUsername: 'xpinvestimentos',
      authorRole: 'Corretora',
      type: 'company',
      content: '💼 Abra sua conta na XP e ganhe R$ 100 de bônus! Plataforma completa com ações, FIIs, renda fixa e muito mais. Taxa ZERO em corretagem para novos clientes.',
      tags: ['XP', 'Investimentos', 'Corretora'],
      likes: 145,
      comments: 23,
      shares: 12,
      time: 'Patrocinado',
      timestamp: Date.now(),
      likedBy: [],
      savedBy: [],
      isSponsored: true,
      sponsorName: 'XP Investimentos',
      sponsorLogo: '💼',
    },
    {
      id: 'post-20-sponsored',
      authorId: 'user-20',
      authorName: 'BTG Pactual',
      authorUsername: 'btgpactual',
      authorRole: 'Banco de Investimentos',
      type: 'company',
      content: '🏦 CDB BTG+ com liquidez diária pagando 110% do CDI! Invista a partir de R$ 100 e tenha rentabilidade superior à poupança. Protegido pelo FGC.',
      tags: ['CDB', 'RendaFixa', 'BTG'],
      likes: 234,
      comments: 45,
      shares: 28,
      time: 'Patrocinado',
      timestamp: Date.now(),
      likedBy: [],
      savedBy: [],
      isSponsored: true,
      sponsorName: 'BTG Pactual',
      sponsorLogo: '🏦',
    },
    {
      id: 'post-21-sponsored',
      authorId: 'user-21',
      authorName: 'Clear Corretora',
      authorUsername: 'clearcorretora',
      authorRole: 'Corretora',
      type: 'education',
      content: '📚 Curso GRATUITO: Como começar a investir na Bolsa! Aprenda análise técnica, fundamentalista e monte sua primeira carteira. Inscreva-se agora! 🚀',
      tags: ['Curso', 'Educacao', 'Bolsa'],
      likes: 567,
      comments: 89,
      shares: 156,
      time: 'Patrocinado',
      timestamp: Date.now(),
      likedBy: [],
      savedBy: [],
      isSponsored: true,
      sponsorName: 'Clear Corretora',
      sponsorLogo: '📚',
    },
  ]);

  // Comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment-1',
      postId: 'post-1',
      authorId: 'user-5',
      authorName: 'João Pedro',
      authorAvatar: 'JP',
      content: 'Excelente análise! Também estou otimista com PETR4.',
      likes: 12,
      likedBy: [],
      time: 'há 1h',
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
    },
  ]);

  // Following
  const [following, setFollowing] = useState<string[]>(['user-2', 'user-3', 'user-4']);

  // Portfolio - com persistência localStorage
  const [portfolio, setPortfolio] = useState<Asset[]>(() => {
    const savedPortfolio = localStorage.getItem('bullsPortfolio');
    return savedPortfolio ? JSON.parse(savedPortfolio) : [
      { code: 'PETR4', quantity: 100, avgPrice: 35.20, currentPrice: 38.52, type: 'acao' },
      { code: 'VALE3', quantity: 50, avgPrice: 62.40, currentPrice: 65.80, type: 'acao' },
      { code: 'HGLG11', quantity: 20, avgPrice: 158.30, currentPrice: 162.50, type: 'fii' },
      { code: 'BTC', quantity: 0.05, avgPrice: 48000, currentPrice: 52340, type: 'crypto' },
    ];
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'like',
      userId: 'user-5',
      userName: 'João Pedro',
      content: 'curtiu seu post',
      postId: 'post-1',
      time: 'há 5min',
      timestamp: Date.now() - 5 * 60 * 1000,
      read: false,
    },
  ]);

  // User methods
  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  // Post methods
  const addPost = (post: Omit<Post, 'id' | 'timestamp' | 'likedBy' | 'savedBy'>) => {
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      timestamp: Date.now(),
      likedBy: [],
      savedBy: [],
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setComments(prev => prev.filter(c => c.postId !== postId));
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(currentUser.id);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(id => id !== currentUser.id)
            : [...post.likedBy, currentUser.id],
        };
      }
      return post;
    }));
  };

  const toggleSavePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isSaved = post.savedBy.includes(currentUser.id);
        return {
          ...post,
          savedBy: isSaved
            ? post.savedBy.filter(id => id !== currentUser.id)
            : [...post.savedBy, currentUser.id],
        };
      }
      return post;
    }));
  };

  const togglePinPost = (postId: string) => {
    setPosts(prev => prev.map(post => ({
      ...post,
      isPinned: post.id === postId ? !post.isPinned : post.isPinned,
    })));
  };

  const getPostById = (postId: string) => {
    return posts.find(p => p.id === postId);
  };

  const getUserPosts = (userId: string) => {
    return posts.filter(p => p.authorId === userId).sort((a, b) => b.timestamp - a.timestamp);
  };

  // Comment methods
  const addComment = (comment: Omit<Comment, 'id' | 'timestamp' | 'likedBy'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      timestamp: Date.now(),
      likedBy: [],
    };
    setComments(prev => [newComment, ...prev]);
    
    // Increase comment count on post
    setPosts(prev => prev.map(p => 
      p.id === comment.postId ? { ...p, comments: p.comments + 1 } : p
    ));
  };

  const getPostComments = (postId: string) => {
    return comments.filter(c => c.postId === postId).sort((a, b) => b.timestamp - a.timestamp);
  };

  const toggleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const isLiked = comment.likedBy.includes(currentUser.id);
        return {
          ...comment,
          likes: isLiked ? comment.likes - 1 : comment.likes + 1,
          likedBy: isLiked
            ? comment.likedBy.filter(id => id !== currentUser.id)
            : [...comment.likedBy, currentUser.id],
        };
      }
      return comment;
    }));
  };

  // Following methods
  const toggleFollow = (userId: string) => {
    setFollowing(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  // Portfolio methods
  const addAsset = (asset: Asset) => {
    setPortfolio(prev => {
      const existingIndex = prev.findIndex(a => a.code === asset.code);
      if (existingIndex >= 0) {
        // Update existing asset
        const existing = prev[existingIndex];
        const totalQuantity = existing.quantity + asset.quantity;
        const totalInvested = (existing.quantity * existing.avgPrice) + (asset.quantity * asset.avgPrice);
        const newAvgPrice = totalInvested / totalQuantity;
        
        return prev.map((a, i) => i === existingIndex ? {
          ...a,
          quantity: totalQuantity,
          avgPrice: newAvgPrice,
        } : a);
      } else {
        return [...prev, asset];
      }
    });
  };

  const removeAsset = (code: string) => {
    setPortfolio(prev => prev.filter(a => a.code !== code));
  };

  const updateAsset = (code: string, updates: Partial<Asset>) => {
    setPortfolio(prev => prev.map(a => a.code === code ? { ...a, ...updates } : a));
  };

  // Notification methods
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Save portfolio no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('bullsPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Sincronizar currentUser com localStorage quando mudar
  useEffect(() => {
    const savedProfile = localStorage.getItem('bullsUserProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      // Criar objeto com dados atualizados do perfil
      const updatedData = {
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        email: profile.email,
      };

      // Verificar se há mudanças antes de atualizar para evitar loop infinito
      const hasChanges = Object.keys(updatedData).some(
        key => currentUser[key] !== updatedData[key]
      );

      if (hasChanges) {
        setCurrentUser(prev => ({ ...prev, ...updatedData }));
      }
    }
  }, []); // Executar apenas uma vez ao montar

  const value: AppContextType = {
    currentUser,
    updateCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    posts,
    addPost,
    deletePost,
    updatePost,
    toggleLikePost,
    toggleSavePost,
    togglePinPost,
    getPostById,
    getUserPosts,
    comments,
    addComment,
    getPostComments,
    toggleLikeComment,
    following,
    toggleFollow,
    isFollowing,
    portfolio,
    addAsset,
    removeAsset,
    updateAsset,
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
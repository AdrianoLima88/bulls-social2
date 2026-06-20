import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, X, ChevronRight, TrendingUp, TrendingDown, DollarSign, Euro, Bitcoin } from 'lucide-react';
import { AssetDetailsModal } from './AssetDetailsModal';
import { useLocale } from '../contexts/LocaleContext';

export const MarketScreen = ({ onBack, onNavigateToCurrencies }) => {
  const { t } = useLocale();
  const [marketTab, setMarketTab] = useState('acoes');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('volume');
  const [filterSector, setFilterSector] = useState('todos');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const stocks = [
    { code: 'PETR4', name: 'Petrobras', price: 38.52, change: 2.45, volume: '1.28B', sector: 'Energy', description: 'Petróleo Brasileiro S.A., maior empresa de energia do Brasil, atuando em exploração, produção e refino de petróleo.' },
    { code: 'VALE3', name: 'Vale', price: 65.80, change: 1.23, volume: '890M', sector: 'Mining', description: 'Vale S.A., uma das maiores mineradoras do mundo, produtora de minério de ferro e níquel.' },
    { code: 'ITUB4', name: 'Itaú Unibanco', price: 28.90, change: -0.85, volume: '650M', sector: 'Financial', description: 'Maior banco privado do Brasil, oferecendo serviços bancários completos.' },
    { code: 'BBDC4', name: 'Bradesco', price: 13.45, change: 0.56, volume: '540M', sector: 'Financial', description: 'Um dos maiores bancos do Brasil, com ampla rede de agências e serviços digitais.' },
    { code: 'ABEV3', name: 'Ambev', price: 12.34, change: -1.12, volume: '430M', sector: 'Consumer', description: 'Maior produtora de bebidas da América Latina, incluindo cervejas e refrigerantes.' },
    { code: 'WEGE3', name: 'WEG', price: 42.10, change: 3.45, volume: '320M', sector: 'Industrial', description: 'Fabricante de motores elétricos, geradores e automação industrial.' },
    { code: 'BBAS3', name: 'Banco do Brasil', price: 25.60, change: 0.78, volume: '425M', sector: 'Financial', description: 'Maior banco da América Latina em ativos, com forte presença no agronegócio.' },
    { code: 'MGLU3', name: 'Magazine Luiza', price: 3.85, change: 4.32, volume: '385M', sector: 'Varejo', description: 'Varejista multicanal com forte presença digital e física no Brasil.' },
    { code: 'RENT3', name: 'Localiza', price: 54.20, change: 1.56, volume: '215M', sector: 'Serviços', description: 'Maior locadora de veículos da América Latina.' },
    { code: 'ELET3', name: 'Eletrobras', price: 38.90, change: -0.45, volume: '380M', sector: 'Energy', description: 'Maior companhia de energia elétrica da América Latina.' },
    { code: 'SUZB3', name: 'Suzano', price: 48.75, change: 2.15, volume: '290M', sector: 'Papel e Celulose', description: 'Maior produtora de celulose de eucalipto do mundo.' },
    { code: 'B3SA3', name: 'B3', price: 12.80, change: 0.95, volume: '310M', sector: 'Financial', description: 'Bolsa de valores oficial do Brasil, operadora de mercado de capitais.' }
  ];

  const cryptos = [
    { code: 'BTC', name: 'Bitcoin', price: 52340, change: 5.23, volume: '25.4B', description: 'A primeira e mais conhecida criptomoeda descentralizada do mundo.' },
    { code: 'ETH', name: 'Ethereum', price: 2845, change: 3.45, volume: '12.8B', description: 'Plataforma blockchain para contratos inteligentes e aplicações descentralizadas.' },
    { code: 'BNB', name: 'Binance Coin', price: 385, change: -1.23, volume: '2.1B', description: 'Token nativo da Binance, maior exchange de criptomoedas do mundo.' },
    { code: 'SOL', name: 'Solana', price: 98, change: 8.45, volume: '1.5B', description: 'Blockchain de alta performance focada em DeFi e NFTs.' },
    { code: 'ADA', name: 'Cardano', price: 0.58, change: 2.85, volume: '650M', description: 'Plataforma blockchain com foco em sustentabilidade e escalabilidade.' },
    { code: 'XRP', name: 'Ripple', price: 0.52, change: -0.75, volume: '1.2B', description: 'Rede de pagamentos globais para transferências rápidas e baratas.' },
    { code: 'DOT', name: 'Polkadot', price: 7.25, change: 4.12, volume: '420M', description: 'Protocolo que permite interoperabilidade entre diferentes blockchains.' },
    { code: 'AVAX', name: 'Avalanche', price: 36.80, change: 6.34, volume: '580M', description: 'Plataforma para aplicações descentralizadas com alto throughput.' }
  ];

  const fiis = [
    { code: 'HGLG11', name: 'CSHG Logística', price: 162.50, change: 0.34, dividend: 1.20, sector: 'Logística', description: 'Fundo de investimento em galpões logísticos de alto padrão.' },
    { code: 'MXRF11', name: 'Maxi Renda', price: 10.45, change: -0.12, dividend: 0.08, sector: 'Tijolo', description: 'Fundo de lajes corporativas com foco em geração de renda.' },
    { code: 'KNRI11', name: 'Kinea Renda', price: 165.80, change: 0.56, dividend: 1.35, sector: 'Tijolo', description: 'Fundo com portfólio diversificado de imóveis comerciais.' },
    { code: 'VISC11', name: 'Vinci Shopping', price: 118.40, change: 1.23, dividend: 0.95, sector: 'Shopping', description: 'Fundo focado em shopping centers de alta qualidade.' },
    { code: 'XPML11', name: 'XP Malls', price: 105.60, change: -0.45, dividend: 0.88, sector: 'Shopping', description: 'Fundo de investimento em shopping centers premium.' },
    { code: 'ALZR11', name: 'Alianza Trust', price: 99.80, change: 0.78, dividend: 0.82, sector: 'Lajes Corporativas', description: 'Fundo de edifícios comerciais em localização privilegiada.' },
    { code: 'BTLG11', name: 'BTG Logística', price: 105.30, change: 1.45, dividend: 0.90, sector: 'Logística', description: 'Galpões logísticos em regiões estratégicas do país.' },
    { code: 'KNCR11', name: 'Kinea Crédito', price: 98.75, change: 0.25, dividend: 0.85, sector: 'Papel', description: 'Fundo de recebíveis imobiliários com foco em crédito.' }
  ];

  const international = [
    { code: 'AAPL', name: 'Apple Inc.', price: 182.45, change: 1.85, volume: '45.2M', market: 'NASDAQ', description: 'Líder global em tecnologia, fabricante do iPhone, iPad e Mac.' },
    { code: 'MSFT', name: 'Microsoft', price: 415.30, change: 2.12, volume: '28.5M', market: 'NASDAQ', description: 'Company de software e serviços em nuvem, criadora do Windows e Office.' },
    { code: 'GOOGL', name: 'Alphabet', price: 142.80, change: -0.45, volume: '22.3M', market: 'NASDAQ', description: 'Controladora do Google, líder em busca online e publicidade digital.' },
    { code: 'TSLA', name: 'Tesla', price: 245.60, change: 3.85, volume: '95.8M', market: 'NASDAQ', description: 'Fabricante de veículos elétricos e soluções de energia sustentável.' },
    { code: 'NVDA', name: 'NVIDIA', price: 875.20, change: 4.23, volume: '38.6M', market: 'NASDAQ', description: 'Líder em chips gráficos e tecnologia de inteligência artificial.' },
    { code: 'AMZN', name: 'Amazon', price: 178.90, change: -1.12, volume: '32.4M', market: 'NASDAQ', description: 'Maior varejista online do mundo e líder em computação em nuvem.' },
    { code: 'META', name: 'Meta Platforms', price: 485.60, change: 2.67, volume: '18.9M', market: 'NASDAQ', description: 'Company de tecnologia dona do Facebook, Instagram e WhatsApp.' },
    { code: 'JPM', name: 'JPMorgan Chase', price: 195.40, change: 0.85, volume: '12.6M', market: 'NYSE', description: 'Maior banco dos Estados Unidos em ativos.' },
    { code: 'V', name: 'Visa', price: 278.30, change: 1.34, volume: '8.2M', market: 'NYSE', description: 'Líder global em pagamentos eletrônicos.' },
    { code: 'JNJ', name: 'Johnson & Johnson', price: 156.80, change: -0.23, volume: '10.5M', market: 'NYSE', description: 'Conglomerado farmacêutico e de produtos de saúde.' }
  ];

  // Função para filtrar e ordenar ativos
  const getFilteredAndSortedAssets = () => {
    let assets = [];
    
    // Seleciona os ativos de acordo com a aba
    if (marketTab === 'acoes') assets = stocks;
    else if (marketTab === 'fiis') assets = fiis;
    else if (marketTab === 'crypto') assets = cryptos;
    else if (marketTab === 'inter') assets = international;

    // Filtra por busca
    if (searchQuery) {
      assets = assets.filter(asset => 
        asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtra por setor (apenas para ações)
    if (marketTab === 'acoes' && filterSector !== 'todos') {
      assets = assets.filter(asset => 
        asset.sector?.toLowerCase() === filterSector.toLowerCase()
      );
    }

    // Ordena
    if (sortBy === 'volume') {
      assets = [...assets].sort((a, b) => {
        const volA = parseFloat(a.volume?.replace(/[BMK]/g, '')) || 0;
        const volB = parseFloat(b.volume?.replace(/[BMK]/g, '')) || 0;
        return volB - volA;
      });
    } else if (sortBy === 'high') {
      assets = [...assets].sort((a, b) => b.change - a.change);
    } else if (sortBy === 'low') {
      assets = [...assets].sort((a, b) => a.change - b.change);
    } else if (sortBy === 'price') {
      assets = [...assets].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'alphabetic') {
      assets = [...assets].sort((a, b) => a.code.localeCompare(b.code));
    }

    return assets;
  };

  const filteredAssets = getFilteredAndSortedAssets();

  // Determina o tipo de ativo para o modal
  const getAssetType = () => {
    if (marketTab === 'acoes') return 'stock';
    if (marketTab === 'fiis') return 'fii';
    if (marketTab === 'crypto') return 'crypto';
    if (marketTab === 'inter') return 'international';
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">{t('market.title')}</h1>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
          >
            <Filter className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Campo de Busca */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('market.search')}
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:bg-white/30 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Índices Principais */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-slate-600 text-sm mb-1">IBOVESPA</p>
            <p className="text-xl font-bold text-slate-900">127.845</p>
            <p className="text-green-600 text-sm font-semibold">+1.24%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-slate-600 text-sm mb-1">S&P 500</p>
            <p className="text-xl font-bold text-slate-900">5.234</p>
            <p className="text-red-600 text-sm font-semibold">-0.34%</p>
          </div>
        </div>

        {/* Câmbio - Moedas */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">{t('market.liveQuotes')}</h3>
                <p className="text-white/80 text-xs">{t('market.realTime')}</p>
              </div>
            </div>
            <button
              onClick={onNavigateToCurrencies}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition flex items-center gap-1"
            >
              {t('market.viewAll')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Dólar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-semibold">USD</span>
              </div>
              <p className="text-white font-bold text-sm">€ 5,23</p>
              <p className="text-red-200 text-xs font-semibold">-0.45%</p>
            </div>

            {/* Euro */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <Euro className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-semibold">EUR</span>
              </div>
              <p className="text-white font-bold text-sm">€ 5,67</p>
              <p className="text-green-200 text-xs font-semibold">+0.32%</p>
            </div>

            {/* Bitcoin */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <Bitcoin className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-semibold">BTC</span>
              </div>
              <p className="text-white font-bold text-sm">287k</p>
              <p className="text-green-200 text-xs font-semibold">+2.18%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => { setMarketTab('acoes'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${
              marketTab === 'acoes' ? 'bg-green-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            {t('market.stocks')}
          </button>
          <button 
            onClick={() => { setMarketTab('fiis'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${
              marketTab === 'fiis' ? 'bg-green-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            {t('market.fiis')}
          </button>
          <button 
            onClick={() => { setMarketTab('crypto'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${
              marketTab === 'crypto' ? 'bg-green-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            {t('market.crypto')}
          </button>
          <button 
            onClick={() => { setMarketTab('inter'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${
              marketTab === 'inter' ? 'bg-green-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            {t('market.international')}
          </button>
        </div>

        {/* Lista de Ativos */}
        <div className="space-y-2">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <div 
                key={asset.code} 
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{asset.code}</h3>
                    <span className="text-xs text-slate-500 truncate">{asset.name}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {marketTab === 'fiis' 
                      ? `Dividend: € ${asset.dividend.toFixed(2)}`
                      : marketTab === 'inter'
                      ? `${asset.market} • Vol: ${asset.volume}`
                      : `Vol: ${marketTab === 'crypto' ? '$' : ''}${asset.volume}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {marketTab === 'acoes' || marketTab === 'fiis' ? '€ ' : '$'}
                    {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm font-semibold ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-green-600 ml-3 flex-shrink-0" />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No assets found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtro */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Filters & Sort</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Ordenar por */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 mb-3">Ordenar por</h3>
              <div className="space-y-2">
                {[
                  { value: 'volume', label: 'Highest volume', icon: '📊' },
                  { value: 'high', label: 'Top gainers', icon: '📈' },
                  { value: 'low', label: 'Top losers', icon: '📉' },
                  { value: 'price', label: 'Highest price', icon: '💰' },
                  { value: 'alphabetic', label: 'Alphabetical', icon: '🔤' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                      sortBy === option.value 
                        ? 'bg-green-50 border-2 border-green-600' 
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className={`font-semibold ${sortBy === option.value ? 'text-green-700' : 'text-slate-700'}`}>
                        {option.label}
                      </span>
                    </div>
                    {sortBy === option.value && (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by sector (apenas para Ações) */}
            {marketTab === 'acoes' && (
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Filter by sector</h3>
                <div className="space-y-2">
                  {[
                    { value: 'todos', label: 'All sectors', icon: '🌐' },
                    { value: 'financeiro', label: 'Financial', icon: '🏦' },
                    { value: 'energia', label: 'Energy', icon: '⚡' },
                    { value: 'tecnologia', label: 'Technology', icon: '💻' },
                    { value: 'consumo', label: 'Consumer', icon: '🛒' },
                    { value: 'industrial', label: 'Industrial', icon: '🏭' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilterSector(option.value)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                        filterSector === option.value 
                          ? 'bg-green-50 border-2 border-green-600' 
                          : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <span className={`font-semibold ${filterSector === option.value ? 'text-green-700' : 'text-slate-700'}`}>
                          {option.label}
                        </span>
                      </div>
                      {filterSector === option.value && (
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button 
                onClick={() => {
                  setSortBy('volume');
                  setFilterSector('todos');
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Ativo */}
      {selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          assetType={getAssetType()}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};
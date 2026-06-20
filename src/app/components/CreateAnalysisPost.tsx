import React, { useState } from 'react';
import { ArrowLeft, ImageIcon, BarChart3, FileText, Eye, Video, Link as LinkIcon } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

export const CreateAnalysisPost = ({ onBack, onPublish }) => {
  const { t } = useLocale();
  const [postType, setPostType] = useState('analysis');
  const [content, setContent] = useState('');
  
  // Estados específicos para Análise
  const [ticker, setTicker] = useState('');
  const [recommendation, setRecommendation] = useState('COMPRA');
  const [currentPrice, setCurrentPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [analysisType, setAnalysisType] = useState('técnica');
  const [timeframe, setTimeframe] = useState('curto');
  
  // Estados específicos para Opinião
  const [opinionTopic, setOpinionTopic] = useState('mercado');
  const [opinionTone, setOpinionTone] = useState('neutro');
  const [opinionTitle, setOpinionTitle] = useState('');
  
  // Estados específicos para Education
  const [eduTitle, setEduTitle] = useState('');
  const [eduCategory, setEduCategory] = useState('fundamentos');
  const [eduLevel, setEduLevel] = useState('iniciante');
  const [eduReadTime, setEduReadTime] = useState('5');
  const [eduTopics, setEduTopics] = useState(['']);
  const [eduFormat, setEduFormat] = useState('texto');
  const [eduVideoUrl, setEduVideoUrl] = useState('');
  const [eduResources, setEduResources] = useState([]);
  
  const addEduTopic = () => {
    setEduTopics([...eduTopics, '']);
  };
  
  const removeEduTopic = (index) => {
    setEduTopics(eduTopics.filter((_, i) => i !== index));
  };
  
  const updateEduTopic = (index, value) => {
    const newTopics = [...eduTopics];
    newTopics[index] = value;
    setEduTopics(newTopics);
  };
  
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white font-semibold">
            Cancel
          </button>
          <h1 className="text-white font-bold text-lg">Nova Análise</h1>
          <button 
            onClick={() => {
              if (content.trim() && ticker) {
                onPublish();
              }
            }}
            className={`font-semibold ${(content.trim() && ticker) ? 'text-white' : 'text-white/50'}`}
          >
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Post Type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-3">Tipo de publicação</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPostType('analysis')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold ${
                postType === 'analysis' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              📊 Analysis
            </button>
            <button 
              onClick={() => setPostType('opinion')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold ${
                postType === 'opinion' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              💭 Opinião
            </button>
            <button 
              onClick={() => setPostType('education')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold ${
                postType === 'education' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              📚 Education
            </button>
          </div>
        </div>

        {/* Campos Específicos para Análise */}
        {postType === 'analysis' && (
          <>
            {/* Ticker / Ativo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Ticker / Ativo *
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder={t('createPost.ticker')}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={10}
              />
            </div>

            {/* Recomendação */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Recomendação *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRecommendation('COMPRA FORTE')}
                  className={`py-3 px-4 rounded-xl font-bold transition ${
                    recommendation === 'COMPRA FORTE'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🚀 Compra Forte
                </button>
                <button
                  onClick={() => setRecommendation('COMPRA')}
                  className={`py-3 px-4 rounded-xl font-bold transition ${
                    recommendation === 'COMPRA'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ✅ Compra
                </button>
                <button
                  onClick={() => setRecommendation('NEUTRO')}
                  className={`py-3 px-4 rounded-xl font-bold transition ${
                    recommendation === 'NEUTRO'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⚖️ Neutro
                </button>
                <button
                  onClick={() => setRecommendation('VENDA')}
                  className={`py-3 px-4 rounded-xl font-bold transition ${
                    recommendation === 'VENDA'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⛔ Venda
                </button>
              </div>
            </div>

            {/* Preços */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold mb-2 block">
                    Preço Atual
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                      €
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      placeholder="38.50"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold mb-2 block">
                    Preço Alvo
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                      €
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="42.00"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>
              {currentPrice && targetPrice && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl">
                  <p className="text-green-700 font-semibold text-center">
                    Potencial de {((parseFloat(targetPrice) / parseFloat(currentPrice) - 1) * 100).toFixed(2)}% 📈
                  </p>
                </div>
              )}
            </div>

            {/* Tipo de Análise */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Tipo de Análise
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAnalysisType('técnica')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    analysisType === 'técnica'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📈 Técnica
                </button>
                <button
                  onClick={() => setAnalysisType('fundamentalista')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    analysisType === 'fundamentalista'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📊 Fundamentalista
                </button>
                <button
                  onClick={() => setAnalysisType('híbrida')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    analysisType === 'híbrida'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🔄 Híbrida
                </button>
              </div>
            </div>

            {/* Prazo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Prazo da Operação
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTimeframe('curto')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    timeframe === 'curto'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⚡ Curto (dias)
                </button>
                <button
                  onClick={() => setTimeframe('médio')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    timeframe === 'médio'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📅 Médio (meses)
                </button>
                <button
                  onClick={() => setTimeframe('longo')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    timeframe === 'longo'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🎯 Longo (anos)
                </button>
              </div>
            </div>
          </>
        )}

        {/* Campos Específicos para Opinião */}
        {postType === 'opinion' && (
          <>
            {/* Tópico da Opinião */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Tópico da Opinião *
              </label>
              <input
                type="text"
                value={opinionTopic}
                onChange={(e) => setOpinionTopic(e.target.value)}
                placeholder="Ex: Market, Economia, Investimentos..."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={50}
              />
            </div>

            {/* Tom da Opinião */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Tom da Opinião
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setOpinionTone('positivo')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    opinionTone === 'positivo'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🚀 Positivo
                </button>
                <button
                  onClick={() => setOpinionTone('neutro')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    opinionTone === 'neutro'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⚖️ Neutro
                </button>
                <button
                  onClick={() => setOpinionTone('negativo')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    opinionTone === 'negativo'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⛔ Negativo
                </button>
              </div>
            </div>

            {/* Título da Opinião */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Título da Opinião *
              </label>
              <input
                type="text"
                value={opinionTitle}
                onChange={(e) => setOpinionTitle(e.target.value)}
                placeholder="Ex: 'O que esperar do mercado em 2023'..."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={100}
              />
            </div>
          </>
        )}

        {/* Campos Específicos para Education */}
        {postType === 'education' && (
          <>
            {/* Título da Education */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Título da Education *
              </label>
              <input
                type="text"
                value={eduTitle}
                onChange={(e) => setEduTitle(e.target.value)}
                placeholder="E.g. 'Intro to Day Trading'..."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={100}
              />
            </div>

            {/* Categoria da Education */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Categoria da Education
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEduCategory('fundamentos')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduCategory === 'fundamentos'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📊 Fundamentos
                </button>
                <button
                  onClick={() => setEduCategory('técnica')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduCategory === 'técnica'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📈 Técnica
                </button>
                <button
                  onClick={() => setEduCategory('estratégia')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduCategory === 'estratégia'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🔄 Estratégia
                </button>
              </div>
            </div>

            {/* Nível da Education */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Nível da Education
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEduLevel('iniciante')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduLevel === 'iniciante'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🚀 Iniciante
                </button>
                <button
                  onClick={() => setEduLevel('intermediário')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduLevel === 'intermediário'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⚖️ Intermediário
                </button>
                <button
                  onClick={() => setEduLevel('avançado')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduLevel === 'avançado'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⛔ Avançado
                </button>
              </div>
            </div>

            {/* Tempo de Leitura */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Tempo de Leitura (minutos)
              </label>
              <input
                type="number"
                value={eduReadTime}
                onChange={(e) => setEduReadTime(e.target.value)}
                placeholder="Ex: 5..."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={2}
              />
            </div>

            {/* Tópicos da Education */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Tópicos da Education *
              </label>
              {eduTopics.map((topic, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateEduTopic(index, e.target.value)}
                    placeholder="E.g. 'Intro to Day Trading'..."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    maxLength={50}
                  />
                  <button
                    onClick={() => removeEduTopic(index)}
                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-full font-semibold"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={addEduTopic}
                className="px-3 py-2 bg-green-500 text-white rounded-full font-semibold"
              >
                +
              </button>
            </div>

            {/* Formato da Education */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-3 block">
                Formato da Education
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEduFormat('texto')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduFormat === 'texto'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📝 Texto
                </button>
                <button
                  onClick={() => setEduFormat('vídeo')}
                  className={`py-2 px-3 rounded-xl font-semibold text-sm transition ${
                    eduFormat === 'vídeo'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🎥 Vídeo
                </button>
              </div>
            </div>

            {/* URL do Vídeo */}
            {eduFormat === 'vídeo' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <label className="text-slate-700 font-semibold mb-2 block">
                  URL do Vídeo
                </label>
                <input
                  type="text"
                  value={eduVideoUrl}
                  onChange={(e) => setEduVideoUrl(e.target.value)}
                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            )}

            {/* Recursos Adicionais */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <label className="text-slate-700 font-semibold mb-2 block">
                Recursos Adicionais
              </label>
              <div className="flex flex-wrap gap-2">
                {eduResources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-green-600" />
                    <a href={resource} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 underline">
                      {resource}
                    </a>
                    <button
                      onClick={() => setEduResources(eduResources.filter((_, i) => i !== index))}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-full font-semibold"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newResource = prompt('Digite a URL do recurso adicional:');
                    if (newResource) {
                      setEduResources([...eduResources, newResource]);
                    }
                  }}
                  className="px-3 py-2 bg-green-500 text-white rounded-full font-semibold"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {/* Área de Texto */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <label className="text-slate-700 font-semibold mb-2 block">
            {postType === 'analysis' ? 'Detalhes da Análise *' : 'Content'}
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'analysis' 
                ? 'Describe your investment thesis, technical indicators, fundamentals, risks and opportunities...'
                : 'Share your opinion or knowledge with the Bulls community...'
            }
            className="w-full h-64 text-slate-700 resize-none focus:outline-none bg-slate-50 rounded-xl p-4"
            maxLength={5000}
          />
          <div className="flex items-center justify-between pt-3">
            <div className="flex gap-2">
              <button 
                onClick={() => alert('Função de adicionar imagem será implementada em breve! 📷')}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => alert('Função de adicionar gráfico será implementada em breve! 📊')}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => alert('Função de adicionar documento será implementada em breve! 📄')}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-slate-500">{content.length} / 5000</span>
          </div>
        </div>

        {/* Preview da Análise */}
        {postType === 'analysis' && ticker && recommendation && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm mb-4 border-2 border-green-200">
            <p className="text-green-700 font-bold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview da sua análise
            </p>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black text-green-700">{ticker || 'TICKER'}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                    recommendation === 'COMPRA FORTE' ? 'bg-green-600 text-white' :
                    recommendation === 'COMPRA' ? 'bg-green-500 text-white' :
                    recommendation === 'NEUTRO' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {recommendation}
                  </span>
                </div>
                {currentPrice && targetPrice && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Preço Atual</p>
                    <p className="text-lg font-bold text-slate-800">€ {parseFloat(currentPrice).toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">Alvo</p>
                    <p className="text-md font-bold text-green-600">€ {parseFloat(targetPrice).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                  {analysisType}
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                  {timeframe} prazo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Preview da Opinião */}
        {postType === 'opinion' && opinionTitle && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 shadow-sm mb-4 border-2 border-blue-200">
            <p className="text-blue-700 font-bold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview da sua opinião
            </p>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  💭 OPINIÃO
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  opinionTone === 'positivo' ? 'bg-green-100 text-green-700' :
                  opinionTone === 'neutro' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {opinionTone === 'positivo' ? '🚀 Positivo' :
                   opinionTone === 'neutro' ? '⚖️ Neutro' :
                   '⛔ Negativo'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{opinionTitle}</h3>
              <p className="text-sm text-slate-600">
                {content ? content.substring(0, 100) + '...' : 'Seu conteúdo aparecerá aqui...'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  📌 {opinionTopic}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Preview da Education */}
        {postType === 'education' && eduTitle && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 shadow-sm mb-4 border-2 border-orange-200">
            <p className="text-orange-700 font-bold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview do seu conteúdo educacional
            </p>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-xs font-bold">
                  📚 EDUCAÇÃO
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  eduLevel === 'iniciante' ? 'bg-green-100 text-green-700' :
                  eduLevel === 'intermediário' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {eduLevel === 'iniciante' ? '🚀 Iniciante' :
                   eduLevel === 'intermediário' ? '⚖️ Intermediário' :
                   '⭐ Avançado'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{eduTitle}</h3>
              <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                <span>📊 {eduCategory}</span>
                <span>⏱️ {eduReadTime} min</span>
              </div>
              {eduTopics.filter(t => t.trim()).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-slate-700 mb-2">📝 O que você vai aprender:</p>
                  <div className="space-y-1">
                    {eduTopics.filter(t => t.trim()).map((topic, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags Sugeridas */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-slate-700 font-semibold mb-3">Tags sugeridas</p>
          <div className="flex flex-wrap gap-2">
            {postType === 'analysis' 
              ? ['#Analysis', '#Trading', ticker ? `#${ticker}` : '#Stocks', '#FTSE100', '#LSE', '#DayTrading'].filter(Boolean).map(tag => (
                  <button 
                    key={tag}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold hover:bg-green-100 transition"
                  >
                    {tag}
                  </button>
                ))
              : ['#Investing', '#Market', '#Tips', '#Education'].map(tag => (
                  <button 
                    key={tag}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold hover:bg-green-100 transition"
                  >
                    {tag}
                  </button>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
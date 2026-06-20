import React from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { COMMUNITY_GUIDELINES } from '../utils/ContentModeration';

export const CommunityGuidelinesScreen = ({ onBack }) => {
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-4 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{COMMUNITY_GUIDELINES.title}</h1>
            <p className="text-sm text-white/90">Mantenha a Bulls focada em finanças</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">{/* Adicionado pb-24 para espaço no final */}
        {/* Hero */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bem-vindo à Bulls!</h2>
              <p className="text-white/90 text-sm">Uma comunit focada em investimentos</p>
            </div>
          </div>
          <p className="text-white/95 text-sm leading-relaxed">
            Bulls is a social network specialised in financial markets, investing, 
            negócios e tecnologia. Para manter a qualidade das discussões, seguimos 
            diretrizes rigorosas de conteúdo.
          </p>
        </div>

        {/* Allowed Content */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">✅ Content Permitido</h3>
          </div>
          
          <div className="space-y-3">
            {COMMUNITY_GUIDELINES.sections[0].items.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 bg-green-50 rounded-lg p-3 border border-green-100"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forbidden Content */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">❌ Content Proibido</h3>
          </div>
          
          <div className="space-y-3">
            {COMMUNITY_GUIDELINES.sections[1].items.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 bg-red-50 rounded-lg p-3 border border-red-100"
              >
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exception: Economic Policy */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">⚠️ Exceção Importante</h3>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">
            <span className="font-bold text-slate-900">Política Econômica é PERMITIDA</span> quando 
            relacionada a investimentos e mercado financeiro:
          </p>
          
          <div className="space-y-3">
            {COMMUNITY_GUIDELINES.sections[2].items.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 bg-yellow-50 rounded-lg p-3 border border-yellow-100"
              >
                <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border border-yellow-200">
            <p className="text-xs text-slate-700">
              <span className="font-bold">Exemplo:</span> "A alta da taxa Selic pode impactar negativamente 
              ações de varejo" ✅ PERMITIDO<br/>
              <br/>
              "John is better than Jane" ❌ PROHIBITED
            </p>
          </div>
        </div>

        {/* Moderation Process */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">🤖 System de Moderação</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">1.</span>
              <span>All posts are automatically reviewed before publishing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">2.</span>
              <span>Off-topic content is blocked with improvement suggestions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">3.</span>
              <span>Users can report inappropriate posts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">4.</span>
              <span>Repeated violations may result in account suspension</span>
            </li>
          </ul>
        </div>

        {/* Consequences */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-3">⚖️ Consequências de Violações</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-yellow-700">1ª</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Primeiro aviso</p>
                <p className="text-sm text-slate-600">Post bloqueado com orientação</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange-700">2-3ª</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Avisos subsequentes</p>
                <p className="text-sm text-slate-600">Restrição temporária de postagens (24-72h)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-red-700">4+</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Violações repetidas</p>
                <p className="text-sm text-slate-600">Suspensão ou banimento permanente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white text-center">
          <h3 className="font-bold text-lg mb-2">💚 Obrigado por fazer parte da Bulls!</h3>
          <p className="text-white/90 text-sm">
            Juntos construímos a melhor comunit de investidores do Brasil.
          </p>
        </div>
      </div>
    </div>
  );
};
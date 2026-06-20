import React from 'react';
import { AlertTriangle, X, Lightbulb, BookOpen } from 'lucide-react';

interface ContentWarningModalProps {
  moderationResult: {
    reason?: string;
    suggestedTopics?: string[];
  };
  onClose: () => void;
  onViewGuidelines: () => void;
}

export const ContentWarningModal: React.FC<ContentWarningModalProps> = ({
  moderationResult,
  onClose,
  onViewGuidelines,
}) => {
  const { reason, suggestedTopics } = moderationResult || {};
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Content Fora do Escopo</h2>
              <p className="text-white/90 text-sm">Bulls é focado em finanças</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Reason */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-slate-700 text-sm leading-relaxed">
              {reason}
            </p>
          </div>

          {/* Suggested Topics */}
          {suggestedTopics && suggestedTopics.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h3 className="font-bold text-slate-900">Tópicos Sugeridos:</h3>
              </div>
              <div className="space-y-2">
                {suggestedTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 bg-slate-50 rounded-lg p-3"
                  >
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <p className="text-sm text-slate-700">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulls Focus */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-green-800 mb-2">📊 Foco da Bulls:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Investments and financial markets</li>
              <li>• Business and entrepreneurship</li>
              <li>• Technology and innovation</li>
              <li>• Economics and analysis</li>
              <li>• Financial education</li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={onViewGuidelines}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Ver Diretrizes Completas
            </button>

            <button
              onClick={onClose}
              className="w-full text-slate-600 hover:text-slate-800 font-semibold py-3 transition"
            >
              Revisar Meu Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { X, Check, Shield, Download, HelpCircle, Globe, Type, UserX, Ban, Eye, MessageSquare, ChevronRight } from 'lucide-react';

export const PremiumModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
        <h3 className="font-bold text-lg text-slate-900">Assinatura Premium</h3>
        <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
          <h4 className="font-bold text-xl mb-2">Bulls Premium</h4>
          <p className="text-white/90 mb-4">Ativo até 05/04/2026</p>
          <p className="text-3xl font-bold">€ 29,90<span className="text-lg font-normal">/mês</span></p>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-3">Benefícios inclusos:</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Acesso a conteúdo exclusivo</p>
                <p className="text-sm text-slate-600">Analyses premium e relatórios avançados</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Ad-free</p>
                <p className="text-sm text-slate-600">Navegue sem interrupções</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Badge verificado</p>
                <p className="text-sm text-slate-600">Destaque seu perfil com selo verificado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-slate-900 mb-3">Opções:</h4>
          <div className="space-y-2">
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">Alterar plano</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">Cancel assinatura</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">History de pagamentos</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyModal = ({ onClose }) => {
  const blockedUsers = [
    { id: 1, name: '@spam_bot_123', reason: 'Spam' },
    { id: 2, name: '@usuario_problema', reason: 'Content inadequado' },
    { id: 3, name: '@usuario_bloqueado', reason: 'Assédio' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bold text-lg text-slate-900">Privacy e Bloqueios</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-700 mb-2"><strong>Accounts bloqueadas não podem:</strong></p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• View your posts</li>
              <li>• Follow you</li>
              <li>• Send direct messages</li>
              <li>• Comment on your posts</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">Accounts Bloqueadas ({blockedUsers.length})</h4>
            <div className="space-y-2">
              {blockedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                      <UserX className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.reason}</p>
                    </div>
                  </div>
                  <button className="text-sm text-red-600 font-semibold hover:text-red-700">
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SecurityModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
        <h3 className="font-bold text-lg text-slate-900">Security</h3>
        <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Autenticação em 2 Etapas</h4>
              <p className="text-sm text-blue-700">
                Two-factor authentication adds an extra layer of security to your account.
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-600 bg-blue-100 rounded-lg p-2">
            ✓ Atualmente ativada via SMS
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-3">Opções disponíveis:</h4>
          <div className="space-y-2">
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">Alterar método (SMS/App Autenticador)</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">Gerar códigos de backup</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">Desativar 2FA</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition">
              <span className="text-sm font-semibold text-slate-900">Ver dispositivos confiáveis</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const FontSizeModal = ({ onClose, fontSize, setFontSize }) => {
  const fontSizes = [
    { id: 'small', label: 'Pequeno', size: 'text-sm' },
    { id: 'medium', label: 'Médio (atual)', size: 'text-base' },
    { id: 'large', label: 'Grande', size: 'text-lg' },
    { id: 'xlarge', label: 'Muito Grande', size: 'text-xl' }
  ];

  const handleSelect = (size) => {
    setFontSize(size);
    alert(`✅ Tamanho de fonte alterado para ${fontSizes.find(f => f.id === size)?.label}\\n\\nThe change will be applied across the entire app.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bold text-lg text-slate-900">Tamanho de Fonte</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-600 mb-4">Escolha o tamanho de fonte ideal para você:</p>
          {fontSizes.map(size => (
            <button
              key={size.id}
              onClick={() => handleSelect(size.id)}
              className={`w-full p-4 rounded-xl border-2 transition ${
                fontSize === size.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${size.size}`}>{size.label}</span>
                {fontSize === size.id && (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
          <p className="text-xs text-slate-500 mt-4 text-center">
            The change will be applied across the entire app.
          </p>
        </div>
      </div>
    </div>
  );
};

export const LanguageModal = ({ onClose, language, setLanguage }) => {
  const languages = [
    { id: 'pt-BR', label: 'Português (BR) - atual', flag: '🇧🇷' },
    { id: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { id: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { id: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { id: 'de-DE', label: 'Deutsch', flag: '🇩🇪' }
  ];

  const handleSelect = (lang) => {
    setLanguage(lang);
    alert(`✅ Language alterado para ${languages.find(l => l.id === lang)?.label}\\n\\nThe language change will be applied across the entire app.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bold text-lg text-slate-900">Language</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => handleSelect(lang.id)}
              className={`w-full p-4 rounded-xl border-2 transition ${
                language === lang.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-semibold text-slate-900">{lang.label}</span>
                </div>
                {language === lang.id && (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
          <p className="text-xs text-slate-500 mt-4 text-center">
            The language change will be applied across the entire app.
          </p>
        </div>
      </div>
    </div>
  );
};

export const DownloadDataModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
        <h3 className="font-bold text-lg text-slate-900">Baixar Meus Dados</h3>
        <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
          <Download className="w-8 h-8 text-cyan-600 mb-2" />
          <h4 className="font-bold text-cyan-900 mb-2">Solicitar cópia dos seus dados</h4>
          <p className="text-sm text-cyan-700">
            Você pode solicitar uma cópia de todos os seus dados:
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate-900 text-sm">Dados inclusos:</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Posts and comments</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Published analyses</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Messages diretas</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Profile information</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Activity history</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Portfolio de investimentos</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-600">
            <strong>Processing time:</strong> Usually takes 24-48 hours. You'll receive an email when your data is ready for download.
          </p>
        </div>

        <button 
          onClick={() => {
            alert('✅ Solicitação enviada!\\n\\nVocê receberá um e-mail em até 48 horas com o link para download dos seus dados.');
            onClose();
          }}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          Solicitar Download
        </button>
      </div>
    </div>
  </div>
);

export const HelpCenterModal = ({ onClose }) => {
  const helpTopics = [
    { id: 1, title: 'Como publicar uma análise', icon: '📊' },
    { id: 2, title: 'Gerenciar carteira de investimentos', icon: '💼' },
    { id: 3, title: 'Configurar alertas de preço', icon: '🔔' },
    { id: 4, title: 'Privacy e segurança', icon: '🔒' },
    { id: 5, title: 'Planos e assinaturas', icon: '💎' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bold text-lg text-slate-900">Central de Ajuda</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <HelpCircle className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-bold text-green-900 mb-1">Como podemos ajudar você?</h4>
            <p className="text-sm text-green-700">
              Find quick answers to your questions
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">📚 Tópicos populares:</h4>
            <div className="space-y-2">
              {helpTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => alert(`Abrindo: ${topic.title}`)}
                  className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{topic.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{topic.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
              Falar com Suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
